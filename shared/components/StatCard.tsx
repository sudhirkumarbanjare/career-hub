import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS, SHADOWS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = COLORS.brand[50],
  onPress,
  style,
}) => {
  const cardContent = (
    <View style={[styles.card, !onPress && style]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
        {icon ? (
          <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
            {icon}
          </View>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={style}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 32,
    marginBottom: SPACING.xs,
  },
  title: {
    flex: 1,
    marginRight: 6,
    fontSize: 11,
    lineHeight: 14,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
});
