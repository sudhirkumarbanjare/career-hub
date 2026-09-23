import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';
import { RADIUS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  style,
}) => {
  let dimension = 40;
  let fontSize = TYPOGRAPHY.sizes.sm;

  if (size === 'sm') {
    dimension = 32;
    fontSize = TYPOGRAPHY.sizes.xs;
  } else if (size === 'lg') {
    dimension = 56;
    fontSize = TYPOGRAPHY.sizes.lg;
  } else if (size === 'xl') {
    dimension = 80;
    fontSize = TYPOGRAPHY.sizes['2xl'];
  }

  const getInitials = (text: string): string => {
    if (!text) return 'U';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: COLORS.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.brand[300],
  };

  if (imageUrl) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={{
          fontSize,
          fontWeight: TYPOGRAPHY.weights.bold,
          color: COLORS.brand[800],
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};
