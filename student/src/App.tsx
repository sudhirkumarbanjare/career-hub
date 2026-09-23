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
  StudentProfile,
  VersionCheckService,
  VersionCheckResult,
} from '@tech2place/shared';

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
  const [isRegistered, setIsRegistered] = useState(true);
  const [otpSession, setOtpSession] = useState<{ verificationId: string; phone: string } | null>(null);

  // 3. Navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'jobs' | 'courses' | 'profile'>('home');
  const [stackScreen, setStackScreen] = useState<{ name: string; params?: any } | null>(null);

  // Run startup version & maintenance check
  useEffect(() => {
    const config = VersionCheckService.getDefaultConfig('student');
    const result = VersionCheckService.evaluate('1.0.0', config);
    setVersionStatus(result);
  }, []);

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
              StudentService.initDefaultStudent(verifiedUser);
            }}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <PhoneLoginScreen
          onOtpRequested={(verificationId, phone) => {
            setOtpSession({ verificationId, phone });
          }}
        />
      </SafeAreaView>
    );
  }

  // 4. Registration Onboarding (if new user profile incomplete)
  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StudentRegistrationScreen
          onComplete={() => setIsRegistered(true)}
        />
      </SafeAreaView>
    );
  }

  // 5. Main Authenticated App with Bottom Tabs & Stack Views
  const renderScreen = () => {
    // If a modal/stack screen is open
    if (stackScreen) {
      switch (stackScreen.name) {
        case 'project-detail':
          return (
            <ProjectDetailScreen
              projectId={stackScreen.params?.id}
              onBack={() => setStackScreen(null)}
              onBookNow={(id) => setStackScreen({ name: 'project-booking', params: { id } })}
            />
          );
        case 'project-booking':
          return (
            <ProjectBookingScreen
              projectId={stackScreen.params?.id}
              onBack={() => setStackScreen(null)}
              onBookingSuccess={() => {
                setStackScreen(null);
                setActiveTab('home');
              }}
            />
          );
        case 'job-detail':
          return (
            <JobDetailScreen
              jobId={stackScreen.params?.id}
              onBack={() => setStackScreen(null)}
              onViewApplications={() => setStackScreen({ name: 'my-applications' })}
            />
          );
        case 'my-applications':
          return (
            <MyApplicationsScreen
              onBack={() => setStackScreen(null)}
              onSelectJob={(id) => setStackScreen({ name: 'job-detail', params: { id } })}
            />
          );
        case 'course-detail':
          return (
            <CourseDetailScreen
              courseId={stackScreen.params?.id}
              onBack={() => setStackScreen(null)}
              onEnrolledSuccess={() => {
                setStackScreen(null);
                setActiveTab('home');
              }}
            />
          );
        case 'notifications':
          return (
            <NotificationsScreen
              onBack={() => setStackScreen(null)}
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
                setActiveTab(screen as any);
              } else {
                setStackScreen({ name: screen, params });
              }
            }}
          />
        );
      case 'projects':
        return (
          <ProjectsMarketplaceScreen
            onSelectProject={(id) => setStackScreen({ name: 'project-detail', params: { id } })}
          />
        );
      case 'jobs':
        return (
          <JobsMarketplaceScreen
            onSelectJob={(id) => setStackScreen({ name: 'job-detail', params: { id } })}
            onViewApplications={() => setStackScreen({ name: 'my-applications' })}
          />
        );
      case 'courses':
        return (
          <CoursesScreen
            onSelectCourse={(id) => setStackScreen({ name: 'course-detail', params: { id } })}
          />
        );
      case 'profile':
        return (
          <StudentProfileScreen
            onNavigateToNotifications={() => setStackScreen({ name: 'notifications' })}
            onLogout={() => {
              setUser(null);
              setOtpSession(null);
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
      {!stackScreen ? (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('home')}
          >
            <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTabIcon]}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('projects')}
          >
            <Text style={[styles.tabIcon, activeTab === 'projects' && styles.activeTabIcon]}>💡</Text>
            <Text style={[styles.tabLabel, activeTab === 'projects' && styles.activeTabLabel]}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('jobs')}
          >
            <Text style={[styles.tabIcon, activeTab === 'jobs' && styles.activeTabIcon]}>💼</Text>
            <Text style={[styles.tabLabel, activeTab === 'jobs' && styles.activeTabLabel]}>Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('courses')}
          >
            <Text style={[styles.tabIcon, activeTab === 'courses' && styles.activeTabIcon]}>📚</Text>
            <Text style={[styles.tabLabel, activeTab === 'courses' && styles.activeTabLabel]}>Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('profile')}
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
