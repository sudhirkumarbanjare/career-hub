export type NotificationTarget = 
  | 'all_users' 
  | 'all_students' 
  | 'all_clients' 
  | 'all_admins' 
  | 'all_staff' 
  | 'student_app' 
  | 'client_app' 
  | 'admin_app' 
  | 'all_apps'
  | 'individual' 
  | 'multiple_users'
  | 'custom';

export type NotificationCategory =
  | 'general'
  | 'jobs'
  | 'applications'
  | 'account'
  | 'admin'
  | 'courses'
  | 'projects'
  | 'system';

export type SystemNotificationEvent =
  | 'NEW_STUDENT_REGISTERED'
  | 'NEW_CLIENT_REGISTERED'
  | 'CLIENT_KYC_SUBMITTED'
  | 'CLIENT_APPROVED'
  | 'CLIENT_REJECTED'
  | 'JOB_CREATED'
  | 'JOB_APPROVED'
  | 'JOB_REJECTED'
  | 'JOB_CLOSED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'COURSE_ENROLLED'
  | 'PROJECT_BOOKED'
  | 'SYSTEM_ALERT';

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'android' | 'ios' | 'web';
  appId: 'student' | 'client' | 'admin';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category?: NotificationCategory;
  imageUrl?: string;
  deepLink?: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  imageUrl?: string;
  deepLink?: string;
  target: NotificationTarget;
  targetUserIds?: string[];
  sentBy: string;
  sentByName?: string;
  status: 'sent' | 'scheduled' | 'failed' | 'draft';
  scheduledFor?: string;
  sentAt?: string;
  recipientCount?: number;
  successCount?: number;
  failureCount?: number;
  createdAt: string;
}

export type NotificationTemplateApp = 'student' | 'client' | 'admin' | 'all';
export type NotificationTemplateStatus = 'active' | 'inactive';

export interface NotificationTemplate {
  id: string;
  app: NotificationTemplateApp;
  name: string;
  title: string;
  body: string;
  category: NotificationCategory;
  deepLink?: string;
  imageUrl?: string;
  variables: string[]; // e.g., ['student_name', 'job_title', 'company_name']
  isSystem: boolean; // true for predefined templates, false for custom
  isPredefined?: boolean; // alias for isSystem
  targetRole?: string;
  status: NotificationTemplateStatus;
  targetAudienceDefault?: NotificationTarget;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByUid?: string;
}

export interface TemplateRenderResult {
  renderedTitle: string;
  renderedBody: string;
  unresolvedVariables: string[];
  missingVariables: string[];
  hasUnrenderedPlaceholders: boolean;
  isValid: boolean;
}

