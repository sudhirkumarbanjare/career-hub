import {
  Project,
  Course,
  Job,
  INITIAL_PROJECTS as SHARED_PROJECTS,
  INITIAL_JOBS as SHARED_JOBS,
  INITIAL_COURSES as SHARED_COURSES,
} from '@gotechplace/shared';

export const INITIAL_PROJECTS: Project[] = SHARED_PROJECTS.map((p) => ({
  ...p,
  cost: p.discounted_cost || p.original_cost || 4999,
  components: p.technologies || [],
}));

export const INITIAL_COURSES: Course[] = [...SHARED_COURSES];

export const INITIAL_APPROVED_JOBS: Job[] = SHARED_JOBS.map((j) => ({
  ...j,
  id: j.job_id || j.id,
  title: j.role || j.title,
  clientId: 'client_01',
  clientName: j.company || 'Tech Partner',
  clientLogo: j.company_logo,
  category: 'Software Engineering',
  budget: 35000,
  isRemote: j.location.includes('Remote') || j.location.includes('Hybrid'),
  jobType: j.job_type || j.jobType || 'Internship',
  attachments: [],
  status: 'approved',
  approvalStatus: 'approved',
  applicationsCount: 12,
  createdAt: j.created_at || new Date().toISOString(),
  updatedAt: j.updated_at || new Date().toISOString(),
}));
