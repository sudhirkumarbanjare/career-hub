import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  Button,
  NotificationCampaign,
  NotificationCategory,
  NotificationTarget,
  NotificationService,
  formatRelativeDate,
  ConfirmationModal,
  SuccessModal,
  ErrorModal,
} from '@gotechplace/shared';
import { AdminService } from '../../services/adminService';

interface AdminNotificationComposerScreenProps {
  onBack?: () => void;
}

export const AdminNotificationComposerScreen: React.FC<AdminNotificationComposerScreenProps> = ({
  onBack,
}) => {
  const [target, setTarget] = useState<NotificationTarget>('student_app');
  const [category, setCategory] = useState<NotificationCategory>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserIdsInput, setTargetUserIdsInput] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);

  // Modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalConfig, setErrorModalConfig] = useState<{ title: string; message: string } | null>(null);

  const loadCampaigns = () => {
    setCampaigns(AdminService.getCampaigns());
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const parsedTargetUserIds = targetUserIdsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const estimatedAudience = NotificationService.estimateAudience(
    target,
    parsedTargetUserIds,
    {
      students: AdminService.getUsers().filter((u) => u.role === 'student').length || 1450,
      clients: AdminService.getUsers().filter((u) => u.role === 'client').length || 320,
      admins: AdminService.getUsers().filter((u) => ['superuser', 'admin', 'staff', 'moderator'].includes(u.role)).length || 35,
    }
  );

  const targetLabel =
    target === 'student_app' || target === 'all_students'
      ? 'All Students'
      : target === 'client_app' || target === 'all_clients'
      ? 'All Registered Clients'
      : target === 'admin_app' || target === 'all_admins' || target === 'all_staff'
      ? 'All Admin Personnel'
      : target === 'individual'
      ? `Individual User (${parsedTargetUserIds[0] || 'Selected'})`
      : target === 'multiple_users'
      ? `${parsedTargetUserIds.length} Targeted Users`
      : 'Entire GoTechPlace Ecosystem';

  const handleSend = () => {
    const validation = NotificationService.validateCampaign(
      title,
      message,
      target,
      (target === 'individual' || target === 'multiple_users') ? parsedTargetUserIds : undefined
    );

    if (!validation.isValid) {
      setErrorModalConfig({
        title: 'Validation Error',
        message: validation.error || 'Please fill in all required fields.',
      });
      return;
    }

    setConfirmModalVisible(true);
  };

  const executeDispatch = () => {
    setConfirmModalVisible(false);
    setSending(true);
    AdminService.sendCampaign(
      title.trim(),
      message.trim(),
      target,
      imageUrl.trim() || undefined,
      deepLink.trim() || undefined,
      category,
      (target === 'individual' || target === 'multiple_users') ? parsedTargetUserIds : undefined
    );
    loadCampaigns();
    setSending(false);
    setTitle('');
    setMessage('');
    setDeepLink('');
    setImageUrl('');
    setTargetUserIdsInput('');
    setSuccessModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Push Broadcasts"
        subtitle="Dispatch push notifications & manage campaigns"
        showBack={!!onBack}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Composer Card */}
        <Card style={styles.composerCard}>
          <Text style={styles.cardTitle}>Create Broadcast Campaign</Text>

          {/* Target Audience */}
          <Text style={styles.fieldLabel}>Target Audience:</Text>
          <View style={styles.targetsGrid}>
            {(
              [
                { id: 'student_app', label: 'Students Only' },
                { id: 'client_app', label: 'Clients Only' },
                { id: 'all_apps', label: 'All Users' },
                { id: 'admin_app', label: 'Staff / Admins' },
                { id: 'individual', label: 'Single User (UID)' },
                { id: 'multiple_users', label: 'Multiple UIDs' },
              ] as const
            ).map((item) => {
              const isSel = target === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.targetChip, isSel && styles.targetChipActive]}
                  onPress={() => setTarget(item.id)}
                >
                  <Text style={[styles.targetText, isSel && styles.targetTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Conditional Target User IDs input */}
          {(target === 'individual' || target === 'multiple_users') && (
            <View style={styles.userTargetBox}>
              <Text style={styles.fieldLabel}>
                {target === 'individual' ? 'Recipient User UID:' : 'Comma-Separated User UIDs:'}
              </Text>
              <TextInput
                style={styles.input}
                value={targetUserIdsInput}
                onChangeText={setTargetUserIdsInput}
                placeholder={
                  target === 'individual'
                    ? 'e.g. usr_student_himanshu'
                    : 'usr_student_1, usr_client_demo, usr_mod_2'
                }
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Category Selection */}
          <Text style={styles.fieldLabel}>Notification Category:</Text>
          <View style={styles.categoriesRow}>
            {(
              [
                { id: 'general', label: '📢 General' },
                { id: 'jobs', label: '💼 Jobs' },
                { id: 'applications', label: '📝 Applications' },
                { id: 'courses', label: '🎓 Courses' },
                { id: 'system', label: '⚙️ System' },
              ] as const
            ).map((cat) => {
              const isSel = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isSel && styles.categoryChipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[styles.categoryText, isSel && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title */}
          <Text style={styles.fieldLabel}>Headline / Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. 50+ Top Tech Companies Hiring This Week!"
          />

          {/* Message Body */}
          <Text style={styles.fieldLabel}>Message Body:</Text>
          <TextInput
            style={styles.inputMultiline}
            value={message}
            onChangeText={setMessage}
            placeholder="Write clear, engaging notification copy that drives action..."
            multiline
            numberOfLines={3}
          />

          {/* Deep Link */}
          <Text style={styles.fieldLabel}>Deep Link Route (Optional):</Text>
          <TextInput
            style={styles.input}
            value={deepLink}
            onChangeText={setDeepLink}
            placeholder="gotechplace://student/job/job-c1"
            autoCapitalize="none"
          />

          {/* Banner Image URL */}
          <Text style={styles.fieldLabel}>Banner Image URL (Optional):</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://assets.gotechplace.com/banners/announcement.png"
            autoCapitalize="none"
          />

          {/* Audience Preview Box */}
          <View style={styles.audienceBox}>
            <View style={styles.audienceLeft}>
              <Text style={styles.audienceLabel}>Estimated Audience Reach:</Text>
              <Text style={styles.audienceCount}>
                ~{estimatedAudience.toLocaleString()} Devices
              </Text>
            </View>
            <Badge
              text={target.replace('_', ' ').toUpperCase()}
              variant="info"
            />
          </View>

          {/* Notification Preview */}
          {(title.length > 0 || message.length > 0) && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewHeaderLabel}>DEVICE PUSH PREVIEW</Text>
              <View style={styles.pushPreviewCard}>
                <View style={styles.previewAppRow}>
                  <Text style={styles.previewAppName}>GoTechPlace • now</Text>
                  <Text style={styles.previewCatBadge}>{category.toUpperCase()}</Text>
                </View>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {title || 'Notification Headline'}
                </Text>
                <Text style={styles.previewBody} numberOfLines={2}>
                  {message || 'Notification body preview text will appear here.'}
                </Text>
                {deepLink ? (
                  <Text style={styles.previewDeepLink} numberOfLines={1}>
                    🔗 {deepLink}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          <View style={{ marginTop: SPACING.lg }}>
            <Button
              title={`Dispatch to ~${estimatedAudience} Recipients`}
              variant="primary"
              size="large"
              onPress={handleSend}
              loading={sending}
            />
          </View>
        </Card>

        {/* Campaign History */}
        <Text style={styles.historyTitle}>Campaign Delivery History</Text>
        {campaigns.length === 0 ? (
          <Text style={styles.emptyHistory}>No previous broadcast campaigns.</Text>
        ) : (
          campaigns.map((camp) => (
            <Card key={camp.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                  <Text style={styles.campTitle}>{camp.title}</Text>
                  <Text style={styles.campCategory}>
                    {(camp.category || 'general').toUpperCase()}
                  </Text>
                </View>
                <Badge
                  text={camp.status.toUpperCase()}
                  variant={camp.status === 'sent' ? 'success' : 'warning'}
                />
              </View>

              <Text style={styles.campMsg}>{camp.message}</Text>

              {camp.deepLink && (
                <Text style={styles.deepLinkText}>URI: {camp.deepLink}</Text>
              )}

              <View style={styles.campFooter}>
                <Text style={styles.campMeta}>
                  Delivered to ~{camp.recipientCount ?? 0} devices
                </Text>
                <Text style={styles.campMeta}>
                  {formatRelativeDate(camp.createdAt)} by {camp.sentByName || 'Admin'}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalVisible}
        title="Confirm Push Dispatch"
        message={`You are about to dispatch this notification to ~${estimatedAudience} recipient(s) (${targetLabel}).\n\nTitle: "${title.trim()}"\nCategory: ${category.toUpperCase()}`}
        confirmText="Dispatch Now"
        cancelText="Cancel"
        icon="🚀"
        onConfirm={executeDispatch}
        onCancel={() => setConfirmModalVisible(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        title="Broadcast Dispatched"
        message={`Notification successfully pushed to ~${estimatedAudience} device(s) via Firebase Cloud Messaging.`}
        buttonText="Done"
        onClose={() => setSuccessModalVisible(false)}
      />

      {/* Error Modal */}
      {errorModalConfig && (
        <ErrorModal
          visible={!!errorModalConfig}
          title={errorModalConfig.title}
          message={errorModalConfig.message}
          onClose={() => setErrorModalConfig(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  composerCard: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  targetChip: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  targetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  targetText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  targetTextActive: {
    color: COLORS.white,
  },
  userTargetBox: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  categoryChip: {
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  categoryChipActive: {
    backgroundColor: COLORS.brand[100],
    borderColor: COLORS.brand[500],
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  categoryTextActive: {
    color: COLORS.brand[700],
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  inputMultiline: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    minHeight: 70,
  },
  audienceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  audienceLeft: {
    flex: 1,
  },
  audienceLabel: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
  },
  audienceCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
    marginTop: 2,
  },
  previewContainer: {
    marginTop: SPACING.md,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: SPACING.sm + 2,
  },
  previewHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  pushPreviewCard: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  previewAppRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewAppName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  previewCatBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38bdf8',
    backgroundColor: '#0f172a',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  previewBody: {
    fontSize: 12,
    color: '#e2e8f0',
    lineHeight: 16,
  },
  previewDeepLink: {
    fontSize: 11,
    color: '#38bdf8',
    marginTop: 4,
  },
  historyTitle: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyHistory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  historyCard: {
    marginBottom: SPACING.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  campTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  campCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[600],
    marginTop: 2,
  },
  campMsg: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  deepLinkText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  campFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: 4,
  },
  campMeta: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

