export type ApplicationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'shortlisted' 
  | 'rejected' 
  | 'accepted';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  branch: string;
  college: string;
  skills: string[];
  resumeUrl?: string;
  coverNote?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  feedback?: string;
}
