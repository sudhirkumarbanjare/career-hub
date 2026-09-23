import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
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
}

export const AdminSettingsScreen: React.FC<AdminSettingsScreenProps> = ({
  onBack,
}) => {
  const [settings, setSettings] = useState<SystemSettings>(AdminService.getSettings());
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(
    AdminService.getFeatureFlags()
  );

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
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
});
