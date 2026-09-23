export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_STAFF'
  | 'UPDATE_STAFF'
  | 'DISABLE_STAFF'
  | 'APPROVE_CLIENT'
  | 'REJECT_CLIENT'
  | 'SUSPEND_CLIENT'
  | 'APPROVE_JOB'
  | 'REJECT_JOB'
  | 'DELETE_JOB'
  | 'SEND_NOTIFICATION'
  | 'CREATE_APP_VERSION'
  | 'UPDATE_APP_VERSION'
  | 'CHANGE_PERMISSION'
  | 'UPDATE_SETTINGS'
  | 'ENABLE_MAINTENANCE'
  | 'DISABLE_MAINTENANCE'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'SUSPEND_USER'
  | 'ACTIVATE_USER'
  | 'RESOLVE_REPORT'
  | 'DISMISS_REPORT';

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: AuditAction;
  targetId?: string;
  targetType: 'job' | 'user' | 'client' | 'student' | 'staff' | 'version' | 'setting' | 'category' | 'report' | 'notification';
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface PlatformReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'job' | 'user' | 'client' | 'student';
  targetTitle?: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  assignedTo?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  isEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface SystemSettings {
  id: string;
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  allowClientRegistration: boolean;
  allowStudentRegistration: boolean;
  requireClientApproval: boolean;
  requireJobApproval: boolean;
  maxAttachmentsPerJob: number;
  maxAttachmentSizeMb: number;
  maintenanceModeAll: boolean;
  maintenanceMessage: string;
  updatedAt: string;
  updatedBy: string;
}
