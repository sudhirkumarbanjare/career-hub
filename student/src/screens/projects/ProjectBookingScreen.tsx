import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  formatCurrency,
} from '@tech2place/shared';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!project) {
    return (
      <View style={styles.container}>
        <Header title="Book Project" onBack={onBack} />
        <View style={styles.notFound}><Text>Project not found.</Text></View>
      </View>
    );
  }

  const handleConfirmBooking = () => {
    setError('');
    setLoading(true);
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
            Your reservation for "{project.title}" has been received with status{' '}
            <Text style={{ color: COLORS.warning[700], fontWeight: 'bold' }}>PENDING</Text>.
          </Text>
          <Text style={styles.successMeta}>
            A dedicated project mentor will contact you at {student.mobile} to schedule your initial guidance session.
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
      <Header title="Confirm Reservation" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Badge label={project.project_type} variant="brand" size="sm" />
            <Text style={styles.branchText}>{project.branch}</Text>
          </View>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.durationText}>Estimated Duration: {project.duration}</Text>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Reservation Fee:</Text>
            <Text style={styles.priceValue}>{formatCurrency(project.cost)}</Text>
          </View>
        </Card>

        <Card style={styles.studentCard}>
          <Text style={styles.sectionTitle}>Student Details</Text>
          <Text style={styles.detailRow}><Text style={styles.bold}>Name:</Text> {student.name}</Text>
          <Text style={styles.detailRow}><Text style={styles.bold}>College:</Text> {student.college}</Text>
          <Text style={styles.detailRow}><Text style={styles.bold}>Branch:</Text> {student.branch}</Text>
          <Text style={styles.detailRow}><Text style={styles.bold}>Contact:</Text> {student.mobile}</Text>
        </Card>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          title="CONFIRM PROJECT BOOKING"
          onPress={handleConfirmBooking}
          loading={loading}
          size="lg"
          style={styles.confirmBtn}
        />
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
  content: {
    padding: SPACING.base,
  },
  summaryCard: {
    marginBottom: SPACING.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  branchText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
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
    color: COLORS.gray[600],
  },
  priceValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  studentCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  detailRow: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  bold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[900],
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
    marginTop: SPACING.sm,
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
