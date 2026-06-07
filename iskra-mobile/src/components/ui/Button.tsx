import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { colors, gradients, radii, shadows, spacing } from '../../theme/tokens';

// ── Primary ember CTA button ──────────────────────────────────────────────────

interface EmberButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function EmberButton({ label, onPress, disabled, loading, style, icon }: EmberButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.emberOuter,
        disabled ? styles.emberDisabled : (pressed ? styles.emberPressed : shadows.ember),
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#F0D6C6', '#EAC5B0'] : gradients.ember}
        start={gradients.emberVertical.start}
        end={gradients.emberVertical.end}
        style={[
          styles.emberInner,
          { transform: [{ scale: pressed ? 0.985 : 1 }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.emberContent}>
            {icon}
            <Text weight="bold" size="md" color="#fff" style={styles.emberLabel}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── White button with ember text (used on dark/ember screens) ─────────────────

interface WhiteButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function WhiteButton({ label, onPress, disabled, style }: WhiteButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.whiteBtn,
        { transform: [{ scale: pressed ? 0.985 : 1 }] },
        style,
      ]}
    >
      <Text weight="bold" size="md" color={colors.ember}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Outlined / bordered button ────────────────────────────────────────────────

interface OutlinedButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function OutlinedButton({ label, onPress, color = colors.ember, style, icon }: OutlinedButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.outlinedBtn, { borderColor: color }, style]}
    >
      {icon}
      <Text weight="semibold" size="base" color={color}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Text-only link button ─────────────────────────────────────────────────────

interface TextButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  size?: keyof typeof import('../../theme/tokens').typography.sizes;
  style?: TextStyle;
}

export function TextButton({ label, onPress, color = colors.textSub, style }: TextButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text weight="medium" size="sm" color={color} style={style}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emberOuter: {
    borderRadius: radii.btn,
    overflow: 'hidden',
  },
  emberDisabled: {
    opacity: 0.7,
  },
  emberPressed: {
    shadowOpacity: 0,
    elevation: 0,
  },
  emberInner: {
    height: 56,
    borderRadius: radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emberLabel: {
    letterSpacing: 0.2,
  },
  whiteBtn: {
    height: 56,
    borderRadius: radii.btn,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  outlinedBtn: {
    height: 56,
    borderRadius: radii.btn,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.xl,
  },
});
