// app/progress/category/[key].tsx — Iskra category milestone timeline
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { format, parseISO } from 'date-fns';

import { Text } from '../../../src/components/ui/Text';
import { colors, categoryConfig, shadows } from '../../../src/theme/tokens';
import type { CategoryKey } from '../../../src/theme/tokens';
import { MILESTONES } from '../../../src/hooks/useMilestones';
import { useQuitStats } from '../../../src/hooks/useQuitStats';
import { useUserData } from '../../../src/hooks/useUserData';
import type { MilestoneDef, MilestoneRecord } from '../../../src/types';
import { supabase } from '../../../src/lib/supabase';

// ─── Category icon ─────────────────────────────────────────────────────────────

interface IconProps {
  size?: number;
  color?: string;
}

function CategoryIcon({ catKey, size = 20, color }: { catKey: CategoryKey; size?: number; color?: string }) {
  const stroke = color ?? categoryConfig[catKey].color;
  const sw = 1.9;
  if (catKey === 'zdravlje') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" />
      </Svg>
    );
  }
  if (catKey === 'pluca') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5a3 3 0 0 0-5.6-1.5A2.5 2.5 0 0 0 4 6.5 2.5 2.5 0 0 0 4 11a2.5 2.5 0 0 0 2 4 3 3 0 0 0 6 0V5Z" />
        <Path d="M12 5a3 3 0 0 1 5.6-1.5A2.5 2.5 0 0 1 20 6.5 2.5 2.5 0 0 1 20 11a2.5 2.5 0 0 1-2 4 3 3 0 0 1-6 0" />
      </Svg>
    );
  }
  if (catKey === 'ekologija') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <Path d="M2 21c0-3 1.85-5.36 5.08-6" />
      </Svg>
    );
  }
  if (catKey === 'finansije') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="8" cy="8" r="6" />
        <Path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <Path d="M7 6h1v4" />
        <Path d="m16.71 13.88.7.71-2.82 2.82" />
      </Svg>
    );
  }
  if (catKey === 'telo') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="13" cy="4" r="1" />
        <Path d="M5 20l2-4 3 2 3-6 2 3h4" />
        <Path d="M13.5 8.5L15 10l3-3" />
      </Svg>
    );
  }
  // nikotin
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </Svg>
  );
}

// ─── Milestone sort key ─────────────────────────────────────────────────────────

function sortKey(m: MilestoneDef): number {
  if (m.days !== undefined) return m.days;
  if (m.rsd !== undefined) return m.rsd / 10; // normalise so 10k RSD ≈ 1000 "days"
  if (m.cravingsSurvived !== undefined) return m.cravingsSurvived * 0.5;
  return 0;
}

// ─── Time until next milestone helper ──────────────────────────────────────────

function timeUntilLabel(
  nextM: MilestoneDef | undefined,
  daysContinuous: number,
  moneySaved: number,
): string {
  if (!nextM) return 'Otključano';
  if (nextM.days !== undefined) {
    const daysLeft = Math.ceil(nextM.days - daysContinuous);
    if (daysLeft <= 0) return 'Otključano';
    return `Za ${daysLeft} dana`;
  }
  if (nextM.rsd !== undefined) {
    const rsdLeft = Math.ceil(nextM.rsd - moneySaved);
    if (rsdLeft <= 0) return 'Otključano';
    return `Još ${rsdLeft} RSD`;
  }
  return 'Uskoro';
}

// ─── Progress percent ───────────────────────────────────────────────────────────

function progressPct(m: MilestoneDef, daysContinuous: number, moneySaved: number): number {
  if (m.days !== undefined) return Math.min(100, Math.round((daysContinuous / m.days) * 100));
  if (m.rsd !== undefined) return Math.min(100, Math.round((moneySaved / m.rsd) * 100));
  return 0;
}

function remainingLabel(m: MilestoneDef, daysContinuous: number, moneySaved: number): string {
  if (m.days !== undefined) {
    const left = Math.ceil(m.days - daysContinuous);
    if (left <= 0) return 'Dostignut';
    return `Za ${left} dana`;
  }
  if (m.rsd !== undefined) {
    const left = Math.ceil(m.rsd - moneySaved);
    if (left <= 0) return 'Dostignut';
    return `Još ${left} RSD`;
  }
  return '';
}

// ─── Timeline dot ───────────────────────────────────────────────────────────────

type DotKind = 'achieved' | 'current' | 'upcoming';

function TimelineDot({ kind, color }: { kind: DotKind; color: string }) {
  if (kind === 'achieved') {
    return <View style={[s.dotAchieved, { backgroundColor: color }]} />;
  }
  if (kind === 'current') {
    return <View style={[s.dotCurrent, { borderColor: color }]} />;
  }
  return <View style={s.dotUpcoming} />;
}

// ─── Main screen ─────────────────────────────────────────────────────────────────

