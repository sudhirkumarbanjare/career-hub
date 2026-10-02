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
  StudentProfile,
  VersionCheckService,
  VersionCheckResult,
  DeviceService,
  AnalyticsService,
  NavigationScreen,
  handleRootBackPress,
  parseDeepLink,
  NotificationService,
} from '@gotechplace/shared';

import { StudentService } from './services/studentService';
import { PhoneLoginScreen } from './screens/auth/PhoneLoginScreen';
import { OtpScreen } from './screens/auth/OtpScreen';
import { StudentRegistrationScreen } from './screens/auth/StudentRegistrationScreen';
import { StudentDashboardScreen } from './screens/home/StudentDashboardScreen';
import { ProjectsMarketplaceScreen } from './screens/projects/ProjectsMarketplaceScreen';
import { ProjectDetailScreen } from './screens/projects/ProjectDetailScreen';
import { ProjectBookingScreen } from './screens/projects/ProjectBookingScreen';
import { JobsMarketplaceScreen } from './screens/jobs/JobsMarketplaceScreen';
import { JobDetailScreen } from './screens/jobs/JobDetailScreen';
import { MyApplicationsScreen } from './screens/jobs/MyApplicationsScreen';
import { CoursesScreen } from './screens/courses/CoursesScreen';
import { CourseDetailScreen } from './screens/courses/CourseDetailScreen';
import { StudentProfileScreen } from './screens/profile/StudentProfileScreen';
import { NotificationsScreen } from './screens/notifications/NotificationsScreen';
import { ForceUpdateScreen } from './screens/system/ForceUpdateScreen';
import { MaintenanceScreen } from './screens/system/MaintenanceScreen';

