import {
  AppNotification,
  NotificationCampaign,
  NotificationCategory,
  NotificationTarget,
  SystemNotificationEvent,
  DeviceToken,
  NotificationTemplate,
  NotificationTemplateApp,
  NotificationTemplateStatus,
  TemplateRenderResult,
} from '../types/notification';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../data/defaultNotificationTemplates';

class NotificationServiceManager {
  private notifications: Map<string, AppNotification[]> = new Map();
  private deviceTokens: Map<string, DeviceToken[]> = new Map();
  private campaigns: NotificationCampaign[] = [];
  private templates: NotificationTemplate[] = [...DEFAULT_NOTIFICATION_TEMPLATES];
  private listeners: Set<(notification: AppNotification) => void> = new Set();

  constructor() {
    this.seedDefaultNotifications();
  }

  private seedDefaultNotifications() {
    const studentNotifs: AppNotification[] = [
      {
        id: 'notif-stu-1',
        userId: 'usr_student',
        title: 'Welcome to GoTechPlace',
        body: 'Explore major & minor projects, enroll in industry courses, and apply to top client jobs.',
        category: 'general',
        read: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        deepLink: 'gotechplace://student/dashboard',
      },
      {
        id: 'notif-stu-2',
        userId: 'usr_student',
        title: 'New Job Match: React Native Engineer',
        body: 'Nexus Innovations Ltd posted a new position matching your skills: React Native, TypeScript & Firebase.',
        category: 'jobs',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        deepLink: 'gotechplace://student/jobs/job-01',
      },
      {
        id: 'notif-stu-3',
        userId: 'usr_student',
        title: 'Course Enrollment Confirmed',
        body: 'You have been enrolled in "Full-Stack Mobile Architecture". Your learning track is now live.',
        category: 'courses',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        deepLink: 'gotechplace://student/courses/course-01',
      },
    ];

    const clientNotifs: AppNotification[] = [
      {
        id: 'notif-cli-1',
        userId: 'usr_client_demo',
        title: 'Welcome to GoTechPlace Employers',
        body: 'Your account is active. Start posting jobs and recruiting pre-screened engineering students.',
        category: 'general',
        read: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        deepLink: 'gotechplace://client/dashboard',
      },
      {
        id: 'notif-cli-2',
        userId: 'usr_client_demo',
        title: 'Candidate Applications Available',
        body: 'New students applied to your "Junior React Native Android Developer" position.',
        category: 'applications',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        deepLink: 'gotechplace://client/applications',
      },
    ];

    const adminNotifs: AppNotification[] = [
      {
        id: 'anotif-1',
        userId: 'usr_admin_root',
        title: 'New Client Awaiting Verification',
        body: 'Apex Dynamics Ltd completed employer KYC. Awaiting business review and approval.',
        category: 'admin',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        deepLink: 'gotechplace://admin/clientApprovals',
      },
      {
        id: 'anotif-2',
        userId: 'usr_admin_root',
        title: 'Job Posting Review Required',
        body: 'Nexus Innovations Ltd submitted "AI Computer Vision Pipeline Engineer" for moderation.',
        category: 'jobs',
        read: false,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        deepLink: 'gotechplace://admin/jobApprovals',
      },
    ];

    this.notifications.set('usr_student', studentNotifs);
    this.notifications.set('usr_student_himanshu', [...studentNotifs]);
    this.notifications.set('student_broadcast', [...studentNotifs]);
    this.notifications.set('usr_client_demo', clientNotifs);
    this.notifications.set('client_broadcast', [...clientNotifs]);
    this.notifications.set('usr_admin_root', adminNotifs);
    this.notifications.set('admin_superuser_01', [...adminNotifs]);
    this.notifications.set('admin_broadcast', [...adminNotifs]);
  }

