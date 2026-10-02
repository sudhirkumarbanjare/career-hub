import {
  ClientProfile,
  Job,
  JobApplication,
  AppNotification,
  User,
  JobStatus,
  ApprovalStatus,
} from '@gotechplace/shared';

class ClientServiceManager {
  private currentClient: ClientProfile | null = null;
  private clientsByUid: Map<string, ClientProfile> = new Map();

  constructor() {
    // Seed default demo verified client
    const defaultClient: ClientProfile = {
      uid: 'usr_client_demo',
      clientId: 'CLI-2026-001',
      companyName: 'Nexus Innovations Ltd',
      contactPerson: 'Vikram Malhotra',
      phoneNumber: '+91 98123 45678',
      email: 'contact@nexusinnovations.tech',
      website: 'https://nexusinnovations.tech',
      location: 'Bangalore, Karnataka',
      industry: 'Software & Cloud Engineering',
      description: 'Leading provider of modern cloud architectures, embedded intelligence, and scalable mobile solutions.',
      approvalStatus: 'approved',
      isProfileComplete: true,
      createdAt: '2026-01-20T11:00:00.000Z',
      updatedAt: '2026-01-20T11:00:00.000Z',
    };
    this.clientsByUid.set(defaultClient.uid, defaultClient);
  }
  private clientJobs: Job[] = [
    {
      id: 'job-c1',
      clientId: 'usr_client_demo',
      clientName: 'Nexus Innovations',
      title: 'Mobile App Developer (React Native)',
      description: 'Building cross-platform fintech dashboard with biometrics and charts. Requires clean TypeScript and Firebase experience.',
      category: 'Mobile Development',
      skills: ['React Native', 'TypeScript', 'Redux', 'REST API'],
      budget: 50000,
      deadline: '2026-11-20',
      location: 'Bangalore, India',
      isRemote: true,
      jobType: 'Full-time',
      attachments: [],
      status: 'approved',
      approvalStatus: 'approved',
      applicationsCount: 4,
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 'job-c2',
      clientId: 'usr_client_demo',
      clientName: 'Nexus Innovations',
      title: 'AI Computer Vision Pipeline Engineer',
      description: 'Implement edge-optimized object tracking for factory automation using PyTorch and OpenCV on embedded Linux.',
      category: 'Machine Learning & AI',
      skills: ['Python', 'OpenCV', 'PyTorch', 'YOLOv8'],
      budget: 65000,
      deadline: '2026-12-05',
      location: 'Hyderabad, India',
      isRemote: false,
      jobType: 'Contract',
      attachments: [],
      status: 'pending_approval',
      approvalStatus: 'pending',
      applicationsCount: 0,
      createdAt: '2026-02-12T14:00:00.000Z',
      updatedAt: '2026-02-12T14:00:00.000Z',
    },
  ];

  private applications: JobApplication[] = [
    {
      id: 'app-c1',
      jobId: 'job-c1',
      jobTitle: 'Mobile App Developer (React Native)',
      clientId: 'usr_client_demo',
      companyName: 'Nexus Innovations',
      studentId: 'STU-101',
      studentName: 'Aarav Patel',
      studentPhone: '+91 98111 22233',
      studentEmail: 'aarav.patel@nit.edu',
      branch: 'CSE / IT',
      college: 'National Institute of Technology',
      skills: ['React Native', 'TypeScript', 'Node.js'],
      resumeUrl: 'https://example.com/aarav-resume.pdf',
      coverNote: 'I built two major React Native apps and would love to contribute to Nexus Innovations.',
      status: 'submitted',
      appliedAt: '2026-02-05T09:30:00.000Z',
      updatedAt: '2026-02-05T09:30:00.000Z',
    },
    {
      id: 'app-c2',
      jobId: 'job-c1',
      jobTitle: 'Mobile App Developer (React Native)',
      clientId: 'usr_client_demo',
      companyName: 'Nexus Innovations',
      studentId: 'STU-102',
      studentName: 'Sneha Verma',
      studentPhone: '+91 98222 33344',
      studentEmail: 'sneha.verma@iit.edu',
      branch: 'CSE / IT',
      college: 'IIT Roorkee',
      skills: ['React Native', 'Firebase', 'GraphQL'],
      resumeUrl: 'https://example.com/sneha-resume.pdf',
      coverNote: 'Top rank in coding hackathon with production React Native experience.',
      status: 'shortlisted',
      appliedAt: '2026-02-06T11:00:00.000Z',
      updatedAt: '2026-02-07T15:00:00.000Z',
    },
  ];

