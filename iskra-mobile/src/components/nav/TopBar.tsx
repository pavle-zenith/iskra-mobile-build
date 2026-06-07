import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/Text';
import { IcoArrowLeft } from '../icons';
import { colors, spacing } from '../../theme/tokens';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
  dark?: boolean;                  // white text/icon for dark backgrounds
}

export function TopBar({ title, onBack, rightElement, transparent, style, dark }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const textColor = dark ? '#fff' : colors.text;
  const iconColor = dark ? '#fff' : colors.text;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
        !transparent && styles.bg,
        style,
      ]}
    >
      {/* Left: back button */}
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IcoArrowLeft size={22} stroke={iconColor} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: title */}
      {title && (
        <Text weight="semibold" size="base" color={textColor} style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

      {/* Right: custom element */}
      <View style={[styles.side, styles.sideRight]}>
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenH,
    paddingBottom: 12,
  },
  bg: {
    backgroundColor: colors.bg,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
