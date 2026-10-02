export type JobStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'closed' 
  | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type JobType = 'Internship' | 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';

export interface JobAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Job {
  id: string;
  job_id?: string;
  clientId?: string;
  company?: string;
  clientName?: string;
  clientLogo?: string;
  company_logo?: string;
  title: string;
  role?: string;
  description: string;
  category?: string;
  eligibility?: string;
  experience?: string;
  apply_url?: string;
  skills: string[];
  budget: number;
  deadline: string;
  location: string;
  isRemote?: boolean;
  jobType?: JobType;
  job_type?: JobType;
  attachments?: JobAttachment[];
  status?: JobStatus;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  applicationsCount?: number;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isEnabled: boolean;
  jobsCount?: number;
  createdAt: string;
  updatedAt: string;
}
