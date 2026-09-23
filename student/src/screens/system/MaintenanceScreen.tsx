import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, Button } from '@tech2place/shared';

export interface MaintenanceScreenProps {
  message?: string;
  onRefresh?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message = 'We are performing scheduled maintenance to improve TECH2PLACE. Please check back shortly.',
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🛠️</Text>
      </View>

      <Text style={styles.title}>System Maintenance</Text>
      <Text style={styles.message}>{message}</Text>

      {onRefresh ? (
        <Button
          title="Check Status"
          onPress={onRefresh}
          variant="outline"
          size="md"
          style={styles.refreshBtn}
        />
      ) : null}
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
    backgroundColor: COLORS.warning[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.warning[100],
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
    marginBottom: SPACING.xl,
    maxWidth: 320,
  },
  refreshBtn: {
    minWidth: 160,
  },
});
