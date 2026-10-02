import {
  DeviceMetadata,
  DeviceRecord,
  DeviceRegistrationPayload,
  DeviceStatus,
  SessionStatus,
} from '../types/device';
import { AnalyticsService } from './analyticsService';

// Safe Platform detector (compatible with React Native and Node test runtime)
function getPlatformInfo(): { OS: string; Version: string | number; constants: any } {
  try {
    const rn = require('react-native');
    if (rn && rn.Platform) {
      return rn.Platform;
    }
  } catch {
    // Fallback in non-RN execution environments
  }
  return {
    OS: 'android',
    Version: 35,
    constants: { Brand: 'Google', Manufacturer: 'Google', Model: 'Pixel 8' },
  };
}

export class DeviceServiceManager {
  private currentDeviceId: string = '';
  private currentUid?: string;
  private currentRole: string = 'anonymous';
  private currentAppId: 'student' | 'client' | 'admin' = 'student';
  private isFirstLaunch: boolean = false;

  // In-memory persistent device registries (keyed by `uid:deviceId` and `deviceId`)
  private userDevices: Map<string, DeviceRecord> = new Map();
  private globalDeviceIndex: Map<string, string> = new Map(); // deviceId -> last active uid

  // Write throttling mechanism (minimum 60 seconds between activity syncs)
  private lastActivitySyncTime: number = 0;
  private readonly activitySyncCooldownMs = 60 * 1000;

  constructor() {
    this.ensureInstallationIdentity();
  }

  /**
   * Generates or retrieves a stable, app-scoped installation identifier.
   * Does NOT use IMEI, MAC address, or restricted hardware serials.
   */
  private ensureInstallationIdentity(): string {
    if (!this.currentDeviceId) {
      // Formats an RFC4122 compliant pseudo-random UUID
      const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      this.currentDeviceId = `inst_${s4()}${s4()}-${s4()}-4${s4().substr(0, 3)}-a${s4().substr(0, 3)}-${s4()}${s4()}${s4()}`;
    }
    return this.currentDeviceId;
  }

  /**
   * Set or override installation ID (e.g. from secure persistent storage)
   */
  setInstallationId(id: string): void {
    if (id && id.trim()) {
      this.currentDeviceId = id.trim();
    }
  }

  getInstallationId(): string {
    return this.ensureInstallationIdentity();
  }

  /**
   * Collect safe hardware & OS properties without accessing restricted identifiers
   */
  collectDeviceMetadata(appId: 'student' | 'client' | 'admin', appName: string, appVersion: string = '1.0.0'): DeviceMetadata {
    const deviceId = this.getInstallationId();
    
    // Safely extract constants from platform
    const platformInfo = getPlatformInfo();
    const constants: any = platformInfo.constants || {};
    
    let manufacturer = 'Google';
    let model = 'Pixel 8';
    
    if (platformInfo.OS === 'android') {
      manufacturer = constants.Manufacturer || constants.Brand || 'Google';
      model = constants.Model || 'Pixel 8';
    } else if (platformInfo.OS === 'ios') {
      manufacturer = 'Apple';
      model = constants.systemName ? `iPhone (${constants.systemName})` : 'iPhone';
    }

    // Build user-friendly display name (Manufacturer + Model)
    const displayName = model.toLowerCase().startsWith(manufacturer.toLowerCase())
      ? model
      : `${manufacturer} ${model}`;

    const osVersion = String(platformInfo.Version || '15');
    const apiLevel = typeof platformInfo.Version === 'number' ? platformInfo.Version : parseInt(osVersion, 10) || 35;

    let timezone = 'UTC';
    let locale = 'en-US';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
    } catch {
      timezone = 'Asia/Kolkata';
    }

