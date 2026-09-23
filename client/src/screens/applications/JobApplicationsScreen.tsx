import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
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
  Tabs,
  formatDate,
  JobApplication,
} from '@tech2place/shared';
import { ClientService } from '../../services/clientService';

export interface JobApplicationsScreenProps {
  jobId?: string;
  onBack: () => void;
}

export const JobApplicationsScreen: React.FC<JobApplicationsScreenProps> = ({
  jobId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'shortlisted' | 'accepted' | 'rejected'>('all');
  const [applications, setApplications] = useState<JobApplication[]>(
    jobId ? ClientService.getApplicationsForJob(jobId) : ClientService.getAllReceivedApplications()
  );

  const filteredApps = useMemo(() => {
    if (activeTab === 'all') return applications;
    return applications.filter((a) => a.status === activeTab);
  }, [applications, activeTab]);

  const handleUpdateStatus = (appId: string, status: JobApplication['status']) => {
    ClientService.updateApplicationStatus(appId, status);
    setApplications([...(jobId ? ClientService.getApplicationsForJob(jobId) : ClientService.getAllReceivedApplications())]);
  };

  const getStatusBadge = (status: JobApplication['status']): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'accepted':
        return { label: 'ACCEPTED', variant: 'success' };
      case 'shortlisted':
        return { label: 'SHORTLISTED', variant: 'brand' };
      case 'rejected':
        return { label: 'REJECTED', variant: 'danger' };
      case 'under_review':
        return { label: 'UNDER REVIEW', variant: 'warning' };
      case 'submitted':
      default:
        return { label: 'NEW SUBMISSION', variant: 'gray' };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Candidate Pool"
        subtitle={`${applications.length} applications total`}
        onBack={onBack}
      />

      <View style={styles.tabsContainer}>
        <Tabs
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'submitted', label: 'New' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'rejected', label: 'Rejected' },
          ]}
          activeTab={activeTab}
          onSelectTab={(k) => setActiveTab(k as any)}
        />
      </View>

      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>No Candidates in Category</Text>
            <Text style={styles.emptySub}>No applicant matches this filter.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          return (
            <Card style={styles.appCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.applicantName}>{item.studentName}</Text>
                  <Text style={styles.collegeText}>{item.college}</Text>
                  <Text style={styles.branchText}>📘 {item.branch}</Text>
                </View>
                <Badge label={badge.label} variant={badge.variant} size="sm" />
              </View>

              <Text style={styles.jobRef}>Applied for: <Text style={{ fontWeight: 'bold' }}>{item.jobTitle}</Text></Text>
              <Text style={styles.appliedDate}>Date: {formatDate(item.appliedAt)}</Text>

              {item.coverNote ? (
                <View style={styles.coverNoteBox}>
                  <Text style={styles.coverNoteText}>"{item.coverNote}"</Text>
                </View>
              ) : null}

              {/* Skills */}
              <View style={styles.skillsRow}>
                {item.skills.map((s) => (
                  <View key={s} style={styles.skillPill}>
                    <Text style={styles.skillText}>{s}</Text>
                  </View>
                ))}
              </View>

              {/* Resume link & Contact */}
              <View style={styles.contactRow}>
                <Text style={styles.contactPhone}>📱 {item.studentPhone}</Text>
                {item.resumeUrl ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.resumeUrl!)}
                    style={styles.resumeBtn}
                  >
                    <Text style={styles.resumeText}>View Resume ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <Button
                  title="Shortlist"
                  onPress={() => handleUpdateStatus(item.id, 'shortlisted')}
                  variant={item.status === 'shortlisted' ? 'primary' : 'outline'}
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Accept ✓"
                  onPress={() => handleUpdateStatus(item.id, 'accepted')}
                  variant={item.status === 'accepted' ? 'primary' : 'secondary'}
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Reject ✕"
                  onPress={() => handleUpdateStatus(item.id, 'rejected')}
                  variant={item.status === 'rejected' ? 'danger' : 'ghost'}
                  size="sm"
                  style={{ flex: 1 }}
                />
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
  appCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  applicantName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  collegeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  branchText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
  },
  jobRef: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  appliedDate: {
    fontSize: 10,
    color: COLORS.gray[400],
    marginBottom: SPACING.xs,
  },
  coverNoteBox: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  coverNoteText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[700],
    fontStyle: 'italic',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: SPACING.sm,
  },
  skillPill: {
    backgroundColor: COLORS.brand[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillText: {
    fontSize: 10,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  contactPhone: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
  },
  resumeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resumeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[600],
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
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
    marginTop: 4,
  },
});
