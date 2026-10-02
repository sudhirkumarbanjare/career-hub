import {
  AppNotification,
  NotificationCampaign,
  NotificationCategory,
  NotificationTarget,
  SystemNotificationEvent,
  DeviceToken,
} from '../types/notification';

class NotificationServiceManager {
  private notifications: Map<string, AppNotification[]> = new Map();
  private deviceTokens: Map<string, DeviceToken[]> = new Map();
  private campaigns: NotificationCampaign[] = [];

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
   * Create campaign payload with validation and delivery metrics
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

  getUnreadCount(userId: string): number {
    const notifs = this.getUserNotifications(userId);
    return notifs.filter((n) => !n.read).length;
  }

  markAsRead(userId: string, notificationId: string): void {
    const notifs = this.getUserNotifications(userId);
    const n = notifs.find((item) => item.id === notificationId);
    if (n) {
      n.read = true;
    }
  }

  markAllAsRead(userId: string): void {
    const notifs = this.getUserNotifications(userId);
    notifs.forEach((n) => (n.read = true));
  }

  deleteNotification(userId: string, notificationId: string): void {
    const notifs = this.getUserNotifications(userId);
    this.notifications.set(
      userId,
      notifs.filter((n) => n.id !== notificationId)
    );
  }

  clearAll(userId: string): void {
    this.notifications.set(userId, []);
  }
}

export const NotificationService = new NotificationServiceManager();

