import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  padding?: number;
}

export function Card({ children, style, radius = radii.card, elevation = 'md', padding = spacing.lg }: CardProps) {
  const shadowStyle = elevation === 'none' ? {} :
    elevation === 'sm' ? shadows.sm :
    elevation === 'md' ? shadows.card :
    shadows.cardMd;

  return (
    <View
      style={[
        styles.base,
        shadowStyle,
        { borderRadius: radius, padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
