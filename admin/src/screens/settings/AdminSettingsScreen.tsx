import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  Header,
  Card,
  Button,
  SystemSettings,
  FeatureFlag,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminSettingsScreenProps {
  onBack?: () => void;
  onLogout?: () => void;
  onNavigateToNotifications?: () => void;
}

export const AdminSettingsScreen: React.FC<AdminSettingsScreenProps> = ({
  onBack,
  onLogout,
  onNavigateToNotifications,
}) => {
  const [settings, setSettings] = useState<SystemSettings>(AdminService.getSettings());
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(
    AdminService.getFeatureFlags()
  );
  const unreadCount = AdminService.getUnreadAdminNotificationsCount();

  // Form states
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [allowClientReg, setAllowClientReg] = useState(settings.allowClientRegistration);
  const [allowStudentReg, setAllowStudentReg] = useState(settings.allowStudentRegistration);
  const [reqClientApproval, setReqClientApproval] = useState(settings.requireClientApproval);
  const [reqJobApproval, setReqJobApproval] = useState(settings.requireJobApproval);
  const [saving, setSaving] = useState(false);

  const handleToggleFeatureFlag = (flagId: string) => {
    AdminService.toggleFeatureFlag(flagId);
    setFeatureFlags([...AdminService.getFeatureFlags()]);
  };

  const handleSaveSettings = () => {
    setSaving(true);
    const updated = AdminService.updateSettings({
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      allowClientRegistration: allowClientReg,
      allowStudentRegistration: allowStudentReg,
      requireClientApproval: reqClientApproval,
      requireJobApproval: reqJobApproval,
    });
    setSettings(updated);
    setSaving(false);
    Alert.alert('Settings Updated', 'Platform global settings and governance rules have been saved.');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Platform Settings"
        subtitle="Global governance, feature flags & policies"
        showBack={!!onBack}
        onBack={onBack}
        rightAction={
          onNavigateToNotifications ? (
            <TouchableOpacity
              onPress={onNavigateToNotifications}
              style={styles.notifBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.notifBellIcon}>🔔</Text>
              {unreadCount > 0 ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin Alerts & System Notifications Quick Access Card */}
        {onNavigateToNotifications ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNavigateToNotifications}
            style={styles.notifCardTouch}
          >
            <Card style={styles.notifMenuCard}>
              <View style={styles.notifCardLeft}>
                <View style={styles.notifIconCircle}>
                  <Text style={{ fontSize: 18 }}>🛡️</Text>
                </View>
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={styles.notifCardTitle}>System Alerts & Notifications</Text>
                  <Text style={styles.notifCardSub}>
                    {unreadCount > 0
                      ? `${unreadCount} unread administrative alert${unreadCount > 1 ? 's' : ''}`
                      : 'All system alerts and approvals reviewed'}
                  </Text>
                </View>
              </View>
              <View style={styles.notifCardRight}>
                {unreadCount > 0 ? (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{unreadCount} New</Text>
                  </View>
                ) : null}
                <Text style={styles.chevron}>→</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ) : null}

        {/* Registration & Approval Policies */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Registration & Governance Rules</Text>
          <Text style={styles.sectionSub}>Control ecosystem admission and moderation gates.</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Allow Student Self-Registration</Text>
              <Text style={styles.switchDesc}>Enable new learners to sign up via phone OTP</Text>
            </View>
            <Switch
              value={allowStudentReg}
              onValueChange={setAllowStudentReg}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Allow Client Self-Registration</Text>
              <Text style={styles.switchDesc}>Permit companies to onboard and set up profiles</Text>
            </View>
            <Switch
              value={allowClientReg}
              onValueChange={setAllowClientReg}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Mandatory Client Verification</Text>
              <Text style={styles.switchDesc}>Require admin approval before client can post jobs</Text>
            </View>
            <Switch
              value={reqClientApproval}
              onValueChange={setReqClientApproval}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Mandatory Job Moderation</Text>
              <Text style={styles.switchDesc}>Require admin approval before client jobs are listed</Text>
            </View>
            <Switch
              value={reqJobApproval}
              onValueChange={setReqJobApproval}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* Feature Flags */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Feature Flags</Text>
          <Text style={styles.sectionSub}>Dynamically toggle platform modules in real-time.</Text>

          {featureFlags.map((flag) => (
            <View key={flag.id} style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>{flag.name}</Text>
                <Text style={styles.switchDesc}>{flag.description}</Text>
              </View>
              <Switch
                value={flag.isEnabled}
                onValueChange={() => handleToggleFeatureFlag(flag.id)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          ))}
        </Card>

        {/* Support & Contact Details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Public Platform Support</Text>
          <Text style={styles.sectionSub}>Contact coordinates displayed in Student and Client apps.</Text>

          <Text style={styles.fieldLabel}>Support Email:</Text>
          <TextInput
            style={styles.input}
            value={supportEmail}
            onChangeText={setSupportEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Support Phone Hotline:</Text>
          <TextInput
            style={styles.input}
            value={supportPhone}
            onChangeText={setSupportPhone}
            keyboardType="phone-pad"
          />

          <View style={{ marginTop: SPACING.md }}>
            <Button
              title="Save System Settings"
              variant="primary"
              size="medium"
              onPress={handleSaveSettings}
              loading={saving}
            />
          </View>
        </Card>

        {onLogout && (
          <Card style={[styles.card, { borderColor: '#fecaca', borderWidth: 1 }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.danger[600] }]}>Session Governance</Text>
            <Text style={styles.sectionSub}>Terminate active session and log out of administrative console.</Text>
            <Button
              title="Sign Out from Admin Console"
              variant="outline"
              size="medium"
              onPress={onLogout}
              style={{ borderColor: COLORS.danger[500], marginTop: SPACING.sm }}
              textStyle={{ color: COLORS.danger[600] }}
            />
          </Card>
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
  card: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  switchLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  switchDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
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
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100] || '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 4,
  },
  notifBellIcon: {
    fontSize: 18,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  notifBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  notifCardTouch: {
    marginBottom: SPACING.md,
  },
  notifMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  notifCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notifIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text || '#111827',
  },
  notifCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary || '#6b7280',
    marginTop: 2,
  },
  notifCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 18,
    color: '#9ca3af',
    marginLeft: 4,
  },
});
