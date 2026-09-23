import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Button,
  Input,
  BRANCHES,
  YEARS,
  SEMESTERS,
  GENDERS,
  validateStudentProfile,
  StudentProfile,
} from '@tech2place/shared';
import { StudentService } from '../../services/studentService';

export interface StudentRegistrationScreenProps {
  onComplete: (profile: StudentProfile) => void;
}

export const StudentRegistrationScreen: React.FC<StudentRegistrationScreenProps> = ({
  onComplete,
}) => {
  const current = StudentService.getCurrentStudent();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(current.name || '');
  const [college, setCollege] = useState(current.college || '');
  const [branch, setBranch] = useState(current.branch || BRANCHES[0]);
  const [year, setYear] = useState(current.year || YEARS[3]);
  const [semester, setSemester] = useState(current.semester || SEMESTERS[7]);
  const [gender, setGender] = useState(current.gender || GENDERS[0]);
  const [location, setLocation] = useState(current.location || '');
  const [skillsText, setSkillsText] = useState(current.skills.join(', '));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const check = validateStudentProfile({ name, college, branch, year, semester });
    if (!name.trim()) {
      setErrors({ name: 'Full name is required' });
      return;
    }
    if (!college.trim()) {
      setErrors({ college: 'College / University is required' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleFinish = () => {
    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = StudentService.updateProfile({
      name,
      college,
      branch,
      year,
      semester,
      gender,
      location: location || 'Bangalore, India',
      skills: skills.length > 0 ? skills : ['React Native', 'TypeScript'],
    });

    onComplete(updated);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Student Profile Setup</Text>
          <Text style={styles.stepSubtitle}>Step {step} of 2</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
          </View>
        </View>

        <View style={styles.card}>
          {step === 1 ? (
            <>
              <Text style={styles.sectionHeading}>Academic & Identity</Text>

              <Input
                label="Full Name"
                placeholder="e.g. Himanshu Sharma"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                error={errors.name}
              />

              <Input
                label="College / University"
                placeholder="e.g. National Institute of Technology"
                value={college}
                onChangeText={(t) => {
                  setCollege(t);
                  if (errors.college) setErrors({ ...errors, college: '' });
                }}
                error={errors.college}
              />

              <Text style={styles.fieldLabel}>Engineering Branch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {BRANCHES.map((b) => {
                  const isSelected = branch === b;
                  return (
                    <TouchableOpacity
                      key={b}
                      onPress={() => setBranch(b)}
                      style={[styles.pill, isSelected ? styles.pillSelected : null]}
                    >
                      <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>
                        {b}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.fieldLabel}>Academic Year</Text>
              <View style={styles.pillGrid}>
                {YEARS.map((y) => {
                  const isSelected = year === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setYear(y)}
                      style={[styles.pill, isSelected ? styles.pillSelected : null]}
                    >
                      <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title="CONTINUE TO STEP 2 →"
                onPress={handleNext}
                size="lg"
                style={styles.actionBtn}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionHeading}>Semester & Skills</Text>

              <Text style={styles.fieldLabel}>Current Semester</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {SEMESTERS.map((s) => {
                  const isSelected = semester === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSemester(s)}
                      style={[styles.pill, isSelected ? styles.pillSelected : null]}
                    >
                      <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Input
                label="Technical Skills (Comma separated)"
                placeholder="React Native, Python, Embedded C, AI/ML"
                value={skillsText}
                onChangeText={setSkillsText}
                hint="Used to recommend matching projects and internships"
              />

              <Input
                label="City / Location"
                placeholder="Bangalore, Karnataka"
                value={location}
                onChangeText={setLocation}
              />

              <View style={styles.btnRow}>
                <Button
                  title="← BACK"
                  onPress={() => setStep(1)}
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                />
                <Button
                  title="COMPLETE SETUP ✓"
                  onPress={handleFinish}
                  size="md"
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING['4xl'],
  },
  stepHeader: {
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brand[600],
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.base,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  pillScroll: {
    marginBottom: SPACING.md,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  pill: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  pillSelected: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  pillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  pillTextSelected: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actionBtn: {
    marginTop: SPACING.base,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
});