  /**
   * Subscribe to real-time notification events
   */
  subscribe(listener: (notification: AppNotification) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all registered real-time subscribers
   */
  private notifySubscribers(notification: AppNotification): void {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });
  }

  /**
   * Format deep links consistently across apps
   */
  formatDeepLink(app: 'student' | 'client' | 'admin', route: string, id?: string): string {
    const cleanRoute = route.replace(/^\//, '');
    if (id) {
      return `gotechplace://${app}/${cleanRoute}/${id}`;
    }
    return `gotechplace://${app}/${cleanRoute}`;
  }

  /**
   * Estimate audience count for targeted campaign
   */
  estimateAudience(
    target: NotificationTarget,
    targetUserIds?: string[],
    knownCounts: { students?: number; clients?: number; admins?: number } = {}
  ): number {
    const students = knownCounts.students ?? 1450;
    const clients = knownCounts.clients ?? 320;
    const admins = knownCounts.admins ?? 35;

    switch (target) {
      case 'all_students':
      case 'student_app':
        return students;
      case 'all_clients':
      case 'client_app':
        return clients;
      case 'all_admins':
      case 'all_staff':
      case 'admin_app':
        return admins;
      case 'all_users':
      case 'all_apps':
        return students + clients + admins;
      case 'individual':
        return targetUserIds && targetUserIds.length > 0 ? 1 : 0;
      case 'multiple_users':
      case 'custom':
        return targetUserIds ? targetUserIds.length : 0;
      default:
        return 0;
    }
  }

  /**
   * Create campaign payload with validation, delivery metrics, and multi-app inbox dispatch
   */
  createCampaignPayload(
    title: string,
    message: string,
    target: NotificationTarget,
    sentBy: { uid: string; name: string },
    options?: {
      category?: NotificationCategory;
      imageUrl?: string;
      deepLink?: string;
      targetUserIds?: string[];
      scheduledFor?: string;
      knownCounts?: { students?: number; clients?: number; admins?: number };
    }
  ): NotificationCampaign {
    const recipientCount = this.estimateAudience(
      target,
      options?.targetUserIds,
      options?.knownCounts
    );

    const campaign: NotificationCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      message: message.trim(),
      category: options?.category || 'general',
      target,
      sentBy: sentBy.uid,
      sentByName: sentBy.name,
      imageUrl: options?.imageUrl?.trim() || undefined,
      deepLink: options?.deepLink?.trim() || undefined,
      targetUserIds: options?.targetUserIds,
      scheduledFor: options?.scheduledFor,
      status: options?.scheduledFor ? 'scheduled' : 'sent',
      sentAt: options?.scheduledFor ? undefined : new Date().toISOString(),
      recipientCount,
      successCount: recipientCount,
      failureCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.campaigns.unshift(campaign);

    // If campaign is active/sent, deliver AppNotification into recipient inboxes and notify subscribers
    if (!options?.scheduledFor) {
      const targetUserList: string[] = [];

      if (target === 'individual' || target === 'multiple_users' || target === 'custom') {
        if (options?.targetUserIds && options.targetUserIds.length > 0) {
          targetUserList.push(...options.targetUserIds);
        }
      } else if (target === 'student_app' || target === 'all_students') {
        targetUserList.push('usr_student', 'usr_student_himanshu', 'student_broadcast');
      } else if (target === 'client_app' || target === 'all_clients') {
        targetUserList.push('usr_client_demo', 'usr_client_pending', 'client_broadcast');
      } else if (target === 'admin_app' || target === 'all_admins' || target === 'all_staff') {
        targetUserList.push('usr_admin_root', 'admin_superuser_01', 'staff_mod_01', 'admin_broadcast');
      } else {
        // all_users / all_apps
        targetUserList.push(
          'usr_student',
          'usr_student_himanshu',
          'usr_client_demo',
          'usr_admin_root',
          'admin_superuser_01',
          'all_broadcast'
        );
      }

      targetUserList.forEach((uid) => {
        const notif: AppNotification = {
          id: `notif_camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: uid,
          title: campaign.title,
          body: campaign.message,
          category: campaign.category,
          imageUrl: campaign.imageUrl,
          deepLink: campaign.deepLink,
          read: false,
          createdAt: new Date().toISOString(),
        };
        this.addNotification(notif);
        this.notifySubscribers(notif);
      });
    }

    return campaign;
  }

  /**
   * Validate campaign parameters
   */
  validateCampaign(
    title: string,
    message: string,
    target: NotificationTarget,
    targetUserIds?: string[]
  ): {
    isValid: boolean;
    error?: string;
  } {
    if (!title || title.trim().length < 3) {
      return { isValid: false, error: 'Notification headline must be at least 3 characters' };
    }
    if (!message || message.trim().length < 5) {
      return { isValid: false, error: 'Notification message body must be at least 5 characters' };
    }
    if (!target) {
      return { isValid: false, error: 'Target audience must be selected' };
    }
    if (
      (target === 'individual' || target === 'multiple_users') &&
      (!targetUserIds || targetUserIds.length === 0)
    ) {
      return { isValid: false, error: 'Please specify at least one recipient user ID' };
    }
    return { isValid: true };
  }

  /**
   * Generate automatic system notifications based on business lifecycle events
   */
  generateAutomaticNotification(
    event: SystemNotificationEvent,
    payload: {
      recipientUid: string;
      title?: string;
      body?: string;
      jobId?: string;
      jobTitle?: string;
      companyName?: string;
      studentName?: string;
      applicationId?: string;
      status?: string;
      reason?: string;
    }
  ): AppNotification {
    let title = payload.title || 'System Notification';
    let body = payload.body || '';
    let category: NotificationCategory = 'general';
    let deepLink: string | undefined;

    switch (event) {
      case 'NEW_STUDENT_REGISTERED':
        title = '🎓 New Student Registration';
        body = `${payload.studentName || 'A new student'} just registered on GoTechPlace.`;
        category = 'account';
        deepLink = this.formatDeepLink('admin', 'users', payload.recipientUid);
        break;

      case 'NEW_CLIENT_REGISTERED':
      case 'CLIENT_KYC_SUBMITTED':
        title = '🏢 Employer KYC Submitted';
        body = `${payload.companyName || 'A new company'} submitted verification details. Action required.`;
        category = 'admin';
        deepLink = this.formatDeepLink('admin', 'client-approval', payload.recipientUid);
        break;

      case 'CLIENT_APPROVED':
        title = '🎉 Employer Profile Verified!';
        body = `Congratulations! Your corporate profile for ${payload.companyName || 'your company'} has been approved. You can now post jobs.`;
        category = 'account';
        deepLink = this.formatDeepLink('client', 'create-job');
        break;

      case 'CLIENT_REJECTED':
        title = '⚠️ Verification Needs Revision';
        body = `Your company verification could not be approved. Reason: ${payload.reason || 'Additional documentation needed'}`;
        category = 'account';
        deepLink = this.formatDeepLink('client', 'profile');
        break;

      case 'JOB_CREATED':
        title = '💼 New Job Awaiting Moderation';
        body = `"${payload.jobTitle || 'New Position'}" was posted by ${payload.companyName || 'an employer'} and is pending review.`;
        category = 'jobs';
        deepLink = this.formatDeepLink('admin', 'job-approval', payload.jobId);
        break;

      case 'JOB_APPROVED':
        title = '🎉 Job Posting Approved & Live!';
        body = `Your job listing "${payload.jobTitle || 'Position'}" is approved and active for student applicants.`;
        category = 'jobs';
        deepLink = this.formatDeepLink('client', 'jobs', payload.jobId);
        break;

      case 'JOB_REJECTED':
        title = '⚠️ Job Posting Not Approved';
        body = `"${payload.jobTitle || 'Job'}" was not approved. Reason: ${payload.reason || 'Please adjust job specifications'}`;
        category = 'jobs';
        deepLink = this.formatDeepLink('client', 'jobs', payload.jobId);
        break;

      case 'APPLICATION_SUBMITTED':
        title = '📝 New Candidate Application';
        body = `${payload.studentName || 'A student'} applied for "${payload.jobTitle || 'your position'}".`;
        category = 'applications';
        deepLink = this.formatDeepLink('client', 'applications');
        break;

      case 'APPLICATION_STATUS_CHANGED':
        title = `📌 Application Update: ${payload.status || 'Reviewed'}`;
        body = `Your application for "${payload.jobTitle || 'Job'}" at ${payload.companyName || 'Company'} status has been updated to ${payload.status}.`;
        category = 'applications';
        deepLink = this.formatDeepLink('student', 'applications');
        break;

      case 'COURSE_ENROLLED':
        title = '🎓 Course Enrollment Confirmed';
        body = `You have successfully enrolled in your course. Your learning materials are ready.`;
        category = 'courses';
        deepLink = this.formatDeepLink('student', 'courses');
        break;

      case 'PROJECT_BOOKED':
        title = '🚀 Project Reservation Confirmed';
        body = `Your project slot has been confirmed. Get ready for development guidance.`;
        category = 'projects';
        deepLink = this.formatDeepLink('student', 'projects');
        break;

      case 'SYSTEM_ALERT':
      default:
        category = 'system';
        break;
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: payload.recipientUid,
      title,
      body,
      category,
      deepLink,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.addNotification(notif);
    this.notifySubscribers(notif);
    return notif;
  }

  /**
   * Device Token Management (Multi-Device & Session Isolation)
   */
  registerDeviceToken(
    userId: string,
    token: string,
    platform: 'android' | 'ios' | 'web',
    appId: 'student' | 'client' | 'admin'
  ): DeviceToken {
    const existing = this.deviceTokens.get(userId) || [];
    const existingIndex = existing.findIndex((d) => d.token === token);

    const deviceToken: DeviceToken = {
      id: `dev_${Date.now()}`,
      userId,
      token,
      platform,
      appId,
      enabled: true,
      createdAt: existingIndex >= 0 ? existing[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      existing[existingIndex] = deviceToken;
    } else {
      existing.push(deviceToken);
    }

    this.deviceTokens.set(userId, existing);
    return deviceToken;
  }

  unregisterDeviceToken(userId: string, token: string): void {
    const existing = this.deviceTokens.get(userId) || [];
    this.deviceTokens.set(
      userId,
      existing.filter((d) => d.token !== token)
    );
  }

  getDeviceTokens(userId: string): DeviceToken[] {
    return (this.deviceTokens.get(userId) || []).filter((d) => d.enabled);
  }

  // --- In-Memory Notification Store & Utilities ---
  addNotification(notification: AppNotification): void {
    const userNotifs = this.notifications.get(notification.userId) || [];
    userNotifs.unshift(notification);
    this.notifications.set(notification.userId, userNotifs);
  }

  getUserNotifications(userId: string): AppNotification[] {
    return this.notifications.get(userId) || [];
  }

  /**
   * Get all notifications relevant to a user, including direct notifications and role/global broadcasts
   */
  getNotificationsForUser(userId: string, role?: string): AppNotification[] {
    const directNotifs = this.getUserNotifications(userId);
    const roleKey = role ? `${role}_broadcast` : '';
    const roleNotifs = roleKey ? this.getUserNotifications(roleKey) : [];
    const globalNotifs = this.getUserNotifications('all_broadcast');

    const combined = [...directNotifs, ...roleNotifs, ...globalNotifs];
    
    // Deduplicate by ID and sort descending by createdAt
    const seen = new Set<string>();
    const deduplicated: AppNotification[] = [];

    for (const n of combined) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        deduplicated.push(n);
      }
    }

    return deduplicated.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getUnreadCount(userId: string, role?: string): number {
    const notifs = this.getNotificationsForUser(userId, role);
    return notifs.filter((n) => !n.read).length;
  }

  markAsRead(userId: string, notificationId: string): void {
    // Search in direct, role, and global buckets
    this.notifications.forEach((list) => {
      const item = list.find((n) => n.id === notificationId);
      if (item) {
        item.read = true;
      }
    });
  }

  markAllAsRead(userId: string, role?: string): void {
    const directNotifs = this.getUserNotifications(userId);
    directNotifs.forEach((n) => (n.read = true));

    if (role) {
      const roleNotifs = this.getUserNotifications(`${role}_broadcast`);
      roleNotifs.forEach((n) => (n.read = true));
    }
    const globalNotifs = this.getUserNotifications('all_broadcast');
    globalNotifs.forEach((n) => (n.read = true));
  }

  deleteNotification(userId: string, notificationId: string): void {
    this.notifications.forEach((list, key) => {
      this.notifications.set(
        key,
        list.filter((n) => n.id !== notificationId)
      );
    });
  }

  clearAll(userId: string): void {
    this.notifications.set(userId, []);
  }

  // --- Push Notification Templates Management ---

  /**
   * Extract all {{variable}} keys from a template string
   */
  extractVariables(text: string): string[] {
    if (!text) return [];
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      if (m[1]) matches.add(m[1]);
    }
    return Array.from(matches);
  }

  /**
   * Render template with given variable dictionary and validate for unresolved placeholders
   */
  renderTemplate(
    template: NotificationTemplate,
    variables: Record<string, string>
  ): TemplateRenderResult {
    let renderedTitle = template.title;
    let renderedBody = template.body;

    const allNeeded = new Set([
      ...this.extractVariables(template.title),
      ...this.extractVariables(template.body),
    ]);

    const unresolved: string[] = [];

    allNeeded.forEach((varKey) => {
      const val = variables[varKey];
      const placeholder = `{{${varKey}}}`;
      if (val !== undefined && val !== null && val.trim().length > 0) {
        renderedTitle = renderedTitle.split(placeholder).join(val.trim());
        renderedBody = renderedBody.split(placeholder).join(val.trim());
      } else {
        unresolved.push(varKey);
      }
    });

    return {
      renderedTitle,
      renderedBody,
      unresolvedVariables: unresolved,
      missingVariables: unresolved,
      hasUnrenderedPlaceholders: unresolved.length > 0,
      isValid: unresolved.length === 0,
    };
  }

  /**
   * Get all templates with optional filters or app string
   */
  getTemplates(
    filtersOrApp?:
      | NotificationTemplateApp
      | {
          app?: NotificationTemplateApp;
          category?: NotificationCategory;
          status?: NotificationTemplateStatus;
          search?: string;
        }
  ): NotificationTemplate[] {
    let list = this.templates.map((t) => ({
      ...t,
      isPredefined: t.isPredefined ?? t.isSystem,
    }));

    if (typeof filtersOrApp === 'string') {
      if (filtersOrApp !== 'all') {
        list = list.filter((t) => t.app === filtersOrApp || t.app === 'all');
      }
      return list;
    }

    const filters = filtersOrApp;
    if (filters?.app && filters.app !== 'all') {
      list = list.filter((t) => t.app === filters.app || t.app === 'all');
    }

    if (filters?.category) {
      list = list.filter((t) => t.category === filters.category);
    }

    if (filters?.status) {
      list = list.filter((t) => t.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getTemplateById(id: string): NotificationTemplate | undefined {
    const tmpl = this.templates.find((t) => t.id === id);
    if (!tmpl) return undefined;
    return {
      ...tmpl,
      isPredefined: tmpl.isPredefined ?? tmpl.isSystem,
    };
  }

  /**
   * Create a new custom notification template
   */
  createCustomTemplate(data: {
    app: NotificationTemplateApp;
    name: string;
    title: string;
    body: string;
    category: NotificationCategory;
    deepLink?: string;
    imageUrl?: string;
    targetRole?: string;
    targetAudienceDefault?: NotificationTarget;
    createdBy?: string;
    createdByUid?: string;
  }): { success: boolean; template?: NotificationTemplate; error?: string } {
    if (!data.name || data.name.trim().length < 3) {
      return { success: false, error: 'Template name must be at least 3 characters.' };
    }
    if (!data.title || data.title.trim().length < 3) {
      return { success: false, error: 'Template headline must be at least 3 characters.' };
    }
    if (!data.body || data.body.trim().length < 5) {
      return { success: false, error: 'Template message body must be at least 5 characters.' };
    }

    const variables = Array.from(
      new Set([
        ...this.extractVariables(data.title),
        ...this.extractVariables(data.body),
      ])
    );

    const newTemplate: NotificationTemplate = {
      id: `tmpl_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      app: data.app,
      name: data.name.trim(),
      title: data.title.trim(),
      body: data.body.trim(),
      category: data.category,
      deepLink: data.deepLink?.trim() || undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
      variables,
      isSystem: false,
      isPredefined: false,
      targetRole: data.targetRole,
      status: 'active',
      targetAudienceDefault: data.targetAudienceDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || 'Admin',
      createdByUid: data.createdByUid,
    };

    this.templates.unshift(newTemplate);
    return { success: true, template: newTemplate };
  }

  /**
   * Update an existing custom template
   */
  updateTemplate(
    id: string,
    updates: Partial<Pick<NotificationTemplate, 'name' | 'title' | 'body' | 'category' | 'deepLink' | 'imageUrl' | 'status' | 'app' | 'targetAudienceDefault' | 'targetRole'>>
  ): { success: boolean; template?: NotificationTemplate; error?: string } {
    const template = this.templates.find((t) => t.id === id);
    if (!template) {
      return { success: false, error: 'Template not found.' };
    }

    if ((template.isSystem || template.isPredefined) && updates.name && updates.name !== template.name) {
      return { success: false, error: 'System template names are immutable.' };
    }

    Object.assign(template, updates, {
      updatedAt: new Date().toISOString(),
    });

    if (updates.title || updates.body) {
      template.variables = Array.from(
        new Set([
          ...this.extractVariables(template.title),
          ...this.extractVariables(template.body),
        ])
      );
    }

    template.isPredefined = template.isPredefined ?? template.isSystem;

    return { success: true, template };
  }

  /**
   * Duplicate any template (system or custom) into a new custom template
   */
  duplicateTemplate(
    id: string,
    createdBy?: string
  ): { success: boolean; template?: NotificationTemplate; error?: string } {
    const source = this.getTemplateById(id);
    if (!source) {
      return { success: false, error: 'Source template not found.' };
    }

    const duplicated: NotificationTemplate = {
      ...source,
      id: `tmpl_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Copy of ${source.name}`,
      isSystem: false, // Duplicates are always custom
      isPredefined: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: createdBy || 'Admin',
    };

    this.templates.unshift(duplicated);
    return { success: true, template: duplicated };
  }

  /**
   * Delete a custom notification template (System templates are protected!)
   */
  deleteCustomTemplate(id: string): { success: boolean; error?: string } {
    const template = this.getTemplateById(id);
    if (!template) {
      return { success: false, error: 'Template not found.' };
    }

    if (template.isSystem || template.isPredefined) {
      return { success: false, error: 'Predefined system templates cannot be deleted.' };
    }

    this.templates = this.templates.filter((t) => t.id !== id);
    return { success: true };
  }

  /**
   * Reset templates to predefined baseline (for tests / recovery)
   */
  resetTemplates(): void {
    this.templates = DEFAULT_NOTIFICATION_TEMPLATES.map((t) => ({
      ...t,
      isPredefined: t.isSystem,
    }));
  }
}

export const NotificationService = new NotificationServiceManager();

