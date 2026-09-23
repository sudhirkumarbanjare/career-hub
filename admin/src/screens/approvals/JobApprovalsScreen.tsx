import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
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
  Modal,
  Job,
  formatCurrency,
  formatRelativeDate,
} from '@tech2place/shared';
import { AdminService } from '../../services/adminService';

interface JobApprovalsScreenProps {
  onBack?: () => void;
}

export const JobApprovalsScreen: React.FC<JobApprovalsScreenProps> = ({
  onBack,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    const all = AdminService.getAllJobs();
    setJobs(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : j.approvalStatus === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (job: Job) => {
    Alert.alert(
      'Approve Job Posting',
      `Approve "${job.title}" by ${job.clientName}? This job will immediately become visible to all students in the marketplace.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Publish',
          onPress: () => {
            setActionLoading(true);
            AdminService.approveJob(job.id);
            loadData();
            setActionLoading(false);
            if (previewJob?.id === job.id) {
              setPreviewJob(null);
            }
            Alert.alert('Published', `Job "${job.title}" is now active in the student marketplace.`);
          },
        },
      ]
    );
  };

  const openRejectDialog = (jobId: string) => {
    setRejectTargetId(jobId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetId) return;
    if (!rejectReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a constructive reason for rejecting this job listing.');
      return;
    }

    setActionLoading(true);
    AdminService.rejectJob(rejectTargetId, rejectReason.trim());
    loadData();
    setActionLoading(false);
    setRejectModalVisible(false);
    setRejectTargetId(null);
    setRejectReason('');
    if (previewJob?.id === rejectTargetId) {
      setPreviewJob(null);
    }
    Alert.alert('Listing Rejected', 'The employer has been notified with your feedback.');
  };

  const handleDeleteJob = (job: Job) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to permanently delete "${job.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            AdminService.deleteJob(job.id);
            loadData();
            if (previewJob?.id === job.id) {
              setPreviewJob(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Job Approvals"
        subtitle="Moderate client job opportunities & internships"
        showBack={!!onBack}
        onBack={onBack}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by job title, client, or skill..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => {
          const count =
            tab === 'all'
              ? jobs.length
              : jobs.filter((j) => j.approvalStatus === tab).length;
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredJobs.length === 0 ? (
          <EmptyState
            title="No Job Postings"
            message={
              filter === 'pending'
                ? 'All submitted client jobs have been reviewed!'
                : 'No job records found matching current criteria.'
            }
            iconName="briefcase-outline"
          />
        ) : (
          filteredJobs.map((job) => {
            const isPending = job.approvalStatus === 'pending';
            const isApproved = job.approvalStatus === 'approved';
            const isRejected = job.approvalStatus === 'rejected';

            return (
              <Card key={job.id} style={styles.jobCard}>
                <View style={styles.cardHeader}>
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

                {/* Meta details */}
                <View style={styles.metaRow}>
                  <Text style={styles.budgetText}>{formatCurrency(job.budget)}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>{job.jobType}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>
                    {job.isRemote ? 'Remote' : job.location}
                  </Text>
                </View>

                {/* Description snippet */}
                <Text style={styles.descSnippet} numberOfLines={2}>
                  {job.description}
                </Text>

                {/* Skills tags */}
                <View style={styles.skillsRow}>
                  {job.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                {/* Rejection Notice if applicable */}
                {job.rejectionReason && (
                  <View style={styles.rejectionNotice}>
                    <Text style={styles.rejectionNoticeTitle}>Rejection Feedback:</Text>
                    <Text style={styles.rejectionNoticeText}>{job.rejectionReason}</Text>
                  </View>
                )}

                <View style={styles.footerRow}>
                  <Text style={styles.timestampText}>
                    Submitted {formatRelativeDate(job.createdAt)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {isPending ? (
                    <>
                      <Button
                        title="Approve & Publish"
                        variant="primary"
                        size="small"
                        style={{ flex: 1, marginRight: SPACING.xs }}
                        onPress={() => handleApprove(job)}
                        loading={actionLoading}
                      />
                      <Button
                        title="Reject"
                        variant="danger"
                        size="small"
                        style={{ flex: 1, marginRight: SPACING.xs }}
                        onPress={() => openRejectDialog(job.id)}
                        loading={actionLoading}
                      />
                      <Button
                        title="Preview"
                        variant="outline"
                        size="small"
                        onPress={() => setPreviewJob(job)}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        title="Preview Details"
                        variant="outline"
                        size="small"
                        style={{ flex: 1, marginRight: SPACING.xs }}
                        onPress={() => setPreviewJob(job)}
                      />
                      {isApproved ? (
                        <Button
                          title="Reject Listing"
                          variant="danger"
                          size="small"
                          style={{ marginRight: SPACING.xs }}
                          onPress={() => openRejectDialog(job.id)}
                        />
                      ) : (
                        <Button
                          title="Re-Approve"
                          variant="primary"
                          size="small"
                          style={{ marginRight: SPACING.xs }}
                          onPress={() => handleApprove(job)}
                        />
                      )}
                      <Button
                        title="Delete"
                        variant="danger"
                        size="small"
                        onPress={() => handleDeleteJob(job)}
                      />
                    </>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        title="Reject Job Listing"
        onClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalSub}>
            Please indicate why this job posting was not approved so the employer can revise it.
          </Text>

          <TextInput
            style={styles.reasonInput}
            multiline
            numberOfLines={4}
            placeholder="e.g. Unrealistic budget for project scope, missing specific technical deliverables, requires non-compliant off-platform deposit..."
            value={rejectReason}
            onChangeText={setRejectReason}
            textAlignVertical="top"
          />

          <View style={styles.modalBtnRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              style={{ flex: 1, marginRight: SPACING.sm }}
              onPress={() => setRejectModalVisible(false)}
            />
            <Button
              title="Confirm Rejection"
              variant="danger"
              size="medium"
              style={{ flex: 1 }}
              onPress={handleConfirmReject}
              loading={actionLoading}
            />
          </View>
        </View>
      </Modal>

      {/* Job Preview Modal */}
      <Modal
        visible={!!previewJob}
        title="Job Listing Preview"
        onClose={() => setPreviewJob(null)}
      >
        {previewJob && (
          <ScrollView style={{ maxHeight: 420 }}>
            <Text style={styles.previewTitle}>{previewJob.title}</Text>
            <Text style={styles.previewClient}>
              {previewJob.clientName} • {previewJob.category}
            </Text>

            <View style={styles.previewMetaBox}>
              <Text style={styles.previewMetaLabel}>Budget / Stipend:</Text>
              <Text style={styles.previewMetaVal}>
                {formatCurrency(previewJob.budget)}
              </Text>
              <Text style={styles.previewMetaLabel}>Deadline:</Text>
              <Text style={styles.previewMetaVal}>{previewJob.deadline}</Text>
              <Text style={styles.previewMetaLabel}>Type & Location:</Text>
              <Text style={styles.previewMetaVal}>
                {previewJob.jobType} • {previewJob.isRemote ? 'Remote' : previewJob.location}
              </Text>
            </View>

            <Text style={styles.previewSectionHeader}>Full Description</Text>
            <Text style={styles.previewDesc}>{previewJob.description}</Text>

            <Text style={styles.previewSectionHeader}>Required Skills</Text>
            <View style={styles.skillsRow}>
              {previewJob.skills.map((skill, i) => (
                <View key={i} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Button
                title="Close Preview"
                variant="outline"
                size="medium"
                onPress={() => setPreviewJob(null)}
              />
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  tabButton: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
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
  descSnippet: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: SPACING.xs,
  },
  skillTag: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  skillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  rejectionNotice: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger[600],
    padding: SPACING.sm,
    borderRadius: 4,
    marginVertical: SPACING.xs,
  },
  rejectionNoticeTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.danger[600],
  },
  rejectionNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger[600],
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  timestampText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    paddingTop: SPACING.xs,
  },
  modalSub: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  reasonInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    minHeight: 90,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  modalBtnRow: {
    flexDirection: 'row',
  },
  previewTitle: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  previewClient: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  previewMetaBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  previewMetaLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  previewMetaVal: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    marginBottom: 4,
  },
  previewSectionHeader: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  previewDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    lineHeight: 20,
  },
});
