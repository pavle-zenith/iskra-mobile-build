import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { WeeklyTracker } from '../../src/components/home/WeeklyTracker';
import { CountdownCard } from '../../src/components/home/CountdownCard';
import { DailyCheckinOverlay } from '../../src/components/home/DailyCheckinOverlay';
import { BottomNav } from '../../src/components/nav/BottomNav';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { useUserData } from '../../src/hooks/useUserData';
import { useMilestones, MILESTONES } from '../../src/hooks/useMilestones';
import { supabase } from '../../src/lib/supabase';
import { track } from '../../src/lib/posthog';
import { colors, gradients, radii, shadows, categoryConfig } from '../../src/theme/tokens';
import { format } from 'date-fns';

// ── Inline icons ─────────────────────────────────────────────────────────────

function SparkIcon({ size = 18, color = '#fff', sw = 2.1 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </Svg>
  );
}

function FlameIcon({ size = 16, color = colors.ember }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
    </Svg>
  );
}

function CoinIcon({ size = 20, color = colors.catMoney }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="8" cy="8" r="6" />
      <Path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <Path d="M7 6h1v4" />
      <Path d="m16.71 13.88.7.71-2.82 2.82" />
    </Svg>
  );
}

function CigOffIcon({ size = 20, color = colors.catCigarettes }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2.5" y="13" width="13.5" height="4" rx="1.4" />
      <Line x1="11.5" y1="13" x2="11.5" y2="17" />
      <Path d="M18 8.5c.9.7.9 1.8 0 2.5" />
      <Path d="M20.5 7c1.3 1 1.3 2.6 0 3.6" />
      <Line x1="3" y1="4" x2="21" y2="20.5" />
    </Svg>
  );
}

function QuoteIcon({ size = 20, color = colors.ember }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
      <Path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </Svg>
  );
}

function ChevronRight({ size = 18, color = '#CFCBC4' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

function HourglassIcon({ size = 20, color = colors.textSub }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 2h12M6 22h12" />
      <Path d="M6 2c0 4 3 5.5 6 8 3-2.5 6-4 6-8" />
      <Path d="M6 22c0-4 3-5.5 6-8 3 2.5 6 4 6 8" />
    </Svg>
  );
}

function LungsIcon({ size = 23, color = colors.finansije }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4v8" />
      <Path d="M9.5 9.5c-2 0-4 2-4 6 0 2 .5 4 2.2 4 1.3 0 1.8-1.1 1.8-2.6V11c0-.85-.7-1.5-1.5-1.5Z" />
      <Path d="M14.5 9.5c2 0 4 2 4 6 0 2-.5 4-2.2 4-1.3 0-1.8-1.1-1.8-2.6V11c0-.85.7-1.5 1.5-1.5Z" />
    </Svg>
  );
}

function CategoryIcon({ cat, size = 25 }: { cat: string; size?: number }) {
  const color = categoryConfig[cat as keyof typeof categoryConfig]?.color ?? colors.ember;
  switch (cat) {
    case 'zdravlje': return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><Path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Svg>;
    case 'pluca': return <LungsIcon size={size} color={color} />;
    case 'ekologija': return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><Path d="M2 21c0-3 1.85-5.36 5.08-6" /></Svg>;
    case 'finansije': return <CoinIcon size={size} color={color} />;
    case 'telo': return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" /></Svg>;
    case 'nikotin': return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><Circle cx="6" cy="7" r="2" /><Circle cx="17.5" cy="8.5" r="2" /><Circle cx="11" cy="17.5" r="2" /><Path d="M7.9 6.4 15.6 8M7.2 8.7 9.8 15.6M16.2 10.2 12.5 15.8" /></Svg>;
    default: return null;
  }
}

// ── Goal progress bar ─────────────────────────────────────────────────────────

function GoalBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={goalBarSt.track}>
      <View style={[goalBarSt.fill, { width: `${Math.min(100, pct)}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const goalBarSt = StyleSheet.create({
  track: { width: '100%', height: 4, borderRadius: 999, backgroundColor: colors.faint, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, chipColor, onPress }: {
  icon: React.ReactNode; value: string; label: string; chipColor: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={statSt.card}>
      <View style={[statSt.chip, { backgroundColor: chipColor }]}>{icon}</View>
      <Text weight="bold" style={statSt.value}>{value}</Text>
      <Text weight="semibold" size="sm" style={statSt.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const statSt = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: 16, paddingBottom: 15, ...shadows.card },
  chip: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  value: { fontSize: 25, color: colors.text, letterSpacing: -0.5, lineHeight: 25, fontFamily: 'Manrope_700Bold' },
  label: { marginTop: 6, color: colors.catMoney },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [showCheckin, setShowCheckin] = useState(false);
  const poriveScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  const { profile, checkins, milestones, refreshCheckins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);
  useMilestones(userId, stats, milestones.map((m) => m.key));

  const name = profile?.name ?? '';
  const initial = name.charAt(0).toUpperCase() || '?';
  const streakDays = stats.daysSmokeFreeContinuous;

  const formatMoney = (n: number) => n.toLocaleString('sr-RS').replace(/,/g, '.');

  async function handleClean() {
    setShowCheckin(false);
    if (!userId) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    await supabase.from('checkins').upsert(
      { user_id: userId, date: today, clean: true },
      { onConflict: 'user_id,date' }
    );
    track.dailyCheckin(true);
    refreshCheckins();
  }

  function handleSlip() {
    setShowCheckin(false);
    router.push('/slip' as any);
  }

  const GOALS = Object.keys(categoryConfig) as (keyof typeof categoryConfig)[];

  // Compute real progress % per category from MILESTONES
  const goalPcts: Record<string, number> = {};
  for (const key of GOALS) {
    const catMilestones = MILESTONES.filter((m) => m.category === key);
    if (catMilestones.length === 0) { goalPcts[key] = 0; continue; }
    const unlockedCount = catMilestones.filter((m) =>
      milestones.some((r) => r.key === m.key)
    ).length;
    goalPcts[key] = Math.round((unlockedCount / catMilestones.length) * 100);
  }

  return (
    <View style={styles.root}>
      <DailyCheckinOverlay
        visible={showCheckin}
        gender={profile?.gender ?? null}
        dayNumber={stats.timeDisplay.days + 1}
        onClose={() => setShowCheckin(false)}
        onClean={handleClean}
        onSlip={handleSlip}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/profil' as any)}
            style={styles.greetingLeft}
            activeOpacity={0.85}
          >
            <LinearGradient colors={gradients.ember} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text weight="bold" style={styles.avatarInitial}>{initial}</Text>
              </View>
            </LinearGradient>
            <View>
              <Text weight="medium" size="sm" color={colors.textSub} style={{ lineHeight: 16 }}>Zdravo,</Text>
              <Text weight="bold" style={styles.greetingName}>{name || 'Iskra'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.streakBadge}>
            <FlameIcon size={16} color={colors.ember} />
            <Text weight="bold" size="base" color={colors.emberDeep}>{streakDays}</Text>
          </View>
        </View>

        {/* ── Cards ── */}
        <View style={styles.cards}>
          <WeeklyTracker checkins={checkins} onCheckIn={() => setShowCheckin(true)} />

          <CountdownCard stats={stats} onPress={() => router.push('/home/time' as any)} />

          <View style={styles.statRow}>
            <StatCard
              icon={<CoinIcon size={20} color={colors.catMoney} />}
              value={formatMoney(stats.moneySavedRSD)}
              label="RSD uštedeno"
              chipColor={colors.catMoneyChip}
              onPress={() => router.push('/home/money' as any)}
            />
            <StatCard
              icon={<CigOffIcon size={20} color={colors.catCigarettes} />}
              value={String(stats.cigarettesAvoided)}
              label="cigareta odbijeno"
              chipColor={colors.catCigChip}
              onPress={() => router.push('/home/cigarettes' as any)}
            />
          </View>

          {/* Quote of the day */}
          <TouchableOpacity onPress={() => router.push('/home/quote' as any)} activeOpacity={0.85} style={styles.quoteCard}>
            <View style={styles.quoteChip}>
              <QuoteIcon size={20} color={colors.ember} />
            </View>
            <View style={styles.quoteText}>
              <Text weight="semibold" size="xs" color={colors.textSub} style={{ marginBottom: 3 }}>
                Quote dana #{stats.timeDisplay.days || 1}
              </Text>
              <Text weight="medium" size="base" color={colors.text} numberOfLines={1} style={{ letterSpacing: -0.1 }}>
                Lako je prestati pušiti. Prestajao sam...
              </Text>
              <Text weight="medium" size="sm" color={colors.textSub} style={{ marginTop: 6 }}>
                — Mark Twain
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* ── Moj napredak ── */}
          <View style={styles.section}>
            <Text weight="bold" size="base" color={colors.text} style={styles.sectionTitle}>
              Moj napredak
            </Text>

            {/* Dnevno znanje card */}
            <TouchableOpacity onPress={() => router.push('/(tabs)/saznaj' as any)} activeOpacity={0.88} style={styles.knowledgeWrapper}>
              <LinearGradient colors={[colors.tealDeepTop, colors.tealDeep]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.knowledgeCard}>
                <Image source={require('../../assets/images/highland-bg.png')} style={styles.knowledgeTexture} resizeMode="cover" />
                <View style={styles.knowledgeTopRow}>
                  <View style={styles.knowledgeEyebrow}>
                    <Text weight="bold" size="xs" color="#fff" style={{ letterSpacing: 1.2 }}>DNEVNO ZNANJE</Text>
                  </View>
                  <Text weight="medium" size="xs" color="rgba(255,255,255,0.6)">3 min</Text>
                </View>
                <Text weight="semibold" size="base" color="#fff" style={styles.knowledgeTitle}>
                  Zašto kafa i cigareta idu zajedno — i kako to razdvojiti.
                </Text>
                <Text weight="regular" size="sm" color="rgba(255,255,255,0.7)" style={styles.knowledgeExcerpt}>
                  Uslovni refleks koji traje godinama može da se promeni. Evo kako...
                </Text>
                <View style={styles.knowledgeBottom}>
                  <View style={styles.knowledgeTag}>
                    <Text weight="medium" size="xs" color="#fff">Okidači</Text>
                  </View>
                  <View style={styles.knowledgeRead}>
                    <Text weight="semibold" size="sm" color="#fff">Čitaj danas</Text>
                    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M5 12h14M13 6l6 6-6 6" />
                    </Svg>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Next goal */}
            <TouchableOpacity onPress={() => router.push('/progress/roadmap' as any)} activeOpacity={0.85} style={styles.nextGoalCard}>
              <View style={styles.nextGoalTop}>
                <View style={styles.nextGoalChip}>
                  <LungsIcon size={23} color={colors.finansije} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text weight="bold" size="xs" color={colors.finansije} style={{ letterSpacing: 0.8, marginBottom: 3 }}>
                    SLEDEĆI CILJ
                  </Text>
                  <Text weight="semibold" size="base" color={colors.text} style={{ letterSpacing: -0.2 }}>
                    Pluća počinju da se čiste
                  </Text>
                </View>
              </View>
              <GoalBar pct={45} color={colors.finansije} />
            </TouchableOpacity>

            {/* 3×2 category grid */}
            <View style={styles.goalGrid}>
              {GOALS.map((key) => {
                const cat = categoryConfig[key];
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => router.push(`/progress/category/${key}` as any)}
                    activeOpacity={0.85}
                    style={styles.goalCard}
                  >
                    <CategoryIcon cat={key} size={25} />
                    <Text weight="bold" size="xs" color={cat.color} style={styles.goalLabel}>{cat.label}</Text>
                    <GoalBar pct={goalPcts[key] ?? 50} color={cat.color} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Total time */}
            <View style={styles.totalTimeCard}>
              <View>
                <HourglassIcon size={20} color={colors.textSub} />
                <Text weight="medium" size="sm" color={colors.textSub} style={{ marginTop: 8 }}>
                  Na putu si već
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text weight="medium" style={styles.totalTimeValue}>
                  {stats.timeDisplay.days} dana {stats.timeDisplay.hours} sati
                </Text>
                <Text weight="medium" size="sm" color={colors.textSub} style={{ marginTop: 3 }}>
                  od kada si počeo/la
                </Text>
              </View>
            </View>

            {/* Slip button */}
            <TouchableOpacity onPress={() => router.push('/slip' as any)} activeOpacity={0.85} style={styles.slipBtn}>
              <Text weight="regular" size="base" color={colors.textSub}>Zapalio/la sam</Text>
            </TouchableOpacity>
            <Text weight="regular" size="xs" color={colors.textGhost} style={{ textAlign: 'center', marginTop: 1 }}>
              Beležimo sve — bez osude.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed footer ── */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: poriveScale }] }}>
          <TouchableOpacity
            onPress={() => router.push('/poriv/entry' as any)}
            onPressIn={() => Animated.spring(poriveScale, { toValue: 0.975, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(poriveScale, { toValue: 1, useNativeDriver: true }).start()}
            activeOpacity={1}
          >
            <LinearGradient colors={gradients.ember} start={gradients.emberVertical.start} end={gradients.emberVertical.end} style={styles.porivBtn}>
              <SparkIcon size={18} color="#fff" sw={2.1} />
              <Text weight="bold" size="md" color="#fff" style={{ letterSpacing: 0.2 }}>Imam poriv</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <BottomNav
          active="home"
          onNav={(tab) => {
            if (tab === 'milestoni') router.push('/(tabs)/milestoni' as any);
            else if (tab === 'saznaj') router.push('/(tabs)/saznaj' as any);
            else if (tab === 'profil') router.push('/(tabs)/profil' as any);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  greetingLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, padding: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: '100%', height: '100%', borderRadius: 24, backgroundColor: colors.emberSoft, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 20, color: colors.emberDeep, fontFamily: 'Manrope_700Bold' },
  greetingName: { fontSize: 24, color: colors.text, letterSpacing: -0.5, lineHeight: 28, fontFamily: 'Manrope_700Bold' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.emberSoft, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 8 },
  cards: { gap: 12 },
  statRow: { flexDirection: 'row', gap: 12 },
  quoteCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.card, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: 16, paddingBottom: 15, ...shadows.card },
  quoteChip: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.emberSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  quoteText: { flex: 1, minWidth: 0 },
  section: { gap: 11 },
  sectionTitle: { letterSpacing: -0.2, marginBottom: 2 },
  knowledgeWrapper: { borderRadius: 20, overflow: 'hidden', shadowColor: 'rgba(26,92,90,1)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 5 },
  knowledgeCard: { borderRadius: 20, padding: 20, overflow: 'hidden' },
  knowledgeTexture: { ...StyleSheet.absoluteFill, opacity: 0.4 } as any,
  knowledgeTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  knowledgeEyebrow: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  knowledgeTitle: { lineHeight: 26, letterSpacing: -0.2 },
  knowledgeExcerpt: { marginTop: 8, lineHeight: 20 },
  knowledgeBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  knowledgeTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  knowledgeRead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  nextGoalCard: { backgroundColor: '#F8FBFA', borderWidth: 1, borderColor: '#E8EFEC', borderRadius: radii.card, padding: 16, paddingBottom: 17, ...shadows.card, gap: 14 },
  nextGoalTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  nextGoalChip: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalCard: { width: '30%', flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radii.chip, paddingVertical: 15, paddingHorizontal: 11, alignItems: 'center', ...shadows.sm },
  goalLabel: { marginTop: 9, marginBottom: 12 },
  totalTimeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, padding: 18, ...shadows.sm },
  totalTimeValue: { fontSize: 20, color: colors.text, letterSpacing: -0.2, fontFamily: 'Manrope_500Medium' },
  slipBtn: { height: 52, borderRadius: radii.card, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  footer: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  porivBtn: { height: 56, borderRadius: radii.btn, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, ...shadows.ember },
});
