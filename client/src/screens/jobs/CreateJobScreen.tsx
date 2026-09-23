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
  Header,
  Button,
  Input,
  JOB_TYPES,
  DEFAULT_CATEGORIES,
  validateJob,
  JobType,
} from '@tech2place/shared';
import { ClientService } from '../../services/clientService';

export interface CreateJobScreenProps {
  onBack: () => void;
  onJobCreated: () => void;
}

export const CreateJobScreen: React.FC<CreateJobScreenProps> = ({
  onBack,
  onJobCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [skillsText, setSkillsText] = useState('React Native, TypeScript, Firebase');
  const [budget, setBudget] = useState('45000');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [location, setLocation] = useState('Bangalore, India');
  const [isRemote, setIsRemote] = useState(true);
  const [jobType, setJobType] = useState<JobType>('Contract');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const budgetNum = parseInt(budget, 10) || 0;

    const check = validateJob({
      title,
      description,
      category,
      skills,
      budget: budgetNum,
      deadline,
      location,
    });

    if (!check.isValid) {
      setErrors(check.errors);
      return;
    }

    setSubmitting(true);
    ClientService.createJob({
      title,
      description,
      category,
      skills,
      budget: budgetNum,
      deadline,
      location,
      isRemote,
      jobType,
      attachments: [],
    });
    setSubmitting(false);
    onJobCreated();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header title="Post Job / Project" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ All submitted jobs are reviewed by platform administration before appearing in the Student marketplace.
          </Text>
        </View>

        <Input
          label="Job / Project Title"
          placeholder="e.g. Build Offline-Ready React Native App"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          error={errors.title}
        />

        <Text style={styles.fieldLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSel = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.catPill, isSel ? styles.catPillActive : null]}
              >
                <Text style={[styles.catText, isSel ? styles.catTextActive : null]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.fieldLabel}>Opportunity Type</Text>
        <View style={styles.typeGrid}>
          {JOB_TYPES.filter((t) => t !== 'All').map((type) => {
            const isSel = jobType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setJobType(type as JobType)}
                style={[styles.typePill, isSel ? styles.typePillActive : null]}
              >
                <Text style={[styles.typeText, isSel ? styles.typeTextActive : null]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Detailed Description & Deliverables"
          placeholder="Specify the problem statement, deliverables, milestones, and student qualifications..."
          value={description}
          onChangeText={(t) => {
            setDescription(t);
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 90, textAlignVertical: 'top' }}
          error={errors.description}
        />

        <Input
          label="Required Skills (Comma separated)"
          placeholder="React Native, TypeScript, Firebase"
          value={skillsText}
          onChangeText={setSkillsText}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Input
              label="Stipend / Budget (INR ₹)"
              placeholder="50000"
              value={budget}
              onChangeText={(t) => {
                setBudget(t);
                if (errors.budget) setErrors({ ...errors, budget: '' });
              }}
              keyboardType="numeric"
              error={errors.budget}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Deadline (YYYY-MM-DD)"
              placeholder="2026-12-31"
              value={deadline}
              onChangeText={(t) => {
                setDeadline(t);
                if (errors.deadline) setErrors({ ...errors, deadline: '' });
              }}
              error={errors.deadline}
            />
          </View>
        </View>

        <Input
          label="Location"
          placeholder="e.g. Bangalore, India"
          value={location}
          onChangeText={(t) => {
            setLocation(t);
            if (errors.location) setErrors({ ...errors, location: '' });
          }}
          error={errors.location}
        />

        <TouchableOpacity
          onPress={() => setIsRemote(!isRemote)}
          style={[styles.remoteToggle, isRemote ? styles.remoteToggleActive : null]}
        >
          <Text style={[styles.remoteToggleText, isRemote ? styles.remoteToggleTextActive : null]}>
            {isRemote ? '✓ Remote / Virtual Work Permitted' : '○ On-Site Location Required'}
          </Text>
        </TouchableOpacity>

        <Button
          title="SUBMIT JOB FOR ADMIN REVIEW 🚀"
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING['4xl'],
  },
  noticeBox: {
    backgroundColor: COLORS.brand[50],
    borderColor: COLORS.brand[200],
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  noticeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[800],
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  catScroll: {
    marginBottom: SPACING.md,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
  },
  catPillActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  catText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
  },
  catTextActive: {
    color: COLORS.brand[700],
    fontWeight: 'bold',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  typePill: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.surface,
  },
  typePillActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[600],
  },
  typeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[700],
  },
  typeTextActive: {
    color: COLORS.common.white,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
  },
  remoteToggle: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.lg,
  },
  remoteToggleActive: {
    borderColor: COLORS.brand[500],
    backgroundColor: COLORS.brand[50],
  },
  remoteToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  remoteToggleTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  submitBtn: {
    marginTop: SPACING.xs,
  },
});
