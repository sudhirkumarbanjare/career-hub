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
  formatCurrency,
  Course,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface CoursesScreenProps {
  onSelectCourse: (courseId: string) => void;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ onSelectCourse }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Mobile Development', 'Hardware & IoT', 'AI & Machine Learning'];

  const courses = useMemo(() => {
    return StudentService.getCourses({
      category,
      search,
    });
  }, [category, search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practical Skill Courses</Text>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search courses or technologies..."
          style={{ marginTop: SPACING.sm }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((c) => {
            const isSel = category === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.catPill, isSel ? styles.catPillActive : null]}
              >
                <Text style={[styles.catText, isSel ? styles.catTextActive : null]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.course_id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card
            style={styles.courseCard}
            onPress={() => onSelectCourse(item.course_id)}
          >
            <View style={styles.cardTop}>
              <Badge label={item.category} variant="purple" size="sm" />
              <Badge label={item.level} variant="gray" size="sm" />
            </View>

            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.focusArea}>🎯 {item.focus_area}</Text>
            <Text style={styles.outcomeText} numberOfLines={2}>
              Outcome: {item.student_outcome}
            </Text>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.durationText}>⏱ {item.duration}</Text>
                <Text style={styles.costText}>{formatCurrency(item.cost)}</Text>
              </View>
              <Badge label="Enroll Now →" variant="brand" size="sm" />
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
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  catScroll: {
    marginTop: SPACING.sm,
  },
  catPill: {
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginRight: SPACING.xs,
  },
  catPillActive: {
    borderColor: COLORS.purple[600],
    backgroundColor: COLORS.purple[50],
  },
  catText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
  },
  catTextActive: {
    color: COLORS.purple[700],
    fontWeight: 'bold',
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  courseCard: {
    marginBottom: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  focusArea: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  durationText: {
    fontSize: 10,
    color: COLORS.gray[400],
  },
  costText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.purple[700],
    marginTop: 2,
  },
});
