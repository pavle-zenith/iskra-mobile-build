import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft } from '../../src/components/icons';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { MILESTONES } from '../../src/hooks/useMilestones';
import { supabase } from '../../src/lib/supabase';
import {
  colors,
  radii,
  shadows,
  categoryConfig,
  spacing,
} from '../../src/theme/tokens';
import type { MilestoneDef } from '../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCatLabel(category: string): string {
  return categoryConfig[category as keyof typeof categoryConfig]?.label ?? category;
}

function getCatColor(category: string): string {
  return categoryConfig[category as keyof typeof categoryConfig]?.color ?? colors.ember;
}

function computePct(m: MilestoneDef, daysContinuous: number, moneySavedRSD: number): number {
  if (m.days !== undefined) {
    return Math.min(100, Math.round((daysContinuous / m.days) * 100));
  }
  if (m.rsd !== undefined) {
    return Math.min(100, Math.round((moneySavedRSD / m.rsd) * 100));
  }
  return 0;
}

function currentProgressLabel(m: MilestoneDef, daysContinuous: number): string {
  if (m.days !== undefined) {
    const rem = Math.max(0, m.days - daysContinuous);
    return `Za ${rem} dana · Dan ${m.days}`;
  }
  if (m.rsd !== undefined) {
    const rem = Math.max(0, m.rsd - daysContinuous);
    // rsd rem — use moneySavedRSD via closure in the call site
    return `Još ${rem.toLocaleString('sr-RS').replace(/,/g, '.')} RSD`;
  }
  return '';
}

function upcomingLabel(m: MilestoneDef, daysContinuous: number, moneySavedRSD: number): string {
  if (m.days !== undefined) {
    const rem = Math.max(0, m.days - daysContinuous);
    return `Za ${rem} dana`;
  }
  if (m.rsd !== undefined) {
    const rem = Math.max(0, m.rsd - moneySavedRSD);
    return `Još ${rem.toLocaleString('sr-RS').replace(/,/g, '.')} RSD`;
  }
  if (m.cravingsSurvived !== undefined) {
    return `${m.cravingsSurvived} porива`;
  }
  return '';
}

// ── Timeline dot sizes ────────────────────────────────────────────────────────

const DOT_ACHIEVED = 12;
const DOT_CURRENT = 14;
const DOT_UPCOMING = 12;
const CONNECTOR_WIDTH = 2;
const CONNECTOR_HEIGHT = 24;
const TIMELINE_LEFT = 20; // distance from screen left to dot center

// ── Row types ─────────────────────────────────────────────────────────────────

type RowKind = 'achieved' | 'current' | 'upcoming';

interface TimelineRow {
  kind: RowKind;
  m: MilestoneDef;
  unlockedAt?: string; // ISO string for achieved
}

// ── Achieved row ──────────────────────────────────────────────────────────────

