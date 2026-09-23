import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
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
  formatDate,
  User,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

export interface AdminUsersScreenProps {
  onBack: () => void;
  initialRole?: string;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({
  onBack,
  initialRole = 'all',
}) => {
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

            {selectedUser.role !== 'superuser' ? (
              <Button
                title={selectedUser.status === 'active' ? 'SUSPEND THIS USER' : 'ACTIVATE USER ACCOUNT'}
                onPress={() => {
                  const u = selectedUser;
                  setSelectedUser(null);
                  handleToggleStatus(u);
                }}
                variant={selectedUser.status === 'active' ? 'danger' : 'primary'}
                size="md"
                style={{ marginTop: SPACING.lg }}
              />
            ) : null}
          </View>
        </Modal>
      )}

      {/* Confirmation Dialog for Suspension */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.action === 'suspend' ? 'Suspend Account Access' : 'Activate Account Access'}
        message={
          confirmDialog.action === 'suspend'
            ? `Are you sure you want to suspend ${confirmDialog.user?.name || confirmDialog.user?.phoneNumber}? They will be immediately blocked from signing into TECH2PLACE.`
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
});