    return {
      deviceId,
      manufacturer,
      model,
      displayName,
      platform: (platformInfo.OS === 'android' ? 'android' : platformInfo.OS === 'ios' ? 'ios' : 'web'),
      osVersion,
      apiLevel,
      appId,
      appName,
      appVersion,
      buildNumber: '1',
      locale,
      timezone,
      deviceType: 'phone',
    };
  }

  /**
   * Initialize or resume installation on app launch
   */
  registerAppLaunch(payload: DeviceRegistrationPayload): DeviceRecord {
    this.currentAppId = payload.appId;
    const metadata = this.collectDeviceMetadata(payload.appId, payload.appName, payload.appVersion);
    const now = new Date().toISOString();

    const uid = payload.uid || this.currentUid || 'anonymous';
    const role = (payload.role || this.currentRole || 'anonymous') as any;
    const key = `${uid}:${metadata.deviceId}`;

    let record = this.userDevices.get(key);
    const isFirstTimeSeen = !record && !this.globalDeviceIndex.has(metadata.deviceId);

    if (!record) {
      record = {
        ...metadata,
        uid,
        role,
        fcmToken: payload.fcmToken,
        isFcmActive: Boolean(payload.fcmToken),
        firstSeenAt: now,
        lastActiveAt: now,
        isLoggedIn: uid !== 'anonymous',
        sessionStatus: 'active',
        deviceStatus: 'active',
        lastKnownState: 'foreground',
        createdAt: now,
        updatedAt: now,
      };
      this.isFirstLaunch = isFirstTimeSeen;
    } else {
      record.lastActiveAt = now;
      record.sessionStatus = 'active';
      record.appVersion = payload.appVersion;
      record.updatedAt = now;
      if (payload.fcmToken) {
        record.fcmToken = payload.fcmToken;
        record.isFcmActive = true;
      }
    }

    this.userDevices.set(key, record);
    this.globalDeviceIndex.set(metadata.deviceId, uid);

    // Emit analytics
    if (isFirstTimeSeen) {
      AnalyticsService.logAppLifecycle('first_open', payload.appId, payload.appVersion);
    }
    AnalyticsService.logAppLifecycle('open', payload.appId, payload.appVersion);

    return record;
  }

  /**
   * Record successful user authentication and attach device to user
   */
  recordLogin(uid: string, role: string, fcmToken?: string): DeviceRecord {
    const deviceId = this.getInstallationId();
    const metadata = this.collectDeviceMetadata(this.currentAppId, `GoTechPlace ${this.currentAppId.toUpperCase()}`);
    const now = new Date().toISOString();

    // 1. Account switching safety: If previous user was active on this device, mark old session logged out
    if (this.currentUid && this.currentUid !== uid) {
      const oldKey = `${this.currentUid}:${deviceId}`;
      const oldRecord = this.userDevices.get(oldKey);
      if (oldRecord) {
        oldRecord.isLoggedIn = false;
        oldRecord.sessionStatus = 'logged_out';
        oldRecord.lastLogoutAt = now;
        oldRecord.isFcmActive = false;
        oldRecord.updatedAt = now;
        this.userDevices.set(oldKey, oldRecord);
      }
    }

    this.currentUid = uid;
    this.currentRole = role;

    const key = `${uid}:${deviceId}`;
    let record = this.userDevices.get(key);

    if (!record) {
      record = {
        ...metadata,
        uid,
        role: role as any,
        fcmToken,
        isFcmActive: Boolean(fcmToken),
        firstSeenAt: now,
        lastActiveAt: now,
        lastLoginAt: now,
        isLoggedIn: true,
        sessionStatus: 'active',
        deviceStatus: 'active',
        lastKnownState: 'foreground',
        createdAt: now,
        updatedAt: now,
      };
    } else {
      record.role = role as any;
      record.lastLoginAt = now;
      record.lastActiveAt = now;
      record.isLoggedIn = true;
      record.sessionStatus = 'active';
      record.deviceStatus = 'active';
      record.updatedAt = now;
      if (fcmToken) {
        record.fcmToken = fcmToken;
        record.isFcmActive = true;
      }
    }

    this.userDevices.set(key, record);
    this.globalDeviceIndex.set(deviceId, uid);

    // Set analytics attribution
    AnalyticsService.setUserId(uid);
    AnalyticsService.setUserProperty('role', role);
    AnalyticsService.setUserProperty('app_version', metadata.appVersion);
    AnalyticsService.setUserProperty('device_model', metadata.displayName);
    AnalyticsService.logAuthEvent('success', role);

    return record;
  }

  /**
   * Record explicit user logout, preserving historical device records for security & audit
   */
  recordLogout(uid: string): DeviceRecord | null {
    const deviceId = this.getInstallationId();
    const key = `${uid}:${deviceId}`;
    const record = this.userDevices.get(key);
    const now = new Date().toISOString();

    if (record) {
      record.isLoggedIn = false;
      record.sessionStatus = 'logged_out';
      record.lastLogoutAt = now;
      record.lastActiveAt = now;
      record.isFcmActive = false;
      record.updatedAt = now;
      this.userDevices.set(key, record);
    }

    AnalyticsService.logAuthEvent('logout', record?.role || this.currentRole);
    AnalyticsService.clearUserId();

    this.currentUid = undefined;
    this.currentRole = 'anonymous';

    return record || null;
  }

  /**
   * Handle application foreground transition with rate-limiting / throttling
   */
  recordAppForeground(): void {
    const nowMs = Date.now();
    if (nowMs - this.lastActivitySyncTime < this.activitySyncCooldownMs) {
      return; // Throttled to prevent excessive Firestore writes
    }
    this.lastActivitySyncTime = nowMs;

    const deviceId = this.getInstallationId();
    const uid = this.currentUid || 'anonymous';
    const key = `${uid}:${deviceId}`;
    const record = this.userDevices.get(key);
    const now = new Date().toISOString();

    if (record) {
      record.sessionStatus = record.isLoggedIn ? 'active' : 'logged_out';
      record.lastActiveAt = now;
      record.lastKnownState = 'foreground';
      record.updatedAt = now;
      this.userDevices.set(key, record);
    }

    AnalyticsService.logAppLifecycle('foreground', this.currentAppId, '1.0.0');
  }

  /**
   * Handle application background transition
   */
  recordAppBackground(): void {
    const deviceId = this.getInstallationId();
    const uid = this.currentUid || 'anonymous';
    const key = `${uid}:${deviceId}`;
    const record = this.userDevices.get(key);
    const now = new Date().toISOString();

    if (record) {
      record.sessionStatus = 'background';
      record.lastActiveAt = now;
      record.lastKnownState = 'background';
      record.updatedAt = now;
      this.userDevices.set(key, record);
    }

    AnalyticsService.logAppLifecycle('background', this.currentAppId, '1.0.0');
  }

  /**
   * Retrieve all active and historical devices for a user
   */
  getUserDevices(uid: string): DeviceRecord[] {
    const results: DeviceRecord[] = [];
    for (const [key, record] of this.userDevices.entries()) {
      if (record.uid === uid) {
        results.push({ ...record });
      }
    }
    // Sort by lastActiveAt descending
    return results.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
  }

  /**
   * Retrieve all registered devices in the system (for Admin Console)
   */
  getAllDevices(): DeviceRecord[] {
    const list: DeviceRecord[] = [];
    for (const record of this.userDevices.values()) {
      list.push({ ...record });
    }
    return list.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
  }

  /**
   * Get single device details
   */
  getDeviceDetails(uid: string, deviceId: string): DeviceRecord | undefined {
    return this.userDevices.get(`${uid}:${deviceId}`);
  }

  /**
   * Admin control: update device status (active | inactive | disabled)
   */
  setDeviceStatus(uid: string, deviceId: string, status: DeviceStatus): boolean {
    const key = `${uid}:${deviceId}`;
    const record = this.userDevices.get(key);
    if (!record) return false;

    record.deviceStatus = status;
    record.updatedAt = new Date().toISOString();
    this.userDevices.set(key, record);
    return true;
  }

  /**
   * Update FCM Token for current device installation
   */
  updateFcmToken(fcmToken: string): void {
    const deviceId = this.getInstallationId();
    const uid = this.currentUid || 'anonymous';
    const key = `${uid}:${deviceId}`;
    const record = this.userDevices.get(key);
    if (record) {
      record.fcmToken = fcmToken;
      record.isFcmActive = true;
      record.updatedAt = new Date().toISOString();
      this.userDevices.set(key, record);
    }
  }

  /**
   * Testing & QA reset helper
   */
  resetState(): void {
    this.currentDeviceId = '';
    this.currentUid = undefined;
    this.currentRole = 'anonymous';
    this.userDevices.clear();
    this.globalDeviceIndex.clear();
    this.lastActivitySyncTime = 0;
  }
}

export const DeviceService = new DeviceServiceManager();
