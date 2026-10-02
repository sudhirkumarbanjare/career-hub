import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
  Button,
  Modal,
  formatCurrency,
} from '@gotechplace/shared';
import { ClientService } from '../../services/clientService';

export interface ClientJobDetailScreenProps {
  jobId: string;
  onBack: () => void;
  onViewApplications: (jobId: string) => void;
}

export const ClientJobDetailScreen: React.FC<ClientJobDetailScreenProps> = ({
  jobId,
  onBack,
  onViewApplications,
}) => {
  const [job, setJob] = useState(ClientService.getJobById(jobId));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState(job?.title || '');
  const [editDesc, setEditDesc] = useState(job?.description || '');
  const [editBudget, setEditBudget] = useState(job ? String(job.budget) : '50000');
  const [editSkills, setEditSkills] = useState(job ? job.skills.join(', ') : '');
  const [editError, setEditError] = useState('');

  if (!job) {
    return (
      <View style={styles.container}>
        <Header title="Job Details" onBack={onBack} />
        <View style={styles.notFound}><Text>Job posting not found.</Text></View>
      </View>
    );
  }

  const isPending = job.approvalStatus === 'pending';
  const isApproved = job.approvalStatus === 'approved';
  const isRejected = job.approvalStatus === 'rejected';

  const getStatusBadge = (): { label: string; variant: BadgeVariant } => {
    if (isApproved) return { label: 'LIVE & APPROVED', variant: 'success' };
    if (isPending) return { label: 'PENDING ADMIN APPROVAL', variant: 'warning' };
    if (isRejected) return { label: 'REJECTED / REVISION REQUIRED', variant: 'danger' };
    return { label: (job.status || 'ACTIVE').toUpperCase(), variant: 'gray' };
  };

  const badge = getStatusBadge();

  const handleSaveEdit = () => {
    setEditError('');
    const skills = editSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const budgetNum = parseInt(editBudget, 10) || 0;

    const res = ClientService.updatePendingJob(job.id, {
      title: editTitle,
      description: editDesc,
      budget: budgetNum,
      skills,
    });

    if (res.success && res.job) {
      setJob({ ...res.job });
      setIsEditModalOpen(false);
    } else {
      setEditError(res.error || 'Failed to update job');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Manage Job"
        subtitle={`Ref: #${job.id}`}
        onBack={onBack}
        rightAction={
          !isApproved ? (
            <Button
              title="Edit ✎"
              onPress={() => setIsEditModalOpen(true)}
              variant="ghost"
              size="sm"
            />
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <Badge label={badge.label} variant={badge.variant} size="md" />
          <Badge label={job.jobType} variant="gray" size="md" />
        </View>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.meta}>
          {job.category} • {job.isRemote ? '🌐 Remote' : `📍 ${job.location}`} • Deadline: {job.deadline}
        </Text>

        {isRejected ? (
          <View style={styles.rejectedBanner}>
            <View style={styles.rejectedHeader}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
              <Text style={styles.rejectedTitle}>Revision Required by Admin</Text>
            </View>
            <Text style={styles.rejectedMsg}>{job.rejectionReason || 'Please modify the job requirements and budget.'}</Text>
            <TouchableOpacity
              style={styles.resubmitCtaBtn}
              onPress={() => setIsEditModalOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.resubmitCtaText}>✎ EDIT & RESUBMIT POSTING NOW</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* High-Impact Applicants Hero CTA Card */}
        <View style={styles.applicantHeroCard}>
          <View style={styles.applicantTopRow}>
            <View style={styles.applicantBadgeIcon}>
              <Text style={{ fontSize: 22 }}>👥</Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.applicantHeroCount}>{job.applicationsCount || 0}</Text>
                <Text style={styles.applicantHeroLabel}> Student Applications</Text>
              </View>
              <Text style={styles.applicantHeroSub}>
                Verified engineering candidates ready for screening & interview.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewCandidatesCtaBtn}
            onPress={() => onViewApplications(job.id)}
            activeOpacity={0.88}
          >
            <Text style={styles.viewCandidatesCtaText}>
              VIEW & SCREEN CANDIDATES ➔
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Job Description & Deliverables</Text>
          <Text style={styles.descText}>{job.description}</Text>
        </Card>

        {/* Required Skills */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Required Skills & Tech Stack</Text>
          <View style={styles.skillsGrid}>
            {job.skills.map((s) => (
              <Badge key={s} label={s} variant="brand" size="md" />
            ))}
          </View>
        </Card>

        {/* Compensation & Timeline */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Offered Stipend / Compensation</Text>
          <Text style={styles.budgetText}>{formatCurrency(job.budget)}</Text>
          <Text style={styles.metaSub}>Milestone payouts verified through escrow.</Text>
        </Card>
      </ScrollView>

      {/* Edit Job Modal (Allowed only for pending / rejected jobs) */}
      <Modal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Job Posting"
      >
        <Text style={styles.inputLabel}>Job Title</Text>
        <TextInput
          value={editTitle}
          onChangeText={setEditTitle}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          value={editDesc}
          onChangeText={setEditDesc}
          multiline
          numberOfLines={4}
          style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
        />

        <Text style={styles.inputLabel}>Budget (INR ₹)</Text>
        <TextInput
          value={editBudget}
          onChangeText={setEditBudget}
          keyboardType="numeric"
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Skills (Comma separated)</Text>
        <TextInput
          value={editSkills}
          onChangeText={setEditSkills}
          style={styles.textInput}
        />

        {editError ? <Text style={styles.errorText}>{editError}</Text> : null}

        <Button
          title="SAVE & UPDATE POSTING"
          onPress={handleSaveEdit}
          size="lg"
          style={{ marginTop: SPACING.md }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginTop: 4,
    marginBottom: 2,
  },
  meta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginBottom: SPACING.base,
  },
  rejectedBanner: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  rejectedTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
    color: '#9f1239',
  },
  rejectedMsg: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#be123c',
    marginTop: 2,
    lineHeight: 16,
  },
  resubmitCtaBtn: {
    backgroundColor: '#e11d48',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  resubmitCtaText: {
    color: '#ffffff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '800',
  },
  applicantHeroCard: {
    backgroundColor: '#090d16',
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1.5,
    borderColor: '#1e3a8a',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applicantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  applicantBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  applicantHeroCount: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '800',
    color: '#38bdf8',
  },
  applicantHeroLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#ffffff',
    fontWeight: '700',
  },
  applicantHeroSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 2,
  },
  viewCandidatesCtaBtn: {
    backgroundColor: '#2563eb',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCandidatesCtaText: {
    color: '#ffffff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaSub: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  card: {
    marginBottom: SPACING.base,
  },
  cardHeading: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  descText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  budgetText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success[700],
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger[600],
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});
