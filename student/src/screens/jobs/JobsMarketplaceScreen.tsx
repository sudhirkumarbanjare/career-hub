import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SearchBar,
  Card,
  Badge,
  JOB_TYPES,
  DEFAULT_CATEGORIES,
  formatCurrency,
  Job,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface JobsMarketplaceScreenProps {
  onSelectJob: (jobId: string) => void;
  onViewApplications: () => void;
}

export const JobsMarketplaceScreen: React.FC<JobsMarketplaceScreenProps> = ({
  onSelectJob,
  onViewApplications,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'budget'>('latest');

  const jobs = useMemo(() => {
    return StudentService.getApprovedJobs({
      category: selectedCategory,
      jobType: selectedJobType,
      isRemote: remoteOnly ? true : undefined,
      search,
      sortBy,
    });
  }, [search, selectedCategory, selectedJobType, remoteOnly, sortBy]);

  const categories = ['All', ...DEFAULT_CATEGORIES];

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Client Jobs & Projects</Text>
        <TouchableOpacity onPress={onViewApplications} style={styles.appTrackBtn}>
          <Text style={styles.appTrackText}>My Applications 📋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search jobs by title, skills, client..."
        />

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.filterPill, isSelected ? styles.filterPillActive : null]}
              >
                <Text style={[styles.filterPillText, isSelected ? styles.filterPillTextActive : null]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sub Filters: Job Type, Remote toggle, Sort */}
        <View style={styles.subRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {JOB_TYPES.map((jt) => (
              <TouchableOpacity
                key={jt}
                onPress={() => setSelectedJobType(jt)}
                style={[styles.subPill, selectedJobType === jt ? styles.subPillActive : null]}
              >
                <Text style={[styles.subPillText, selectedJobType === jt ? styles.subPillTextActive : null]}>
                  {jt}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setRemoteOnly(!remoteOnly)}
              style={[styles.subPill, remoteOnly ? styles.remotePillActive : null]}
            >
              <Text style={[styles.subPillText, remoteOnly ? styles.subPillTextActive : null]}>
                🌐 Remote Only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortBy(sortBy === 'latest' ? 'budget' : 'latest')}
              style={[styles.subPill, { backgroundColor: COLORS.brand[100] }]}
            >
              <Text style={[styles.subPillText, { color: COLORS.brand[800], fontWeight: 'bold' }]}>
                ⇅ {sortBy === 'latest' ? 'Sort: Latest' : 'Sort: Highest Budget'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Approved Jobs Found</Text>
            <Text style={styles.emptySub}>
              All client jobs are verified by administration before appearing. Check back soon!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSaved = StudentService.isJobBookmarked(item.id);
          return (
            <Card
              style={styles.jobCard}
              onPress={() => onSelectJob(item.id)}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.clientName}>{item.clientName || 'Verified Client'}</Text>
                  <Text style={styles.jobTitle}>{item.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => StudentService.toggleBookmark(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.bookmarkIcon}>{isSaved ? '★' : '☆'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.locationMeta}>
                {item.isRemote ? '🌐 Remote' : `📍 ${item.location}`} • {item.jobType}
              </Text>

              <Text style={styles.jobDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.skillsRow}>
                {item.skills.slice(0, 3).map((skill) => (
                  <View key={skill} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {item.skills.length > 3 ? (
                  <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
                ) : null}
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.budgetLabel}>Budget / Compensation</Text>
                  <Text style={styles.budgetValue}>{formatCurrency(item.budget)}</Text>
                </View>
                <Badge label="Apply Now →" variant="brand" size="sm" />
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  appTrackBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.brand[50],
  },
  appTrackText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterScroll: {
    marginTop: SPACING.sm,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginRight: SPACING.xs,
  },
  filterPillActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterPillTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  subPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray[100],
    marginRight: 6,
  },
  subPillActive: {
    backgroundColor: COLORS.brand[600],
  },
  remotePillActive: {
    backgroundColor: COLORS.info[600],
  },
  subPillText: {
    fontSize: 11,
    color: COLORS.gray[600],
  },
  subPillTextActive: {
    color: COLORS.common.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginTop: 2,
  },
  bookmarkIcon: {
    fontSize: 22,
    color: COLORS.warning[500],
  },
  locationMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  jobDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.md,
  },
  skillPill: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillText: {
    fontSize: 10,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  moreSkills: {
    fontSize: 10,
    color: COLORS.gray[400],
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  budgetLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
  },
  budgetValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success[700],
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 44,
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
    lineHeight: 20,
    maxWidth: 280,
  },
});
