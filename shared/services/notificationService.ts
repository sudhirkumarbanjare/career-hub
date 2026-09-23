import { AppNotification, NotificationCampaign, NotificationTarget } from '../types/notification';

export const NotificationService = {
  /**
   * Format payload for sending notification
   */
  createCampaignPayload(
    title: string,
    message: string,
    target: NotificationTarget,
    sentBy: { uid: string; name: string },
    options?: {
      imageUrl?: string;
      deepLink?: string;
      targetUserIds?: string[];
      scheduledFor?: string;
    }
  ): NotificationCampaign {
    return {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      target,
      sentBy: sentBy.uid,
      sentByName: sentBy.name,
      imageUrl: options?.imageUrl,
      deepLink: options?.deepLink,
      targetUserIds: options?.targetUserIds,
      scheduledFor: options?.scheduledFor,
      status: options?.scheduledFor ? 'scheduled' : 'sent',
      sentAt: options?.scheduledFor ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Validate campaign parameters
   */
  validateCampaign(title: string, message: string, target: NotificationTarget): {
    isValid: boolean;
    error?: string;
  } {
    if (!title || title.trim().length < 3) {
      return { isValid: false, error: 'Notification title must be at least 3 characters' };
    }
    if (!message || message.trim().length < 5) {
      return { isValid: false, error: 'Notification message must be at least 5 characters' };
    }
    if (!target) {
      return { isValid: false, error: 'Target audience must be selected' };
    }
    return { isValid: true };
  },
};
