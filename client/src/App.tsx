import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  AppState,
  AppStateStatus,
  BackHandler,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  User,
  ClientProfile,
  VersionCheckService,
  VersionCheckResult,
  DeviceService,
  AnalyticsService,
  NavigationScreen,
  handleRootBackPress,
  parseDeepLink,
  NotificationService,
} from '@gotechplace/shared';

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
import { ClientNotificationsScreen } from './screens/notifications/ClientNotificationsScreen';

export const ClientApp: React.FC = () => {
  // 1. Version Check & Maintenance state
  const [versionStatus, setVersionStatus] = useState<VersionCheckResult | null>(null);
  const [dismissOptionalUpdate, setDismissOptionalUpdate] = useState(false);

  // 2. Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [otpSession, setOtpSession] = useState<{ verificationId: string; phone: string } | null>(null);

  // 3. Navigation state - Multi-level Stack and Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'applications' | 'profile'>('dashboard');
  const [navigationStack, setNavigationStack] = useState<NavigationScreen[]>([]);
  const [, setNotificationVersion] = useState(0);

  // Stack navigation helpers
  const pushScreen = useCallback((name: string, params?: any) => {
    setNavigationStack((prev) => [...prev, { name, params }]);
  }, []);

  const popScreen = useCallback(() => {
    setNavigationStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const clearStack = useCallback(() => {
    setNavigationStack([]);
  }, []);

  const currentStackScreen = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;

  // Complete Deep Link Navigation Handler for Client App
  const handleDeepLinkUrl = useCallback((url: string) => {
    const parsed = parseDeepLink(url);
    if (!parsed) return;
    if (parsed.app !== 'client' && parsed.app !== 'admin') {
      // allow client deep links
    }

    const { screen, params } = parsed;
    switch (screen.toLowerCase()) {
      case 'job':
      case 'jobs':
      case 'my-jobs':
        if (params?.id) {
          clearStack();
          setActiveTab('jobs');
          pushScreen('client-job-detail', { id: params.id });
        } else {
          clearStack();
          setActiveTab('jobs');
        }
        break;
      case 'create-job':
        clearStack();
        setActiveTab('jobs');
        pushScreen('create-job');
        break;
      case 'application':
      case 'applications':
      case 'candidates':
        if (params?.jobId || params?.id) {
          clearStack();
          setActiveTab('applications');
          pushScreen('applications-for-job', { jobId: params.jobId || params.id });
        } else {
          clearStack();
          setActiveTab('applications');
        }
        break;
      case 'notification':
      case 'notifications':
        clearStack();
        pushScreen('notifications');
        break;
      case 'profile':
      case 'company':
        clearStack();
        setActiveTab('profile');
        break;
      case 'dashboard':
      default:
        clearStack();
        setActiveTab('dashboard');
        break;
    }
  }, [clearStack, pushScreen]);

  // Centralized Android BackHandler (Hardware Back & Gesture Edge-Swipe Back)
  useEffect(() => {
    const onHardwareBackPress = (): boolean => {
      // 1. Auth Flow: If on OTP screen, go back to Phone Login
      if (!user) {
        if (otpSession) {
          setOtpSession(null);
          return true; // Handled, return to phone login
        }
        return false; // Exit app on root login screen
      }

      // 2. Registration / Approval Gates
      if (!clientProfile?.isProfileComplete) {
        return false;
      }

      // 3. Navigation Stack: If inside detail/sub-screen, unwind stack
      if (navigationStack.length > 0) {
        popScreen();
        return true;
      }

      // 4. Secondary Tab: If on jobs/applications/profile, return to dashboard tab
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return true;
      }

      // 5. Root Tab (Dashboard): Double-back to exit guard
      return handleRootBackPress('Press back again to exit GoTechPlace Client');
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      backSubscription.remove();
    };
  }, [user, otpSession, clientProfile, navigationStack, activeTab, popScreen]);

  // Run startup version check & device registration & deep link listeners
  useEffect(() => {
    const config = VersionCheckService.getDefaultConfig('client');
    const result = VersionCheckService.evaluate('1.0.0', config);
    setVersionStatus(result);

    DeviceService.registerAppLaunch({
      appId: 'client',
      appName: 'GoTechPlace Employer / Client',
      appVersion: '1.0.0',
      uid: user?.uid,
      role: 'client',
    });

    // 1. Listen for real-time push notifications from Admin & Firebase
    const notifUnsub = NotificationService.subscribe(() => {
      setNotificationVersion((v) => v + 1);
    });

    // 2. Cold boot deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLinkUrl(url);
    }).catch(() => {});

    // 3. Runtime deep link events
    const linkSub = Linking.addEventListener('url', (event) => {
      if (event.url) handleDeepLinkUrl(event.url);
    });

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        DeviceService.recordAppForeground();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        DeviceService.recordAppBackground();
      }
    });

    return () => {
      notifUnsub();
      linkSub.remove();
      subscription.remove();
    };
  }, [handleDeepLinkUrl]);

  const handleLogout = () => {
    if (user) {
      DeviceService.recordLogout(user.uid);
    }
    ClientService.clearSession();
    setUser(null);
    setClientProfile(null);
    setOtpSession(null);
    setActiveTab('dashboard');
    clearStack();
  };

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
              DeviceService.recordLogin(verifiedUser.uid, 'client');
            }}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <ClientPhoneLoginScreen
          onOtpRequested={(verificationId, phone) => {
            AnalyticsService.logAuthEvent('started', 'client');
            setOtpSession({ verificationId, phone });
          }}
        />
      </SafeAreaView>
    );
  }

  // 4. Client Profile Setup (Mandatory Gate if profile is incomplete)
  if (!clientProfile || !clientProfile.isProfileComplete || !clientProfile.companyName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ClientProfileSetupScreen
          onComplete={(profile) => {
            AnalyticsService.logEvent('profile_completed', { app_role: 'client' });
            setClientProfile(profile);
          }}
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
          onLogout={handleLogout}
        />
      </SafeAreaView>
    );
  }

  // 6. Main Authenticated Client App
  const renderContent = () => {
    if (currentStackScreen) {
      switch (currentStackScreen.name) {
        case 'create-job':
          return (
            <CreateJobScreen
              onBack={popScreen}
              onJobCreated={() => {
                clearStack();
                setActiveTab('jobs');
              }}
            />
          );
        case 'client-job-detail':
          return (
            <ClientJobDetailScreen
              jobId={currentStackScreen.params?.id}
              onBack={popScreen}
              onViewApplications={(id) => pushScreen('applications-for-job', { jobId: id })}
            />
          );
        case 'applications-for-job':
          return (
            <JobApplicationsScreen
              jobId={currentStackScreen.params?.jobId}
              onBack={popScreen}
            />
          );
        case 'notifications':
          return (
            <ClientNotificationsScreen
              onBack={popScreen}
              onOpenNotification={(deepLink) => {
                if (deepLink) {
                  handleDeepLinkUrl(deepLink);
                } else {
                  clearStack();
                  setActiveTab('applications');
                }
              }}
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
                clearStack();
                setActiveTab(screen as any);
              } else {
                pushScreen(screen, params);
              }
            }}
          />
        );
      case 'jobs':
        return (
          <MyJobsScreen
            onBack={() => {
              clearStack();
              setActiveTab('dashboard');
            }}
            onSelectJob={(id) => pushScreen('client-job-detail', { id })}
            onCreateJob={() => pushScreen('create-job')}
          />
        );
      case 'applications':
        return (
          <JobApplicationsScreen
            onBack={() => {
              clearStack();
              setActiveTab('dashboard');
            }}
          />
        );
      case 'profile':
        return (
          <ClientProfileScreen
            onNavigateToNotifications={() => pushScreen('notifications')}
            onLogout={handleLogout}
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

      {!currentStackScreen ? (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => {
              clearStack();
              setActiveTab('dashboard');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.activeTabIcon]}>📊</Text>
            <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.activeTabLabel]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => {
              clearStack();
              setActiveTab('jobs');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'jobs' && styles.activeTabIcon]}>💼</Text>
            <Text style={[styles.tabLabel, activeTab === 'jobs' && styles.activeTabLabel]}>My Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => {
              clearStack();
              setActiveTab('applications');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'applications' && styles.activeTabIcon]}>👥</Text>
            <Text style={[styles.tabLabel, activeTab === 'applications' && styles.activeTabLabel]}>Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => {
              clearStack();
              setActiveTab('profile');
            }}
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
