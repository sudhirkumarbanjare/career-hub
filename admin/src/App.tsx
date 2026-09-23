import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  User,
  Modal,
  Badge,
} from '@tech2place/shared';
import { AdminService } from './services/adminService';
import { AdminPhoneLoginScreen } from './screens/auth/AdminPhoneLoginScreen';
import { AdminOtpScreen } from './screens/auth/AdminOtpScreen';
import { AdminDashboardScreen } from './screens/dashboard/AdminDashboardScreen';
import { AdminUsersScreen } from './screens/users/AdminUsersScreen';
import { ClientApprovalsScreen } from './screens/approvals/ClientApprovalsScreen';
import { JobApprovalsScreen } from './screens/approvals/JobApprovalsScreen';
import { AdminJobsScreen } from './screens/jobs/AdminJobsScreen';
import { AdminVersionManagementScreen } from './screens/versions/AdminVersionManagementScreen';
import { AdminNotificationComposerScreen } from './screens/notifications/AdminNotificationComposerScreen';
import { AdminStaffScreen } from './screens/staff/AdminStaffScreen';
import { AdminAuditLogsScreen } from './screens/audit/AdminAuditLogsScreen';
import { AdminCategoriesScreen } from './screens/categories/AdminCategoriesScreen';
import { AdminSettingsScreen } from './screens/settings/AdminSettingsScreen';
import { AdminNotificationsScreen } from './screens/notifications/AdminNotificationsScreen';

type AuthStage = 'login' | 'otp' | 'authenticated';
type AdminTab =
  | 'dashboard'
  | 'users'
  | 'clientApprovals'
  | 'jobApprovals'
  | 'jobs'
  | 'versions'
  | 'notifications'
  | 'adminInbox'
  | 'staff'
  | 'categories'
  | 'audit'
  | 'settings';

