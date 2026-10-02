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
} from '@gotechplace/shared';
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
        renderItem={({ item }) => {
          const originalPrice = item.original_cost || Math.round((item.cost || 6000) * 1.25);
          const discountedPrice = item.discounted_cost || item.cost || 6000;
          const isBooked = StudentService.isProjectBooked(item.project_id);
          const techs = item.technologies || [];

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onSelectProject(item.project_id)}
              style={styles.cardWrapper}
            >
              <Card style={styles.projectCard}>
                {/* Limited Time Offer Ribbon */}
                <View style={styles.offerBadge}>
                  <View style={styles.offerDot} />
                  <Text style={styles.offerText}>LIMITED TIME OFFER</Text>
                </View>

                {/* Badges Bar */}
                <View style={styles.cardHeader}>
                  <Badge
                    label={`${item.project_type || 'Minor'} Project`}
                    variant={item.project_type === 'Major' ? 'brand' : 'purple'}
                    size="sm"
                  />
                  <View style={styles.branchPill}>
                    <Text style={styles.branchPillText}>{item.branch || 'General'}</Text>
                  </View>
                </View>

                {/* Title & Excerpt */}
                <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.projectDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Tech Stack Chips */}
                <View style={styles.techStackRow}>
                  {techs.slice(0, 4).map((tech) => (
                    <View key={tech} style={styles.techBadge}>
                      <Text style={styles.techText}>{tech}</Text>
                    </View>
                  ))}
                  {techs.length > 4 ? (
                    <Text style={styles.moreTechText}>+{techs.length - 4}</Text>
                  ) : null}
                </View>

                {/* Meta Row: Duration & Availability */}
                <View style={styles.metaRow}>
                  <Text style={styles.durationText}>🕒 {item.duration || '4–6 weeks'}</Text>
                  <Text style={styles.availabilityText}>✓ {item.availability || 'Available'}</Text>
                </View>

                {/* Pricing & CTA */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.costLabel}>ESTIMATED COST</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.originalPriceText}>{formatCurrency(originalPrice)}</Text>
                      <Text style={styles.discountedPriceText}>{formatCurrency(discountedPrice)}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.actionBtn, isBooked ? styles.actionBtnBooked : null]}>
                    <Text style={[styles.actionBtnText, isBooked ? styles.actionBtnTextBooked : null]}>
                      {isBooked ? 'Already Booked' : 'View Project →'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
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
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  projectCard: {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: SPACING.md + 4,
  },
  offerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#059669',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderBottomLeftRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  offerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  offerText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  branchPill: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  branchPillText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[600],
  },
  projectTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    lineHeight: 16,
    marginBottom: SPACING.xs + 2,
  },
  techStackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  techBadge: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  techText: {
    fontSize: 10,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  moreTechText: {
    fontSize: 10,
    color: COLORS.gray[400],
    alignSelf: 'center',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    marginBottom: 6,
  },
  durationText: {
    fontSize: 11,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  availabilityText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  costLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[400],
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 1,
  },
  originalPriceText: {
    fontSize: 12,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  discountedPriceText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: '#059669',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.surface,
  },
  actionBtnBooked: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[600],
  },
  actionBtnTextBooked: {
    color: '#047857',
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
