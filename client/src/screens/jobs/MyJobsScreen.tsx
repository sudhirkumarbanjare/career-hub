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
} from '@tech2place/shared';
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

  const getStatusBadge = (status: string): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'approved':
        return { label: 'APPROVED & LIVE', variant: 'success' };
      case 'pending':
        return { label: 'PENDING REVIEW', variant: 'warning' };
      case 'rejected':
        return { label: 'REJECTED', variant: 'danger' };
      default:
        return { label: status.toUpperCase(), variant: 'gray' };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Job Postings"
        subtitle={`${allJobs.length} listings total`}
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={onCreateJob} style={styles.headerActionBtn}>
            <Text style={styles.headerActionText}>+ New</Text>
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
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No Job Postings</Text>
            <Text style={styles.emptySub}>You haven't posted any jobs in this category yet.</Text>
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
                <Text style={styles.applicantCount}>
                  👥 {item.applicationsCount || 0} Applicants
                </Text>
                <Text style={styles.manageLink}>View & Manage →</Text>
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
    backgroundColor: COLORS.brand[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  headerActionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
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
    paddingTop: SPACING.xs,
  },
  applicantCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  manageLink: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
  },
  emptySub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
});
