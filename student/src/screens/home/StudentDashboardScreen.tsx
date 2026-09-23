import React from 'react';
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
  Badge,
  Button,
  Avatar,
  formatCurrency,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface StudentDashboardScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({
  onNavigate,
}) => {
  const student = StudentService.getCurrentStudent();
  const bookings = StudentService.getMyBookings();
  const enrollments = StudentService.getMyEnrollments();
  const applications = StudentService.getMyApplications();
  const recommendedProjects = StudentService.getProjects().slice(0, 2);
  const recommendedJobs = StudentService.getApprovedJobs().slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentMeta}>
              {student.branch} • {student.year} ({student.semester})
            </Text>
            <Text style={styles.studentCollege}>{student.college}</Text>
          </View>
          <Avatar name={student.name} size="lg" />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Booked Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{enrollments.length}</Text>
            <Text style={styles.statLabel}>Enrolled Courses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{applications.length}</Text>
            <Text style={styles.statLabel}>Job Applications</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('projects')}
            style={[styles.quickCard, { backgroundColor: COLORS.brand[50] }]}
          >
            <Text style={styles.quickIcon}>💡</Text>
            <Text style={styles.quickTitle}>Projects</Text>
            <Text style={styles.quickSub}>Minor & Major</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('jobs')}
            style={[styles.quickCard, { backgroundColor: COLORS.success[50] }]}
          >
            <Text style={styles.quickIcon}>💼</Text>
            <Text style={styles.quickTitle}>Jobs</Text>
            <Text style={styles.quickSub}>Client Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('courses')}
            style={[styles.quickCard, { backgroundColor: COLORS.purple[50] }]}
          >
            <Text style={styles.quickIcon}>📚</Text>
            <Text style={styles.quickTitle}>Courses</Text>
            <Text style={styles.quickSub}>Skill Building</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('my-applications')}
            style={[styles.quickCard, { backgroundColor: COLORS.warning[50] }]}
          >
            <Text style={styles.quickIcon}>📝</Text>
            <Text style={styles.quickTitle}>Applications</Text>
            <Text style={styles.quickSub}>Track Status</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Bookings (if any) */}
      {bookings.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Reserved Projects</Text>
          {bookings.map((b) => (
            <Card key={b.booking_id} style={styles.itemCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{b.project?.title || 'Project'}</Text>
                <Badge label={b.status} variant="warning" size="sm" />
              </View>
              <Text style={styles.cardMeta}>Booking Ref: #{b.booking_id}</Text>
            </Card>
          ))}
        </View>
      ) : null}

      {/* Recommended Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended Projects</Text>
          <TouchableOpacity onPress={() => onNavigate('projects')}>
            <Text style={styles.seeAllLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recommendedProjects.map((p) => (
          <Card
            key={p.project_id}
            style={styles.itemCard}
            onPress={() => onNavigate('project-detail', { id: p.project_id })}
          >
            <View style={styles.cardHeader}>
              <Badge label={p.project_type} variant={p.project_type === 'Major' ? 'brand' : 'purple'} size="sm" />
              <Badge label={p.difficulty} variant="gray" size="sm" />
            </View>
            <Text style={styles.itemTitle}>{p.title}</Text>
            <Text style={styles.itemDesc} numberOfLines={2}>{p.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.costText}>{formatCurrency(p.cost)}</Text>
              <Text style={styles.branchTag}>{p.branch}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Recommended Client Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Client Jobs</Text>
          <TouchableOpacity onPress={() => onNavigate('jobs')}>
            <Text style={styles.seeAllLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recommendedJobs.map((j) => (
          <Card
            key={j.id}
            style={styles.itemCard}
            onPress={() => onNavigate('job-detail', { id: j.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.companyName}>{j.clientName || 'Client'}</Text>
              <Badge label={j.jobType} variant="success" size="sm" />
            </View>
            <Text style={styles.itemTitle}>{j.title}</Text>
            <Text style={styles.locationText}>📍 {j.location}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.budgetText}>{formatCurrency(j.budget)}</Text>
              <Text style={styles.deadlineText}>Deadline: {j.deadline}</Text>
            </View>
          </Card>
        ))}
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
  welcomeBanner: {
    backgroundColor: COLORS.brand[700],
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  welcomeGreeting: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[200],
  },
  studentName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.common.white,
    marginTop: 2,
  },
  studentMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[100],
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  studentCollege: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[200],
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand[800],
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.common.white,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.brand[200],
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.brand[600],
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  seeAllLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickCard: {
    width: '48%',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  quickTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  quickSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  itemCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  cardMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  costText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  branchTag: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
  },
  budgetText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success[700],
  },
  deadlineText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
  },
});
