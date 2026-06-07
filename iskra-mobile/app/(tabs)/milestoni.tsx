import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { PhotoHeroCard } from '../../src/components/ui/PhotoHeroCard';
import { BottomNav } from '../../src/components/nav/BottomNav';
import { IcoFlame, IcoTrophy, IcoLock, IcoShare } from '../../src/components/icons';
import { ShareCard, useShareCard } from '../../src/components/ShareCard';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { MILESTONES } from '../../src/hooks/useMilestones';
import { supabase } from '../../src/lib/supabase';
import {
  colors,
  radii,
  shadows,
  categoryConfig,
} from '../../src/theme/tokens';
import type { MilestoneDef } from '../../src/types';
import type { NavTab } from '../../src/components/nav/BottomNav';

// ── Category gradient pairs ──────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, readonly [string, string]> = {
  zdravlje: ['#D4547E', '#C04070'],
  pluca: ['#4A8AC4', '#3A7AB4'],
  finansije: ['#3A7A3A', '#2D6A2D'],
  telo: ['#C4724A', '#B4623A'],
  nikotin: ['#6B52A8', '#5B4298'],
  ekologija: ['#2E8B80', '#1E7B70'],
};

function getCatGradient(category: string): readonly [string, string] {
  return CATEGORY_GRADIENTS[category] ?? [colors.ember, colors.emberDeep];
}

// ── Category icon (white, for unlocked card) ─────────────────────────────────

function CategoryIconWhite({ category, size = 24 }: { category: string; size?: number }) {
  // Financial milestones → trophy, craving milestones → flame, time milestones → flame
  if (category === 'finansije') {
    return <IcoTrophy size={size} stroke="#fff" strokeWidth={1.9} />;
  }
  return <IcoFlame size={size} stroke="#fff" strokeWidth={1.9} />;
}

// ── Remaining text helper ─────────────────────────────────────────────────────

function remainingText(m: MilestoneDef, daysContinuous: number, moneySavedRSD: number): string | null {
  if (m.days !== undefined) {
    const rem = m.days - daysContinuous;
    if (rem <= 0) return null; // already eligible — skip from locked
    return `još ${rem} ${rem === 1 ? 'dan' : 'dana'}`;
  }
  if (m.rsd !== undefined) {
    const rem = m.rsd - moneySavedRSD;
    if (rem <= 0) return null;
    return `još ${rem.toLocaleString('sr-RS').replace(/,/g, '.')} RSD`;
  }
  if (m.cravingsSurvived !== undefined) {
    // cravingsSurvived not tracked in stats — always show
    return `još ${m.cravingsSurvived} porива`;
  }
  return null;
}

// ── Milestone card shadow ─────────────────────────────────────────────────────

const CARD_SHADOW = {
  shadowColor: 'rgba(120,80,40,1)',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.10,
  shadowRadius: 20,
  elevation: 5,
} as const;

// ── Unlocked card ─────────────────────────────────────────────────────────────

interface UnlockedCardProps {
  m: MilestoneDef;
  cardWidth: number;
}

function UnlockedCard({ m, cardWidth }: UnlockedCardProps) {
  const cardHeight = cardWidth * 1.15;
  const gradient = getCatGradient(m.category);
  const { shotRef, captureAndShare } = useShareCard();

  return (
    <>
      <ShareCard
        shotRef={shotRef}
        variant={{
          type: 'milestone',
          title: m.title,
          unlockText: m.unlockText,
          category: m.category,
          gradientColors: gradient,
        }}
      />
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={captureAndShare}
        style={[styles.cardBase, CARD_SHADOW, { width: cardWidth, height: cardHeight }]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.cardLg }]}
        />
        <View style={styles.unlockedInner}>
          <CategoryIconWhite category={m.category} size={24} />
          <View style={{ flex: 1 }} />
          <View>
            <Text weight="bold" style={styles.unlockedTitle}>{m.title}</Text>
            <Text weight="medium" style={styles.unlockedSub}>{m.unlockText}</Text>
            <View style={styles.shareRow}>
              <Text weight="semibold" style={styles.shareLabel}>PODELI</Text>
              <IcoShare size={10} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}

// ── Locked card ───────────────────────────────────────────────────────────────

interface LockedCardProps {
  m: MilestoneDef;
  remaining: string;
  cardWidth: number;
}

