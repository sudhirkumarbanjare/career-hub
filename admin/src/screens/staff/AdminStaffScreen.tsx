import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  Modal,
  StaffMember,
  Permission,
  UserRole,
  ALL_PERMISSIONS,
  DEFAULT_ROLE_CONFIGS,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminStaffScreenProps {
  onBack?: () => void;
}

export const AdminStaffScreen: React.FC<AdminStaffScreenProps> = ({
  onBack,
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('moderator');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    DEFAULT_ROLE_CONFIGS.moderator.defaultPermissions
  );
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setStaff(AdminService.getStaffMembers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole in DEFAULT_ROLE_CONFIGS) {
      setSelectedPermissions([...DEFAULT_ROLE_CONFIGS[newRole].defaultPermissions]);
    }
  };

  const togglePermission = (perm: Permission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleCreateStaff = () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert('Required Fields', 'Please specify full name and phone number for staff onboarding.');
      return;
    }

    setSaving(true);
    AdminService.createStaff(
      name.trim(),
      phoneNumber.trim(),
      email.trim(),
      role,
      selectedPermissions
    );
    loadData();
    setSaving(false);
    setModalVisible(false);
    setName('');
    setPhoneNumber('');
    setEmail('');
    setRole('moderator');
    setSelectedPermissions(DEFAULT_ROLE_CONFIGS.moderator.defaultPermissions);
    Alert.alert('Staff Created', `${name} has been added with ${role.toUpperCase()} privileges.`);
  };

  const handleDeleteStaff = (member: StaffMember) => {
    Alert.alert(
      'Revoke Staff Access',
      `Are you sure you want to revoke administrative access for ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: () => {
            AdminService.deleteStaff(member.uid);
            loadData();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Staff & RBAC Access"
        subtitle="Manage operators, moderators & granular permissions"
        showBack={!!onBack}
        onBack={onBack}
      />

      <View style={styles.actionHeaderRow}>
        <Text style={styles.staffCountText}>{staff.length} Active Staff Member(s)</Text>
        <Button
          title="+ Add Staff"
          variant="primary"
          size="small"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {staff.map((member) => (
          <Card key={member.uid} style={styles.staffCard}>
            <View style={styles.staffHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.staffName}>{member.name}</Text>
                <Text style={styles.staffContact}>
                  {member.phoneNumber} {member.email ? `• ${member.email}` : ''}
                </Text>
              </View>
              <Badge
                text={member.role.toUpperCase()}
                variant={
                  member.role === 'superuser'
                    ? 'danger'
                    : member.role === 'admin'
                    ? 'info'
                    : 'warning'
                }
              />
            </View>

            <Text style={styles.permLabel}>Assigned Permissions ({member.permissions.length}):</Text>
            <View style={styles.permsContainer}>
              {member.permissions.map((perm) => (
                <View key={perm} style={styles.permChip}>
                  <Text style={styles.permChipText}>{perm}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.dateMeta}>
                Added {formatRelativeDate(member.createdAt)}
              </Text>
              {member.role !== 'superuser' && (
                <TouchableOpacity onPress={() => handleDeleteStaff(member)}>
                  <Text style={styles.revokeText}>Revoke Access</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Staff Modal */}
      <Modal
        visible={modalVisible}
        title="Onboard Staff Member"
        onClose={() => setModalVisible(false)}
      >
        <ScrollView style={{ maxHeight: 460 }}>
          <Text style={styles.fieldLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Priya Sundaram"
          />

          <Text style={styles.fieldLabel}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+91 98765 00000"
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>Official Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="priya@tech2place.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Role Level *</Text>
          <View style={styles.roleChipsRow}>
            {(['moderator', 'admin', 'superuser'] as const).map((r) => {
              const isSel = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, isSel && styles.roleChipActive]}
                  onPress={() => handleRoleChange(r)}
                >
                  <Text style={[styles.roleChipText, isSel && styles.roleChipTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Granular Permissions Matrix:</Text>
          <View style={styles.permMatrix}>
            {ALL_PERMISSIONS.map((perm) => {
              const checked = selectedPermissions.includes(perm);
              return (
                <TouchableOpacity
                  key={perm}
                  style={[styles.matrixItem, checked && styles.matrixItemChecked]}
                  onPress={() => togglePermission(perm)}
                >
                  <Text style={[styles.matrixBox, checked && styles.matrixBoxChecked]}>
                    {checked ? '✓' : ' '}
                  </Text>
                  <Text style={[styles.matrixText, checked && styles.matrixTextChecked]}>
                    {perm}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modalBtnRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              style={{ flex: 1, marginRight: SPACING.sm }}
              onPress={() => setModalVisible(false)}
            />
            <Button
              title="Create Staff"
              variant="primary"
              size="medium"
              style={{ flex: 1 }}
              onPress={handleCreateStaff}
              loading={saving}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  staffCountText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  staffCard: {
    marginBottom: SPACING.md,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  staffName: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  staffContact: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  permLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  permsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  permChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  permChipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  dateMeta: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  revokeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '700',
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
  roleChipsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  roleChip: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  roleChipTextActive: {
    color: COLORS.white,
  },
  permMatrix: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  matrixItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.xs,
    borderRadius: 4,
  },
  matrixItemChecked: {
    backgroundColor: COLORS.card,
  },
  matrixBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 12,
    marginRight: SPACING.sm,
    color: COLORS.white,
    backgroundColor: COLORS.background,
  },
  matrixBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  matrixText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  matrixTextChecked: {
    color: COLORS.text,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
});
