import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/Text';
import { IcoHome, IcoFlag, IcoBook, IcoUser } from '../icons';
import { colors, spacing } from '../../theme/tokens';

export type NavTab = 'home' | 'milestoni' | 'saznaj' | 'profil';

interface BottomNavProps {
  active: NavTab;
  onNav: (tab: NavTab) => void;
}

const tabs: Array<{
  key: NavTab;
  label: string;
  Icon: React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>;
}> = [
  { key: 'home', label: 'Početna', Icon: IcoHome },
  { key: 'milestoni', label: 'Milestoni', Icon: IcoFlag },
  { key: 'saznaj', label: 'Saznaj', Icon: IcoBook },
  { key: 'profil', label: 'Profil', Icon: IcoUser },
];

export function BottomNav({ active, onNav }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map(({ key, label, Icon }) => {
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onNav(key)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Icon
              size={23}
              stroke={isActive ? colors.ember : '#BDBAB3'}
              strokeWidth={isActive ? 2.1 : 1.9}
            />
            <Text
              weight={isActive ? 'bold' : 'medium'}
              size="xs"
              color={isActive ? colors.emberDeep : colors.textSub}
              style={styles.label}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  label: {
    letterSpacing: 0.1,
  },
});
