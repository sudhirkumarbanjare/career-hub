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
} from '@gotechplace/shared';
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

              {/* Resume link & Contact Actions */}
              <View style={styles.contactRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${item.studentPhone}`)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.callBtnText}>📞 {item.studentPhone}</Text>
                </TouchableOpacity>

                {item.resumeUrl ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.resumeUrl!)}
                    style={styles.resumeBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resumeText}>📄 View Resume ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Status Action CTAs */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.shortlistBtn,
                    item.status === 'shortlisted' && styles.shortlistBtnActive,
                  ]}
                  onPress={() => handleUpdateStatus(item.id, 'shortlisted')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      styles.shortlistText,
                      item.status === 'shortlisted' && styles.activeBtnText,
                    ]}
                  >
                    ⭐ Shortlist
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.acceptBtn,
                    item.status === 'accepted' && styles.acceptBtnActive,
                  ]}
                  onPress={() => handleUpdateStatus(item.id, 'accepted')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      styles.acceptText,
                      item.status === 'accepted' && styles.activeBtnText,
                    ]}
                  >
                    ✓ Accept & Hire
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.rejectBtn,
                    item.status === 'rejected' && styles.rejectBtnActive,
                  ]}
                  onPress={() => handleUpdateStatus(item.id, 'rejected')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      styles.rejectText,
                      item.status === 'rejected' && styles.activeBtnText,
                    ]}
                  >
                    ✕ Decline
                  </Text>
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
    borderWidth: 1,
    borderColor: COLORS.gray[200],
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
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand[500],
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
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.brand[200],
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
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  callBtn: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  callBtnText: {
    fontSize: 11,
    color: COLORS.gray[800],
    fontWeight: '600',
  },
  resumeBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  resumeText: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  shortlistBtn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  shortlistText: {
    color: '#b45309',
  },
  shortlistBtnActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
  },
  acceptBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  acceptText: {
    color: '#15803d',
  },
  acceptBtnActive: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
  },
  rejectBtn: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  rejectText: {
    color: '#be123c',
  },
  rejectBtnActive: {
    backgroundColor: '#e11d48',
    borderColor: '#be123c',
  },
  activeBtnText: {
    color: '#ffffff',
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
