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
  Badge,
  Card,
  Button,
  formatCurrency,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface CourseDetailScreenProps {
  courseId: string;
  onBack: () => void;
  onEnrolledSuccess: () => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  courseId,
  onBack,
  onEnrolledSuccess,
}) => {
  const course = StudentService.getCourseById(courseId);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');

  if (!course) {
    return (
      <View style={styles.container}>
        <Header title="Course Details" onBack={onBack} />
        <View style={styles.notFound}><Text>Course not found.</Text></View>
      </View>
    );
  }

  const handleEnroll = () => {
    setError('');
    setEnrolling(true);
    const res = StudentService.enrollCourse(courseId);
    setEnrolling(false);

    if (res.success) {
      setEnrolled(true);
    } else {
      setError(res.error || 'Failed to enroll');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Course Overview" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgesRow}>
          <Badge label={course.category} variant="purple" size="md" />
          <Badge label={course.level} variant="gray" size="md" />
          <Badge label={`⏱ ${course.duration}`} variant="brand" size="md" />
        </View>

        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>Instructor: {course.instructor || 'Senior Industry Mentor'}</Text>

        <Card style={styles.outcomeCard}>
          <Text style={styles.outcomeTitle}>Target Learning Outcome</Text>
          <Text style={styles.outcomeDesc}>{course.student_outcome}</Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About this Course</Text>
          <Text style={styles.descText}>{course.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Tools & Technologies</Text>
          <View style={styles.techRow}>
            {course.technologies.map((t) => (
              <View key={t} style={styles.techPill}>
                <Text style={styles.techText}>⚡ {t}</Text>
              </View>
            ))}
          </View>
        </View>

        {enrolled ? (
          <View style={styles.enrolledBox}>
            <Text style={styles.enrolledIcon}>🎉</Text>
            <Text style={styles.enrolledTitle}>Successfully Enrolled!</Text>
            <Text style={styles.enrolledSub}>Course materials are unlocked in your dashboard.</Text>
            <Button
              title="RETURN TO DASHBOARD"
              onPress={onEnrolledSuccess}
              variant="outline"
              size="sm"
              style={{ marginTop: SPACING.md }}
            />
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      {!enrolled ? (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.priceLabel}>Full Course Tuition</Text>
            <Text style={styles.priceValue}>{formatCurrency(course.cost)}</Text>
          </View>
          <Button
            title="ENROLL IN COURSE →"
            onPress={handleEnroll}
            loading={enrolling}
            size="lg"
            style={styles.enrollBtn}
          />
        </View>
      ) : null}
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
    marginBottom: 4,
  },
  instructor: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.lg,
  },
  outcomeCard: {
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[200],
    marginBottom: SPACING.lg,
  },
  outcomeTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  outcomeDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[900],
    lineHeight: 20,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  descText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  techPill: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  techText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  enrolledBox: {
    backgroundColor: COLORS.success[50],
    borderColor: COLORS.success[200],
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  enrolledIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  enrolledTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success[800],
  },
  enrolledSub: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success[700],
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.danger[600],
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
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
    color: COLORS.purple[700],
  },
  enrollBtn: {
    minWidth: 180,
  },
});
