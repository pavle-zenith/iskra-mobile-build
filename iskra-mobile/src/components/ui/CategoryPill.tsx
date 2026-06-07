import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing, radii } from '../../theme/tokens';

interface CategoryPillProps {
  label: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export function CategoryPill({
  label,
  color = colors.ember,
  bgColor = colors.emberTint,
  style,
}: CategoryPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bgColor }, style]}>
      <Text
        weight="bold"
        size="xs"
        color={color}
        style={styles.label}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  label: {
    letterSpacing: 1.6,
  },
});
