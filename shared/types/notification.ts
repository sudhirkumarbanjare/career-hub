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
  | 'custom';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
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
