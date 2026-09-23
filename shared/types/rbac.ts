import { UserRole, AccountStatus } from './user';

export type Permission =
  | 'users.view'
  | 'users.edit'
  | 'users.suspend'
  | 'users.search'
  | 'students.view'
  | 'students.edit'
  | 'clients.view'
  | 'clients.approve'
  | 'clients.reject'
  | 'clients.suspend'
  | 'jobs.view'
  | 'jobs.create'
  | 'jobs.edit'
  | 'jobs.approve'
  | 'jobs.reject'
  | 'jobs.delete'
  | 'applications.view'
  | 'applications.manage'
  | 'notifications.view'
  | 'notifications.send'
  | 'reports.view'
  | 'reports.manage'
  | 'app_versions.view'
  | 'app_versions.create'
  | 'app_versions.update'
  | 'staff.view'
  | 'staff.create'
  | 'staff.edit'
  | 'staff.delete'
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'
  | 'settings.view'
  | 'settings.update'
  | 'audit_logs.view'
  | 'maintenance.manage'
  | 'feature_flags.manage'
  | 'categories.manage';

export interface RoleConfig {
  id: string;
  role: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export interface StaffMember {
  uid: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}
