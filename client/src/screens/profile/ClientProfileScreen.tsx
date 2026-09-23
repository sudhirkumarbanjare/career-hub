import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
}

export const ClientProfileScreen: React.FC<ClientProfileScreenProps> = ({ onLogout }) => {
  const [client, setClient] = useState(ClientService.getCurrentClient());
  const [isEditOpen, setIsEditOpen] = useState(false);

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
        return { label: client.approvalStatus.toUpperCase(), variant: 'gray' };
    }
  };

  const badge = getApprovalBadge();

  return (
    <View style={styles.container}>
      <Header
        title="Employer Profile"
        rightAction={
          <Button
            title="Edit ✎"
            onPress={() => setIsEditOpen(true)}
            variant="ghost"
            size="sm"
          />
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
});
