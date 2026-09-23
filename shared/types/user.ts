export type UserRole = 
  | 'student' 
  | 'client' 
  | 'admin' 
  | 'staff' 
  | 'superuser' 
  | 'moderator' 
  | 'support';

export type AccountStatus = 'active' | 'suspended' | 'pending' | 'rejected';

export interface DeviceToken {
  token: string;
  platform: 'android' | 'ios';
  app: 'student' | 'client' | 'admin';
  deviceId: string;
  lastSeen: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  phoneNumber: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  isApproved: boolean;
  profileImage?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  devices?: Record<string, DeviceToken>;
}

export interface StudentProfile {
  uid: string;
  student_id: string;
  name: string;
  email: string;
  mobile: string;
  location: string;
  gender: string;
  college: string;
  branch: string;
  year: string;
  semester: string;
  skills: string[];
  bio?: string;
  resumeUrl?: string;
  profileImage?: string;
  savedJobs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  uid: string;
  clientId: string;
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email?: string;
  website?: string;
  location: string;
  industry: string;
  description: string;
  logoUrl?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  uid: string;
  name: string;
  email?: string;
  phoneNumber: string;
  role: 'superuser' | 'admin' | 'staff' | 'moderator' | 'support';
  permissions: string[];
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}
