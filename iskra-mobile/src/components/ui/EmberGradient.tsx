import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../theme/tokens';

interface EmberGradientProps {
  children: React.ReactNode;
  style?: ViewStyle;
  horizontal?: boolean;
}

export function EmberGradient({ children, style, horizontal = false }: EmberGradientProps) {
  return (
    <LinearGradient
      colors={gradients.ember}
      start={horizontal ? { x: 0, y: 0.5 } : gradients.emberVertical.start}
      end={horizontal ? { x: 1, y: 0.5 } : gradients.emberVertical.end}
      style={[styles.base, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
