import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { colors, gradients, radii, shadows, spacing } from '../../theme/tokens';

// Full-width stacked option card with inverted selected state.
// Selected: ember gradient bg + white text + white chip with ember icon.
// Unselected: white card, gray border, icon in its own category color.

interface OptionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;              // receives color prop via render prop pattern
  iconSelected?: React.ReactNode;      // ember-colored version for white chip
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  rightElement?: React.ReactNode;
}

export function OptionCard({
  title,
  subtitle,
  icon,
  iconSelected,
  selected = false,
  onPress,
  style,
  rightElement,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.wrapper, selected && shadows.ember, style]}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.ember}
          start={gradients.emberVertical.start}
          end={gradients.emberVertical.end}
          style={styles.inner}
        >
          <OptionCardContent
            title={title}
            subtitle={subtitle}
            icon={iconSelected ?? icon}
            selected
            rightElement={rightElement}
          />
        </LinearGradient>
      ) : (
        <View style={[styles.inner, styles.unselected]}>
          <OptionCardContent
            title={title}
            subtitle={subtitle}
            icon={icon}
            selected={false}
            rightElement={rightElement}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

interface ContentProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected: boolean;
  rightElement?: React.ReactNode;
}

function OptionCardContent({ title, subtitle, icon, selected, rightElement }: ContentProps) {
  return (
    <View style={styles.row}>
      {icon && (
        <View style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}>
          {icon}
        </View>
      )}
      <View style={styles.textBlock}>
        <Text
          weight="semibold"
          size="base"
          color={selected ? '#fff' : colors.text}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            weight="regular"
            size="sm"
            color={selected ? 'rgba(255,255,255,0.75)' : colors.textSub}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  inner: {
    borderRadius: radii.card,
    padding: spacing.lg,
    minHeight: 72,
    justifyContent: 'center',
  },
  unselected: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chipSelected: {
    backgroundColor: '#fff',
  },
  chipUnselected: {
    backgroundColor: colors.faint,
  },
  textBlock: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
});
