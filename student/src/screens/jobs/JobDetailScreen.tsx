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
  Badge,
  Card,
  Button,
  Modal,
  formatCurrency,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface JobDetailScreenProps {
  jobId: string;
  onBack: () => void;
  onViewApplications: () => void;
}

export const JobDetailScreen: React.FC<JobDetailScreenProps> = ({
  jobId,
  onBack,
  onViewApplications,
}) => {
  const job = StudentService.getJobById(jobId);
  const student = StudentService.getCurrentStudent();

  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState(student.resumeUrl || 'https://drive.google.com/resume-student.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  if (!job) {
    return (
      <View style={styles.container}>
        <Header title="Job Details" onBack={onBack} />
        <View style={styles.notFound}><Text>Job opening not found or inactive.</Text></View>
      </View>
    );
  }

  const handleApply = () => {
    setError('');
    setSubmitting(true);
    const res = StudentService.applyToJob(jobId, coverNote, resumeUrl);
    setSubmitting(false);

    if (res.success) {
      setApplied(true);
      setApplyModalVisible(false);
    } else {
      setError(res.error || 'Failed to submit application');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Job Opportunity"
        subtitle={job.clientName || 'Client Project'}
        onBack={onBack}
        rightAction={
          <Button
            title={StudentService.isJobBookmarked(job.id) ? '★ Saved' : '☆ Save'}
            onPress={() => StudentService.toggleBookmark(job.id)}
            variant="ghost"
            size="sm"
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Company & Status Card */}
        <Card style={styles.clientCard}>
          <View style={styles.clientRow}>
            <View style={styles.companyIcon}>
              <Text style={{ fontSize: 24 }}>🏢</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.verifiedRow}>
                <Text style={styles.clientName}>{job.clientName || 'Tech2Place Client'}</Text>
                <Text style={styles.verifiedBadge}>✓ Verified Client</Text>
              </View>
              <Text style={styles.metaLocation}>
                {job.isRemote ? '🌐 Remote Opportunity' : `📍 ${job.location}`}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.jobTitle}>{job.title}</Text>

        <View style={styles.badgesRow}>
          <Badge label={job.jobType} variant="success" size="md" />
          <Badge label={job.category} variant="brand" size="md" />
          <Badge label={`Deadline: ${job.deadline}`} variant="gray" size="md" />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Project / Role</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Required Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Skills & Technologies</Text>
          <View style={styles.skillsRow}>
            {job.skills.map((skill) => (
              <View key={skill} style={styles.skillPill}>
                <Text style={styles.skillText}>✓ {skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compensation & Details Card */}
        <Card style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetLabel}>Stipend / Budget</Text>
              <Text style={styles.budgetValue}>{formatCurrency(job.budget)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.budgetLabel}>Project Type</Text>
              <Text style={styles.typeValue}>{job.jobType}</Text>
            </View>
          </View>
        </Card>

        {applied ? (
          <View style={styles.appliedBanner}>
            <Text style={styles.appliedEmoji}>🎉</Text>
            <Text style={styles.appliedTitle}>Application Submitted!</Text>
            <Text style={styles.appliedDesc}>
              Your profile has been forwarded to {job.clientName}. You can track status in your applications.
            </Text>
            <Button
              title="VIEW MY APPLICATIONS 📋"
              onPress={onViewApplications}
              variant="outline"
              size="sm"
              style={{ marginTop: SPACING.md }}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Bottom Apply Bar */}
      {!applied ? (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.priceLabel}>Compensation</Text>
            <Text style={styles.priceValue}>{formatCurrency(job.budget)}</Text>
          </View>
          <Button
            title="APPLY FOR JOB →"
            onPress={() => setApplyModalVisible(true)}
            size="lg"
            style={styles.applyBtn}
          />
        </View>
      ) : null}

      {/* Application Modal */}
      <Modal
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        title="Submit Job Application"
      >
        <Text style={styles.modalSub}>
          Applying for <Text style={{ fontWeight: 'bold', color: COLORS.gray[900] }}>{job.title}</Text> at{' '}
          {job.clientName}
        </Text>

        <Card style={styles.applicantPreview}>
          <Text style={styles.previewHeading}>Your Academic Profile Summary</Text>
          <Text style={styles.previewItem}>👤 {student.name}</Text>
          <Text style={styles.previewItem}>🎓 {student.college}</Text>
          <Text style={styles.previewItem}>📘 {student.branch} ({student.year})</Text>
          <Text style={styles.previewItem}>📱 {student.mobile}</Text>
        </Card>

        <Text style={styles.inputLabel}>Resume / Portfolio Link</Text>
        <TextInput
          value={resumeUrl}
          onChangeText={setResumeUrl}
          placeholder="https://drive.google.com/..."
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Short Cover Note (Optional)</Text>
        <TextInput
          value={coverNote}
          onChangeText={setCoverNote}
          placeholder="Explain your relevant project experience and interest..."
          multiline
          numberOfLines={3}
          style={[styles.textInput, { minHeight: 70, textAlignVertical: 'top' }]}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="CONFIRM & SUBMIT APPLICATION"
          onPress={handleApply}
          loading={submitting}
          size="lg"
          style={{ marginTop: SPACING.lg }}
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
    paddingBottom: 100,
  },
  clientCard: {
    marginBottom: SPACING.md,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  clientName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  verifiedBadge: {
    fontSize: 10,
    color: COLORS.success[700],
    backgroundColor: COLORS.success[50],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  metaLocation: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    lineHeight: 30,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  skillPill: {
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[200],
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  skillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  budgetCard: {
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[200],
    marginBottom: SPACING.lg,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 10,
    color: COLORS.brand[700],
    textTransform: 'uppercase',
  },
  budgetValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[900],
    marginTop: 2,
  },
  typeValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
    marginTop: 2,
  },
  appliedBanner: {
    backgroundColor: COLORS.success[50],
    borderColor: COLORS.success[200],
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  appliedEmoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  appliedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success[800],
  },
  appliedDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success[700],
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.success[700],
  },
  applyBtn: {
    minWidth: 180,
  },
  modalSub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  applicantPreview: {
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.md,
  },
  previewHeading: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  previewItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[800],
    marginBottom: 2,
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
  },
});
