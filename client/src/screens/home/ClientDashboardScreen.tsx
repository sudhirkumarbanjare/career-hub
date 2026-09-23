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
  BadgeVariant,
  Button,
  Avatar,
  formatCurrency,
} from '@tech2place/shared';
import { ClientService } from '../../services/clientService';

export interface ClientDashboardScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const ClientDashboardScreen: React.FC<ClientDashboardScreenProps> = ({
  onNavigate,
}) => {
  const client = ClientService.getCurrentClient();
  const jobs = ClientService.getMyJobs();
  const approvedJobs = jobs.filter((j) => j.approvalStatus === 'approved');
  const pendingJobs = jobs.filter((j) => j.approvalStatus === 'pending');
  const applications = ClientService.getAllReceivedApplications();

  const getStatusBadge = (status: string): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'approved':
        return { label: 'LIVE & APPROVED', variant: 'success' };
      case 'pending':
        return { label: 'PENDING APPROVAL', variant: 'warning' };
      case 'rejected':
        return { label: 'REJECTED', variant: 'danger' };
      default:
        return { label: status.toUpperCase(), variant: 'gray' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Client Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>{client.companyName}</Text>
            <Text style={styles.contactPerson}>Managed by: {client.contactPerson}</Text>
            <Badge
              label="VERIFIED EMPLOYER"
              variant="success"
              size="sm"
              style={{ marginTop: 4 }}
            />
          </View>
          <Avatar name={client.companyName} size="lg" />
        </View>

        {/* Metrics Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{approvedJobs.length}</Text>
            <Text style={styles.statLabel}>Live Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{pendingJobs.length}</Text>
            <Text style={styles.statLabel}>Under Review</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{applications.length}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>
      </View>

      {/* Primary Action Button */}
      <Button
        title="+ POST NEW JOB / PROJECT"
        onPress={() => onNavigate('create-job')}
        size="lg"
        style={styles.postBtn}
      />

      {/* Quick Navigation Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employer Operations</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: COLORS.brand[50] }]}
            onPress={() => onNavigate('my-jobs')}
            activeOpacity={0.75}
          >
            <Text style={styles.quickIcon}>📂</Text>
            <Text style={styles.quickTitle}>My Job Postings</Text>
            <Text style={styles.quickSub}>{jobs.length} total listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: COLORS.success[50] }]}
            onPress={() => onNavigate('applications')}
            activeOpacity={0.75}
          >
            <Text style={styles.quickIcon}>👥</Text>
            <Text style={styles.quickTitle}>Candidate Pool</Text>
            <Text style={styles.quickSub}>{applications.length} submissions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Job Postings</Text>
          <TouchableOpacity onPress={() => onNavigate('my-jobs')}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {jobs.slice(0, 3).map((job) => {
          const badge = getStatusBadge(job.approvalStatus);
          return (
            <Card
              key={job.id}
              style={styles.jobCard}
              onPress={() => onNavigate('client-job-detail', { id: job.id })}
            >
              <View style={styles.jobTop}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Badge label={badge.label} variant={badge.variant} size="sm" />
              </View>

              <Text style={styles.jobMeta}>
                {job.jobType} • {formatCurrency(job.budget)} • Deadline: {job.deadline}
              </Text>

              <View style={styles.jobBottom}>
                <Text style={styles.appCountText}>
                  📋 {job.applicationsCount || 0} Student Applications
                </Text>
                <Text style={styles.detailLink}>Manage →</Text>
              </View>
            </Card>
          );
        })}
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
  headerBanner: {
    backgroundColor: COLORS.gray[900],
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.common.white,
  },
  contactPerson: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[800],
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
    fontSize: 10,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.gray[700],
  },
  postBtn: {
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickCard: {
    flex: 1,
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
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  quickSub: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  jobMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  jobBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.xs,
  },
  appCountText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  detailLink: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
  },
});
