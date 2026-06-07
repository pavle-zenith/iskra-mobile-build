// Success screen — ember gradient, flame animation, brain fact, next milestone
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { colors } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';

const PURPLE = '#6B52A8';
const PURPLE_CHIP = '#F0EDF8';
const AMBER = '#BA7517';
const AMBER_CHIP = '#FEF3E2';

function FlameIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="#fff" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
    </Svg>
  );
}

export default function PorivSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [cravingsToday, setCravingsToday] = useState(0);
  const [pressed, setPressed] = useState(false);

  const flameAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);

  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  // Count cravings survived today
  useEffect(() => {
    if (!userId) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('cravings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today)
      .then(({ count }) => {
        if (count !== null) setCravingsToday(count);
      });
  }, [userId]);

  // Flame animation
  useEffect(() => {
    const flameLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.06, duration: 1300, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.08, duration: 1600, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    );
    flameLoop.start();
    glowLoop.start();
    return () => { flameLoop.stop(); glowLoop.stop(); };
  }, []);

  // Next milestone: find nearest unlocked day milestone
  const daysClean = stats.timeDisplay.days;
  const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30, 50, 66, 90, 100, 180, 365];
  const nextMilestoneDay = MILESTONE_DAYS.find((d) => d > daysClean) ?? 365;
  const daysToNext = nextMilestoneDay - daysClean;

  return (
    <LinearGradient
      colors={[colors.emberTop, colors.ember]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.root}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />

        {/* Flame illustration */}
        <View style={styles.flameContainer}>
          <Animated.View style={[styles.glowOuter, { transform: [{ scale: glowAnim }] }]} />
          <Animated.View style={[styles.glowMid, { transform: [{ scale: glowAnim }], opacity: 0.7 }]} />
          <Animated.View style={[styles.flameIcon, { transform: [{ scale: flameAnim }] }]}>
            <FlameIcon />
          </Animated.View>
        </View>

        {/* Thin accent line */}
        <View style={styles.accentLine} />

        {/* Headline */}
        <Text weight="bold" color="#fff" style={styles.headline}>
          Izdržao/la si.
        </Text>

        {/* Subtext */}
        <Text weight="regular" color="rgba(255,255,255,0.88)" style={styles.subtext}>
          Poriv traje 3–5 minuta.{'\n'}Tvoj je upravo prošao.
        </Text>

        {/* Cravings count card */}
        <View style={styles.card}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.ember}>
            <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
          </Svg>
          <View style={{ marginLeft: 14 }}>
            <Text weight="regular" size="sm" color={colors.textMuted}>Danas si odoleo/la već</Text>
            <Text weight="semibold" color={colors.ember} style={styles.cardValue}>{cravingsToday} puta</Text>
          </View>
        </View>

        {/* Brain fact card */}
        <View style={styles.card}>
          <View style={[styles.chip, { backgroundColor: PURPLE_CHIP }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6A2.5 2.5 0 0 0 9 18a2.5 2.5 0 0 0 3 .5 2.5 2.5 0 0 0 3-.5 2.5 2.5 0 0 0 1.5-4.4A3 3 0 0 0 15 8a3 3 0 0 0-3-3Z" />
              <Path d="M12 5v14" />
            </Svg>
          </View>
          <Text weight="regular" size="sm" color={colors.bodyText} style={styles.factText}>
            Svaki put kad odolevaš, mozak uči da porivi prolaze.
          </Text>
        </View>

        {/* Next milestone card */}
        <View style={styles.card}>
          <View style={[styles.chip, { backgroundColor: AMBER_CHIP }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
              <Path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4" />
              <Path d="M17 6h2.5a2.5 2.5 0 0 1-2.5 4" />
              <Path d="M10 14.5V18M14 14.5V18M8 20h8" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text weight="regular" size="sm" color={colors.textMuted}>Do sledećeg milestonea</Text>
            <Text weight="semibold" color={colors.text} style={styles.milestoneValue}>
              Dan {nextMilestoneDay} — još {daysToNext} {daysToNext === 1 ? 'dan' : 'dana'}
            </Text>
          </View>
        </View>

        <View style={styles.spacerBottom} />
      </ScrollView>

      {/* Home button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.homeBtn, pressed && styles.homeBtnPressed]}
          onPress={() => router.replace('/(tabs)')}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          activeOpacity={0.92}
        >
          <Text weight="bold" size="base" color={colors.ember}>Nazad na početnu</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  spacer: {
    height: 32,
  },
  spacerBottom: {
    height: 28,
  },
  flameContainer: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  glowMid: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  flameIcon: {
    position: 'absolute',
  },
  accentLine: {
    width: 40,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  headline: {
    fontSize: 36,
    letterSpacing: -0.5,
    marginTop: 32,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 18,
    lineHeight: 28.8,
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    shadowColor: 'rgba(120,40,0,1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 8,
  },
  cardValue: {
    fontSize: 22,
    marginTop: 1,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  factText: {
    flex: 1,
    lineHeight: 21,
    paddingTop: 4,
  },
  milestoneValue: {
    fontSize: 18,
    marginTop: 1,
  },
  footer: {
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  homeBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(120,40,0,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  homeBtnPressed: {
    shadowOpacity: 0.08,
  },
});
