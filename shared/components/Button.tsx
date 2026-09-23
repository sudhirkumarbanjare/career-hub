import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = { ...styles.base };

    // Size
    if (size === 'sm' || size === 'small') {
      base.paddingVertical = SPACING.xs + 2;
      base.paddingHorizontal = SPACING.md;
    } else if (size === 'lg' || size === 'large') {
      base.paddingVertical = SPACING.base;
      base.paddingHorizontal = SPACING.xl;
    } else {
      base.paddingVertical = SPACING.sm + 4;
      base.paddingHorizontal = SPACING.lg;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = COLORS.brand[600];
        base.borderColor = COLORS.brand[600];
        break;
      case 'secondary':
        base.backgroundColor = COLORS.brand[50];
        base.borderColor = COLORS.brand[200];
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderColor = COLORS.gray[300];
        base.borderWidth = 1;
        break;
      case 'danger':
        base.backgroundColor = COLORS.danger[600];
        base.borderColor = COLORS.danger[600];
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        base.borderColor = 'transparent';
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.6;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = { ...styles.text };

    if (size === 'sm') base.fontSize = TYPOGRAPHY.sizes.sm;
    if (size === 'lg') base.fontSize = TYPOGRAPHY.sizes.lg;

    switch (variant) {
      case 'primary':
      case 'danger':
        base.color = COLORS.common.white;
        break;
      case 'secondary':
        base.color = COLORS.brand[700];
        break;
      case 'outline':
        base.color = COLORS.gray[800];
        break;
      case 'ghost':
        base.color = COLORS.gray[600];
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? COLORS.common.white : COLORS.brand[600]}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
});
