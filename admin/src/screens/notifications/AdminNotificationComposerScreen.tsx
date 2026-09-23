import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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
  NotificationTarget,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminNotificationComposerScreenProps {
  onBack?: () => void;
}

export const AdminNotificationComposerScreen: React.FC<AdminNotificationComposerScreenProps> = ({
  onBack,
}) => {
  const [target, setTarget] = useState<NotificationTarget>('student_app');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);

  const loadCampaigns = () => {
    setCampaigns(AdminService.getCampaigns());
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleSend = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a notification headline.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Missing Message', 'Please enter the notification body text.');
      return;
    }

    const targetLabel =
      target === 'student_app'
        ? 'All Students'
        : target === 'client_app'
        ? 'All Registered Clients'
        : target === 'admin_app'
        ? 'All Admin Personnel'
        : 'Entire TECH2PLACE Ecosystem';

    Alert.alert(
      'Confirm Broadcast',
      `Dispatch push notification "${title}" to ${targetLabel}? This cannot be recalled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Broadcast',
          onPress: () => {
            setSending(true);
            AdminService.sendCampaign(
              title.trim(),
              message.trim(),
              target,
              imageUrl.trim() || undefined,
              deepLink.trim() || undefined
            );
            loadCampaigns();
            setSending(false);
            setTitle('');
            setMessage('');
            setDeepLink('');
            setImageUrl('');
            Alert.alert('Dispatched', 'Push notification campaign successfully sent.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Broadcast Notifications"
        subtitle="Push messages across students, clients & admins"
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

          <Text style={styles.fieldLabel}>Notification Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Major Project Submission Deadline Extended"
          />

          <Text style={styles.fieldLabel}>Message Body:</Text>
          <TextInput
            style={styles.inputMultiline}
            value={message}
            onChangeText={setMessage}
            placeholder="Write clear, concise announcement text..."
            multiline
            numberOfLines={3}
          />

          <Text style={styles.fieldLabel}>Deep Link URI (Optional):</Text>
          <TextInput
            style={styles.input}
            value={deepLink}
            onChangeText={setDeepLink}
            placeholder="tech2place://student/jobs/job-101"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Banner Image URL (Optional):</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://assets.tech2place.com/banners/announcement.png"
            autoCapitalize="none"
          />

          <View style={{ marginTop: SPACING.lg }}>
            <Button
              title="Dispatch Notification"
              variant="primary"
              size="large"
              onPress={handleSend}
              loading={sending}
            />
          </View>
        </Card>

        {/* Campaign History */}
        <Text style={styles.historyTitle}>Campaign History</Text>
        {campaigns.length === 0 ? (
          <Text style={styles.emptyHistory}>No previous broadcast campaigns.</Text>
        ) : (
          campaigns.map((camp) => (
            <Card key={camp.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.campTitle}>{camp.title}</Text>
                <Badge
                  text={
                    camp.target === 'student_app'
                      ? 'STUDENTS'
                      : camp.target === 'client_app'
                      ? 'CLIENTS'
                      : 'ALL APPS'
                  }
                  variant="info"
                />
              </View>

              <Text style={styles.campMsg}>{camp.message}</Text>

              {camp.deepLink && (
                <Text style={styles.deepLinkText}>URI: {camp.deepLink}</Text>
              )}

              <View style={styles.campFooter}>
                <Text style={styles.campMeta}>
                  Delivered to ~{camp.recipientCount} devices
                </Text>
                <Text style={styles.campMeta}>
                  {formatRelativeDate(camp.createdAt)} by {camp.sentByName}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
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
    flex: 1,
    paddingRight: SPACING.sm,
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