function AchievedRow({ m, unlockedAt }: { m: MilestoneDef; unlockedAt: string }) {
  const catColor = getCatColor(m.category);
  const dateStr = format(new Date(unlockedAt), 'd. MMM yyyy.', { locale: sr });

  return (
    <View style={rowSt.container}>
      {/* Left: dot + connector */}
      <View style={rowSt.leftColumn}>
        <View
          style={[
            rowSt.dot,
            {
              width: DOT_ACHIEVED,
              height: DOT_ACHIEVED,
              borderRadius: DOT_ACHIEVED / 2,
              backgroundColor: catColor,
              opacity: 0.5,
            },
          ]}
        />
        <View style={[rowSt.connector, { backgroundColor: colors.border }]} />
      </View>

      {/* Right: content */}
      <View style={rowSt.rightColumn}>
        <View style={rowSt.achievedRow}>
          <Text
            weight="medium"
            style={rowSt.achievedTitle}
          >
            {m.title}
          </Text>
          <Text weight="regular" style={rowSt.achievedDate}>
            {dateStr}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Current row ───────────────────────────────────────────────────────────────

function CurrentRow({
  m,
  pct,
  progressLabel,
}: {
  m: MilestoneDef;
  pct: number;
  progressLabel: string;
}) {
  return (
    <View style={rowSt.container}>
      {/* Left: ember-outlined dot + connector */}
      <View style={rowSt.leftColumn}>
        <View
          style={[
            rowSt.dot,
            {
              width: DOT_CURRENT,
              height: DOT_CURRENT,
              borderRadius: DOT_CURRENT / 2,
              backgroundColor: colors.card,
              borderWidth: 3,
              borderColor: colors.ember,
            },
          ]}
        />
        <View style={[rowSt.connector, { backgroundColor: colors.border }]} />
      </View>

      {/* Right: highlighted card */}
      <View style={[rowSt.rightColumn, { paddingBottom: 0 }]}>
        <View style={[currentSt.card, shadows.card]}>
          <Text weight="bold" style={currentSt.eyebrow}>SLEDEĆE</Text>
          <Text weight="medium" style={currentSt.catLabel}>
            {getCatLabel(m.category)}
          </Text>
          <Text weight="semibold" style={currentSt.title}>{m.title}</Text>

          {/* Progress bar */}
          <View style={currentSt.barTrack}>
            <View
              style={[
                currentSt.barFill,
                { width: `${pct}%` as `${number}%` },
              ]}
            />
          </View>

          <Text weight="regular" style={currentSt.progressLabel}>
            {progressLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Upcoming row ──────────────────────────────────────────────────────────────

function UpcomingRow({ m, label }: { m: MilestoneDef; label: string }) {
  const catColor = getCatColor(m.category);

  return (
    <View style={rowSt.container}>
      {/* Left: outlined dot + connector */}
      <View style={rowSt.leftColumn}>
        <View
          style={[
            rowSt.dot,
            {
              width: DOT_UPCOMING,
              height: DOT_UPCOMING,
              borderRadius: DOT_UPCOMING / 2,
              backgroundColor: colors.card,
              borderWidth: 2.5,
              borderColor: catColor,
            },
          ]}
        />
        <View style={[rowSt.connector, { backgroundColor: colors.border }]} />
      </View>

      {/* Right: content */}
      <View style={rowSt.rightColumn}>
        <Text weight="medium" style={rowSt.upcomingCat}>
          {getCatLabel(m.category)}
        </Text>
        <Text weight="semibold" style={rowSt.upcomingTitle}>{m.title}</Text>
        <Text weight="regular" style={rowSt.upcomingRemaining}>{label}</Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function RoadmapScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  const { profile, checkins, milestones } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  const unlockedKeys = new Set(milestones.map((r) => r.key));
  const unlockedAtMap = new Map(milestones.map((r) => [r.key, r.unlocked_at]));

  // Build chronological timeline
  const rows: TimelineRow[] = [];
  let foundCurrent = false;

  for (const m of MILESTONES) {
    if (unlockedKeys.has(m.key)) {
      rows.push({ kind: 'achieved', m, unlockedAt: unlockedAtMap.get(m.key) });
    } else if (!foundCurrent) {
      // First locked = current
      foundCurrent = true;
      rows.push({ kind: 'current', m });
    } else {
      // Subsequent locked = upcoming
      rows.push({ kind: 'upcoming', m });
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <IcoArrowLeft size={20} stroke="#999999" strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="medium" style={styles.topBarTitle}>
          Moj napredak
        </Text>
        {/* Spacer to balance the back button */}
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Timeline */}
        <View style={styles.timeline}>
          {rows.map((row, idx) => {
            const isLast = idx === rows.length - 1;

            if (row.kind === 'achieved') {
              return (
                <View key={row.m.key} style={isLast ? styles.lastRow : undefined}>
                  <AchievedRow
                    m={row.m}
                    unlockedAt={row.unlockedAt ?? new Date().toISOString()}
                  />
                </View>
              );
            }

            if (row.kind === 'current') {
              const pct = computePct(row.m, stats.daysSmokeFreeContinuous, stats.moneySavedRSD);
              let label: string;
              if (row.m.days !== undefined) {
                const rem = Math.max(0, row.m.days - stats.daysSmokeFreeContinuous);
                label = `Za ${rem} dana · Dan ${row.m.days}`;
              } else if (row.m.rsd !== undefined) {
                const rem = Math.max(0, row.m.rsd - stats.moneySavedRSD);
                label = `Još ${rem.toLocaleString('sr-RS').replace(/,/g, '.')} RSD`;
              } else {
                label = currentProgressLabel(row.m, stats.daysSmokeFreeContinuous);
              }
              return (
                <View key={row.m.key} style={isLast ? styles.lastRow : undefined}>
                  <CurrentRow m={row.m} pct={pct} progressLabel={label} />
                </View>
              );
            }

            // upcoming
            const label = upcomingLabel(
              row.m,
              stats.daysSmokeFreeContinuous,
              stats.moneySavedRSD
            );
            return (
              <View key={row.m.key} style={isLast ? styles.lastRow : undefined}>
                <UpcomingRow m={row.m} label={label} />
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text weight="regular" italic style={styles.footer}>
          Svaki dan dodaje novi cilj na listu.
        </Text>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

// ── Timeline row styles ───────────────────────────────────────────────────────

const rowSt = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 56,
  },
  leftColumn: {
    width: TIMELINE_LEFT * 2,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    // sizing set inline
  },
  connector: {
    width: CONNECTOR_WIDTH,
    height: CONNECTOR_HEIGHT,
    marginTop: 4,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 16,
    paddingRight: 16,
  },

  // Achieved
  achievedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  achievedTitle: {
    fontSize: 16,
    color: colors.textSub,
    fontFamily: 'Manrope_500Medium',
    flex: 1,
  },
  achievedDate: {
    fontSize: 13,
    color: colors.textGhost,
    fontFamily: 'Manrope_400Regular',
    marginLeft: 8,
  },

  // Upcoming
  upcomingCat: {
    fontSize: 11,
    color: colors.textSub,
    fontFamily: 'Manrope_500Medium',
    marginTop: 2,
    marginBottom: 2,
  },
  upcomingTitle: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Manrope_600SemiBold',
    lineHeight: 20,
  },
  upcomingRemaining: {
    fontSize: 13,
    color: colors.textSub,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
});

// ── Current card styles ───────────────────────────────────────────────────────

const currentSt = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.ember,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    color: colors.ember,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  catLabel: {
    fontSize: 11,
    color: colors.textSub,
    fontFamily: 'Manrope_500Medium',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    color: colors.text,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 12,
    lineHeight: 22,
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.faint,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.ember,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textSub,
    fontFamily: 'Manrope_400Regular',
  },
});

// ── Main styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 40,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    color: colors.text,
    fontFamily: 'Manrope_500Medium',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xl,
    paddingLeft: spacing.lg,
    paddingRight: 0,
  },
  timeline: {
    // rows laid out inside
  },
  lastRow: {
    // no special style needed — connector on last item just overflows
  },
  footer: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    paddingBottom: 36,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    fontFamily: 'Manrope_400Regular',
  },
});