export default function CategoryScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const insets = useSafeAreaInsets();

  const catKey = (key ?? 'zdravlje') as CategoryKey;
  const cfg = categoryConfig[catKey] ?? categoryConfig.zdravlje;

  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUserId(session?.user?.id),
    );
  }, []);

  const { profile, checkins, milestones } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  // Filter milestones for this category and sort
  const catMilestones = MILESTONES.filter((m) => m.category === catKey).sort(
    (a, b) => sortKey(a) - sortKey(b),
  );

  // Build set of unlocked keys
  const unlockedSet = new Set(milestones.map((r: MilestoneRecord) => r.key));
  const unlockedMap = new Map(milestones.map((r: MilestoneRecord) => [r.key, r]));

  // Split into achieved / current / upcoming
  const achievedItems = catMilestones.filter((m) => unlockedSet.has(m.key));
  const notAchieved = catMilestones.filter((m) => !unlockedSet.has(m.key));
  const currentItem = notAchieved[0];
  const upcomingItems = notAchieved.slice(1);

  // Amber pill: time to next milestone
  const nextPillLabel = timeUntilLabel(currentItem, stats.daysSmokeFreeContinuous, stats.moneySavedRSD);

  type TimelineEntry =
    | { kind: 'achieved'; m: MilestoneDef }
    | { kind: 'current'; m: MilestoneDef }
    | { kind: 'upcoming'; m: MilestoneDef };

  const timelineItems: TimelineEntry[] = [
    ...achievedItems.map((m): TimelineEntry => ({ kind: 'achieved', m })),
    ...(currentItem ? [{ kind: 'current' as const, m: currentItem }] : []),
    ...upcomingItems.map((m): TimelineEntry => ({ kind: 'upcoming', m })),
  ];

  const totalCount = catMilestones.length;
  const achievedCount = achievedItems.length;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5" />
            <Path d="m12 19-7-7 7-7" />
          </Svg>
        </TouchableOpacity>

        <View style={s.amberPill}>
          <Text weight="medium" style={{ fontSize: 13, color: colors.amber }}>{nextPillLabel}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text weight="semibold" style={{ fontSize: 32, color: cfg.color, letterSpacing: -0.6, marginTop: 14 }}>
          {cfg.label}
        </Text>

        <View style={s.headerRow}>
          <CategoryIcon catKey={catKey} size={20} />
          <Text weight="medium" style={{ fontSize: 16, color: colors.text, marginLeft: 9 }}>
            {achievedCount} / {totalCount} postignuto
          </Text>
        </View>

        {/* Timeline */}
        <View style={s.timeline}>
          {timelineItems.map((entry, idx) => {
            const isLast = idx === timelineItems.length - 1;
            const unlockedAt = entry.kind === 'achieved'
              ? unlockedMap.get(entry.m.key)?.unlocked_at
              : undefined;

            return (
              <View key={entry.m.key} style={s.timelineRow}>
                {/* Left column: dot + connector */}
                <View style={s.dotCol}>
                  <TimelineDot kind={entry.kind} color={cfg.color} />
                  {!isLast && <View style={s.connector} />}
                </View>

                {/* Right column: content */}
                <View style={[s.rowContent, isLast && { paddingBottom: 0 }]}>
                  {entry.kind === 'achieved' && (
                    <View>
                      <Text weight="medium" style={s.titleText}>{entry.m.title}</Text>
                      <Text weight="regular" style={s.dateText}>
                        {unlockedAt
                          ? format(parseISO(unlockedAt), "d. MMM yyyy., HH:mm")
                          : '—'}
                      </Text>
                    </View>
                  )}

                  {entry.kind === 'current' && (
                    <View style={[s.currentCard, { borderLeftColor: cfg.color }]}>
                      <Text weight="medium" style={s.titleText}>{entry.m.title}</Text>
                      <View style={s.progressRow}>
                        <View style={s.progressTrack}>
                          <View
                            style={[
                              s.progressFill,
                              {
                                backgroundColor: cfg.color,
                                width: `${progressPct(entry.m, stats.daysSmokeFreeContinuous, stats.moneySavedRSD)}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text weight="semibold" style={{ fontSize: 13, color: cfg.color, marginLeft: 10, flexShrink: 0 }}>
                          {progressPct(entry.m, stats.daysSmokeFreeContinuous, stats.moneySavedRSD)}%
                        </Text>
                      </View>
                    </View>
                  )}

                  {entry.kind === 'upcoming' && (
                    <View>
                      <Text weight="regular" style={s.upcomingTitle}>{entry.m.title}</Text>
                      <Text weight="regular" style={s.upcomingRem}>
                        {remainingLabel(entry.m, stats.daysSmokeFreeContinuous, stats.moneySavedRSD)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Info card */}
        <View style={s.infoCard}>
          <View style={{ marginTop: 1 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx="12" cy="12" r="9.5" />
              <Line x1="12" y1="16" x2="12" y2="12" />
              <Line x1="12" y1="8" x2="12.01" y2="8" />
            </Svg>
          </View>
          <Text weight="regular" style={s.infoText}>
            Podaci su zasnovani na istraživanjima WHO i CDC. Precizan napredak zavisi od individualnih faktora.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
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
  amberPill: {
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  timeline: {
    // vertical timeline
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dotCol: {
    width: 16,
    flexShrink: 0,
    alignItems: 'center',
  },
  dotAchieved: {
    width: 14,
    height: 14,
    borderRadius: 7,
    flexShrink: 0,
  },
  dotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: colors.card,
    flexShrink: 0,
    marginLeft: -1,
  },
  dotUpcoming: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    backgroundColor: colors.card,
    flexShrink: 0,
    marginTop: 1,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: '#EEE9E3',
    marginTop: 4,
    minHeight: 24,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 22,
  },
  titleText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 21,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 3,
  },
  currentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.card,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  upcomingTitle: {
    fontSize: 16,
    color: colors.textSub,
    lineHeight: 21,
  },
  upcomingRem: {
    fontSize: 13,
    color: colors.textGhost,
    marginTop: 3,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
  },
});