  private notifications: AppNotification[] = [
    {
      id: 'notif-c1',
      userId: 'usr_client_demo',
      title: 'Job Approved by Admin',
      body: 'Your job posting "Mobile App Developer (React Native)" has been approved and is now visible to students.',
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'notif-c2',
      userId: 'usr_client_demo',
      title: 'New Student Application',
      body: 'Sneha Verma submitted an application for "Mobile App Developer".',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      deepLink: 'gotechplace://client/applications',
    },
    {
      id: 'notif-c3',
      userId: 'usr_client_demo',
      title: 'Employer Profile Verified',
      body: 'Your company KYC and corporate tax details have been verified by the Admin team.',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'notif-c4',
      userId: 'usr_client_demo',
      title: 'Interview Reminder',
      body: 'Technical interview scheduled with Candidate Sneha Verma for tomorrow at 2:00 PM IST.',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
  ];

  initDefaultClient(user?: User): ClientProfile {
    if (!user) {
      if (!this.currentClient) {
        this.currentClient = this.clientsByUid.get('usr_client_demo')!;
      }
      return this.currentClient;
    }

    // Check if client profile already exists for this exact Firebase Auth UID
    if (this.clientsByUid.has(user.uid)) {
      this.currentClient = this.clientsByUid.get(user.uid)!;
      return this.currentClient;
    }

    // Check if this is the default demo client UID or test phone
    if (user.uid === 'usr_client_demo' || user.phoneNumber === '+91 98123 45678' || user.phoneNumber === '+919812345678') {
      const demo = { ...this.clientsByUid.get('usr_client_demo')!, uid: user.uid, phoneNumber: user.phoneNumber };
      this.clientsByUid.set(user.uid, demo);
      this.currentClient = demo;
      return demo;
    }

    // Brand new client: Bind strictly to verified Firebase phone number with incomplete profile
    const newClient: ClientProfile = {
      uid: user.uid,
      clientId: `CLI-${Date.now().toString().slice(-6)}`,
      companyName: '',
      contactPerson: user.name || '',
      phoneNumber: user.phoneNumber, // STRICT: ALWAYS verified phone number from Firebase Auth
      email: user.email || '',
      website: '',
      location: '',
      industry: '',
      description: '',
      approvalStatus: 'pending',
      isProfileComplete: false, // Mandatory profile completion required
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.clientsByUid.set(user.uid, newClient);
    this.currentClient = newClient;
    return newClient;
  }

  getCurrentClient(): ClientProfile {
    if (!this.currentClient) {
      return this.initDefaultClient();
    }
    return this.currentClient;
  }

  updateProfile(updates: Partial<ClientProfile>): ClientProfile {
    const current = this.getCurrentClient();

    // SECURITY RULE: Strip immutable fields (phoneNumber, uid, clientId) to prevent modification
    const { phoneNumber, uid, clientId, ...safeUpdates } = updates as any;

    const isComplete = Boolean(
      (safeUpdates.companyName || current.companyName) &&
      (safeUpdates.contactPerson || current.contactPerson) &&
      (safeUpdates.location || current.location) &&
      (safeUpdates.industry || current.industry) &&
      (safeUpdates.description || current.description)
    );

    this.currentClient = {
      ...current,
      ...safeUpdates,
      phoneNumber: current.phoneNumber, // STRICT IMMUTABILITY: Retain verified phone number
      uid: current.uid,
      clientId: current.clientId,
      approvalStatus: isComplete ? 'approved' : current.approvalStatus,
      isProfileComplete: isComplete,
      updatedAt: new Date().toISOString(),
    };

    // Ensure jobs are available for this client
    if (isComplete) {
      this.clientJobs.forEach((j) => {
        if (j.clientId === 'usr_client_demo') {
          j.clientId = this.currentClient!.uid;
        }
      });
      this.applications.forEach((a) => {
        if (a.clientId === 'usr_client_demo') {
          a.clientId = this.currentClient!.uid;
        }
      });
    }

    this.clientsByUid.set(this.currentClient.uid, this.currentClient);
    return this.currentClient;
  }

  clearSession(): void {
    this.currentClient = null;
  }

  // --- Jobs ---
  getMyJobs(statusFilter?: 'all' | JobStatus): Job[] {
    const client = this.getCurrentClient();
    let list = this.clientJobs.filter((j) => j.clientId === client.uid);
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((j) => j.status === statusFilter);
    }
    return list;
  }

  getJobById(id: string): Job | undefined {
    return this.clientJobs.find((j) => j.id === id);
  }

  createJob(jobData: Omit<Job, 'id' | 'clientId' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'status'>): Job {
    const client = this.getCurrentClient();
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientId: client.uid,
      clientName: client.companyName,
      status: 'pending_approval',
      approvalStatus: 'pending', // Requires admin approval!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.clientJobs.unshift(newJob);
    return newJob;
  }

  updatePendingJob(
    id: string,
    updates: Partial<Pick<Job, 'title' | 'description' | 'category' | 'skills' | 'budget' | 'deadline' | 'location' | 'isRemote' | 'jobType'>>
  ): { success: boolean; job?: Job; error?: string } {
    const job = this.getJobById(id);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Client can only edit pending or draft jobs!
    if (job.approvalStatus === 'approved') {
      return { success: false, error: 'Cannot edit an already approved job without admin re-review.' };
    }

    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    return { success: true, job };
  }

  // --- Applications ---
  getApplicationsForJob(jobId: string): JobApplication[] {
    return this.applications.filter((a) => a.jobId === jobId);
  }

  getAllReceivedApplications(): JobApplication[] {
    const client = this.getCurrentClient();
    return this.applications.filter((a) => a.clientId === client.uid);
  }

  updateApplicationStatus(
    applicationId: string,
    status: JobApplication['status'],
    feedback?: string
  ): boolean {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) return false;

    app.status = status;
    if (feedback) app.feedback = feedback;
    app.updatedAt = new Date().toISOString();
    return true;
  }

  // --- Notifications ---
  getNotifications(): AppNotification[] {
    return this.notifications;
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markNotificationRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) n.read = true;
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  clearAllNotifications() {
    this.notifications = [];
  }
}

export const ClientService = new ClientServiceManager();
