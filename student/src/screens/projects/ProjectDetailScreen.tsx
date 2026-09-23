import React from 'react';
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
  Badge,
  Card,
  Button,
  formatCurrency,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
  onBookNow: (projectId: string) => void;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
  onBack,
  onBookNow,
}) => {
  const project = StudentService.getProjectById(projectId);

  if (!project) {
    return (
      <View style={styles.container}>
        <Header title="Project Details" onBack={onBack} />
        <View style={styles.notFound}>
          <Text>Project not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Project Details" subtitle={project.branch} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgesRow}>
          <Badge
            label={project.project_type}
            variant={project.project_type === 'Major' ? 'brand' : 'purple'}
            size="md"
          />
          <Badge label={project.difficulty} variant="gray" size="md" />
          <Badge
            label={project.availability}
            variant={project.availability === 'Available' ? 'success' : 'warning'}
            size="md"
          />
        </View>

        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.description}>{project.description}</Text>

        {/* Specifications Card */}
        <Card style={styles.specCard}>
          <Text style={styles.sectionHeading}>Specifications & Timeline</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Estimated Duration:</Text>
            <Text style={styles.specValue}>{project.duration}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Team Capacity:</Text>
            <Text style={styles.specValue}>Up to {project.capacity} Students</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Branch Stream:</Text>
            <Text style={styles.specValue}>{project.branch}</Text>
          </View>
        </Card>

        {/* Technologies Used */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Technologies & Frameworks</Text>
          <View style={styles.tagsContainer}>
            {project.technologies.map((t) => (
              <View key={t} style={styles.techPill}>
                <Text style={styles.techText}>⚡ {t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Included Hardware/Components */}
        {project.components && project.components.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Included Components / Kit</Text>
            {project.components.map((comp, idx) => (
              <View key={idx} style={styles.componentRow}>
                <Text style={styles.bullet}>✓</Text>
                <Text style={styles.componentText}>{comp}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>All-Inclusive Fee</Text>
          <Text style={styles.priceValue}>{formatCurrency(project.cost)}</Text>
        </View>
        <Button
          title="RESERVE PROJECT →"
          onPress={() => onBookNow(project.project_id)}
          size="lg"
          style={styles.bookBtn}
        />
      </View>
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
  badgesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    lineHeight: 30,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[700],
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  specCard: {
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  specLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
  },
  specValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[800],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  techPill: {
    backgroundColor: COLORS.brand[50],
    borderWidth: 1,
    borderColor: COLORS.brand[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  techText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.success[600],
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  componentText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
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
    color: COLORS.brand[700],
  },
  bookBtn: {
    minWidth: 180,
  },
});