export const StudentApp: React.FC = () => {
  // 1. Version Check & Maintenance state
  const [versionStatus, setVersionStatus] = useState<VersionCheckResult | null>(null);
  const [dismissOptionalUpdate, setDismissOptionalUpdate] = useState(false);

  // 2. Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [otpSession, setOtpSession] = useState<{ verificationId: string; phone: string } | null>(null);

  // 3. Navigation state - Multi-level Stack and Tab
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'jobs' | 'courses' | 'profile'>('home');
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

  // Complete Deep Link Navigation Handler
  const handleDeepLinkUrl = useCallback((url: string) => {
    const parsed = parseDeepLink(url);
    if (!parsed) return;
    if (parsed.app !== 'student' && parsed.app !== 'admin') {
      // allow student deep links
    }

    const { screen, params } = parsed;
    switch (screen.toLowerCase()) {
      case 'job':
      case 'jobs':
        if (params?.id) {
          clearStack();
          setActiveTab('jobs');
          pushScreen('job-detail', { id: params.id });
        } else {
          clearStack();
          setActiveTab('jobs');
        }
        break;
      case 'applications':
      case 'my-applications':
        clearStack();
        setActiveTab('jobs');
        pushScreen('my-applications');
        break;
      case 'project':
      case 'projects':
        if (params?.id) {
          clearStack();
          setActiveTab('projects');
          pushScreen('project-detail', { id: params.id });
        } else {
          clearStack();
          setActiveTab('projects');
        }
        break;
      case 'project-booking':
        if (params?.id) {
          clearStack();
          setActiveTab('projects');
          pushScreen('project-booking', { id: params.id });
        }
        break;
      case 'course':
      case 'courses':
        if (params?.id) {
          clearStack();
          setActiveTab('courses');
          pushScreen('course-detail', { id: params.id });
        } else {
          clearStack();
          setActiveTab('courses');
        }
        break;
      case 'notification':
      case 'notifications':
        clearStack();
        pushScreen('notifications');
        break;
      case 'profile':
        clearStack();
        setActiveTab('profile');
        break;
      case 'home':
      case 'dashboard':
      default:
        clearStack();
        setActiveTab('home');
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

      // 2. Onboarding Registration Gate
      if (!isRegistered) {
        return false; // Let root back press handle or exit
      }

      // 3. Navigation Stack: If inside detail/sub-screen, unwind stack
      if (navigationStack.length > 0) {
        popScreen();
        return true;
      }

      // 4. Secondary Tab: If on projects/jobs/courses/profile, return to home tab
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }

      // 5. Root Tab (Home): Double-back to exit guard
      return handleRootBackPress('Press back again to exit GoTechPlace Student');
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      backSubscription.remove();
    };
  }, [user, otpSession, isRegistered, navigationStack, activeTab, popScreen]);

  // Run startup version & maintenance check & device registration & deep link listeners
  useEffect(() => {
    const config = VersionCheckService.getDefaultConfig('student');
    const result = VersionCheckService.evaluate('1.0.0', config);
    setVersionStatus(result);

    DeviceService.registerAppLaunch({
      appId: 'student',
      appName: 'GoTechPlace Student',
      appVersion: '1.0.0',
      uid: user?.uid,
      role: 'student',
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
    StudentService.clearSession();
    setUser(null);
    setOtpSession(null);
    setIsRegistered(false);
    setActiveTab('home');
    clearStack();
  };

  // 1. Force Update blocking check
  if (versionStatus?.needsForceUpdate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ForceUpdateScreen
          title={versionStatus.updateTitle}
          message={versionStatus.updateMessage}
          storeUrl={versionStatus.storeUrl}
        />
      </SafeAreaView>
    );
  }

  // 2. Maintenance mode blocking check
  if (versionStatus?.isMaintenanceMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MaintenanceScreen
          message={versionStatus.maintenanceMessage}
          onRefresh={() => {
            const config = VersionCheckService.getDefaultConfig('student');
            setVersionStatus(VersionCheckService.evaluate('1.0.0', config));
          }}
        />
      </SafeAreaView>
    );
  }

  // 3. Auth Flow
  if (!user) {
    if (otpSession) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <OtpScreen
            verificationId={otpSession.verificationId}
            phoneNumber={otpSession.phone}
            onChangePhone={() => setOtpSession(null)}
            onOtpVerified={(verifiedUser) => {
              setUser(verifiedUser);
              const profile = StudentService.initDefaultStudent(verifiedUser);
              setIsRegistered(Boolean(profile.isProfileComplete));
              DeviceService.recordLogin(verifiedUser.uid, 'student');
            }}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <PhoneLoginScreen
          onOtpRequested={(verificationId, phone) => {
            AnalyticsService.logAuthEvent('started', 'student');
            setOtpSession({ verificationId, phone });
          }}
        />
      </SafeAreaView>
    );
  }

  // 4. Registration Onboarding (Mandatory Gate: if new student profile is incomplete)
  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StudentRegistrationScreen
          onComplete={(profile) => {
            AnalyticsService.logEvent('profile_completed', { app_role: 'student' });
            setIsRegistered(true);
          }}
        />
      </SafeAreaView>
    );
  }

  // 5. Main Authenticated App with Bottom Tabs & Stack Views
  const renderScreen = () => {
    // If a modal/stack screen is open
    if (currentStackScreen) {
      switch (currentStackScreen.name) {
        case 'project-detail':
          return (
            <ProjectDetailScreen
              projectId={currentStackScreen.params?.id}
              onBack={popScreen}
              onBookNow={(id) => pushScreen('project-booking', { id })}
            />
          );
        case 'project-booking':
          return (
            <ProjectBookingScreen
              projectId={currentStackScreen.params?.id}
              onBack={popScreen}
              onBookingSuccess={() => {
                clearStack();
                setActiveTab('home');
              }}
            />
          );
        case 'job-detail':
          return (
            <JobDetailScreen
              jobId={currentStackScreen.params?.id}
              onBack={popScreen}
              onViewApplications={() => pushScreen('my-applications')}
            />
          );
        case 'my-applications':
          return (
            <MyApplicationsScreen
              onBack={popScreen}
              onSelectJob={(id) => pushScreen('job-detail', { id })}
            />
          );
        case 'course-detail':
          return (
            <CourseDetailScreen
              courseId={currentStackScreen.params?.id}
              onBack={popScreen}
              onEnrolledSuccess={() => {
                clearStack();
                setActiveTab('home');
              }}
            />
          );
        case 'notifications':
          return (
            <NotificationsScreen
              onBack={popScreen}
              onOpenNotification={handleDeepLinkUrl}
            />
          );
      }
    }

    // Main Tab Screens
    switch (activeTab) {
      case 'home':
        return (
          <StudentDashboardScreen
            onNavigate={(screen, params) => {
              if (['projects', 'jobs', 'courses', 'profile'].includes(screen)) {
                clearStack();
                setActiveTab(screen as any);
              } else {
                pushScreen(screen, params);
              }
            }}
          />
        );
      case 'projects':
        return (
          <ProjectsMarketplaceScreen
            onSelectProject={(id) => pushScreen('project-detail', { id })}
          />
        );
      case 'jobs':
        return (
          <JobsMarketplaceScreen
            onSelectJob={(id) => pushScreen('job-detail', { id })}
            onViewApplications={() => pushScreen('my-applications')}
          />
        );
      case 'courses':
        return (
          <CoursesScreen
            onSelectCourse={(id) => pushScreen('course-detail', { id })}
          />
        );
      case 'profile':
        return (
          <StudentProfileScreen
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
          <Text style={styles.updateText}>
            A new version ({versionStatus.latestVersion}) is available.
          </Text>
          <View style={styles.updateBtns}>
            <TouchableOpacity
              onPress={() => {
                if (versionStatus.storeUrl) Linking.openURL(versionStatus.storeUrl);
              }}
              style={styles.updateNowBtn}
            >
              <Text style={styles.updateNowText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDismissOptionalUpdate(true)}
              style={styles.laterBtn}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Screen Body */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Persistent Bottom Tab Bar (hidden when stack screen is active) */}
      {!currentStackScreen ? (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => {
              clearStack();
              setActiveTab('home');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTabIcon]}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => {
              clearStack();
              setActiveTab('projects');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'projects' && styles.activeTabIcon]}>💡</Text>
            <Text style={[styles.tabLabel, activeTab === 'projects' && styles.activeTabLabel]}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => {
              clearStack();
              setActiveTab('jobs');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'jobs' && styles.activeTabIcon]}>💼</Text>
            <Text style={[styles.tabLabel, activeTab === 'jobs' && styles.activeTabLabel]}>Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => {
              clearStack();
              setActiveTab('courses');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'courses' && styles.activeTabIcon]}>📚</Text>
            <Text style={[styles.tabLabel, activeTab === 'courses' && styles.activeTabLabel]}>Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => {
              clearStack();
              setActiveTab('profile');
            }}
          >
            <Text style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabIcon]}>👤</Text>
            <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>Profile</Text>
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
  screenContainer: {
    flex: 1,
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
  updateText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[900],
    flex: 1,
  },
  updateBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  updateNowBtn: {
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
  laterBtn: {
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
  tabButton: {
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

export default StudentApp;
