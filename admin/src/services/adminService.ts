import {
  User,
  ClientProfile,
  StudentProfile,
  Job,
  JobApplication,
  AppNotification,
  NotificationCampaign,
  NotificationCategory,
  NotificationTarget,
  NotificationService,
  AppVersionConfig,
  AppId,
  AuditLogEntry,
  StaffMember,
  Category,
  PlatformReport,
  FeatureFlag,
  SystemSettings,
  Permission,
  UserRole,
  Project,
  INITIAL_PROJECTS,
  DEFAULT_ROLE_CONFIGS,
  DEFAULT_APP_VERSIONS,
  DEFAULT_CATEGORIES,
  AccountDeletionService,
  NotificationTemplate,
  NotificationTemplateApp,
  NotificationTemplateStatus,
  TemplateRenderResult,
  DeletionResult,
  FirestoreClient,
} from '@gotechplace/shared';

class AdminServiceManager {
  // 0. Projects Dataset
  private projects: Project[] = [...INITIAL_PROJECTS];

  // 1. Current logged-in admin user
  private currentAdmin: User = {
    uid: 'admin_superuser_01',
    phoneNumber: '+91 99999 88888',
    name: 'Platform Superuser',
    role: 'superuser',
    status: 'active',
    isApproved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  // 2. Users Dataset
  private users: User[] = [
    {
      uid: 'admin_superuser_01',
      phoneNumber: '+91 99999 88888',
      name: 'Platform Superuser',
      role: 'superuser',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      uid: 'staff_mod_01',
      phoneNumber: '+91 98700 11223',
      name: 'Aditi Rao',
      role: 'moderator',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    {
      uid: 'usr_student_himanshu',
      phoneNumber: '+91 98765 43210',
      name: 'Himanshu Sharma',
      role: 'student',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-15T09:00:00.000Z',
      updatedAt: '2026-01-15T09:00:00.000Z',
    },
    {
      uid: 'usr_9999999999',
      phoneNumber: '+91 99999 99999',
      name: 'Himanshu Sharma (Verified Student)',
      role: 'student',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-16T09:00:00.000Z',
      updatedAt: '2026-01-16T09:00:00.000Z',
    },
    {
      uid: 'usr_client_demo',
      phoneNumber: '+91 98123 45678',
      name: 'Vikram Malhotra',
      role: 'client',
      status: 'active',
      isApproved: true,
      createdAt: '2026-01-20T11:00:00.000Z',
      updatedAt: '2026-01-20T11:00:00.000Z',
    },
    {
      uid: 'usr_client_pending',
      phoneNumber: '+91 98450 99887',
      name: 'Aerosmith Robotics',
      role: 'client',
      status: 'pending',
      isApproved: false,
      createdAt: '2026-02-14T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
    },
  ];

  // 3. Pending Clients Queue
  private clients: ClientProfile[] = [
    {
      uid: 'usr_client_demo',
      clientId: 'CLI-001',
      companyName: 'Nexus Innovations Ltd',
      contactPerson: 'Vikram Malhotra',
      phoneNumber: '+91 98123 45678',
      email: 'contact@nexusinnovations.tech',
      location: 'Bangalore, Karnataka',
      industry: 'Software & Cloud Engineering',
      description: 'Leading provider of modern cloud architectures and scalable mobile solutions.',
      approvalStatus: 'approved',
      createdAt: '2026-01-20T11:00:00.000Z',
      updatedAt: '2026-01-20T11:00:00.000Z',
    },
    {
      uid: 'usr_client_pending',
      clientId: 'CLI-002',
      companyName: 'Aerosmith Robotics Private Ltd',
      contactPerson: 'Karan Mehra (Founder)',
      phoneNumber: '+91 98450 99887',
      email: 'karan@aerosmithrobotics.in',
      website: 'https://aerosmithrobotics.in',
      location: 'Pune, Maharashtra',
      industry: 'Robotics & Automation',
      description: 'Autonomous industrial drone and robotic manipulator development startup.',
      approvalStatus: 'pending',
      createdAt: '2026-02-14T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
    },
  ];

  // 4. Jobs Dataset
  private jobs: Job[] = [
    {
      id: 'job-101',
      clientId: 'usr_client_demo',
      clientName: 'Nexus Innovations Ltd',
      title: 'Junior React Native Android Developer',
      description: 'Looking for a passionate junior mobile engineer to join our team.',
      category: 'Mobile Development',
      skills: ['React Native', 'TypeScript', 'Android', 'Firebase'],
      budget: 45000,
      deadline: '2026-11-30',
      location: 'Bangalore, India',
      isRemote: false,
      jobType: 'Full-time',
      attachments: [],
      status: 'approved',
      approvalStatus: 'approved',
      applicationsCount: 4,
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 'job-pending-01',
      clientId: 'usr_client_demo',
      clientName: 'Nexus Innovations Ltd',
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

  // 5. App Versions Configuration (Student, Client, Admin)
  private appVersions: Record<AppId, AppVersionConfig> = {
    student: {
      appId: 'student',
      latestVersion: DEFAULT_APP_VERSIONS.student.latestVersion,
      minimumVersion: DEFAULT_APP_VERSIONS.student.minimumVersion,
      updateMode: DEFAULT_APP_VERSIONS.student.updateMode,
      updateTitle: DEFAULT_APP_VERSIONS.student.updateTitle,
      updateMessage: DEFAULT_APP_VERSIONS.student.updateMessage,
      androidStoreUrl: DEFAULT_APP_VERSIONS.student.androidStoreUrl,
      maintenance: DEFAULT_APP_VERSIONS.student.maintenance,
      enabled: DEFAULT_APP_VERSIONS.student.enabled,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin_superuser_01',
    },
    client: {
      appId: 'client',
      latestVersion: DEFAULT_APP_VERSIONS.client.latestVersion,
      minimumVersion: DEFAULT_APP_VERSIONS.client.minimumVersion,
      updateMode: DEFAULT_APP_VERSIONS.client.updateMode,
      updateTitle: DEFAULT_APP_VERSIONS.client.updateTitle,
      updateMessage: DEFAULT_APP_VERSIONS.client.updateMessage,
      androidStoreUrl: DEFAULT_APP_VERSIONS.client.androidStoreUrl,
      maintenance: DEFAULT_APP_VERSIONS.client.maintenance,
      enabled: DEFAULT_APP_VERSIONS.client.enabled,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin_superuser_01',
    },
    admin: {
      appId: 'admin',
      latestVersion: DEFAULT_APP_VERSIONS.admin.latestVersion,
      minimumVersion: DEFAULT_APP_VERSIONS.admin.minimumVersion,
      updateMode: DEFAULT_APP_VERSIONS.admin.updateMode,
      updateTitle: DEFAULT_APP_VERSIONS.admin.updateTitle,
      updateMessage: DEFAULT_APP_VERSIONS.admin.updateMessage,
      androidStoreUrl: DEFAULT_APP_VERSIONS.admin.androidStoreUrl,
      maintenance: DEFAULT_APP_VERSIONS.admin.maintenance,
      enabled: DEFAULT_APP_VERSIONS.admin.enabled,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin_superuser_01',
    },
  };

  // 6. Staff & Permissions
  private staffMembers: StaffMember[] = [
    {
      uid: 'staff_mod_01',
      name: 'Aditi Rao',
      phoneNumber: '+91 98700 11223',
      email: 'aditi.moderator@gotechplace.com',
      role: 'moderator',
      permissions: ['jobs.view', 'jobs.approve', 'jobs.reject', 'reports.view', 'reports.manage'],
      status: 'active',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
  ];

  // 7. Categories
  private categories: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
    id: `cat-${idx + 1}`,
    name: cat,
    description: `Category for ${cat} projects and listings`,
    isEnabled: true,
    jobsCount: idx === 0 ? 3 : 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }));

  // 8. Push Notifications Campaigns
  private campaigns: NotificationCampaign[] = [
    {
      id: 'camp-1',
      title: 'Welcome to Spring Semester 2026',
      message: 'New major and minor projects are now open for reservations.',
      target: 'student_app',
      sentBy: 'admin_superuser_01',
      sentByName: 'Platform Superuser',
      status: 'sent',
      sentAt: '2026-02-01T09:00:00.000Z',
      recipientCount: 1450,
      createdAt: '2026-02-01T09:00:00.000Z',
    },
  ];

  // 8b. Administrative Incoming Alerts & Notifications
  private adminNotifications: AppNotification[] = [
    {
      id: 'anotif-1',
      userId: 'usr_admin_root',
      title: 'New Client Awaiting Verification',
      body: 'Apex Dynamics Ltd completed employer KYC. Awaiting business review and approval.',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      deepLink: 'gotechplace://admin/clientApprovals',
    },
    {
      id: 'anotif-2',
      userId: 'usr_admin_root',
      title: 'Job Posting Review Required',
      body: 'Nexus Innovations Ltd submitted "AI Computer Vision Pipeline Engineer" for moderation.',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      deepLink: 'gotechplace://admin/jobApprovals',
    },
    {
      id: 'anotif-3',
      userId: 'usr_admin_root',
      title: 'System Activity Alert',
      body: 'High candidate application volume detected on mobile developer positions.',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    },
    {
      id: 'anotif-4',
      userId: 'usr_admin_root',
      title: 'Automated Snapshot Verified',
      body: 'Nightly database backup and audit ledger checkpoint completed successfully.',
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'anotif-5',
      userId: 'usr_admin_root',
      title: 'Release Version 1.0.1 Staged',
      body: 'Optional client and student app upgrade manifests have been published to version control.',
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  // 9. Feature Flags
  private featureFlags: FeatureFlag[] = [
    {
      id: 'ff-1',
      key: 'jobs_enabled',
      name: 'Client Job Marketplace',
      description: 'Allow clients to post and students to browse jobs',
      isEnabled: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
      updatedBy: 'superuser',
    },
    {
      id: 'ff-2',
      key: 'applications_enabled',
      name: 'Student Job Applications',
      description: 'Allow students to submit applications to client jobs',
      isEnabled: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
      updatedBy: 'superuser',
    },
    {
      id: 'ff-3',
      key: 'client_registration_enabled',
      name: 'Client Self-Registration',
      description: 'Allow new employers to sign up and submit verification details',
      isEnabled: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
      updatedBy: 'superuser',
    },
  ];

  // 10. System Settings
  private settings: SystemSettings = {
    id: 'settings_global',
    platformName: 'GoTechPlace',
    supportEmail: 'support@gotechplace.com',
    supportPhone: '+91 800 123 4567',
    allowClientRegistration: true,
    allowStudentRegistration: true,
    requireClientApproval: true,
    requireJobApproval: true,
    maxAttachmentsPerJob: 5,
    maxAttachmentSizeMb: 10,
    maintenanceModeAll: false,
    maintenanceMessage: 'GoTechPlace ecosystem is currently undergoing scheduled platform upgrades.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'superuser',
  };

  // 11. Platform Reports
  private reports: PlatformReport[] = [
    {
      id: 'rep-01',
      reporterId: 'usr_student_himanshu',
      reporterName: 'Himanshu Sharma',
      targetId: 'job-101',
      targetType: 'job',
      targetTitle: 'Junior React Native Android Developer',
      reason: 'Question regarding stipend clarity',
      details: 'Is the stipend monthly or milestone-based?',
      status: 'pending',
      createdAt: '2026-02-10T12:00:00.000Z',
      updatedAt: '2026-02-10T12:00:00.000Z',
    },
  ];

  // 12. Audit Logs (Immutable)
  private auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-001',
      adminId: 'admin_superuser_01',
      adminName: 'Platform Superuser',
      action: 'APPROVE_JOB',
      targetId: 'job-101',
      targetType: 'job',
      timestamp: '2026-02-01T10:05:00.000Z',
      metadata: { title: 'Junior React Native Android Developer' },
    },
    {
      id: 'aud-002',
      adminId: 'admin_superuser_01',
      adminName: 'Platform Superuser',
      action: 'APPROVE_CLIENT',
      targetId: 'usr_client_demo',
      targetType: 'client',
      timestamp: '2026-01-20T11:15:00.000Z',
      metadata: { companyName: 'Nexus Innovations Ltd' },
    },
  ];

  // Helper to append immutable audit log
  private logAction(
    action: AuditLogEntry['action'],
    targetType: AuditLogEntry['targetType'],
    targetId?: string,
    metadata?: Record<string, any>
  ) {
    this.auditLogs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: this.currentAdmin.uid,
      adminName: this.currentAdmin.name,
      action,
      targetId,
      targetType,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    });
  }

