import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../ui/Text';
import { colors, radii, shadows } from '../../theme/tokens';
import type { QuitStats } from '../../types';

function SparkIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.ember} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </Svg>
  );
}

interface Props {
  stats: QuitStats;
  onPress?: () => void;
}

export function CountdownCard({ stats, onPress }: Props) {
  const { days, hours, minutes, seconds } = stats.timeDisplay;
  const pad = (n: number) => String(n).padStart(2, '0');

  const cells = [
    { value: String(days), label: 'DANA' },
    { value: pad(hours), label: 'SATI' },
    { value: pad(minutes), label: 'MINUTA' },
    { value: pad(seconds), label: 'SEKUNDE' },
  ];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.85 : 1} style={styles.card}>
      {/* Header pill */}
      <View style={styles.headerRow}>
        <SparkIcon />
        <Text weight="bold" size="xs" color={colors.ember} style={styles.headerLabel}>
          SLOBODAN SI
        </Text>
      </View>

      {/* Time grid */}
      <View style={styles.grid}>
        {cells.map((c, i) => (
          <React.Fragment key={c.label}>
            <View style={styles.cell}>
              <Text weight="bold" style={styles.bigNumber}>
                {c.value}
              </Text>
              <Text weight="bold" size="xs" color={colors.textSub} style={styles.cellLabel}>
                {c.label}
              </Text>
            </View>
            {i < 3 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 17,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 13,
  },
  headerLabel: {
    letterSpacing: 0.06 * 11,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 33,
    color: colors.text,
    letterSpacing: -0.03 * 33,
    lineHeight: 42,
    fontFamily: 'Manrope_700Bold',
    fontVariant: ['tabular-nums'],
  },
  cellLabel: {
    letterSpacing: 0.06 * 10,
    marginTop: 7,
  },
  divider: {
    width: 1,
    alignSelf: 'center',
    height: 26,
    backgroundColor: colors.border,
  },
});