export const App: React.FC = () => {
  const [authStage, setAuthStage] = useState<AuthStage>('authenticated');
  const [phoneNumber, setPhoneNumber] = useState('+91 99999 88888');
  const [adminUser, setAdminUser] = useState<User>(AdminService.getCurrentAdmin());
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  // Authentication Flow
  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setAuthStage('otp');
  };

  const handleOtpVerified = (user: User) => {
    if (user.role !== 'superuser' && user.role !== 'admin' && user.role !== 'moderator') {
      Alert.alert('Access Denied', 'This phone number does not have administrative privileges.');
      setAuthStage('login');
      return;
    }
    setAdminUser(user);
    AdminService.setAdminSession(user);
    setAuthStage('authenticated');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to end your administrative session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setAuthStage('login');
          setActiveTab('dashboard');
          setMenuModalVisible(false);
        },
      },
    ]);
  };

  if (authStage === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <AdminPhoneLoginScreen onContinue={handlePhoneSubmit} />
      </SafeAreaView>
    );
  }

  if (authStage === 'otp') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <AdminOtpScreen
          phoneNumber={phoneNumber}
          onSuccess={handleOtpVerified}
          onBack={() => setAuthStage('login')}
        />
      </SafeAreaView>
    );
  }

  // Count pending items for badges
  const pendingClientsCount = AdminService.getPendingClients().length;
  const pendingJobsCount = AdminService.getPendingJobs().length;
  const unreadAlertsCount = AdminService.getUnreadAdminNotificationsCount();

  const navigateTo = (tab: AdminTab) => {
    setActiveTab(tab);
    setMenuModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {activeTab === 'dashboard' && (
          <AdminDashboardScreen
            onNavigateUsers={() => setActiveTab('users')}
            onNavigateClientApprovals={() => setActiveTab('clientApprovals')}
            onNavigateJobApprovals={() => setActiveTab('jobApprovals')}
            onNavigateNotifications={() => setActiveTab('notifications')}
            onNavigateAdminInbox={() => setActiveTab('adminInbox')}
            onNavigateVersions={() => setActiveTab('versions')}
            onNavigateStaff={() => setActiveTab('staff')}
            onNavigateCategories={() => setActiveTab('categories')}
            onNavigateAudit={() => setActiveTab('audit')}
            onNavigateSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'clientApprovals' && (
          <ClientApprovalsScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'jobApprovals' && (
          <JobApprovalsScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'jobs' && (
          <AdminJobsScreen
            onBack={() => setActiveTab('dashboard')}
            onNavigateApprovals={() => setActiveTab('jobApprovals')}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'versions' && (
          <AdminVersionManagementScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'notifications' && (
          <AdminNotificationComposerScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'adminInbox' && (
          <AdminNotificationsScreen
            onBack={() => setActiveTab('dashboard')}
            onNavigateClients={() => setActiveTab('clientApprovals')}
            onNavigateJobs={() => setActiveTab('jobApprovals')}
          />
        )}

        {activeTab === 'staff' && (
          <AdminStaffScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategoriesScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'audit' && (
          <AdminAuditLogsScreen
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsScreen
            onBack={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
            onNavigateToNotifications={() => setActiveTab('adminInbox')}
          />
        )}
      </View>

      {/* Global Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>
            📊
          </Text>
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'clientApprovals' && styles.navItemActive]}
          onPress={() => setActiveTab('clientApprovals')}
        >
          <View>
            <Text
              style={[styles.navIcon, activeTab === 'clientApprovals' && styles.navIconActive]}
            >
              🏢
            </Text>
            {pendingClientsCount > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{pendingClientsCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.navText, activeTab === 'clientApprovals' && styles.navTextActive]}
          >
            Clients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'jobApprovals' && styles.navItemActive]}
          onPress={() => setActiveTab('jobApprovals')}
        >
          <View>
            <Text style={[styles.navIcon, activeTab === 'jobApprovals' && styles.navIconActive]}>
              💼
            </Text>
            {pendingJobsCount > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{pendingJobsCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navText, activeTab === 'jobApprovals' && styles.navTextActive]}>
            Jobs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'users' && styles.navItemActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.navIcon, activeTab === 'users' && styles.navIconActive]}>
            👥
          </Text>
          <Text style={[styles.navText, activeTab === 'users' && styles.navTextActive]}>
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, menuModalVisible && styles.navItemActive]}
          onPress={() => setMenuModalVisible(true)}
        >
          <View>
            <Text style={styles.navIcon}>⚙️</Text>
            {unreadAlertsCount > 0 && (
              <View style={[styles.navBadge, { backgroundColor: COLORS.danger[500] }]}>
                <Text style={styles.navBadgeText}>{unreadAlertsCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Menu Drawer / Modal */}
      <Modal
        visible={menuModalVisible}
        title="Admin Control Center"
        onClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.adminProfileHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminNameText}>{adminUser.name}</Text>
            <Text style={styles.adminRoleText}>
              Role: {adminUser.role.toUpperCase()} • {adminUser.phoneNumber}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileHeaderNotifBtn}
            onPress={() => navigateTo('adminInbox')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>
            {unreadAlertsCount > 0 && (
              <View style={styles.profileHeaderNotifBadge}>
                <Text style={styles.profileHeaderNotifBadgeText}>{unreadAlertsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.menuList}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: SPACING.sm, marginBottom: 4 }]}
            onPress={() => navigateTo('adminInbox')}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.menuTitle}>System Alerts & Notifications</Text>
                {unreadAlertsCount > 0 && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{unreadAlertsCount} unread</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuSub}>Platform activity, verification requests & alerts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('versions')}
          >
            <Text style={styles.menuIcon}>🚀</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>App Releases & Maintenance</Text>
              <Text style={styles.menuSub}>Force updates and platform kill switches</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('notifications')}
          >
            <Text style={styles.menuIcon}>📢</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Broadcast Push Notifications</Text>
              <Text style={styles.menuSub}>Dispatch alerts to students and clients</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('staff')}
          >
            <Text style={styles.menuIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Staff & Granular RBAC</Text>
              <Text style={styles.menuSub}>Operators, moderators and access matrix</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('categories')}
          >
            <Text style={styles.menuIcon}>🏷️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Listing Categories</Text>
              <Text style={styles.menuSub}>Manage project and job taxonomy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('audit')}
          >
            <Text style={styles.menuIcon}>📜</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Security & Audit Logs</Text>
              <Text style={styles.menuSub}>Immutable chronological activity trail</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('settings')}
          >
            <Text style={styles.menuIcon}>🔧</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Platform Settings</Text>
              <Text style={styles.menuSub}>Governance rules and feature flags</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0, marginTop: SPACING.sm }]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: COLORS.danger[500] }]}>Sign Out</Text>
              <Text style={styles.menuSub}>End current administrative session</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 6,
    paddingBottom: SPACING.xs,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  navTextActive: {
    color: '#026fc7',
    fontWeight: '700',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  navBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  adminProfileHeader: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileHeaderNotifBtn: {
    padding: SPACING.xs,
    position: 'relative',
    marginLeft: SPACING.sm,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileHeaderNotifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  profileHeaderNotifBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  adminNameText: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 16,
  },
  adminRoleText: {
    ...TYPOGRAPHY.caption,
    color: '#026fc7',
    fontWeight: '700',
    marginTop: 2,
    fontSize: 12,
  },
  menuList: {
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 14,
  },
  menuBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: SPACING.xs,
  },
  menuBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuSub: {
    ...TYPOGRAPHY.caption,
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
});
