import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Button,
  Input,
  validateClientProfile,
  ClientProfile,
} from '@tech2place/shared';
import { ClientService } from '../../services/clientService';

export interface ClientProfileSetupScreenProps {
  onComplete: (profile: ClientProfile) => void;
}

export const ClientProfileSetupScreen: React.FC<ClientProfileSetupScreenProps> = ({
  onComplete,
}) => {
  const current = ClientService.getCurrentClient();

  const [companyName, setCompanyName] = useState(current.companyName || '');
  const [contactPerson, setContactPerson] = useState(current.contactPerson || '');
  const [industry, setIndustry] = useState(current.industry || '');
  const [location, setLocation] = useState(current.location || '');
  const [website, setWebsite] = useState(current.website || '');
  const [description, setDescription] = useState(current.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const check = validateClientProfile({
      companyName,
      contactPerson,
      industry,
      location,
      description,
    });

    if (!check.isValid) {
      setErrors(check.errors);
      return;
    }

    setSubmitting(true);
    const updated = ClientService.updateProfile({
      companyName,
      contactPerson,
      industry,
      location,
      website,
      description,
      approvalStatus: 'pending', // Starts as pending admin approval
    });
    setSubmitting(false);
    onComplete(updated);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Company Verification</Text>
          <Text style={styles.subtitle}>
            Please provide your verified organization details to begin posting projects.
          </Text>
        </View>

        <View style={styles.card}>
          <Input
            label="Organization / Company Name"
            placeholder="e.g. Nexus Innovations Ltd"
            value={companyName}
            onChangeText={(t) => {
              setCompanyName(t);
              if (errors.companyName) setErrors({ ...errors, companyName: '' });
            }}
            error={errors.companyName}
          />

          <Input
            label="Primary Contact Person"
            placeholder="e.g. Vikram Malhotra (HR / Tech Lead)"
            value={contactPerson}
            onChangeText={(t) => {
              setContactPerson(t);
              if (errors.contactPerson) setErrors({ ...errors, contactPerson: '' });
            }}
            error={errors.contactPerson}
          />

          <Input
            label="Industry Domain"
            placeholder="e.g. Software & Cloud Engineering"
            value={industry}
            onChangeText={(t) => {
              setIndustry(t);
              if (errors.industry) setErrors({ ...errors, industry: '' });
            }}
            error={errors.industry}
          />

          <Input
            label="Headquarters / Office Location"
            placeholder="e.g. Bangalore, Karnataka"
            value={location}
            onChangeText={(t) => {
              setLocation(t);
              if (errors.location) setErrors({ ...errors, location: '' });
            }}
            error={errors.location}
          />

          <Input
            label="Company Website (Optional)"
            placeholder="https://yourcompany.com"
            value={website}
            onChangeText={setWebsite}
          />

          <Input
            label="Brief Organization Overview"
            placeholder="Describe what your organization builds and the types of projects offered..."
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            multiline
            numberOfLines={3}
            inputStyle={{ minHeight: 70, textAlignVertical: 'top' }}
            error={errors.description}
          />

          <Button
            title="SUBMIT FOR ADMIN APPROVAL →"
            onPress={handleSubmit}
            loading={submitting}
            size="lg"
            style={{ marginTop: SPACING.md }}
          />
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
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
});
