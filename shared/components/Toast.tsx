import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS, SHADOWS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  style,
}) => {
  if (!visible) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: COLORS.success[600],
          icon: '✓',
        };
      case 'error':
        return {
          bg: COLORS.danger[600],
          icon: '✕',
        };
      case 'warning':
        return {
          bg: COLORS.warning[600],
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          bg: COLORS.brand[600],
          icon: 'ℹ',
        };
    }
  };

  const typeConfig = getTypeStyle();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.toast, { backgroundColor: typeConfig.bg }]}>
        <Text style={styles.icon}>{typeConfig.icon}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: SPACING.base,
    right: SPACING.base,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: RADIUS.lg,
    maxWidth: 400,
    width: '100%',
    ...SHADOWS.md,
  },
  icon: {
    color: COLORS.common.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  message: {
    color: COLORS.common.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
});
