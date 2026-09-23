import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
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
  AppId,
  AppVersionConfig,
  isValidSemver,
  compareSemver,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminVersionManagementScreenProps {
  onBack?: () => void;
}

export const AdminVersionManagementScreen: React.FC<AdminVersionManagementScreenProps> = ({
  onBack,
}) => {
  const [selectedApp, setSelectedApp] = useState<AppId>('student');
  const [configs, setConfigs] = useState<Record<AppId, AppVersionConfig>>(
    AdminService.getAppVersions()
  );

  // Form states for the selected app
  const currentConfig = configs[selectedApp];
  const [latestVer, setLatestVer] = useState(currentConfig?.latestVersion || '');
  const [minVer, setMinVer] = useState(currentConfig?.minimumVersion || '');
  const [updateMode, setUpdateMode] = useState<'force' | 'flexible' | 'optional'>(
    currentConfig?.updateMode || 'flexible'
  );
  const [updateTitle, setUpdateTitle] = useState(currentConfig?.updateTitle || '');
  const [updateMsg, setUpdateMsg] = useState(currentConfig?.updateMessage || '');
  const [storeUrl, setStoreUrl] = useState(currentConfig?.androidStoreUrl || '');
  const [maintenance, setMaintenance] = useState(currentConfig?.maintenance || false);
  const [maintenanceMsg, setMaintenanceMsg] = useState(
    currentConfig?.maintenanceMessage || ''
  );
  const [saving, setSaving] = useState(false);

  // Sync state whenever selected tab changes
  useEffect(() => {
    const cfg = configs[selectedApp];
    if (cfg) {
      setLatestVer(cfg.latestVersion);
      setMinVer(cfg.minimumVersion);
      setUpdateMode(cfg.updateMode);
      setUpdateTitle(cfg.updateTitle);
      setUpdateMsg(cfg.updateMessage);
      setStoreUrl(cfg.androidStoreUrl);
      setMaintenance(cfg.maintenance);
      setMaintenanceMsg(cfg.maintenanceMessage || '');
    }
  }, [selectedApp, configs]);

  const handleSave = () => {
    // 1. Validation
    if (!isValidSemver(latestVer.trim())) {
      Alert.alert('Invalid Version', `Latest version "${latestVer}" must follow Semantic Versioning (e.g., 1.2.0).`);
      return;
    }
    if (!isValidSemver(minVer.trim())) {
      Alert.alert('Invalid Version', `Minimum required version "${minVer}" must follow Semantic Versioning (e.g., 1.0.0).`);
      return;
    }
    if (compareSemver(minVer.trim(), latestVer.trim()) > 0) {
      Alert.alert(
        'Version Order Error',
        `Minimum version (${minVer}) cannot be higher than Latest version (${latestVer}).`
      );
      return;
    }

    setSaving(true);
    const updated = AdminService.updateAppVersion(selectedApp, {
      latestVersion: latestVer.trim(),
      minimumVersion: minVer.trim(),
      updateMode,
      updateTitle: updateTitle.trim(),
      updateMessage: updateMsg.trim(),
      androidStoreUrl: storeUrl.trim(),
      maintenance,
      maintenanceMessage: maintenanceMsg.trim(),
    });

    setConfigs({ ...configs, [selectedApp]: updated });
    setSaving(false);
    Alert.alert('Configuration Saved', `Version & release policies updated for ${selectedApp.toUpperCase()} app.`);
  };

  const toggleMaintenanceModeQuick = (val: boolean) => {
    setMaintenance(val);
    AdminService.setMaintenanceMode(selectedApp, val, maintenanceMsg);
    setConfigs(AdminService.getAppVersions());
  };

  return (
    <View style={styles.container}>
      <Header
        title="App Version & Maintenance"
        subtitle="Manage force-updates and kill switches"
        showBack={!!onBack}
        onBack={onBack}
      />

      {/* App Selector Tabs */}
      <View style={styles.tabsRow}>
        {(['student', 'client', 'admin'] as const).map((appId) => {
          const isActive = selectedApp === appId;
          const cfg = configs[appId];
          return (
            <TouchableOpacity
              key={appId}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setSelectedApp(appId)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {appId === 'student'
                  ? 'Student App'
                  : appId === 'client'
                  ? 'Client App'
                  : 'Admin Console'}
              </Text>
              {cfg?.maintenance && (
                <View style={styles.maintenanceBadgeDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Maintenance Mode Card */}
        <Card
          style={[
            styles.card,
            maintenance && { borderColor: COLORS.warning[500], borderWidth: 1.5 },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Maintenance Mode</Text>
              <Text style={styles.sectionSub}>
                When enabled, all users of this app are blocked by the maintenance screen.
              </Text>
            </View>
            <Switch
              value={maintenance}
              onValueChange={toggleMaintenanceModeQuick}
              trackColor={{ false: COLORS.border, true: COLORS.warning[500] }}
              thumbColor={COLORS.white}
            />
          </View>

          {maintenance && (
            <View style={styles.maintenanceForm}>
              <Text style={styles.fieldLabel}>Maintenance Notice Message:</Text>
              <TextInput
                style={styles.inputMultiline}
                value={maintenanceMsg}
                onChangeText={setMaintenanceMsg}
                placeholder="We are upgrading our servers. Please check back shortly."
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </Card>

        {/* Version Release Policy Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Version Release Policy</Text>
          <Text style={styles.sectionSub}>
            Define semver thresholds to prompt or mandate user updates.
          </Text>

          <View style={styles.rowTwoCols}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Latest Version:</Text>
              <TextInput
                style={styles.input}
                value={latestVer}
                onChangeText={setLatestVer}
                placeholder="1.1.0"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Minimum Required:</Text>
              <TextInput
                style={styles.input}
                value={minVer}
                onChangeText={setMinVer}
                placeholder="1.0.0"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Update Mode Selection */}
          <Text style={styles.fieldLabel}>Update Enforcement Mode:</Text>
          <View style={styles.modeRow}>
            {(['force', 'flexible', 'optional'] as const).map((m) => {
              const isSel = updateMode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeChip, isSel && styles.modeChipActive]}
                  onPress={() => setUpdateMode(m)}
                >
                  <Text style={[styles.modeText, isSel && styles.modeTextActive]}>
                    {m === 'force'
                      ? 'Strict Force'
                      : m === 'flexible'
                      ? 'Flexible'
                      : 'Optional'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.modeExplainer}>
            {updateMode === 'force'
              ? 'Users below minimum version cannot dismiss the update screen.'
              : updateMode === 'flexible'
              ? 'Users below minimum are forced; users between min and latest receive dismissible prompt.'
              : 'Users are notified of a new version but can continue using the app.'}
          </Text>

          <Text style={styles.fieldLabel}>Update Dialog Title:</Text>
          <TextInput
            style={styles.input}
            value={updateTitle}
            onChangeText={setUpdateTitle}
            placeholder="Critical Update Required"
          />

          <Text style={styles.fieldLabel}>Update Message:</Text>
          <TextInput
            style={styles.inputMultiline}
            value={updateMsg}
            onChangeText={setUpdateMsg}
            placeholder="A new version with essential security improvements is available."
            multiline
            numberOfLines={2}
          />

          <Text style={styles.fieldLabel}>Google Play Store / Download URL:</Text>
          <TextInput
            style={styles.input}
            value={storeUrl}
            onChangeText={setStoreUrl}
            placeholder="https://play.google.com/store/apps/details?id=..."
            autoCapitalize="none"
          />

          <View style={styles.lastUpdatedRow}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {formatRelativeDate(currentConfig?.updatedAt)}
            </Text>
          </View>

          <Button
            title="Save Release Configuration"
            variant="primary"
            size="large"
            onPress={handleSave}
            loading={saving}
          />
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  maintenanceBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning[500],
    marginLeft: 4,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  maintenanceForm: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  col: {
    flex: 1,
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
  inputMultiline: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    minHeight: 60,
  },
  modeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  modeChip: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTextActive: {
    color: COLORS.white,
  },
  modeExplainer: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  lastUpdatedRow: {
    marginVertical: SPACING.md,
  },
  lastUpdatedText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
