import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Button } from '@tech2place/shared';

export interface ForceUpdateScreenProps {
  title?: string;
  message?: string;
  storeUrl?: string;
}

export const ForceUpdateScreen: React.FC<ForceUpdateScreenProps> = ({
  title = 'New Version Required',
  message = 'A new critical version of TECH2PLACE is required to continue using the application securely.',
  storeUrl = 'https://play.google.com/store/apps/details?id=com.tech2place.student',
}) => {
  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch((err) =>
        console.error('Failed to open Play Store URL:', err)
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🚀</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actionContainer}>
        <Button
          title="UPDATE NOW"
          onPress={handleUpdate}
          variant="primary"
          size="lg"
          style={styles.updateButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.brand[200],
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 300,
  },
  updateButton: {
    width: '100%',
  },
});
