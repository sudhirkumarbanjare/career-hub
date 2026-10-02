import { AnalyticsEventType, AnalyticsEventParams } from '../types/device';

export interface AnalyticsRecord {
  id: string;
  eventName: AnalyticsEventType;
  params: AnalyticsEventParams;
  userId?: string;
  timestamp: string;
}

// PII & sensitive keywords to automatically strip from analytics parameters
const FORBIDDEN_KEYS = [
  'phone',
  'phonenumber',
  'mobile',
  'otp',
  'code',
  'password',
  'token',
  'authtoken',
  'sessioninfo',
  'refreshtoken',
  'idtoken',
  'secret',
  'creditcard',
  'pan',
  'aadhaar',
  'messagebody',
  'body',
];

export class AnalyticsServiceManager {
  private currentUserId?: string;
  private userProperties: Record<string, string | number | boolean> = {};
  private eventLogs: AnalyticsRecord[] = [];
  private readonly maxLogHistory = 500;

  /**
   * Set Analytics User ID upon verified Firebase Authentication
   * NEVER pass phone number or personal identifiable strings
   */
  setUserId(uid: string | null | undefined): void {
    if (!uid) {
      this.currentUserId = undefined;
      return;
    }

    // Safety guard: Ensure UID is not a phone number
    if (/^\+?\d{10,15}$/.test(uid.trim())) {
      console.warn('[AnalyticsService] Refusing to set phone number as Analytics User ID');
      return;
    }

    this.currentUserId = uid.trim();
  }

  /**
   * Clear user ID on logout or session switch
   */
  clearUserId(): void {
    this.currentUserId = undefined;
    this.userProperties = {};
  }

  /**
   * Set user properties (e.g. role, app_version)
   */
  setUserProperty(name: string, value: string | number | boolean): void {
    const cleanKey = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    this.userProperties[cleanKey] = value;
  }

  /**
   * Sanitize parameter payload to ensure NO sensitive PII is logged
   */
  private sanitizeParams(params: AnalyticsEventParams): AnalyticsEventParams {
    const clean: AnalyticsEventParams = {};

    for (const [key, value] of Object.entries(params)) {
      const lowerKey = key.toLowerCase();
      
      // 1. Skip forbidden keys
      if (FORBIDDEN_KEYS.some((fk) => lowerKey.includes(fk))) {
        continue;
      }

      // 2. Skip if value is undefined or null
      if (value === undefined || value === null) {
        continue;
      }

      // 3. Prevent phone-number-like string values from leaking in general params
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\+?\d{10,14}$/.test(trimmed)) {
          continue; // Strip leaked phone number
        }
        // Truncate overly long strings
        clean[key] = trimmed.slice(0, 100);
      } else {
        clean[key] = value;
      }
    }

    return clean;
  }

  /**
   * Log an analytics event with automated sanitization
   */
  logEvent(eventName: AnalyticsEventType, params: AnalyticsEventParams = {}): AnalyticsRecord {
    const sanitized = this.sanitizeParams(params);

    const record: AnalyticsRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventName,
      params: {
        ...sanitized,
        ...this.userProperties,
      },
      userId: this.currentUserId,
      timestamp: new Date().toISOString(),
    };

    this.eventLogs.unshift(record);
    if (this.eventLogs.length > this.maxLogHistory) {
      this.eventLogs.pop();
    }

    return record;
  }

  // --- Convenience Helpers for Standard Application Lifecycles ---

  logAppLifecycle(
    action: 'first_open' | 'open' | 'foreground' | 'background',
    appId: string,
    appVersion: string
  ): AnalyticsRecord {
    const eventMap: Record<string, AnalyticsEventType> = {
      first_open: 'app_first_open',
      open: 'app_open',
      foreground: 'app_foreground',
      background: 'app_background',
    };

    return this.logEvent(eventMap[action], {
      app_role: appId,
      app_version: appVersion,
      platform: 'android',
    });
  }

  logAuthEvent(
    action: 'started' | 'otp_sent' | 'otp_verified' | 'success' | 'failed' | 'logout',
    role: string,
    status?: string
  ): AnalyticsRecord {
    const eventMap: Record<string, AnalyticsEventType> = {
      started: 'login_started',
      otp_sent: 'otp_sent',
      otp_verified: 'otp_verified',
      success: 'login_success',
      failed: 'login_failed',
      logout: 'logout',
    };

    return this.logEvent(eventMap[action], {
      app_role: role,
      status: status || 'completed',
    });
  }

  logJobEvent(
    action: 'created' | 'published' | 'updated' | 'closed' | 'viewed' | 'applied',
    jobId: string,
    category?: string
  ): AnalyticsRecord {
    const eventMap: Record<string, AnalyticsEventType> = {
      created: 'job_created',
      published: 'job_published',
      updated: 'job_updated',
      closed: 'job_closed',
      viewed: 'job_viewed',
      applied: 'job_applied',
    };

    return this.logEvent(eventMap[action], {
      job_id: jobId,
      category: category || 'general',
    });
  }

  logNotificationEvent(
    action: 'received' | 'opened',
    notificationType: string
  ): AnalyticsRecord {
    const eventName: AnalyticsEventType =
      action === 'received' ? 'notification_received' : 'notification_opened';

    return this.logEvent(eventName, {
      notification_type: notificationType,
    });
  }

  /**
   * Get historical events (for Admin/QA inspection)
   */
  getRecentEvents(limit: number = 50, filterUserId?: string): AnalyticsRecord[] {
    if (filterUserId) {
      return this.eventLogs
        .filter((e) => e.userId === filterUserId)
        .slice(0, limit);
    }
    return this.eventLogs.slice(0, limit);
  }

  clearLogs(): void {
    this.eventLogs = [];
  }
}

export const AnalyticsService = new AnalyticsServiceManager();
