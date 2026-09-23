import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  SearchBar,
  EmptyState,
  Modal,
  ClientProfile,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface ClientApprovalsScreenProps {
  onBack?: () => void;
}

export const ClientApprovalsScreen: React.FC<ClientApprovalsScreenProps> = ({
  onBack,
}) => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    const all = AdminService.getAllClients();
    setClients(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredClients = clients.filter((c) => {
    const matchesFilter =
      filter === 'all' ? true : c.approvalStatus === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (client: ClientProfile) => {
    Alert.alert(
      'Approve Client',
      `Are you sure you want to verify and approve "${client.companyName}"? They will be permitted to post jobs immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setActionLoading(true);
            AdminService.approveClient(client.uid);
            loadData();
            setActionLoading(false);
            if (selectedClient?.uid === client.uid) {
              setSelectedClient(null);
            }
            Alert.alert('Success', `Client "${client.companyName}" has been approved.`);
          },
        },
      ]
    );
  };

  const openRejectDialog = (clientId: string) => {
    setRejectTargetId(clientId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetId) return;
    if (!rejectReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a clear reason for rejecting this client registration.');
      return;
    }

    setActionLoading(true);
    AdminService.rejectClient(rejectTargetId, rejectReason.trim());
    loadData();
    setActionLoading(false);
    setRejectModalVisible(false);
    setRejectTargetId(null);
    setRejectReason('');
    if (selectedClient?.uid === rejectTargetId) {
      setSelectedClient(null);
    }
    Alert.alert('Rejected', 'Client application has been rejected with feedback.');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Client Verifications"
        subtitle="Review and approve employer registrations"
        showBack={!!onBack}
        onBack={onBack}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by company, founder, or contact..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['pending', 'approved', 'all'] as const).map((tab) => {
          const count =
            tab === 'pending'
              ? clients.filter((c) => c.approvalStatus === 'pending').length
              : tab === 'approved'
              ? clients.filter((c) => c.approvalStatus === 'approved').length
              : clients.length;
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredClients.length === 0 ? (
          <EmptyState
            title="No Clients Found"
            message={
              filter === 'pending'
                ? 'There are no pending client registrations awaiting approval.'
                : 'No client records matching current criteria.'
            }
            iconName="checkmark-circle-outline"
          />
        ) : (
          filteredClients.map((client) => {
            const isPending = client.approvalStatus === 'pending';
            const isApproved = client.approvalStatus === 'approved';
            return (
              <Card key={client.uid} style={styles.clientCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{client.companyName}</Text>
                    <Text style={styles.contactPerson}>
                      {client.contactPerson} • {client.industry || 'Industry N/A'}
                    </Text>
                  </View>
                  <Badge
                    text={client.approvalStatus.toUpperCase()}
                    variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'}
                  />
                </View>

                <View style={styles.detailsBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{client.phoneNumber}</Text>
                  </View>
                  {client.email && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{client.email}</Text>
                    </View>
                  )}
                  {client.location && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Location:</Text>
                      <Text style={styles.infoValue}>{client.location}</Text>
                    </View>
                  )}
                  {client.website && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Website:</Text>
                      <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                        {client.website}
                      </Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Submitted:</Text>
                    <Text style={styles.infoValue}>
                      {formatRelativeDate(client.createdAt)}
                    </Text>
                  </View>
                </View>

                {client.description && (
                  <View style={styles.descBox}>
                    <Text style={styles.descTitle}>Company Profile:</Text>
                    <Text style={styles.descText}>{client.description}</Text>
                  </View>
                )}

                {client.rejectionReason && (
                  <View style={styles.rejectReasonBox}>
                    <Text style={styles.rejectReasonTitle}>Rejection Reason:</Text>
                    <Text style={styles.rejectReasonText}>
                      {client.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {isPending ? (
                    <>
                      <Button
                        title="Approve Client"
                        variant="primary"
                        size="small"
                        style={{ flex: 1, marginRight: SPACING.sm }}
                        onPress={() => handleApprove(client)}
                        loading={actionLoading}
                      />
                      <Button
                        title="Reject"
                        variant="danger"
                        size="small"
                        style={{ flex: 1 }}
                        onPress={() => openRejectDialog(client.uid)}
                        loading={actionLoading}
                      />
                    </>
                  ) : isApproved ? (
                    <Button
                      title="Revoke / Reject"
                      variant="outline"
                      size="small"
                      onPress={() => openRejectDialog(client.uid)}
                    />
                  ) : (
                    <Button
                      title="Re-Approve"
                      variant="primary"
                      size="small"
                      onPress={() => handleApprove(client)}
                    />
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Reject Modal with Mandatory Reason */}
      <Modal
        visible={rejectModalVisible}
        title="Reject Client Verification"
        onClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalSub}>
            Please state the specific reason for rejecting this employer registration.
            This feedback will be presented to the client.
          </Text>

          <TextInput
            style={styles.reasonInput}
            multiline
            numberOfLines={4}
            placeholder="e.g. Incomplete business verification documents, invalid GSTIN or tax identification..."
            value={rejectReason}
            onChangeText={setRejectReason}
            textAlignVertical="top"
          />

          <View style={styles.modalBtnRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              style={{ flex: 1, marginRight: SPACING.sm }}
              onPress={() => setRejectModalVisible(false)}
            />
            <Button
              title="Confirm Rejection"
              variant="danger"
              size="medium"
              style={{ flex: 1 }}
              onPress={handleConfirmReject}
              loading={actionLoading}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tabButton: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
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
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  clientCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  companyName: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactPerson: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  descBox: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  descTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  descText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    lineHeight: 18,
  },
  rejectReasonBox: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger[600],
    padding: SPACING.sm,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  rejectReasonTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.danger[600],
  },
  rejectReasonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger[600],
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  modalContent: {
    paddingTop: SPACING.xs,
  },
  modalSub: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  reasonInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    minHeight: 90,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  modalBtnRow: {
    flexDirection: 'row',
  },
});
