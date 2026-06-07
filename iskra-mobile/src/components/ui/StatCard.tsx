import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radii, shadows, spacing } from '../../theme/tokens';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub?: string;
  accentColor: string;
  chipColor: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function StatCard({
  icon,
  value,
  label,
  sub,
  accentColor,
  chipColor,
  onPress,
  style,
}: StatCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[styles.card, shadows.card, style]}
    >
      <View style={[styles.chip, { backgroundColor: chipColor }]}>
        {icon}
      </View>
      <Text weight="semibold" size="xl" color={accentColor} style={styles.value}>
        {value}
      </Text>
      <Text weight="semibold" size="sm" color={colors.text} style={styles.label}>
        {label}
      </Text>
      {sub && (
        <Text weight="medium" size="xs" color={colors.textFaint} style={styles.sub}>
          {sub}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.cardLg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  chip: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  label: {
    marginTop: 4,
  },
  sub: {
    marginTop: 2,
  },
});
