import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  BadgeVariant,
  Button,
  DeviceRecord,
  DeviceService,
  formatDate,
  formatRelativeDate,
  SuccessModal,
} from '@gotechplace/shared';

export interface AdminDeviceDetailsScreenProps {
  device: DeviceRecord;
  onBack: () => void;
  onDeviceUpdated?: () => void;
}

export const AdminDeviceDetailsScreen: React.FC<AdminDeviceDetailsScreenProps> = ({
  device: initialDevice,
  onBack,
  onDeviceUpdated,
}) => {
  const [device, setDevice] = useState<DeviceRecord>(initialDevice);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getStatusBadge = (status: string): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'active':
        return { label: 'ACTIVE', variant: 'success' };
      case 'disabled':
        return { label: 'DISABLED / BLOCKED', variant: 'danger' };
      case 'inactive':
      default:
        return { label: 'INACTIVE', variant: 'gray' };
    }
  };

  const getSessionBadge = (sessionStatus: string): { label: string; variant: BadgeVariant } => {
    switch (sessionStatus) {
      case 'active':
        return { label: 'ONLINE / ACTIVE', variant: 'success' };
      case 'background':
        return { label: 'BACKGROUNDED', variant: 'warning' };
      case 'logged_out':
      default:
        return { label: 'LOGGED OUT', variant: 'gray' };
    }
  };

  const handleToggleDeviceStatus = (newStatus: 'active' | 'disabled') => {
    DeviceService.setDeviceStatus(device.uid, device.deviceId, newStatus);
    const updated = DeviceService.getDeviceDetails(device.uid, device.deviceId);
    if (updated) {
      setDevice({ ...updated });
    }
    setSuccessMessage(`Device status updated to ${newStatus.toUpperCase()}.`);
    setSuccessModalVisible(true);
    if (onDeviceUpdated) onDeviceUpdated();
  };

  const statusBadge = getStatusBadge(device.deviceStatus);
  const sessionBadge = getSessionBadge(device.sessionStatus);

  return (
    <View style={styles.container}>
      <Header
        title="Device Details"
        subtitle={device.displayName || `${device.manufacturer} ${device.model}`}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Hardware Card */}
        <Card style={styles.mainCard}>
          <View style={styles.deviceHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>
                {device.deviceType === 'tablet' ? '📱' : '📱'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.deviceName}>{device.displayName}</Text>
              <Text style={styles.deviceSub}>
                {device.manufacturer} • {device.platform.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <Badge label={statusBadge.label} variant={statusBadge.variant} size="md" />
            <Badge label={sessionBadge.label} variant={sessionBadge.variant} size="md" />
          </View>
        </Card>

        {/* Operational & Session Timestamps */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Session & Activity Timestamps</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Seen / Installed:</Text>
            <Text style={styles.infoValue}>{formatDate(device.firstSeenAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Active:</Text>
            <Text style={[styles.infoValue, { color: COLORS.brand[700], fontWeight: 'bold' }]}>
              {formatRelativeDate(device.lastActiveAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Login:</Text>
            <Text style={styles.infoValue}>
              {device.lastLoginAt ? formatDate(device.lastLoginAt) : 'Never'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Explicit Logout:</Text>
            <Text style={styles.infoValue}>
              {device.lastLogoutAt ? formatDate(device.lastLogoutAt) : 'N/A (Active)'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Auth State:</Text>
            <Text style={[styles.infoValue, { color: device.isLoggedIn ? '#059669' : '#64748b' }]}>
              {device.isLoggedIn ? '● Logged In' : '○ Logged Out'}
            </Text>
          </View>
        </Card>

        {/* Software & System Specifications */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Application & OS Specifications</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name:</Text>
            <Text style={styles.infoValue}>{device.appName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version / Build:</Text>
            <Text style={styles.infoValue}>v{device.appVersion} (Build {device.buildNumber})</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Android / OS Version:</Text>
            <Text style={styles.infoValue}>Android {device.osVersion} (API {device.apiLevel || 35})</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Timezone:</Text>
            <Text style={styles.infoValue}>{device.timezone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Locale:</Text>
            <Text style={styles.infoValue}>{device.locale}</Text>
          </View>
        </Card>

        {/* Push Notification (FCM) Status */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Push Notification (FCM) Integration</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>FCM Token Status:</Text>
            <Text style={[styles.infoValue, { color: device.isFcmActive ? '#059669' : '#64748b' }]}>
              {device.isFcmActive ? 'Active & Registered' : 'Disabled / Inactive'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Installation Identity:</Text>
            <Text style={[styles.infoValue, { fontSize: 10, color: COLORS.gray[500] }]}>
              {device.deviceId}
            </Text>
          </View>
        </Card>

        {/* Administrative Governance Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Device Security Controls</Text>
          <Text style={styles.sectionSub}>
            Disable access for stolen, suspicious, or compromised device installations.
          </Text>

          {device.deviceStatus === 'active' ? (
            <Button
              title="BLOCK / DISABLE THIS DEVICE"
              variant="danger"
              size="md"
              onPress={() => handleToggleDeviceStatus('disabled')}
              style={{ marginTop: SPACING.sm }}
            />
          ) : (
            <Button
              title="RE-ENABLE THIS DEVICE"
              variant="primary"
              size="md"
              onPress={() => handleToggleDeviceStatus('active')}
              style={{ marginTop: SPACING.sm }}
            />
          )}
        </Card>
      </ScrollView>

      <SuccessModal
        visible={successModalVisible}
        title="Device Updated"
        message={successMessage}
        onConfirm={() => setSuccessModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  mainCard: {
    marginBottom: SPACING.md,
    padding: SPACING.base,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  deviceName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  deviceSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  sectionCard: {
    marginBottom: SPACING.md,
    padding: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
    marginBottom: SPACING.sm,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'right',
  },
});