function LockedCard({ m, remaining, cardWidth }: LockedCardProps) {
  const cardHeight = cardWidth * 1.15;
  const cat = categoryConfig[m.category as keyof typeof categoryConfig];

  return (
    <View
      style={[
        styles.cardBase,
        styles.lockedCard,
        CARD_SHADOW,
        { width: cardWidth, height: cardHeight },
      ]}
    >
      {/* Top row: category pill + lock icon */}
      <View style={styles.lockedTopRow}>
        <View style={[styles.catPill, { backgroundColor: cat?.chipColor ?? colors.faint }]}>
          <Text
            weight="bold"
            style={[styles.catPillText, { color: cat?.color ?? colors.textSub }]}
          >
            {(cat?.label ?? m.category).toUpperCase()}
          </Text>
        </View>
        <IcoLock size={22} stroke={colors.textGhost} strokeWidth={1.8} />
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom text */}
      <View>
        <Text weight="semibold" style={styles.lockedTitle}>
          {m.title}
        </Text>
        <Text weight="medium" style={styles.lockedRemaining}>
          {remaining}
        </Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function MilestoniScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  const { profile, checkins, milestones } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  // Build unlocked list (sorted by unlocked_at desc), mapped to full MilestoneDef
  const unlockedKeys = new Set(milestones.map((r) => r.key));
  const unlockedDefs: MilestoneDef[] = milestones
    .slice()
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .map((r) => MILESTONES.find((m) => m.key === r.key))
    .filter((m): m is MilestoneDef => m !== undefined);

  // Build locked list with remaining text
  const lockedWithRemaining: Array<{ m: MilestoneDef; remaining: string }> = MILESTONES.filter(
    (m) => !unlockedKeys.has(m.key)
  )
    .map((m) => {
      const rem = remainingText(m, stats.daysSmokeFreeContinuous, stats.moneySavedRSD);
      return rem !== null ? { m, remaining: rem } : null;
    })
    .filter((x): x is { m: MilestoneDef; remaining: string } => x !== null);

  const heroSubtitle = `${unlockedDefs.length} otključano · ${lockedWithRemaining.length} čeka`;

  // Card width: 2-col grid with 12 gap and 16 horizontal padding each side
  const cardWidth = (width - 16 * 2 - 12) / 2;

  function handleNav(tab: NavTab) {
    switch (tab) {
      case 'home': router.replace('/(tabs)' as any); break;
      case 'saznaj': router.replace('/(tabs)/saznaj' as any); break;
      case 'profil': router.replace('/(tabs)/profil' as any); break;
      default: break;
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <PhotoHeroCard
            image={require('../../assets/images/sky-bg.webp')}
            title="Milestoni"
            subtitle={heroSubtitle}
          />
        </View>

        {/* ── Unlocked section ── */}
        {unlockedDefs.length > 0 && (
          <>
            <Text weight="semibold" style={styles.sectionLabel}>OTKLJUČANO</Text>
            <View style={styles.grid}>
              {unlockedDefs.map((m) => (
                <UnlockedCard key={m.key} m={m} cardWidth={cardWidth} />
              ))}
            </View>
          </>
        )}

        {/* ── Locked section ── */}
        {lockedWithRemaining.length > 0 && (
          <>
            <Text weight="semibold" style={[styles.sectionLabel, { marginTop: 24 }]}>ČEKA TE</Text>
            <View style={styles.grid}>
              {lockedWithRemaining.map(({ m, remaining }) => (
                <LockedCard key={m.key} m={m} remaining={remaining} cardWidth={cardWidth} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom nav */}
      <BottomNav active="milestoni" onNav={handleNav} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FCFBF9',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  heroWrap: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    color: colors.textSub,
    letterSpacing: 0.08 * 11,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },

  // Card base
  cardBase: {
    borderRadius: radii.cardLg,
    overflow: 'hidden',
  },

  // Unlocked card inner layout
  unlockedInner: {
    flex: 1,
    padding: 16,
    paddingBottom: 16,
  },
  unlockedTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  unlockedSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Manrope_500Medium',
    marginTop: 2,
    lineHeight: 14 * 1.3,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
  },
  shareLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Manrope_600SemiBold',
    letterSpacing: 0.08 * 10,
  },

  // Locked card
  lockedCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    padding: 14,
  },
  lockedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  catPillText: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.3,
  },
  lockedTitle: {
    fontSize: 20,
    color: colors.textGhost,
    fontFamily: 'Manrope_600SemiBold',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  lockedRemaining: {
    fontSize: 13,
    color: colors.ember,
    fontFamily: 'Manrope_500Medium',
    marginTop: 4,
  },
});