  // Constructor to seed Firestore Client cache
  constructor() {
    FirestoreClient.seedCache('users', this.users);
    FirestoreClient.seedCache('clients', this.clients);
    FirestoreClient.seedCache('jobs', this.jobs);
    FirestoreClient.seedCache('projects', this.projects);
    FirestoreClient.seedCache('campaigns', this.campaigns);
  }

  // --- Auth & Admin Session ---
  getCurrentAdmin(): User {
    return this.currentAdmin;
  }

  setAdminSession(user: User) {
    this.currentAdmin = user;
    this.logAction('LOGIN', 'user', user.uid);
  }

  // --- Dashboard Metrics ---
  getDashboardStats() {
    const totalStudents = this.users.filter((u) => u.role === 'student').length;
    const totalClients = this.clients.length;
    const pendingClients = this.clients.filter((c) => c.approvalStatus === 'pending').length;
    const approvedClients = this.clients.filter((c) => c.approvalStatus === 'approved').length;

    const totalJobs = this.jobs.length;
    const pendingJobs = this.jobs.filter((j) => j.approvalStatus === 'pending').length;
    const approvedJobs = this.jobs.filter((j) => j.approvalStatus === 'approved').length;
    const rejectedJobs = this.jobs.filter((j) => j.approvalStatus === 'rejected').length;

    const activeUsers = this.users.filter((u) => u.status === 'active').length;
    const suspendedUsers = this.users.filter((u) => u.status === 'suspended').length;
    const pendingReports = this.reports.filter((r) => r.status === 'pending').length;

    return {
      totalStudents,
      totalClients,
      pendingClients,
      approvedClients,
      totalJobs,
      pendingJobs,
      approvedJobs,
      rejectedJobs,
      activeUsers,
      suspendedUsers,
      pendingReports,
      totalCampaigns: this.campaigns.length,
    };
  }

