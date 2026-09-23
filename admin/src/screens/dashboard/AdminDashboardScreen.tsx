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
  Card,
  StatCard,
  Badge,
  Tabs,
  Button,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

export interface AdminDashboardScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onNavigateUsers?: () => void;
  onNavigateClientApprovals?: () => void;
  onNavigateJobApprovals?: () => void;
  onNavigateJobs?: () => void;
  onNavigateVersions?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateStaff?: () => void;
  onNavigateCategories?: () => void;
  onNavigateAuditLogs?: () => void;
  onNavigateAudit?: () => void;
  onNavigateSettings?: () => void;
  onNavigateAdminInbox?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigate,
  onNavigateUsers,
  onNavigateClientApprovals,
  onNavigateJobApprovals,
  onNavigateJobs,
  onNavigateVersions,
  onNavigateNotifications,
  onNavigateStaff,
  onNavigateCategories,
  onNavigateAuditLogs,
  onNavigateAudit,
  onNavigateSettings,
  onNavigateAdminInbox,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const stats = AdminService.getDashboardStats();
  const currentAdmin = AdminService.getCurrentAdmin();
  const unreadNotifsCount = AdminService.getUnreadAdminNotificationsCount();

  const handleNav = (screen: string, params?: any) => {
    if (screen === 'users' && onNavigateUsers) onNavigateUsers();
    else if (screen === 'client-approvals' && onNavigateClientApprovals) onNavigateClientApprovals();
    else if (screen === 'job-approvals' && onNavigateJobApprovals) onNavigateJobApprovals();
    else if (screen === 'jobs' && onNavigateJobs) onNavigateJobs();
    else if (screen === 'version-management' && onNavigateVersions) onNavigateVersions();
    else if (screen === 'notifications' && onNavigateNotifications) onNavigateNotifications();
    else if (screen === 'staff' && onNavigateStaff) onNavigateStaff();
    else if (screen === 'categories' && onNavigateCategories) onNavigateCategories();
    else if ((screen === 'audit-logs' || screen === 'audit') && (onNavigateAuditLogs || onNavigateAudit)) {
      (onNavigateAuditLogs || onNavigateAudit)!();
    }
    else if (screen === 'settings' && onNavigateSettings) onNavigateSettings();
    else if (screen === 'adminInbox' && onNavigateAdminInbox) onNavigateAdminInbox();
    else if (onNavigate) onNavigate(screen, params);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Admin Hero Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Text style={styles.greeting}>Console Superuser</Text>
            <Text style={styles.adminName} numberOfLines={1} ellipsizeMode="tail">
              {currentAdmin.name}
            </Text>
          </View>
          <View style={styles.heroRightActions}>
            <TouchableOpacity
              onPress={() => {
                if (onNavigateAdminInbox) onNavigateAdminInbox();
                else if (onNavigate) onNavigate('adminInbox');
              }}
              style={styles.heroNotifBtn}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unreadNotifsCount > 0 ? (
                <View style={styles.heroNotifBadge}>
                  <Text style={styles.heroNotifBadgeText}>
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <Badge label="SUPERUSER 🛡️" variant="brand" size="md" />
          </View>
        </View>

        {/* Action Highlights */}
        {(stats.pendingClients > 0 || stats.pendingJobs > 0) && (
          <View style={styles.pendingAlert}>
            <Text style={styles.alertText}>
              ⚠️ Requires Attention: {stats.pendingClients} pending client verification(s) and{' '}
              {stats.pendingJobs} unapproved job(s).
            </Text>
            <View style={styles.alertBtns}>
              {stats.pendingClients > 0 && (
                <TouchableOpacity
                  onPress={() => handleNav('client-approvals')}
                  style={styles.alertActionBtn}
                >
                  <Text style={styles.alertBtnText}>Verify Clients →</Text>
                </TouchableOpacity>
              )}
              {stats.pendingJobs > 0 && (
                <TouchableOpacity
                  onPress={() => handleNav('job-approvals')}
                  style={styles.alertActionBtn}
                >
                  <Text style={styles.alertBtnText}>Review Jobs →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Date Filter Tabs */}
      <View style={styles.filterSection}>
        <Tabs
          tabs={[
            { key: 'today', label: 'Today' },
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: 'all', label: 'All-Time' },
          ]}
          activeTab={dateFilter}
          onSelectTab={(k) => setDateFilter(k as any)}
        />
      </View>

      {/* Primary Metrics Grid */}
      <Text style={styles.sectionHeader}>Platform Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Active Students"
          value={stats.totalStudents}
          subtitle="Enrolled & verified"
          icon={<Text style={{ fontSize: 18 }}>🎓</Text>}
          iconBgColor={COLORS.brand[50]}
          onPress={() => handleNav('users', { role: 'student' })}
          style={styles.statItem}
        />

        <StatCard
          title="Employers / Clients"
          value={stats.totalClients}
          subtitle={`${stats.approvedClients} approved`}
          icon={<Text style={{ fontSize: 18 }}>🏢</Text>}
          iconBgColor={COLORS.success[50]}
          onPress={() => handleNav('users', { role: 'client' })}
          style={styles.statItem}
        />

        <StatCard
          title="Pending Client Approvals"
          value={stats.pendingClients}
          subtitle="Awaiting review"
          icon={<Text style={{ fontSize: 18 }}>⏳</Text>}
          iconBgColor={COLORS.warning[50]}
          onPress={() => handleNav('client-approvals')}
          style={styles.statItem}
        />

        <StatCard
          title="Job Submissions"
          value={stats.totalJobs}
          subtitle={`${stats.pendingJobs} pending approval`}
          icon={<Text style={{ fontSize: 18 }}>💼</Text>}
          iconBgColor={COLORS.purple[50]}
          onPress={() => handleNav('job-approvals')}
          style={styles.statItem}
        />
      </View>

      {/* Management Navigation Hub */}
      <Text style={styles.sectionHeader}>Platform Governance</Text>
      <View style={styles.navGrid}>
        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('users')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navTitle}>User Directory</Text>
          <Text style={styles.navSub}>Students, Clients, Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('client-approvals')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>🏢</Text>
          <Text style={styles.navTitle}>Client Approvals</Text>
          <Text style={styles.navSub}>{stats.pendingClients} pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('job-approvals')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>💼</Text>
          <Text style={styles.navTitle}>Job Approvals</Text>
          <Text style={styles.navSub}>{stats.pendingJobs} pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('version-management')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>📱</Text>
          <Text style={styles.navTitle}>Force App Updates</Text>
          <Text style={styles.navSub}>Student, Client, Admin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('notifications')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>📢</Text>
          <Text style={styles.navTitle}>Broadcast FCM</Text>
          <Text style={styles.navSub}>Push Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('staff')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>🛡️</Text>
          <Text style={styles.navTitle}>Staff & Roles</Text>
          <Text style={styles.navSub}>RBAC Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('categories')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>🏷️</Text>
          <Text style={styles.navTitle}>Categories</Text>
          <Text style={styles.navSub}>Manage Domains</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => handleNav('audit-logs')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>📜</Text>
          <Text style={styles.navTitle}>Audit Trail</Text>
          <Text style={styles.navSub}>Immutable Ledger</Text>
        </TouchableOpacity>
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
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  adminName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.common.white,
    marginTop: 2,
  },
  pendingAlert: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  alertText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.warning[500],
    lineHeight: 18,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  alertBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  alertActionBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.common.white,
  },
  filterSection: {
    marginBottom: SPACING.base,
  },
  sectionHeader: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navCard: {
    width: '48%',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  navIcon: {
    fontSize: 26,
    marginBottom: SPACING.xs,
  },
  navTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  navSub: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  heroRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroNotifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroNotifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#1e1b4b',
  },
  heroNotifBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
