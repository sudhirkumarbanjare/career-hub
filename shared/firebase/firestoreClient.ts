import { getFirebaseConfig } from './config';

export interface FirestoreQueryOptions {
  where?: Array<{
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in';
    value: any;
  }>;
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  };
  limit?: number;
}

type RealtimeListener<T = any> = (data: T[]) => void;

class UniversalFirestoreClient {
  private inMemoryCache: Map<string, any> = new Map();
  private listeners: Map<string, Set<RealtimeListener>> = new Map();
  private config = getFirebaseConfig();

  private getBaseUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/(default)/documents`;
  }

  /** Convert a plain JS object to Firestore REST API value format */
  private toFirestoreFields(obj: Record<string, any>): Record<string, any> {
    const fields: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === undefined) continue;
      fields[key] = this.toFirestoreValue(val);
    }
    return fields;
  }

  private toFirestoreValue(val: any): any {
    if (val === null) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map((item) => this.toFirestoreValue(item)) } };
    }
    if (typeof val === 'object') {
      return { mapValue: { fields: this.toFirestoreFields(val) } };
    }
    return { stringValue: String(val) };
  }

  /** Convert Firestore REST API document format to a plain JS object */
  private fromFirestoreFields(fields: Record<string, any> = {}): Record<string, any> {
    const res: Record<string, any> = {};
    for (const key of Object.keys(fields)) {
      res[key] = this.fromFirestoreValue(fields[key]);
    }
    return res;
  }

  private fromFirestoreValue(valObj: Record<string, any>): any {
    if (!valObj) return null;
    if ('stringValue' in valObj) return valObj.stringValue;
    if ('booleanValue' in valObj) return valObj.booleanValue;
    if ('integerValue' in valObj) return parseInt(valObj.integerValue, 10);
    if ('doubleValue' in valObj) return parseFloat(valObj.doubleValue);
    if ('nullValue' in valObj) return null;
    if ('timestampValue' in valObj) return valObj.timestampValue;
    if ('arrayValue' in valObj) {
      return (valObj.arrayValue.values || []).map((v: any) => this.fromFirestoreValue(v));
    }
    if ('mapValue' in valObj) {
      return this.fromFirestoreFields(valObj.mapValue.fields || {});
    }
    return null;
  }

  /**
   * Seed local cache with default dataset for fast offline-first launches
   */
  seedCache(collectionName: string, items: Array<Record<string, any> & { id?: string; uid?: string; projectId?: string; job_id?: string; course_id?: string }>): void {
    const list = this.inMemoryCache.get(collectionName) || [];
    const mergedMap = new Map<string, any>();
    
    // Existing cached items
    for (const item of list) {
      const id = item.id || item.uid || item.projectId || item.job_id || item.course_id;
      if (id) mergedMap.set(id, item);
    }

    // Seeded items
    for (const item of items) {
      const id = item.id || item.uid || item.projectId || item.job_id || item.course_id;
      if (id && !mergedMap.has(id)) {
        mergedMap.set(id, item);
      }
    }

    this.inMemoryCache.set(collectionName, Array.from(mergedMap.values()));
  }

  /**
   * Fetch a single document by ID with Cache-First + Network update
   */
  async getDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
    const cachedList: any[] = this.inMemoryCache.get(collectionName) || [];
    const cachedItem = cachedList.find(
      (d) => d.id === docId || d.uid === docId || d.job_id === docId || d.projectId === docId || d.course_id === docId
    );

    try {
      if (typeof fetch !== 'undefined') {
        const url = `${this.getBaseUrl()}/${collectionName}/${encodeURIComponent(docId)}`;
        const resp = await fetch(url);
        if (resp.ok) {
          const rawDoc = await resp.json();
          const docData = {
            id: docId,
            ...this.fromFirestoreFields(rawDoc.fields),
          } as unknown as T;

          // Update cache
          this.setDocumentInCache(collectionName, docId, docData);
          return docData;
        }
      }
    } catch {
      // Fallback to cached item if network is unavailable
    }

    return (cachedItem as T) || null;
  }

  /**
   * Query a collection with optional filters and real-time cache synchronization
   */
  async queryCollection<T = any>(
    collectionName: string,
    filterFn?: (item: T) => boolean
  ): Promise<T[]> {
    let items: T[] = (this.inMemoryCache.get(collectionName) || []) as T[];

    try {
      if (typeof fetch !== 'undefined') {
        const url = `${this.getBaseUrl()}/${collectionName}?pageSize=100`;
        const resp = await fetch(url);
        if (resp.ok) {
          const raw = await resp.json();
          if (raw.documents && Array.isArray(raw.documents)) {
            const fetched = raw.documents.map((doc: any) => {
              const parts = doc.name.split('/');
              const id = parts[parts.length - 1];
              return {
                id,
                ...this.fromFirestoreFields(doc.fields),
              };
            });
            this.inMemoryCache.set(collectionName, fetched);
            items = fetched as T[];
            this.notifyListeners(collectionName, items);
          }
        }
      }
    } catch {
      // Network failure, use cached collection
    }

    if (filterFn) {
      return items.filter(filterFn);
    }
    return items;
  }

  /**
   * Set / Create / Replace a document in Firestore
   */
  async setDocument<T = any>(collectionName: string, docId: string, data: Partial<T>): Promise<T> {
    const fullDoc: any = {
      id: docId,
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: (data as any).createdAt || new Date().toISOString(),
    };

    // 1. Optimistic Cache Update
    this.setDocumentInCache(collectionName, docId, fullDoc);

    // 2. Network Write via REST
    try {
      if (typeof fetch !== 'undefined') {
        const url = `${this.getBaseUrl()}/${collectionName}/${encodeURIComponent(docId)}`;
        const fields = this.toFirestoreFields(data as Record<string, any>);
        await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        });
      }
    } catch {
      // Offline fallback: cached version remains saved
    }

    return fullDoc as T;
  }

  /**
   * Update specific fields of an existing document
   */
  async updateDocument<T = any>(collectionName: string, docId: string, updates: Partial<T>): Promise<void> {
    const existing = await this.getDocument<any>(collectionName, docId);
    const updated = {
      ...(existing || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setDocumentInCache(collectionName, docId, updated);

    try {
      if (typeof fetch !== 'undefined') {
        const updateMask = Object.keys(updates)
          .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
          .join('&');
        const url = `${this.getBaseUrl()}/${collectionName}/${encodeURIComponent(docId)}?${updateMask}`;
        const fields = this.toFirestoreFields(updates as Record<string, any>);
        await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        });
      }
    } catch {
      // Offline fallback
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const list: any[] = this.inMemoryCache.get(collectionName) || [];
    const filtered = list.filter(
      (d) => d.id !== docId && d.uid !== docId && d.job_id !== docId && d.projectId !== docId && d.course_id !== docId
    );
    this.inMemoryCache.set(collectionName, filtered);
    this.notifyListeners(collectionName, filtered);

    try {
      if (typeof fetch !== 'undefined') {
        const url = `${this.getBaseUrl()}/${collectionName}/${encodeURIComponent(docId)}`;
        await fetch(url, { method: 'DELETE' });
      }
    } catch {
      // Offline fallback
    }
  }

  /**
   * Real-time subscription listener (onSnapshot pattern)
   */
  subscribe<T = any>(collectionName: string, listener: RealtimeListener<T>): () => void {
    if (!this.listeners.has(collectionName)) {
      this.listeners.set(collectionName, new Set());
    }
    const set = this.listeners.get(collectionName)!;
    set.add(listener);

    // Initial trigger with current state
    const current = (this.inMemoryCache.get(collectionName) || []) as T[];
    listener(current);

    return () => {
      set.delete(listener);
    };
  }

  private setDocumentInCache(collectionName: string, docId: string, data: any): void {
    const list: any[] = this.inMemoryCache.get(collectionName) || [];
    const idx = list.findIndex(
      (d) => d.id === docId || d.uid === docId || d.job_id === docId || d.projectId === docId || d.course_id === docId
    );

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data };
    } else {
      list.unshift({ id: docId, ...data });
    }

    this.inMemoryCache.set(collectionName, [...list]);
    this.notifyListeners(collectionName, list);
  }

  private notifyListeners(collectionName: string, items: any[]): void {
    const set = this.listeners.get(collectionName);
    if (set) {
      for (const listener of set) {
        try {
          listener([...items]);
        } catch (err) {
          console.error(`Error notifying realtime listener for ${collectionName}:`, err);
        }
      }
    }
  }
}

export const FirestoreClient = new UniversalFirestoreClient();
