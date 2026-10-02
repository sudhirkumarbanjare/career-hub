import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export interface AppLogoProps {
  portalLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
  style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  portalLabel,
  size = 'md',
  showSubtitle = true,
  subtitle = 'Empowering student projects, practical skills, and client career opportunities.',
  style,
}) => {
  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 68 : 52;
  const titleSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;

  return (
    <View style={[styles.container, style]}>
      {/* Brand Icon Badge */}
      <View style={[styles.iconBox, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.28 }]}>
        <Text style={[styles.iconEmoji, { fontSize: iconSize * 0.52 }]}>🎓</Text>
      </View>

      {/* Brand Title */}
      <Text style={[styles.title, { fontSize: titleSize }]}>GoTechPlace</Text>

      {/* Portal Tag */}
      {portalLabel ? (
        <Text style={styles.portalTag}>{portalLabel.toUpperCase()}</Text>
      ) : null}

      {/* Subtitle */}
      {showSubtitle && subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    backgroundColor: COLORS.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: SPACING.xs,
  },
  iconEmoji: {
    textAlign: 'center',
  },
  title: {
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.brand[950],
    letterSpacing: -0.5,
  },
  portalTag: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.brand[600],
    letterSpacing: 1.5,
    marginTop: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
});
