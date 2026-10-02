import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  BadgeVariant,
  Tabs,
  formatCurrency,
  Job,
} from '@gotechplace/shared';
import { ClientService } from '../../services/clientService';

export interface MyJobsScreenProps {
  onBack: () => void;
  onSelectJob: (jobId: string) => void;
  onCreateJob: () => void;
}

export const MyJobsScreen: React.FC<MyJobsScreenProps> = ({
  onBack,
  onSelectJob,
  onCreateJob,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending_approval' | 'rejected'>('all');
  const allJobs = ClientService.getMyJobs();

  const filteredJobs = useMemo(() => {
    if (activeTab === 'all') return allJobs;
    if (activeTab === 'approved') return allJobs.filter((j) => j.approvalStatus === 'approved');
    if (activeTab === 'pending_approval') return allJobs.filter((j) => j.approvalStatus === 'pending');
    if (activeTab === 'rejected') return allJobs.filter((j) => j.approvalStatus === 'rejected');
    return allJobs;
  }, [allJobs, activeTab]);

  const getStatusBadge = (status?: string): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'approved':
        return { label: 'APPROVED & LIVE', variant: 'success' };
      case 'pending':
        return { label: 'PENDING REVIEW', variant: 'warning' };
      case 'rejected':
        return { label: 'REJECTED', variant: 'danger' };
      default:
        return { label: (status || 'UNKNOWN').toUpperCase(), variant: 'gray' };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Job Postings"
        subtitle={`${allJobs.length} listings total`}
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={onCreateJob} style={styles.headerActionBtn} activeOpacity={0.8}>
            <Text style={styles.headerActionText}>+ Post Job 🚀</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.tabsContainer}>
        <Tabs
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'approved', label: 'Live' },
            { key: 'pending_approval', label: 'Under Review' },
            { key: 'rejected', label: 'Needs Revision' },
          ]}
          activeTab={activeTab}
          onSelectTab={(k) => setActiveTab(k as any)}
        />
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>📂</Text>
            </View>
            <Text style={styles.emptyTitle}>No Job Postings Found</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'all'
                ? "You haven't posted any job or capstone requirements yet. Post your opportunity to reach top engineering students."
                : `No listings currently under "${activeTab.replace('_', ' ')}".`}
            </Text>
            <TouchableOpacity
              style={styles.emptyPostCtaBtn}
              onPress={onCreateJob}
              activeOpacity={0.88}
            >
              <Text style={styles.emptyPostCtaText}>+ POST NEW JOB / PROJECT 🚀</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.approvalStatus);
          return (
            <Card
              style={styles.jobCard}
              onPress={() => onSelectJob(item.id)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Badge label={badge.label} variant={badge.variant} size="sm" />
              </View>

              <Text style={styles.jobMeta}>
                {item.jobType} • {formatCurrency(item.budget)} • {item.location}
              </Text>

              {item.rejectionReason ? (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionLabel}>Admin Feedback:</Text>
                  <Text style={styles.rejectionReason}>{item.rejectionReason}</Text>
                </View>
              ) : null}

              <View style={styles.cardBottom}>
                <View style={styles.applicantBadge}>
                  <Text style={styles.applicantCount}>
                    👥 {item.applicationsCount || 0} Candidates
                  </Text>
                </View>

                <View style={styles.cardActionGroup}>
                  <TouchableOpacity
                    style={styles.managePill}
                    onPress={() => onSelectJob(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.managePillText}>Review & Manage ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerActionBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  tabsContainer: {
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  jobCard: {
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  cardTop: {
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
  rejectionBox: {
    backgroundColor: COLORS.danger[50],
    borderColor: COLORS.danger[200],
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rejectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.danger[700],
    textTransform: 'uppercase',
  },
  rejectionReason: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.danger[800],
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  applicantBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  applicantCount: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '700',
  },
  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managePill: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  managePillText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: SPACING['2xl'],
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  emptySub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyPostCtaBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyPostCtaText: {
    color: '#ffffff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
