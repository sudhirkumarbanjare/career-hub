import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  icon?: React.ReactNode;
  iconName?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  message,
  icon,
  iconName,
  actionTitle,
  onAction,
  style,
}) => {
  const desc = description ?? message ?? '';

  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      {!icon && iconName ? (
        <View style={styles.iconWrapper}>
          <Text style={{ fontSize: 36 }}>{iconName}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {desc ? <Text style={styles.description}>{desc}</Text> : null}
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: SPACING.md,
    opacity: 0.85,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: SPACING.lg,
  },
});
