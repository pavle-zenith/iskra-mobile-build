import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { colors, gradients, radii, shadows, spacing } from '../../theme/tokens';

// 2-column grid pill with inverted selected state.
// Icon chip stays white with ember icon when selected.

interface SelectionPillProps {
  label: string;
  icon?: React.ReactNode;
  chipColor?: string;           // unselected chip background
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function SelectionPill({
  label,
  icon,
  chipColor = colors.faint,
  selected = false,
  onPress,
  style,
  fullWidth = false,
}: SelectionPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        selected && shadows.ember,
        style,
      ]}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.ember}
          start={gradients.emberVertical.start}
          end={gradients.emberVertical.end}
          style={styles.inner}
        >
          <PillContent label={label} icon={icon} chipColor={chipColor} selected />
        </LinearGradient>
      ) : (
        <View style={[styles.inner, styles.unselected]}>
          <PillContent label={label} icon={icon} chipColor={chipColor} selected={false} />
        </View>
      )}
    </TouchableOpacity>
  );
}

interface PillContentProps {
  label: string;
  icon?: React.ReactNode;
  chipColor: string;
  selected: boolean;
}

function PillContent({ label, icon, chipColor, selected }: PillContentProps) {
  return (
    <View style={styles.content}>
      {icon && (
        <View style={[styles.chip, { backgroundColor: selected ? '#fff' : chipColor }]}>
          {icon}
        </View>
      )}
      <Text
        weight="semibold"
        size="sm"
        color={selected ? '#fff' : colors.text}
        style={styles.label}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.chip,
    overflow: 'hidden',
    flex: 1,
  },
  fullWidth: {
    flex: 0,
    width: '100%',
  },
  inner: {
    borderRadius: radii.chip,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
    gap: spacing.sm,
  },
  unselected: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    lineHeight: 17,
  },
});
