import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export type BadgeVariant =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'gray'
  | 'default';

export interface BadgeProps {
  label?: string;
  text?: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  text,
  variant = 'brand',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const displayText = label ?? text ?? '';
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = { ...styles.badge };
    if (size === 'sm') {
      base.paddingVertical = 2;
      base.paddingHorizontal = SPACING.xs + 2;
    } else {
      base.paddingVertical = 4;
      base.paddingHorizontal = SPACING.sm + 2;
    }

    switch (variant) {
      case 'brand':
        base.backgroundColor = COLORS.brand[50];
        base.borderColor = COLORS.brand[200];
        break;
      case 'success':
        base.backgroundColor = COLORS.success[50];
        base.borderColor = COLORS.success[100];
        break;
      case 'warning':
        base.backgroundColor = COLORS.warning[50];
        base.borderColor = COLORS.warning[100];
        break;
      case 'danger':
        base.backgroundColor = COLORS.danger[50];
        base.borderColor = COLORS.danger[100];
        break;
      case 'info':
        base.backgroundColor = COLORS.info[50];
        base.borderColor = COLORS.info[100];
        break;
      case 'purple':
        base.backgroundColor = COLORS.purple[50];
        base.borderColor = COLORS.purple[100];
        break;
      case 'gray':
      default:
        base.backgroundColor = COLORS.gray[100];
        base.borderColor = COLORS.gray[200];
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = { ...styles.text };
    if (size === 'sm') base.fontSize = TYPOGRAPHY.sizes.xs - 1;

    switch (variant) {
      case 'brand':
        base.color = COLORS.brand[700];
        break;
      case 'success':
        base.color = COLORS.success[700];
        break;
      case 'warning':
        base.color = COLORS.warning[700];
        break;
      case 'danger':
        base.color = COLORS.danger[700];
        break;
      case 'info':
        base.color = COLORS.info[700];
        break;
      case 'purple':
        base.color = COLORS.purple[700];
        break;
      case 'gray':
      default:
        base.color = COLORS.gray[700];
        break;
    }

    return base;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      <Text style={[getTextStyle(), textStyle]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
