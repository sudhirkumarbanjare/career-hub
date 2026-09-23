import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Avatar,
  Badge,
  BadgeVariant,
  Button,
  Modal,
} from '@tech2place/shared';
import { ClientService } from '../../services/clientService';

export interface ClientProfileScreenProps {
  onLogout: () => void;
  onNavigateToNotifications?: () => void;
}

export const ClientProfileScreen: React.FC<ClientProfileScreenProps> = ({
  onLogout,
  onNavigateToNotifications,
}) => {
  const [client, setClient] = useState(ClientService.getCurrentClient());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const unreadCount = ClientService.getUnreadNotificationsCount();

  const [editCompany, setEditCompany] = useState(client.companyName);
  const [editContact, setEditContact] = useState(client.contactPerson);
  const [editLocation, setEditLocation] = useState(client.location);
  const [editWebsite, setEditWebsite] = useState(client.website || '');
  const [editDesc, setEditDesc] = useState(client.description);

  const handleSave = () => {
    const updated = ClientService.updateProfile({
      companyName: editCompany,
      contactPerson: editContact,
      location: editLocation,
      website: editWebsite,
      description: editDesc,
    });
    setClient(updated);
    setIsEditOpen(false);
  };

  const getApprovalBadge = (): { label: string; variant: BadgeVariant } => {
    switch (client.approvalStatus) {
      case 'approved':
        return { label: 'VERIFIED EMPLOYER ✓', variant: 'success' };
      case 'pending':
        return { label: 'PENDING VERIFICATION ⏳', variant: 'warning' };
      case 'rejected':
        return { label: 'REVISION REQUIRED ⚠️', variant: 'danger' };
      default:
        return { label: String((client as any).approvalStatus || 'STATUS').toUpperCase(), variant: 'gray' };
    }
  };

  const badge = getApprovalBadge();

  return (
    <View style={styles.container}>
      <Header
        title="Employer Profile"
        rightAction={
          <View style={styles.headerRightRow}>
            {onNavigateToNotifications ? (
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
            ) : null}
            <Button
              title="Edit ✎"
              onPress={() => setIsEditOpen(true)}
              variant="ghost"
              size="sm"
            />
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar name={client.companyName} size="xl" />
            <View style={styles.nameBlock}>
              <Text style={styles.companyName}>{client.companyName}</Text>
              <Text style={styles.industryText}>{client.industry}</Text>
              <Badge label={badge.label} variant={badge.variant} size="sm" style={{ marginTop: 4 }} />
            </View>
          </View>
          <Text style={styles.descText}>{client.description}</Text>
        </Card>

        {/* Notifications & Updates Quick Access Card */}
        {onNavigateToNotifications ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNavigateToNotifications}
            style={styles.notifCardTouch}
          >
            <Card style={styles.notifMenuCard}>
              <View style={styles.notifCardLeft}>
                <View style={styles.notifIconCircle}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                </View>
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={styles.notifCardTitle}>Employer Notifications & Alerts</Text>
                  <Text style={styles.notifCardSub}>
                    {unreadCount > 0
                      ? `${unreadCount} unread candidate / approval alert${unreadCount > 1 ? 's' : ''}`
                      : 'All caught up with employer updates'}
                  </Text>
                </View>
              </View>
              <View style={styles.notifCardRight}>
                {unreadCount > 0 ? (
                  <Badge label={`${unreadCount} New`} variant="danger" size="sm" />
                ) : null}
                <Text style={styles.chevron}>→</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ) : null}

        <Card style={styles.infoCard}>
          <Text style={styles.cardHeading}>Account & Organization Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client ID:</Text>
            <Text style={styles.infoValue}>{client.clientId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Person:</Text>
            <Text style={styles.infoValue}>{client.contactPerson}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered Mobile:</Text>
            <Text style={styles.infoValue}>{client.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{client.location}</Text>
          </View>
          {client.website ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website:</Text>
              <Text style={[styles.infoValue, { color: COLORS.brand[600] }]}>{client.website}</Text>
            </View>
          ) : null}
        </Card>

        <Button
          title="LOG OUT OF CLIENT ACCOUNT"
          onPress={onLogout}
          variant="danger"
          size="md"
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Organization Profile"
      >
        <Text style={styles.inputLabel}>Company Name</Text>
        <TextInput
          value={editCompany}
          onChangeText={setEditCompany}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Contact Person</Text>
        <TextInput
          value={editContact}
          onChangeText={setEditContact}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Office Location</Text>
        <TextInput
          value={editLocation}
          onChangeText={setEditLocation}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Website</Text>
        <TextInput
          value={editWebsite}
          onChangeText={setEditWebsite}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Overview</Text>
        <TextInput
          value={editDesc}
          onChangeText={setEditDesc}
          multiline
          numberOfLines={3}
          style={[styles.textInput, { minHeight: 70, textAlignVertical: 'top' }]}
        />

        <Button
          title="SAVE CHANGES ✓"
          onPress={handleSave}
          size="lg"
          style={{ marginTop: SPACING.md }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  profileCard: {
    marginBottom: SPACING.base,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nameBlock: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  industryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
  },
  descText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  infoCard: {
    marginBottom: SPACING.base,
  },
  cardHeading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[900],
  },
  logoutBtn: {
    marginTop: SPACING.base,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100],
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
    backgroundColor: COLORS.danger[500] || '#ef4444',
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
    marginBottom: SPACING.base,
  },
  notifMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#99f6e4',
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
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  notifCardSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  notifCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.gray[400],
    marginLeft: 4,
  },
});
