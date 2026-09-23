import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
} from '@tech2place/shared';
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
    return { label: job.status.toUpperCase(), variant: 'gray' };
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
            <Text style={styles.rejectedTitle}>⚠️ Rejection Feedback</Text>
            <Text style={styles.rejectedMsg}>{job.rejectionReason || 'Please modify the job requirements.'}</Text>
            <Button
              title="EDIT & RESUBMIT JOB"
              onPress={() => setIsEditModalOpen(true)}
              variant="danger"
              size="sm"
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        ) : null}

        {/* Applicants Card */}
        <Card style={styles.applicantCard}>
          <View style={styles.applicantRow}>
            <View>
              <Text style={styles.applicantCount}>{job.applicationsCount || 0}</Text>
              <Text style={styles.applicantLabel}>Candidate Applications</Text>
            </View>
            <Button
              title="VIEW CANDIDATES →"
              onPress={() => onViewApplications(job.id)}
              size="sm"
            />
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Job Description</Text>
          <Text style={styles.descText}>{job.description}</Text>
        </Card>

        {/* Required Skills */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Required Technologies</Text>
          <View style={styles.skillsGrid}>
            {job.skills.map((s) => (
              <Badge key={s} label={s} variant="brand" size="md" />
            ))}
          </View>
        </Card>

        {/* Compensation */}
        <Card style={styles.card}>
          <Text style={styles.cardHeading}>Compensation</Text>
          <Text style={styles.budgetText}>{formatCurrency(job.budget)}</Text>
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
    backgroundColor: COLORS.danger[50],
    borderColor: COLORS.danger[200],
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  rejectedTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.danger[800],
  },
  rejectedMsg: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.danger[700],
    marginTop: 2,
  },
  applicantCard: {
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[200],
    marginBottom: SPACING.base,
  },
  applicantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantCount: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[900],
  },
  applicantLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.medium,
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
