import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/tokens';

interface ProgressBarProps {
  pct: number;             // 0–100
  color?: string;
  height?: number;
  trackColor?: string;
  style?: ViewStyle;
  radius?: number;
}

export function ProgressBar({
  pct,
  color = colors.ember,
  height = 6,
  trackColor = colors.faint,
  style,
  radius = 999,
}: ProgressBarProps) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  return (
    <View style={[{ height, borderRadius: radius, backgroundColor: trackColor, overflow: 'hidden' }, style]}>
      <View
        style={{
          width: `${clampedPct}%`,
          height: '100%',
          borderRadius: radius,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
