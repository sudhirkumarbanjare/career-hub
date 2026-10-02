import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
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
  SearchBar,
  Button,
  ConfirmDialog,
  Modal,
  SuccessModal,
  ErrorModal,
  formatDate,
  formatRelativeDate,
  User,
  DeviceRecord,
  DeviceService,
} from '@gotechplace/shared';
import { AdminService } from '../../services/adminService';
import { AdminDeviceDetailsScreen } from './AdminDeviceDetailsScreen';

export interface AdminUsersScreenProps {
  onBack: () => void;
  initialRole?: string;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({
  onBack,
  initialRole = 'all',
}) => {
  const currentAdmin = AdminService.getCurrentAdmin();
  const isSuperuser = currentAdmin.role === 'superuser';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState('all');
  const [usersList, setUsersList] = useState<User[]>(AdminService.getUsers());

  // Suspension confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    user?: User;
    action: 'suspend' | 'activate';
  }>({ visible: false, action: 'suspend' });

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inspectingDevice, setInspectingDevice] = useState<DeviceRecord | null>(null);

  // Superuser Permanent Deletion Modal state
  const [superuserDeleteVisible, setSuperuserDeleteVisible] = useState(false);
  const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccessModalVisible, setDeleteSuccessModalVisible] = useState(false);
  const [deletedUserSummary, setDeletedUserSummary] = useState<{ name: string; uid: string } | null>(null);

  const selectedUserDevices = useMemo(() => {
    if (!selectedUser) return [];
    return DeviceService.getUserDevices(selectedUser.uid);
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    return AdminService.getUsers({
      role: roleFilter,
      status: statusFilter,
      search,
    });
  }, [search, roleFilter, statusFilter, usersList]);

  const handleToggleStatus = (user: User) => {
    const action = user.status === 'active' ? 'suspend' : 'activate';
    setConfirmDialog({
      visible: true,
      user,
      action,
    });
  };

  const handleConfirmAction = (reason?: string) => {
    if (!confirmDialog.user) return;
    const targetStatus = confirmDialog.action === 'suspend' ? 'suspended' : 'active';
    AdminService.setUserStatus(confirmDialog.user.uid, targetStatus);
    setUsersList([...AdminService.getUsers()]);
    setConfirmDialog({ visible: false, action: 'suspend' });
  };

  const getRoleBadge = (role: string): { label: string; variant: BadgeVariant } => {
    switch (role) {
      case 'superuser':
        return { label: 'SUPERUSER', variant: 'purple' };
      case 'admin':
        return { label: 'ADMIN', variant: 'brand' };
      case 'staff':
      case 'moderator':
      case 'support':
        return { label: role.toUpperCase(), variant: 'info' };
      case 'client':
        return { label: 'CLIENT', variant: 'warning' };
      case 'student':
      default:
        return { label: 'STUDENT', variant: 'success' };
    }
  };

  const roles = ['all', 'student', 'client', 'admin', 'staff', 'moderator'];
  const statuses = ['all', 'active', 'suspended', 'pending'];

  return (
    <View style={styles.container}>
      <Header
        title="User Management"
        subtitle={`${filteredUsers.length} users displayed`}
        onBack={onBack}
      />

      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, phone (+91), or UID..."
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {roles.map((r) => {
            const isSel = roleFilter === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRoleFilter(r)}
                style={[styles.filterPill, isSel ? styles.filterPillActive : null]}
              >
                <Text style={[styles.filterPillText, isSel ? styles.filterPillTextActive : null]}>
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
          {statuses.map((s) => {
            const isSel = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(s)}
                style={[styles.subPill, isSel ? styles.subPillActive : null]}
              >
                <Text style={[styles.subPillText, isSel ? styles.subPillTextActive : null]}>
                  Status: {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const roleBadge = getRoleBadge(item.role);
          const isSuspended = item.status === 'suspended';
          return (
            <Card style={styles.userCard}>
              <View style={styles.userTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name || 'Unnamed Account'}</Text>
                  <Text style={styles.userPhone}>📱 {item.phoneNumber}</Text>
                  <Text style={styles.userUid}>UID: {item.uid}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Badge label={roleBadge.label} variant={roleBadge.variant} size="sm" />
                  <Badge
                    label={item.status.toUpperCase()}
                    variant={isSuspended ? 'danger' : 'gray'}
                    size="sm"
                  />
                </View>
              </View>

              <View style={styles.userBottom}>
                <TouchableOpacity
                  onPress={() => setSelectedUser(item)}
                  style={styles.inspectBtn}
                >
                  <Text style={styles.inspectText}>Inspect Account Details 🔍</Text>
                </TouchableOpacity>

                {item.role !== 'superuser' ? (
                  <Button
                    title={isSuspended ? 'Activate User' : 'Suspend User'}
                    onPress={() => handleToggleStatus(item)}
                    variant={isSuspended ? 'secondary' : 'danger'}
                    size="sm"
                  />
                ) : null}
              </View>
            </Card>
          );
        }}
      />

      {/* User Inspection Modal */}
      {selectedUser && (
        <Modal
          visible={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title="Account Inspection"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalName}>{selectedUser.name || 'User Profile'}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Role:</Text>
              <Text style={styles.detailVal}>{selectedUser.role.toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Status:</Text>
              <Text style={styles.detailVal}>{selectedUser.status.toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Phone:</Text>
              <Text style={styles.detailVal}>{selectedUser.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Account Created:</Text>
              <Text style={styles.detailVal}>{formatDate(selectedUser.createdAt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>UID:</Text>
              <Text style={styles.detailVal}>{selectedUser.uid}</Text>
            </View>

            {/* Registered Devices List */}
            <View style={styles.devicesSection}>
              <Text style={styles.devicesSectionTitle}>
                📱 Registered Devices ({selectedUserDevices.length})
              </Text>
              {selectedUserDevices.length === 0 ? (
                <Text style={styles.noDevicesText}>No active device sessions registered.</Text>
              ) : (
                selectedUserDevices.map((dev) => (
                  <TouchableOpacity
                    key={dev.deviceId}
                    style={styles.deviceMiniCard}
                    onPress={() => setInspectingDevice(dev)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deviceMiniName}>{dev.displayName}</Text>
                      <Text style={styles.deviceMiniSub}>
                        {dev.appName} v{dev.appVersion} • Android {dev.osVersion}
                      </Text>
                      <Text style={styles.deviceMiniActive}>
                        Last active: {formatRelativeDate(dev.lastActiveAt)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Badge
                        label={dev.sessionStatus === 'active' ? 'ONLINE' : 'OFFLINE'}
                        variant={dev.sessionStatus === 'active' ? 'success' : 'gray'}
                        size="sm"
                      />
                      <Text style={styles.viewDeviceLink}>Details →</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {selectedUser.role !== 'superuser' ? (
              <View style={{ marginTop: SPACING.lg, gap: SPACING.sm }}>
                <Button
                  title={selectedUser.status === 'active' ? 'SUSPEND THIS USER' : 'ACTIVATE USER ACCOUNT'}
                  onPress={() => {
                    const u = selectedUser;
                    setSelectedUser(null);
                    handleToggleStatus(u);
                  }}
                  variant={selectedUser.status === 'active' ? 'outline' : 'primary'}
                  size="md"
                />

                {/* GATED STRICTLY FOR SUPERUSER ONLY */}
                {isSuperuser ? (
                  <Button
                    title="PERMANENTLY ERASE ALL USER DATA ⚠️"
                    onPress={() => {
                      setDeleteConfirmPhrase('');
                      setDeleteError('');
                      setSuperuserDeleteVisible(true);
                    }}
                    variant="danger"
                    size="md"
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </Modal>
      )}

      {/* Superuser Permanent Data Deletion Confirmation Modal */}
      {selectedUser && superuserDeleteVisible && (
        <Modal
          visible={superuserDeleteVisible}
          onClose={() => {
            if (!deleteInProgress) setSuperuserDeleteVisible(false);
          }}
          title="Superuser: Permanent Data Eradication"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.superDeleteWarningBox}>
              <Text style={styles.superDeleteWarningTitle}>⚠️ IRREVERSIBLE SUPERUSER OPERATION</Text>
              <Text style={styles.superDeleteWarningText}>
                You are about to completely and permanently purge all database records, profiles, applications, job relations, device registrations, and Firebase Auth credentials for this user.
              </Text>
            </View>

            <View style={styles.targetSummaryCard}>
              <Text style={styles.targetSummaryHeading}>Target Account Summary:</Text>
              <Text style={styles.targetSummaryLine}>• <Text style={{ fontWeight: 'bold' }}>Name:</Text> {selectedUser.name || 'Unnamed'}</Text>
              <Text style={styles.targetSummaryLine}>• <Text style={{ fontWeight: 'bold' }}>Role:</Text> {selectedUser.role.toUpperCase()}</Text>
              <Text style={styles.targetSummaryLine}>• <Text style={{ fontWeight: 'bold' }}>Phone:</Text> {selectedUser.phoneNumber}</Text>
              <Text style={styles.targetSummaryLine}>• <Text style={{ fontWeight: 'bold' }}>UID:</Text> {selectedUser.uid}</Text>
              <Text style={styles.targetSummaryLine}>• <Text style={{ fontWeight: 'bold' }}>Active Devices:</Text> {selectedUserDevices.length}</Text>
            </View>

            <Text style={styles.phrasePromptText}>
              To confirm destruction, type <Text style={styles.phraseCode}>DELETE</Text> or the exact UID below:
            </Text>

            <TextInput
              style={styles.phraseInput}
              value={deleteConfirmPhrase}
              onChangeText={setDeleteConfirmPhrase}
              placeholder="Type DELETE to confirm"
              autoCapitalize="none"
              editable={!deleteInProgress}
            />

            {deleteError ? (
              <Text style={styles.deleteErrorText}>{deleteError}</Text>
            ) : null}

            {deleteInProgress ? (
              <View style={styles.deletingProgressRow}>
                <ActivityIndicator size="small" color={COLORS.danger[600]} />
                <Text style={styles.deletingProgressText}>Purging multi-collection records...</Text>
              </View>
            ) : (
              <View style={styles.deleteModalBtnRow}>
                <Button
                  title="Cancel"
                  onPress={() => setSuperuserDeleteVisible(false)}
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                />
                <Button
                  title="CONFIRM PURGE"
                  onPress={async () => {
                    setDeleteInProgress(true);
                    setDeleteError('');
                    const res = await AdminService.permanentlyDeleteUserData(
                      selectedUser.uid,
                      deleteConfirmPhrase
                    );
                    setDeleteInProgress(false);

                    if (res.success) {
                      const u = selectedUser;
                      setDeletedUserSummary({ name: u.name || u.phoneNumber, uid: u.uid });
                      setSuperuserDeleteVisible(false);
                      setSelectedUser(null);
                      setUsersList([...AdminService.getUsers()]);
                      setDeleteSuccessModalVisible(true);
                    } else {
                      setDeleteError(res.error || res.message || 'Deletion failed.');
                    }
                  }}
                  variant="danger"
                  size="md"
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </ScrollView>
        </Modal>
      )}

      {/* Success Modal after deletion */}
      {deleteSuccessModalVisible && deletedUserSummary && (
        <SuccessModal
          visible={deleteSuccessModalVisible}
          title="User Eradicated"
          message={`Complete account and associated Firestore data for ${deletedUserSummary.name} (UID: ${deletedUserSummary.uid}) has been permanently purged.`}
          onClose={() => setDeleteSuccessModalVisible(false)}
        />
      )}

      {/* Full Device Details View */}
      {inspectingDevice && (
        <View style={StyleSheet.absoluteFillObject}>
          <AdminDeviceDetailsScreen
            device={inspectingDevice}
            onBack={() => setInspectingDevice(null)}
            onDeviceUpdated={() => {
              if (selectedUser) {
                const refreshed = DeviceService.getDeviceDetails(
                  inspectingDevice.uid,
                  inspectingDevice.deviceId
                );
                if (refreshed) setInspectingDevice(refreshed);
              }
            }}
          />
        </View>
      )}

      {/* Confirmation Dialog for Suspension */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.action === 'suspend' ? 'Suspend Account Access' : 'Activate Account Access'}
        message={
          confirmDialog.action === 'suspend'
            ? `Are you sure you want to suspend ${confirmDialog.user?.name || confirmDialog.user?.phoneNumber}? They will be immediately blocked from signing into GoTechPlace.`
            : `Are you sure you want to reactivate access for ${confirmDialog.user?.name || confirmDialog.user?.phoneNumber}?`
        }
        confirmText={confirmDialog.action === 'suspend' ? 'Suspend Account' : 'Reactivate'}
        isDestructive={confirmDialog.action === 'suspend'}
        requireReason={confirmDialog.action === 'suspend'}
        reasonPlaceholder="Specify reason for account suspension..."
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ visible: false, action: 'suspend' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterScroll: {
    marginTop: SPACING.sm,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginRight: SPACING.xs,
  },
  filterPillActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[600],
  },
  filterPillTextActive: {
    color: COLORS.brand[700],
  },
  subPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[100],
    marginRight: 6,
  },
  subPillActive: {
    backgroundColor: COLORS.gray[800],
  },
  subPillText: {
    fontSize: 10,
    color: COLORS.gray[600],
  },
  subPillTextActive: {
    color: COLORS.common.white,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  userCard: {
    marginBottom: SPACING.md,
  },
  userTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  userPhone: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  userUid: {
    fontSize: 10,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  userBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  inspectBtn: {
    paddingVertical: 4,
  },
  inspectText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[600],
    fontWeight: 'bold',
  },
  modalContent: {
    paddingVertical: SPACING.xs,
  },
  modalName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  detailKey: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
  },
  detailVal: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[800],
  },
  devicesSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  devicesSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  noDevicesText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    fontStyle: 'italic',
    paddingVertical: SPACING.xs,
  },
  deviceMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: 4,
  },
  deviceMiniName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  deviceMiniSub: {
    fontSize: 10,
    color: COLORS.gray[600],
    marginTop: 1,
  },
  deviceMiniActive: {
    fontSize: 9,
    color: COLORS.brand[700],
    fontWeight: '600',
    marginTop: 2,
  },
  viewDeviceLink: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.brand[600],
  },
  superDeleteWarningBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  superDeleteWarningTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.danger[700],
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  superDeleteWarningText: {
    fontSize: 11,
    color: COLORS.danger[600],
    lineHeight: 16,
  },
  targetSummaryCard: {
    backgroundColor: COLORS.gray[50],
    borderColor: COLORS.gray[200],
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  targetSummaryHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  targetSummaryLine: {
    fontSize: 11,
    color: COLORS.gray[700],
    lineHeight: 18,
  },
  phrasePromptText: {
    fontSize: 12,
    color: COLORS.gray[800],
    marginBottom: 6,
    lineHeight: 18,
  },
  phraseCode: {
    fontWeight: 'bold',
    color: COLORS.danger[600],
    backgroundColor: '#fee2e2',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  phraseInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger[500],
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 13,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  deleteErrorText: {
    fontSize: 11,
    color: COLORS.danger[600],
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  deletingProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  deletingProgressText: {
    fontSize: 12,
    color: COLORS.danger[700],
    fontWeight: '600',
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
});