  // --- Users Management ---
  getUsers(filters?: { role?: string; status?: string; search?: string }): User[] {
    let list = [...this.users];
    if (filters?.role && filters.role !== 'all') {
      list = list.filter((u) => u.role === filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((u) => u.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      const qDigits = q.replace(/\D/g, '');
      list = list.filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const uidMatch = u.uid.toLowerCase().includes(q);
        const phoneRawMatch = u.phoneNumber.toLowerCase().includes(q);
        const phoneDigits = u.phoneNumber.replace(/\D/g, '');
        const phoneDigitMatch = qDigits.length >= 3 && phoneDigits.includes(qDigits);
        return nameMatch || uidMatch || phoneRawMatch || phoneDigitMatch;
      });
    }
    return list;
  }

  getUserById(uid: string): User | undefined {
    return this.users.find((u) => u.uid === uid);
  }

  registerOrUpdateUser(user: Partial<User> & { uid: string; phoneNumber?: string }): User {
    const existing = this.getUserById(user.uid);
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, user, { updatedAt: now });
      return existing;
    }
    const newUser: User = {
      uid: user.uid,
      phoneNumber: user.phoneNumber || '+91 99999 99999',
      name: user.name || 'User Account',
      role: user.role || 'student',
      status: user.status || 'active',
      isApproved: user.isApproved ?? true,
      email: user.email,
      createdAt: now,
      updatedAt: now,
    };
    this.users.unshift(newUser);
    return newUser;
  }

  setUserStatus(uid: string, status: 'active' | 'suspended'): boolean {
    const u = this.getUserById(uid);
    if (!u) return false;
    u.status = status;
    u.updatedAt = new Date().toISOString();
    this.logAction(status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER', 'user', uid, { status });
    return true;
  }

  /**
   * Superuser-Only Complete User Data Deletion
   */
  async permanentlyDeleteUserData(
    targetUid: string,
    confirmationPhrase: string
  ): Promise<DeletionResult> {
    const targetUser = this.getUserById(targetUid);
    if (!targetUser) {
      return {
        success: false,
        deletionJobId: '',
        message: 'Target user does not exist.',
        deletedRecordsCount: 0,
        error: 'User not found in system directory.',
      };
    }

    const result = await AccountDeletionService.executeSuperuserDeletion(
      targetUser,
      this.currentAdmin,
      confirmationPhrase,
      async (uid, role) => {
        // 1. Remove from in-memory users array
        this.users = this.users.filter((u) => u.uid !== uid);

        // 2. If client, remove from clients array and close/delete jobs
        if (role === 'client') {
          this.clients = this.clients.filter((c) => c.uid !== uid);
          this.jobs = this.jobs.filter((j) => j.clientId !== uid);
        }

        // 3. If staff, remove from staffMembers
        this.staffMembers = this.staffMembers.filter((s) => s.uid !== uid);

        // 4. Remove user reports
        this.reports = this.reports.filter((r) => r.reporterId !== uid && r.targetId !== uid);
      }
    );

    if (result.success) {
      this.logAction('DELETE_USER', 'user', targetUid, {
        targetRole: targetUser.role,
        targetPhone: targetUser.phoneNumber,
        targetName: targetUser.name,
        deletionJobId: result.deletionJobId,
      });
    }

    return result;
  }

  // --- Client Approvals ---
  getPendingClients(): ClientProfile[] {
    return this.clients.filter((c) => c.approvalStatus === 'pending');
  }

  getAllClients(): ClientProfile[] {
    return this.clients;
  }

  approveClient(clientId: string): boolean {
    const client = this.clients.find((c) => c.uid === clientId || c.clientId === clientId);
    if (!client) return false;

    client.approvalStatus = 'approved';
    client.approvedBy = this.currentAdmin.uid;
    client.approvedAt = new Date().toISOString();

    const u = this.getUserById(client.uid);
    if (u) {
      u.isApproved = true;
      u.status = 'active';
    }

    // Trigger automatic push notification to client
    NotificationService.generateAutomaticNotification('CLIENT_APPROVED', {
      recipientUid: client.uid,
      companyName: client.companyName,
    });

    this.logAction('APPROVE_CLIENT', 'client', client.uid, { companyName: client.companyName });
    return true;
  }

  rejectClient(clientId: string, reason: string): boolean {
    const client = this.clients.find((c) => c.uid === clientId || c.clientId === clientId);
    if (!client) return false;

    client.approvalStatus = 'rejected';
    client.rejectionReason = reason;
    client.rejectedBy = this.currentAdmin.uid;
    client.rejectedAt = new Date().toISOString();

    // Trigger automatic push notification to client with feedback
    NotificationService.generateAutomaticNotification('CLIENT_REJECTED', {
      recipientUid: client.uid,
      companyName: client.companyName,
      reason,
    });

    this.logAction('REJECT_CLIENT', 'client', client.uid, { companyName: client.companyName, reason });
    return true;
  }

  // --- Job Approvals ---
  getPendingJobs(): Job[] {
    return this.jobs.filter((j) => j.approvalStatus === 'pending');
  }

  getAllJobs(): Job[] {
    return this.jobs;
  }

  approveJob(jobId: string): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return false;

    job.approvalStatus = 'approved';
    job.status = 'approved';
    job.approvedBy = this.currentAdmin.uid;
    job.approvedAt = new Date().toISOString();

    // 1. Trigger notification to Employer
    NotificationService.generateAutomaticNotification('JOB_APPROVED', {
      recipientUid: job.clientId || 'system',
      jobId: job.id,
      jobTitle: job.title,
    });

    // 2. Trigger notification broadcast to Students
    const company = job.company || job.clientName || 'Company';
    NotificationService.createCampaignPayload(
      '💼 New Verified Job Opening!',
      `${job.title} at ${company} (${job.category || 'General'}) is now open for applications.`,
      'student_app',
      { uid: this.currentAdmin.uid, name: 'System Moderation' },
      {
        category: 'jobs',
        deepLink: `gotechplace://student/job/${job.id}`,
      }
    );

    this.logAction('APPROVE_JOB', 'job', job.id, { title: job.title });
    return true;
  }

  rejectJob(jobId: string, reason: string): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return false;

    job.approvalStatus = 'rejected';
    job.status = 'rejected';
    job.rejectionReason = reason;
    job.rejectedBy = this.currentAdmin.uid;
    job.rejectedAt = new Date().toISOString();

    // Trigger feedback notification to Employer
    NotificationService.generateAutomaticNotification('JOB_REJECTED', {
      recipientUid: job.clientId || 'system',
      jobId: job.id,
      jobTitle: job.title,
      reason,
    });

    this.logAction('REJECT_JOB', 'job', job.id, { title: job.title, reason });
    return true;
  }

  deleteJob(jobId: string): boolean {
    const idx = this.jobs.findIndex((j) => j.id === jobId);
    if (idx === -1) return false;
    const [deleted] = this.jobs.splice(idx, 1);
    this.logAction('DELETE_JOB', 'job', jobId, { title: deleted.title });
    return true;
  }

  // --- App Version & Force Update ---
  getAppVersions(): Record<AppId, AppVersionConfig> {
    return this.appVersions;
  }

  updateAppVersion(appId: AppId, updates: Partial<AppVersionConfig>): AppVersionConfig {
    const current = this.appVersions[appId];
    this.appVersions[appId] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentAdmin.uid,
    };

    this.logAction('UPDATE_APP_VERSION', 'version', appId, updates);
    return this.appVersions[appId];
  }

  setMaintenanceMode(appId: AppId, maintenance: boolean, message?: string): boolean {
    const current = this.appVersions[appId];
    if (!current) return false;

    current.maintenance = maintenance;
    if (message) current.maintenanceMessage = message;
    current.updatedAt = new Date().toISOString();

    this.logAction(
      maintenance ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
      'version',
      appId,
      { maintenance, message }
    );
    return true;
  }

  // --- Staff & Permissions ---
  getStaffMembers(): StaffMember[] {
    return this.staffMembers;
  }

  createStaff(name: string, phoneNumber: string, email: string, role: UserRole, permissions: Permission[]): StaffMember {
    const newStaff: StaffMember = {
      uid: `staff_${Date.now()}`,
      name,
      phoneNumber,
      email,
      role,
      permissions,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.staffMembers.push(newStaff);
    this.users.push({
      uid: newStaff.uid,
      phoneNumber,
      name,
      role,
      status: 'active',
      isApproved: true,
      email,
      createdAt: newStaff.createdAt,
      updatedAt: newStaff.updatedAt,
    });

    this.logAction('CREATE_STAFF', 'staff', newStaff.uid, { name, role });
    return newStaff;
  }

  updateStaff(uid: string, updates: Partial<StaffMember>): boolean {
    const staff = this.staffMembers.find((s) => s.uid === uid);
    if (!staff) return false;

    Object.assign(staff, updates, { updatedAt: new Date().toISOString() });
    this.logAction('UPDATE_STAFF', 'staff', uid, updates);
    return true;
  }

  deleteStaff(uid: string): boolean {
    const idx = this.staffMembers.findIndex((s) => s.uid === uid);
    if (idx === -1) return false;
    const [deleted] = this.staffMembers.splice(idx, 1);
    this.logAction('DISABLE_STAFF', 'staff', uid, { name: deleted.name });
    return true;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.categories;
  }

  createCategory(name: string, description: string): Category {
    const cat: Category = {
      id: `cat-${Date.now()}`,
      name,
      description,
      isEnabled: true,
      jobsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.categories.push(cat);
    this.logAction('CREATE_CATEGORY', 'category', cat.id, { name });
    return cat;
  }

  toggleCategory(id: string): boolean {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return false;
    cat.isEnabled = !cat.isEnabled;
    cat.updatedAt = new Date().toISOString();
    this.logAction('UPDATE_CATEGORY', 'category', id, { isEnabled: cat.isEnabled });
    return true;
  }

  // --- Push Notifications ---
  getCampaigns(): NotificationCampaign[] {
    return this.campaigns;
  }

  sendCampaign(
    title: string,
    message: string,
    target: NotificationTarget,
    imageUrl?: string,
    deepLink?: string,
    category?: NotificationCategory,
    targetUserIds?: string[]
  ): NotificationCampaign {
    const knownCounts = {
      students: this.users.filter((u) => u.role === 'student').length || 1450,
      clients: this.users.filter((u) => u.role === 'client').length || 320,
      admins: this.users.filter((u) => ['superuser', 'admin', 'staff', 'moderator'].includes(u.role)).length || 35,
    };

    const campaign = NotificationService.createCampaignPayload(
      title,
      message,
      target,
      { uid: this.currentAdmin.uid, name: this.currentAdmin.name },
      {
        category,
        imageUrl,
        deepLink,
        targetUserIds,
        knownCounts,
      }
    );

    this.campaigns.unshift(campaign);
    this.logAction('SEND_NOTIFICATION', 'notification', campaign.id, { title, target, category });
    return campaign;
  }

  // --- Notification Templates Management ---
  getNotificationTemplates(filters?: {
    app?: NotificationTemplateApp;
    category?: NotificationCategory;
    status?: NotificationTemplateStatus;
    search?: string;
  }): NotificationTemplate[] {
    return NotificationService.getTemplates(filters);
  }

  getNotificationTemplateById(id: string): NotificationTemplate | undefined {
    return NotificationService.getTemplateById(id);
  }

  createNotificationTemplate(data: {
    app: NotificationTemplateApp;
    name: string;
    title: string;
    body: string;
    category: NotificationCategory;
    deepLink?: string;
    imageUrl?: string;
    targetAudienceDefault?: NotificationTarget;
  }): { success: boolean; template?: NotificationTemplate; error?: string } {
    const res = NotificationService.createCustomTemplate({
      ...data,
      createdBy: this.currentAdmin.name,
    });
    if (res.success && res.template) {
      this.logAction('CREATE_TEMPLATE', 'notification', res.template.id, {
        name: res.template.name,
        app: res.template.app,
      });
    }
    return res;
  }

  updateNotificationTemplate(
    id: string,
    updates: Partial<Pick<NotificationTemplate, 'name' | 'title' | 'body' | 'category' | 'deepLink' | 'imageUrl' | 'status' | 'app' | 'targetAudienceDefault'>>
  ): { success: boolean; template?: NotificationTemplate; error?: string } {
    const res = NotificationService.updateTemplate(id, updates);
    if (res.success && res.template) {
      this.logAction('UPDATE_TEMPLATE', 'notification', id, updates);
    }
    return res;
  }

  duplicateNotificationTemplate(
    id: string,
    newName?: string
  ): { success: boolean; template?: NotificationTemplate; error?: string } {
    const res = NotificationService.duplicateTemplate(id, newName, this.currentAdmin.name);
    if (res.success && res.template) {
      this.logAction('DUPLICATE_TEMPLATE', 'notification', res.template.id, {
        sourceId: id,
        name: res.template.name,
      });
    }
    return res;
  }

  deleteNotificationTemplate(id: string): { success: boolean; error?: string } {
    const target = NotificationService.getTemplateById(id);
    const res = NotificationService.deleteCustomTemplate(id);
    if (res.success) {
      this.logAction('DELETE_TEMPLATE', 'notification', id, {
        name: target?.name,
      });
    }
    return res;
  }

  renderNotificationTemplate(
    template: NotificationTemplate,
    variables: Record<string, string>
  ): TemplateRenderResult {
    return NotificationService.renderTemplate(template, variables);
  }

  // --- Feature Flags ---
  getFeatureFlags(): FeatureFlag[] {
    return this.featureFlags;
  }

  toggleFeatureFlag(id: string): boolean {
    const f = this.featureFlags.find((item) => item.id === id);
    if (!f) return false;
    f.isEnabled = !f.isEnabled;
    f.updatedAt = new Date().toISOString();
    f.updatedBy = this.currentAdmin.uid;
    this.logAction('UPDATE_SETTINGS', 'setting', f.id, { key: f.key, enabled: f.isEnabled });
    return true;
  }

  // --- System Settings ---
  getSettings(): SystemSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentAdmin.uid,
    };
    this.logAction('UPDATE_SETTINGS', 'setting', 'global', updates);
    return this.settings;
  }

  // --- Reports ---
  getReports(): PlatformReport[] {
    return this.reports;
  }

  resolveReport(id: string, note?: string): boolean {
    const rep = this.reports.find((r) => r.id === id);
    if (!rep) return false;
    rep.status = 'resolved';
    rep.resolutionNote = note || 'Resolved by administration';
    rep.updatedAt = new Date().toISOString();
    this.logAction('RESOLVE_REPORT', 'report', id, { note });
    return true;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  // --- Administrative Incoming Notifications & Alerts ---
  getAdminNotifications(): AppNotification[] {
    const uid = this.currentAdmin ? this.currentAdmin.uid : 'usr_admin_root';
    return NotificationService.getNotificationsForUser(uid, 'admin');
  }

  getUnreadAdminNotificationsCount(): number {
    const uid = this.currentAdmin ? this.currentAdmin.uid : 'usr_admin_root';
    return NotificationService.getUnreadCount(uid, 'admin');
  }

  markAdminNotificationRead(id: string) {
    const uid = this.currentAdmin ? this.currentAdmin.uid : 'usr_admin_root';
    NotificationService.markAsRead(uid, id);
  }

  markAllAdminNotificationsAsRead() {
    const uid = this.currentAdmin ? this.currentAdmin.uid : 'usr_admin_root';
    NotificationService.markAllAsRead(uid, 'admin');
  }

  clearAllAdminNotifications() {
    const uid = this.currentAdmin ? this.currentAdmin.uid : 'usr_admin_root';
    NotificationService.clearAll(uid);
  }

  deleteAdminNotification(id: string) {
    const uid = this.currentAdmin ? this.currentAdmin.uid : 'usr_admin_root';
    NotificationService.deleteNotification(uid, id);
  }

  // --- Projects Management (Full Control) ---
  getAllProjects(): Project[] {
    return [...this.projects];
  }

  getProjectById(projectId: string): Project | undefined {
    return this.projects.find((p) => p.project_id === projectId);
  }

  createProject(data: Partial<Project>): Project {
    const newProject: Project = {
      project_id: data.project_id || `proj_${Date.now()}`,
      title: data.title || 'Untitled Project',
      description: data.description || '',
      branch: data.branch || 'CSE / IT',
      project_type: data.project_type || 'Minor',
      technologies: data.technologies || ['React Native', 'Node.js'],
      difficulty: data.difficulty || 'Intermediate',
      duration: data.duration || '4–6 weeks',
      cost: data.discounted_cost || data.cost || 6000,
      original_cost: data.original_cost || 8000,
      discounted_cost: data.discounted_cost || 6000,
      availability: data.availability || 'Available',
      capacity: data.capacity || 25,
      image: data.image || '/images/projects/1.webp',
      components: data.components || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.unshift(newProject);
    this.logAction('CREATE_PROJECT', 'project', newProject.project_id, { title: newProject.title });
    return newProject;
  }

  updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const idx = this.projects.findIndex((p) => p.project_id === projectId);
    if (idx === -1) return null;
    this.projects[idx] = {
      ...this.projects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.logAction('UPDATE_PROJECT', 'project', projectId, updates);
    return this.projects[idx];
  }

  deleteProject(projectId: string): boolean {
    const prevLen = this.projects.length;
    this.projects = this.projects.filter((p) => p.project_id !== projectId);
    if (this.projects.length < prevLen) {
      this.logAction('DELETE_PROJECT', 'project', projectId, {});
      return true;
    }
    return false;
  }

  toggleProjectAvailability(projectId: string): Project | null {
    const p = this.projects.find((item) => item.project_id === projectId);
    if (!p) return null;
    p.availability = p.availability === 'Available' ? 'Booked' : 'Available';
    p.updated_at = new Date().toISOString();
    this.logAction('UPDATE_PROJECT', 'project', projectId, { availability: p.availability });
    return p;
  }
}

export const AdminService = new AdminServiceManager();

