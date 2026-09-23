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
  BRANCHES,
  PROJECT_TYPES,
  DIFFICULTIES,
  formatCurrency,
  Project,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface ProjectsMarketplaceScreenProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsMarketplaceScreen: React.FC<ProjectsMarketplaceScreenProps> = ({
  onSelectProject,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const projects = useMemo(() => {
    return StudentService.getProjects({
      branch: selectedBranch,
      type: selectedType,
      difficulty: selectedDifficulty,
      search,
    });
  }, [search, selectedBranch, selectedType, selectedDifficulty]);

  const branchOptions = ['All', ...BRANCHES];

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search projects by title or tech..."
        />

        {/* Branch Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {branchOptions.map((b) => {
            const isSelected = selectedBranch === b;
            return (
              <TouchableOpacity
                key={b}
                onPress={() => setSelectedBranch(b)}
                style={[styles.filterPill, isSelected ? styles.filterPillActive : null]}
              >
                <Text style={[styles.filterPillText, isSelected ? styles.filterPillTextActive : null]}>
                  {b}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Type & Difficulty Row */}
        <View style={styles.subFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PROJECT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setSelectedType(t)}
                style={[styles.subPill, selectedType === t ? styles.subPillActive : null]}
              >
                <Text style={[styles.subPillText, selectedType === t ? styles.subPillTextActive : null]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.filterSeparator} />
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDifficulty(d)}
                style={[styles.subPill, selectedDifficulty === d ? styles.subPillActive : null]}
              >
                <Text style={[styles.subPillText, selectedDifficulty === d ? styles.subPillTextActive : null]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.project_id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No Matching Projects</Text>
            <Text style={styles.emptySubtitle}>Try changing your search terms or filters.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.projectCard}
            onPress={() => onSelectProject(item.project_id)}
          >
            <View style={styles.cardHeader}>
              <Badge
                label={item.project_type}
                variant={item.project_type === 'Major' ? 'brand' : 'purple'}
                size="sm"
              />
              <Badge label={item.difficulty} variant="gray" size="sm" />
            </View>

            <Text style={styles.projectTitle}>{item.title}</Text>
            <Text style={styles.projectDesc} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Tech Stack Pills */}
            <View style={styles.techStackRow}>
              {item.technologies.slice(0, 4).map((tech) => (
                <View key={tech} style={styles.techBadge}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
              {item.technologies.length > 4 ? (
                <Text style={styles.moreTechText}>+{item.technologies.length - 4}</Text>
              ) : null}
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.costLabel}>Project Kit & Guidance</Text>
                <Text style={styles.costValue}>{formatCurrency(item.cost)}</Text>
              </View>
              <Badge
                label={item.availability}
                variant={item.availability === 'Available' ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterScroll: {
    marginTop: SPACING.sm,
  },
  filterPill: {
    paddingVertical: 6,
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
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  subPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray[100],
    marginRight: 6,
  },
  subPillActive: {
    backgroundColor: COLORS.brand[600],
  },
  subPillText: {
    fontSize: 11,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  subPillTextActive: {
    color: COLORS.common.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  filterSeparator: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.xs,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  projectCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  projectTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  techStackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.md,
  },
  techBadge: {
    backgroundColor: COLORS.brand[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  techText: {
    fontSize: 10,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  moreTechText: {
    fontSize: 10,
    color: COLORS.gray[500],
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  costLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
  },
  costValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    marginTop: 4,
  },
});
