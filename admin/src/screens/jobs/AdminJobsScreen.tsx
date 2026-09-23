import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  Header,
  Card,
  Badge,
  Button,
  SearchBar,
  EmptyState,
  Job,
  formatCurrency,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface AdminJobsScreenProps {
  onBack?: () => void;
  onNavigateApprovals?: () => void;
}

export const AdminJobsScreen: React.FC<AdminJobsScreenProps> = ({
  onBack,
  onNavigateApprovals,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const loadData = () => {
    const all = AdminService.getAllJobs();
    setJobs(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = jobs.filter((j) => j.approvalStatus === 'pending').length;

  const filteredJobs = jobs.filter((j) => {
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'pending'
        ? j.approvalStatus === 'pending'
        : selectedStatus === 'approved'
        ? j.approvalStatus === 'approved'
        : j.approvalStatus === 'rejected';

    const matchesSearch =
      searchQuery.trim() === '' ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleDelete = (job: Job) => {
    Alert.alert(
      'Takedown / Delete Job',
      `Are you sure you want to permanently remove "${job.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            AdminService.deleteJob(job.id);
            loadData();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Jobs Directory"
        subtitle="Platform-wide job & internship oversight"
        showBack={!!onBack}
        onBack={onBack}
      />

      {/* Pending Banner if any */}
      {pendingCount > 0 && onNavigateApprovals && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={onNavigateApprovals}
        >
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.pendingTitle}>Job Approvals Pending</Text>
            <Text style={styles.pendingSub}>Tap to review newly submitted client postings</Text>
          </View>
          <Text style={styles.pendingArrow}>➔</Text>
        </TouchableOpacity>
      )}

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, client, or category..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filtersRow}>
        {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => {
          const isActive = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedStatus(st)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {st === 'all'
                  ? 'All Jobs'
                  : st === 'approved'
                  ? 'Active / Approved'
                  : st === 'pending'
                  ? 'Pending Review'
                  : 'Rejected'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredJobs.length === 0 ? (
          <EmptyState
            title="No Jobs Found"
            message="No jobs matching the current search query or filter."
            iconName="briefcase-outline"
          />
        ) : (
          filteredJobs.map((job) => {
            const isPending = job.approvalStatus === 'pending';
            const isApproved = job.approvalStatus === 'approved';

            return (
              <Card key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.clientSubtitle}>
                      {job.clientName} • {job.category}
                    </Text>
                  </View>
                  <Badge
                    text={job.approvalStatus.toUpperCase()}
                    variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'}
                  />
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.budgetText}>{formatCurrency(job.budget)}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>{job.jobType}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>
                    {job.isRemote ? 'Remote' : job.location}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Applications:</Text>
                    <Text style={styles.statVal}>{job.applicationsCount}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Deadline:</Text>
                    <Text style={styles.statVal}>{job.deadline}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Posted:</Text>
                    <Text style={styles.statVal}>{formatRelativeDate(job.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  {onNavigateApprovals && isPending && (
                    <Button
                      title="Review Listing"
                      variant="primary"
                      size="small"
                      style={{ flex: 1, marginRight: SPACING.sm }}
                      onPress={onNavigateApprovals}
                    />
                  )}
                  <Button
                    title="Delete / Remove"
                    variant="danger"
                    size="small"
                    style={{ flex: 1 }}
                    onPress={() => handleDelete(job)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e6',
    borderWidth: 1,
    borderColor: '#ffe8a3',
    borderRadius: 8,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.white,
  },
  pendingTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text,
  },
  pendingSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  pendingArrow: {
    fontSize: 16,
    color: COLORS.warning,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  clientSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  budgetText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metaDivider: {
    marginHorizontal: SPACING.xs,
    color: COLORS.textSecondary,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  statVal: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
});
