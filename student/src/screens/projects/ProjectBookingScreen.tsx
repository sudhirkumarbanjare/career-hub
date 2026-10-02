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
  Button,
  Badge,
  BRANCHES,
  formatCurrency,
} from '@gotechplace/shared';
import { StudentService } from '../../services/studentService';

export interface ProjectBookingScreenProps {
  projectId: string;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export const ProjectBookingScreen: React.FC<ProjectBookingScreenProps> = ({
  projectId,
  onBack,
  onBookingSuccess,
}) => {
  const project = StudentService.getProjectById(projectId);
  const student = StudentService.getCurrentStudent();

  const [name, setName] = useState(student.name || '');
  const [college, setCollege] = useState(student.college || '');
  const [branch, setBranch] = useState(student.branch || project?.branch || 'CSE / IT');
  const [semester, setSemester] = useState(student.semester || 'Semester 8');
  const [mobile, setMobile] = useState(
    student.mobile ? student.mobile.replace(/[^0-9]/g, '').slice(-10) : ''
  );
  const [email, setEmail] = useState(student.email || '');
  const [teamSize, setTeamSize] = useState('1 Student (Individual)');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!project) {
    return (
      <View style={styles.container}>
        <Header title="Book Project" onBack={onBack} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Project not found.</Text>
        </View>
      </View>
    );
  }

  const originalPrice = project.original_cost || Math.round((project.cost || 6000) * 1.25);
  const discountedPrice = project.discounted_cost || project.cost || 6000;

  const handleConfirmBooking = () => {
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!college.trim()) {
      setError('Please enter your college or institution name.');
      return;
    }

    setLoading(true);

    // Update profile with student's academic details (verified mobile is strictly preserved)
    StudentService.updateProfile({
      name: name.trim(),
      college: college.trim(),
      branch,
      semester,
      email: email.trim() || student.email,
    });

    const res = StudentService.bookProject(projectId);
    setLoading(false);

    if (res.success) {
      setConfirmed(true);
    } else {
      setError(res.error || 'Failed to book project reservation.');
    }
  };

  if (confirmed) {
    return (
      <View style={styles.container}>
        <Header title="Reservation Confirmed" onBack={onBookingSuccess} />
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Project Reserved!</Text>
          <Text style={styles.successMessage}>
            Your reservation for "{project.title}" has been successfully submitted with status{' '}
            <Text style={{ color: COLORS.warning[700], fontWeight: 'bold' }}>PENDING</Text>.
          </Text>
          <Text style={styles.successMeta}>
            A dedicated project mentor will contact you at +91 {mobile} to coordinate your hardware kit, code repository, and documentation schedule.
          </Text>
          <Button
            title="VIEW MY DASHBOARD"
            onPress={onBookingSuccess}
            size="lg"
            style={styles.doneBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Complete Reservation" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Badge
              label={`${project.project_type} Project`}
              variant={project.project_type === 'Major' ? 'brand' : 'purple'}
              size="sm"
            />
            <View style={styles.branchPill}>
              <Text style={styles.branchPillText}>{project.branch}</Text>
            </View>
          </View>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.durationText}>🕒 Estimated Duration: {project.duration}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Payable Reservation Fee</Text>
              <Text style={styles.priceSub}>Includes hardware kit + source code</Text>
            </View>
            <View style={styles.priceValues}>
              <Text style={styles.originalPriceText}>{formatCurrency(originalPrice)}</Text>
              <Text style={styles.discountedPriceText}>{formatCurrency(discountedPrice)}</Text>
            </View>
          </View>
        </Card>

        {/* Student & Contact Details Form */}
        <Card style={styles.studentCard}>
          <Text style={styles.sectionTitle}>Student & Contact Details</Text>
          <Text style={styles.sectionSubtitle}>
            Please review and complete your academic details for your project reservation certificate & hardware delivery.
          </Text>

          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Himanshu Sharma"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>

          {/* College / Institution */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>College / Institution *</Text>
            <TextInput
              style={styles.textInput}
              value={college}
              onChangeText={setCollege}
              placeholder="e.g. National Institute of Technology"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>

          {/* Branch */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Branch / Department *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {BRANCHES.map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() => setBranch(b)}
                  style={[styles.branchOptionPill, branch === b ? styles.branchOptionPillActive : null]}
                >
                  <Text style={[styles.branchOptionText, branch === b ? styles.branchOptionTextActive : null]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Semester & Year */}
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.inputLabel}>Semester *</Text>
              <TextInput
                style={styles.textInput}
                value={semester}
                onChangeText={setSemester}
                placeholder="e.g. Semester 8"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Team Size</Text>
              <TextInput
                style={styles.textInput}
                value={teamSize}
                onChangeText={setTeamSize}
                placeholder="e.g. Individual / 2 Members"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          {/* Verified Mobile Number */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Verified Contact Mobile (Immutable) *</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>🔒 🇮🇳</Text>
              <TextInput
                style={[styles.phoneInput, { color: COLORS.gray[600] }]}
                value={student.mobile}
                editable={false}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. student@college.edu"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Special Requirements / Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Special Instructions / Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any specific hardware module requests or submission deadline dates..."
              placeholderTextColor={COLORS.gray[400]}
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <Button
          title="CONFIRM PROJECT BOOKING"
          onPress={handleConfirmBooking}
          loading={loading}
          size="lg"
          style={styles.confirmBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
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
  notFoundText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[600],
  },
  content: {
    padding: SPACING.base,
  },
  summaryCard: {
    marginBottom: SPACING.base,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  branchPill: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  branchPillText: {
    fontSize: 11,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  projectTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  durationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[800],
  },
  priceSub: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  priceValues: {
    alignItems: 'flex-end',
  },
  originalPriceText: {
    fontSize: 12,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  discountedPriceText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#059669',
  },
  studentCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
    backgroundColor: COLORS.gray[50],
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
  },
  phonePrefix: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
  },
  pillRow: {
    marginTop: 2,
  },
  branchOptionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginRight: 6,
  },
  branchOptionPillActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  branchOptionText: {
    fontSize: 11,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  branchOptionTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  errorBox: {
    backgroundColor: COLORS.danger[50],
    borderColor: COLORS.danger[200],
    borderWidth: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  errorText: {
    color: COLORS.danger[700],
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  confirmBtn: {
    marginTop: SPACING.xs,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  successEmoji: {
    fontSize: 56,
    marginBottom: SPACING.base,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[700],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  successMeta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    lineHeight: 20,
  },
  doneBtn: {
    width: '100%',
    maxWidth: 280,
  },
});
