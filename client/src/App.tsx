import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  User,
  ClientProfile,
  VersionCheckService,
  VersionCheckResult,
} from '@tech2place/shared';

import { ClientService } from './services/clientService';
import { ClientPhoneLoginScreen } from './screens/auth/ClientPhoneLoginScreen';
import { ClientOtpScreen } from './screens/auth/ClientOtpScreen';
import { ClientProfileSetupScreen } from './screens/auth/ClientProfileSetupScreen';
import { PendingApprovalScreen } from './screens/approval/PendingApprovalScreen';
import { ClientDashboardScreen } from './screens/home/ClientDashboardScreen';
import { MyJobsScreen } from './screens/jobs/MyJobsScreen';
import { CreateJobScreen } from './screens/jobs/CreateJobScreen';
import { ClientJobDetailScreen } from './screens/jobs/ClientJobDetailScreen';
import { JobApplicationsScreen } from './screens/applications/JobApplicationsScreen';
import { ClientProfileScreen } from './screens/profile/ClientProfileScreen';

export const ClientApp: React.FC = () => {
  // 1. Version Check & Maintenance state
  const [versionStatus, setVersionStatus] = useState<VersionCheckResult | null>(null);
  const [dismissOptionalUpdate, setDismissOptionalUpdate] = useState(false);

  // 2. Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [otpSession, setOtpSession] = useState<{ verificationId: string; phone: string } | null>(null);

  // 3. Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'applications' | 'profile'>('dashboard');
  const [stackScreen, setStackScreen] = useState<{ name: string; params?: any } | null>(null);

  // Run startup version check
  useEffect(() => {
    const config = VersionCheckService.getDefaultConfig('client');
    const result = VersionCheckService.evaluate('1.0.0', config);
    setVersionStatus(result);
  }, []);

  // 1. Force Update Screen
  if (versionStatus?.needsForceUpdate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fullCenter}>
          <Text style={styles.forceTitle}>Client App Update Required</Text>
          <Text style={styles.forceSub}>{versionStatus.updateMessage}</Text>
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => {
              if (versionStatus.storeUrl) Linking.openURL(versionStatus.storeUrl);
            }}
          >
            <Text style={styles.updateBtnText}>UPDATE VIA PLAY STORE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Maintenance Mode Screen
  if (versionStatus?.isMaintenanceMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fullCenter}>
          <Text style={styles.forceTitle}>Scheduled Maintenance</Text>
          <Text style={styles.forceSub}>{versionStatus.maintenanceMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Auth Flow
  if (!user) {
    if (otpSession) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <ClientOtpScreen
            verificationId={otpSession.verificationId}
            phoneNumber={otpSession.phone}
            onChangePhone={() => setOtpSession(null)}
            onOtpVerified={(verifiedUser) => {
              setUser(verifiedUser);
              const profile = ClientService.initDefaultClient(verifiedUser);
              setClientProfile(profile);
            }}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <ClientPhoneLoginScreen
          onOtpRequested={(verificationId, phone) => {
            setOtpSession({ verificationId, phone });
          }}
        />
      </SafeAreaView>
    );
  }

  // 4. Client Profile Setup (if not configured)
  if (!clientProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ClientProfileSetupScreen
          onComplete={(profile) => setClientProfile(profile)}
        />
      </SafeAreaView>
    );
  }

  // 5. Client Approval Guard: If client is pending or rejected, block posting jobs!
  if (clientProfile.approvalStatus === 'pending' || clientProfile.approvalStatus === 'rejected') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PendingApprovalScreen
          client={clientProfile}
          onRefresh={() => setClientProfile({ ...ClientService.getCurrentClient() })}
          onLogout={() => {
            setUser(null);
            setClientProfile(null);
          }}
        />
      </SafeAreaView>
    );
  }

  // 6. Main Authenticated Client App
  const renderContent = () => {
    if (stackScreen) {
      switch (stackScreen.name) {
        case 'create-job':
          return (
            <CreateJobScreen
              onBack={() => setStackScreen(null)}
              onJobCreated={() => {
                setStackScreen(null);
                setActiveTab('jobs');
              }}
            />
          );
        case 'client-job-detail':
          return (
            <ClientJobDetailScreen
              jobId={stackScreen.params?.id}
              onBack={() => setStackScreen(null)}
              onViewApplications={(id) => setStackScreen({ name: 'applications-for-job', params: { jobId: id } })}
            />
          );
        case 'applications-for-job':
          return (
            <JobApplicationsScreen
              jobId={stackScreen.params?.jobId}
              onBack={() => setStackScreen(null)}
            />
          );
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <ClientDashboardScreen
            onNavigate={(screen, params) => {
              if (['jobs', 'applications', 'profile'].includes(screen)) {
                setActiveTab(screen as any);
              } else {
                setStackScreen({ name: screen, params });
              }
            }}
          />
        );
      case 'jobs':
        return (
          <MyJobsScreen
            onBack={() => setActiveTab('dashboard')}
            onSelectJob={(id) => setStackScreen({ name: 'client-job-detail', params: { id } })}
            onCreateJob={() => setStackScreen({ name: 'create-job' })}
          />
        );
      case 'applications':
        return (
          <JobApplicationsScreen
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'profile':
        return (
          <ClientProfileScreen
            onLogout={() => {
              setUser(null);
              setClientProfile(null);
            }}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Optional Update Banner */}
      {versionStatus?.needsOptionalUpdate && !dismissOptionalUpdate ? (
        <View style={styles.updateBanner}>
          <Text style={styles.updateBannerText}>
            A new version ({versionStatus.latestVersion}) is available.
          </Text>
          <View style={styles.updateBtnRow}>
            <TouchableOpacity
              onPress={() => {
                if (versionStatus.storeUrl) Linking.openURL(versionStatus.storeUrl);
              }}
              style={styles.updateNowPill}
            >
              <Text style={styles.updateNowText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDismissOptionalUpdate(true)}
              style={styles.laterPill}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.mainContainer}>{renderContent()}</View>

      {!stackScreen ? (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.activeTabIcon]}>📊</Text>
            <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.activeTabLabel]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('jobs')}
          >
            <Text style={[styles.tabIcon, activeTab === 'jobs' && styles.activeTabIcon]}>💼</Text>
            <Text style={[styles.tabLabel, activeTab === 'jobs' && styles.activeTabLabel]}>My Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('applications')}
          >
            <Text style={[styles.tabIcon, activeTab === 'applications' && styles.activeTabIcon]}>👥</Text>
            <Text style={[styles.tabLabel, activeTab === 'applications' && styles.activeTabLabel]}>Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabIcon]}>🏢</Text>
            <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>Company</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContainer: {
    flex: 1,
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  forceTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  forceSub: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  updateBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  updateBtnText: {
    color: COLORS.common.white,
    fontWeight: 'bold',
  },
  updateBanner: {
    backgroundColor: COLORS.brand[100],
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.brand[200],
  },
  updateBannerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[900],
    flex: 1,
  },
  updateBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  updateNowPill: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  updateNowText: {
    color: COLORS.common.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  laterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  laterText: {
    color: COLORS.gray[500],
    fontSize: 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activeTabLabel: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default ClientApp;
