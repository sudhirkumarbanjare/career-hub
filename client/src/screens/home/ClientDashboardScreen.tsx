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
} from '@gotechplace/shared';
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

  const getStatusBadge = (status?: string): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'approved':
        return { label: 'LIVE & APPROVED', variant: 'success' };
      case 'pending':
        return { label: 'PENDING APPROVAL', variant: 'warning' };
      case 'rejected':
        return { label: 'REJECTED', variant: 'danger' };
      default:
        return { label: (status || 'UNKNOWN').toUpperCase(), variant: 'gray' };
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

      {/* Premium Employer CTA Hero Card */}
      <View style={styles.heroCtaCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroGlowBadge}>
            <Text style={styles.heroGlowDot}>●</Text>
            <Text style={styles.heroGlowBadgeText}>HIRING & CAPSTONE HUB</Text>
          </View>
          <Text style={styles.heroRightTag}>Zero Placement Fees</Text>
        </View>

        <View style={styles.heroCtaHeader}>
          <View style={styles.heroCtaIconWrapper}>
            <Text style={{ fontSize: 26 }}>💼</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.heroCtaTitle}>Hire Pre-Screened Tech Talent</Text>
            <Text style={styles.heroCtaSub}>
              Post internships, freelance contracts & sponsor innovative student capstone projects with verified source code delivery.
            </Text>
          </View>
        </View>

        <View style={styles.heroCtaActions}>
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            onPress={() => onNavigate('create-job')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryCtaBtnIcon}>⚡</Text>
            <Text style={styles.primaryCtaBtnText}>+ POST NEW JOB / PROJECT</Text>
            <Text style={styles.primaryCtaBtnArrow}>➔</Text>
          </TouchableOpacity>

          <View style={styles.heroSecondaryRow}>
            <TouchableOpacity
              style={styles.secondaryCtaBtn}
              onPress={() => onNavigate('applications')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryCtaBtnText}>
                👥 Review Candidates ({applications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCtaBtn}
              onPress={() => onNavigate('my-jobs')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryCtaBtnText}>
                📂 Manage ({jobs.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employer Operations</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
            onPress={() => onNavigate('my-jobs')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#dbeafe' }]}>
                <Text style={styles.quickIcon}>📂</Text>
              </View>
              <Badge label={`${jobs.length} Active`} variant="brand" size="sm" />
            </View>
            <Text style={styles.quickTitle}>My Job Postings</Text>
            <Text style={styles.quickSub}>Review listings, edit details & track approval status</Text>
            <View style={styles.quickActionLink}>
              <Text style={[styles.quickActionText, { color: COLORS.brand[700] }]}>Manage Postings →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
            onPress={() => onNavigate('applications')}
            activeOpacity={0.75}
          >
            <View style={styles.quickCardHeader}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.quickIcon}>👥</Text>
              </View>
              <Badge label={`${applications.length} Submissions`} variant="success" size="sm" />
            </View>
            <Text style={styles.quickTitle}>Candidate Pool</Text>
            <Text style={styles.quickSub}>Screen verified student profiles, skills & resumes</Text>
            <View style={styles.quickActionLink}>
              <Text style={[styles.quickActionText, { color: COLORS.success[700] }]}>Screen Candidates →</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Jobs with Action CTAs */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Job Postings</Text>
          <TouchableOpacity onPress={() => onNavigate('my-jobs')}>
            <Text style={styles.seeAllText}>View All ({jobs.length}) →</Text>
          </TouchableOpacity>
        </View>

        {jobs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
            <Text style={styles.emptySubtitle}>
              Post your first internship, project or contract role to start receiving student applications.
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaBtn}
              onPress={() => onNavigate('create-job')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaBtnText}>+ CREATE FIRST JOB POSTING 🚀</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          jobs.slice(0, 3).map((job) => {
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
                  <TouchableOpacity
                    style={styles.jobActionPill}
                    onPress={() => onNavigate('client-job-detail', { id: job.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.appCountText}>
                      👥 {job.applicationsCount || 0} Applicants
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.manageBtn}
                    onPress={() => onNavigate('client-job-detail', { id: job.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.manageBtnText}>Manage & Edit ➔</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
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
  heroCtaCard: {
    backgroundColor: '#090d16',
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
    borderWidth: 1.5,
    borderColor: '#1e3a8a',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  heroGlowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  heroGlowDot: {
    color: '#38bdf8',
    fontSize: 8,
    marginRight: 5,
  },
  heroGlowBadgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroRightTag: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  heroCtaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  heroCtaIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  heroCtaTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#ffffff',
  },
  heroCtaSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 3,
    lineHeight: 16,
  },
  heroCtaActions: {
    gap: SPACING.sm,
  },
  primaryCtaBtn: {
    backgroundColor: '#2563eb',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  primaryCtaBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  primaryCtaBtnText: {
    color: '#ffffff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  primaryCtaBtnArrow: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  heroSecondaryRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
  },
  secondaryCtaBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryCtaBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  quickCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 18,
  },
  quickTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginTop: 4,
  },
  quickSub: {
    fontSize: 11,
    color: COLORS.gray[600],
    marginTop: 2,
    lineHeight: 15,
  },
  quickActionLink: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
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
    borderWidth: 1.5,
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
    paddingTop: SPACING.xs + 2,
  },
  jobActionPill: {
    backgroundColor: COLORS.brand[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  appCountText: {
    fontSize: 11,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  manageBtn: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  manageBtnText: {
    fontSize: 11,
    color: COLORS.gray[800],
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: SPACING.base,
    lineHeight: 16,
  },
  emptyCtaBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.brand[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCtaBtnText: {
    color: COLORS.common.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: 'bold',
  },
});
