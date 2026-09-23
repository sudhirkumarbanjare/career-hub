import React, { useState } from 'react';
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
  formatDate,
  JobApplication,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface MyApplicationsScreenProps {
  onBack: () => void;
  onSelectJob: (jobId: string) => void;
}

export const MyApplicationsScreen: React.FC<MyApplicationsScreenProps> = ({
  onBack,
  onSelectJob,
}) => {
  const [applications, setApplications] = useState<JobApplication[]>(
    StudentService.getMyApplications()
  );

  const getStatusBadge = (status: JobApplication['status']): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'accepted':
        return { label: 'ACCEPTED', variant: 'success' };
      case 'shortlisted':
        return { label: 'SHORTLISTED', variant: 'brand' };
      case 'under_review':
        return { label: 'UNDER REVIEW', variant: 'warning' };
      case 'rejected':
        return { label: 'REJECTED', variant: 'danger' };
      case 'submitted':
      default:
        return { label: 'SUBMITTED', variant: 'gray' };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Applications"
        subtitle={`${applications.length} active submissions`}
        onBack={onBack}
      />

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptySub}>
              You haven't submitted any job or internship applications yet. Browse approved client jobs to apply.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusBadge(item.status);
          return (
            <Card style={styles.appCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companyName}>{item.companyName}</Text>
                  <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                </View>
                <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
              </View>

              <Text style={styles.appliedDate}>Applied: {formatDate(item.appliedAt)}</Text>

              {item.coverNote ? (
                <Text style={styles.coverNote} numberOfLines={2}>
                  "{item.coverNote}"
                </Text>
              ) : null}

              <View style={styles.cardBottom}>
                <TouchableOpacity
                  onPress={() => onSelectJob(item.jobId)}
                  style={styles.viewJobBtn}
                >
                  <Text style={styles.viewJobText}>View Job Details →</Text>
                </TouchableOpacity>
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
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  appCard: {
    marginBottom: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginTop: 2,
  },
  appliedDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
    marginBottom: SPACING.xs,
  },
  coverNote: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.xs,
    alignItems: 'flex-end',
  },
  viewJobBtn: {
    paddingVertical: 4,
  },
  viewJobText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
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
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 280,
  },
});
