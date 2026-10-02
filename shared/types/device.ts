export type DevicePlatform = 'android' | 'ios' | 'web';

export type DeviceStatus = 'active' | 'inactive' | 'disabled';

export type SessionStatus = 'active' | 'background' | 'logged_out';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface DeviceMetadata {
  deviceId: string;
  manufacturer: string;
  model: string;
  displayName: string;
  platform: DevicePlatform;
  osVersion: string;
  apiLevel?: number;
  appId: 'student' | 'client' | 'admin';
  appName: string;
  appVersion: string;
  buildNumber: string;
  locale: string;
  timezone: string;
  deviceType: 'phone' | 'tablet' | 'desktop';
}

export interface DeviceRecord extends DeviceMetadata {
  uid: string;
  role: 'student' | 'client' | 'admin' | 'staff' | 'superuser' | 'moderator' | 'support' | 'anonymous';
  fcmToken?: string;
  isFcmActive: boolean;
  firstSeenAt: string;
  lastActiveAt: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  isLoggedIn: boolean;
  sessionStatus: SessionStatus;
  deviceStatus: DeviceStatus;
  lastKnownState?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceRegistrationPayload {
  uid?: string;
  role?: string;
  fcmToken?: string;
  appId: 'student' | 'client' | 'admin';
  appName: string;
  appVersion: string;
  buildNumber?: string;
}

export type AnalyticsEventType =
  // App Lifecycle
  | 'app_first_open'
  | 'app_open'
  | 'app_foreground'
  | 'app_background'
  // Authentication
  | 'login_started'
  | 'otp_sent'
  | 'otp_verified'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  // Profile
  | 'profile_started'
  | 'profile_completed'
  | 'profile_updated'
  // Client Actions
  | 'client_created'
  | 'job_create_started'
  | 'job_created'
  | 'job_published'
  | 'job_updated'
  | 'job_closed'
  // Student Actions
  | 'job_viewed'
  | 'job_applied'
  | 'application_submitted'
  | 'project_viewed'
  // Notifications
  | 'notification_received'
  | 'notification_opened';

export interface AnalyticsEventParams {
  app_role?: string;
  app_version?: string;
  platform?: string;
  job_id?: string;
  project_id?: string;
  application_id?: string;
  category?: string;
  notification_type?: string;
  screen_name?: string;
  action_type?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}
