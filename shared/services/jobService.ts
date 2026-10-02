import { Job, JobType, ApprovalStatus } from '../types/job';
import { JobApplication } from '../types/application';
import { INITIAL_JOBS } from '../data/mockJobs';
import { FirestoreClient } from '../firebase/firestoreClient';

let jobsStore: Job[] = INITIAL_JOBS.map((j) => ({
  ...j,
  id: j.job_id || j.id,
  title: j.role || j.title,
  approvalStatus: 'approved' as ApprovalStatus,
  status: 'approved',
  applicationsCount: 12,
  createdAt: j.created_at || new Date().toISOString(),
  updatedAt: j.updated_at || new Date().toISOString(),
}));

let applicationsStore: JobApplication[] = [
  {
    id: 'app-01',
    jobId: 'job-01',
    jobTitle: 'Backend Developer Intern',
    clientId: 'client_01',
    companyName: 'TechWave Solutions',
    studentId: 'usr_9999999999',
    studentName: 'Himanshu Sharma',
    studentEmail: 'himanshu@gotechplace.com',
    studentPhone: '+91 99999 99999',
    branch: 'Computer Science & Engineering',
    college: 'Delhi Technological University',
    resumeUrl: 'https://storage.gotechplace.com/resumes/himanshu.pdf',
    skills: ['Python', 'Django', 'SQL'],
    coverLetter: 'Passionate junior engineer looking to build scalable cloud backends.',
    coverNote: 'Passionate junior engineer looking to build scalable cloud backends.',
    status: 'under_review',
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Firestore Client Cache
FirestoreClient.seedCache('jobs', jobsStore);
FirestoreClient.seedCache('applications', applicationsStore);

export const JobService = {
  /** Get all approved active jobs matching website catalog */
  async getJobs(filters?: { category?: string; jobType?: string; location?: string; query?: string }): Promise<Job[]> {
    let list = jobsStore.filter((j) => j.approvalStatus === 'approved' || !j.approvalStatus);
    if (filters?.category && filters.category !== 'All') {
      list = list.filter((j) => j.category?.toLowerCase().includes(filters.category!.toLowerCase()));
    }
    if (filters?.jobType && filters.jobType !== 'All') {
      list = list.filter((j) => (j.job_type || j.jobType)?.toLowerCase() === filters.jobType!.toLowerCase());
    }
    if (filters?.location && filters.location !== 'All') {
      list = list.filter((j) => j.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (j) =>
          (j.title || j.role || '').toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list;
  },

  /** Get single job by ID */
  async getJobById(jobId: string): Promise<Job | null> {
    const found = jobsStore.find((j) => j.id === jobId || j.job_id === jobId);
    return found || null;
  },

  /** Apply for a job */
  async applyJob(application: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'status'>): Promise<{
    success: boolean;
    application?: JobApplication;
    error?: string;
  }> {
    const existing = applicationsStore.find(
      (a) => a.jobId === application.jobId && a.studentId === application.studentId
    );
    if (existing) {
      return { success: false, error: 'You have already applied for this position!' };
    }

    const newApp: JobApplication = {
      ...application,
      id: `app_${Date.now()}`,
      status: 'submitted',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    applicationsStore.unshift(newApp);

    // Update applications count
    const job = jobsStore.find((j) => j.id === application.jobId || j.job_id === application.jobId);
    if (job) {
      job.applicationsCount = (job.applicationsCount || 0) + 1;
    }

    return { success: true, application: newApp };
  },

  /** Get applications for a student */
  async getStudentApplications(studentId: string): Promise<JobApplication[]> {
    return applicationsStore.filter((a) => a.studentId === studentId || studentId === 'all');
  },

  /** Post new job (Client / Admin) */
  async postJob(jobData: Partial<Job>): Promise<{ success: boolean; job?: Job; error?: string }> {
    const now = new Date().toISOString();
    const newJob: Job = {
      id: `job_${Date.now()}`,
      job_id: `job_${Date.now()}`,
      clientId: jobData.clientId || 'client_01',
      company: jobData.company || jobData.clientName || 'GoTechPlace Partner',
      title: jobData.title || jobData.role || 'Software Engineer',
      description: jobData.description || '',
      category: jobData.category || 'Software Engineering',
      skills: jobData.skills || ['JavaScript', 'React'],
      budget: jobData.budget || 35000,
      deadline: jobData.deadline || '2026-11-30',
      location: jobData.location || 'Remote',
      isRemote: jobData.isRemote ?? true,
      jobType: jobData.jobType || 'Internship',
      job_type: jobData.job_type || 'Internship',
      status: 'pending_approval',
      approvalStatus: 'pending',
      applicationsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    jobsStore.unshift(newJob);
    return { success: true, job: newJob };
  },
};
