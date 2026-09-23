import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Card,
  Button,
  ClientProfile,
} from '@tech2place/shared';

export interface PendingApprovalScreenProps {
  client: ClientProfile;
  onRefresh: () => void;
  onLogout: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  client,
  onRefresh,
  onLogout,
}) => {
  const isRejected = client.approvalStatus === 'rejected';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{isRejected ? '❌' : '⏳'}</Text>
      </View>

      <Text style={styles.title}>
        {isRejected ? 'Profile Needs Attention' : 'Verification Under Review'}
      </Text>

      <Text style={styles.subtitle}>
        {isRejected
          ? `Your client application was not approved: ${client.rejectionReason || 'Please review your business details'}.`
          : 'Thank you for registering your company on TECH2PLACE. To ensure high-quality opportunities for our students, all new clients are manually reviewed by our compliance team within 24 hours.'}
      </Text>

      <Card style={styles.detailsCard}>
        <Text style={styles.cardHeader}>Submitted Business Profile</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Company:</Text>
          <Text style={styles.value}>{client.companyName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contact Person:</Text>
          <Text style={styles.value}>{client.contactPerson}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{client.phoneNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Industry:</Text>
          <Text style={styles.value}>{client.industry}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.value,
              { color: isRejected ? COLORS.danger[700] : COLORS.warning[700], fontWeight: 'bold' },
            ]}
          >
            {isRejected ? 'REJECTED' : 'PENDING ADMIN APPROVAL'}
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="CHECK APPROVAL STATUS ⟳"
          onPress={onRefresh}
          size="lg"
          style={styles.btn}
        />
        <Button
          title="Sign Out"
          onPress={onLogout}
          variant="outline"
          size="md"
          style={[styles.btn, { marginTop: SPACING.sm }]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.warning[50],
    borderWidth: 2,
    borderColor: COLORS.warning[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    maxWidth: 320,
  },
  detailsCard: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  cardHeader: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[900],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actions: {
    width: '100%',
  },
  btn: {
    width: '100%',
  },
});
