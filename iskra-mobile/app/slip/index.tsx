// Slip screen — non-judgmental, warm, safe response to a slip
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { colors, shadows } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';

const AMBER = '#BA7517';
const AMBER_CHIP = '#FEF3E2';

function FlameIllustration() {
  return (
    <View style={styles.illContainer}>
      <View style={styles.illGlow} />
      <Svg width={46} height={46} viewBox="0 0 24 24" fill={colors.ember}>
        <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
      </Svg>
    </View>
  );
}

export default function SlipScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const continuePressAnim = useRef(new Animated.Value(1)).current;
  const reflectPressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);

  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  // Write slip record to DB
  const writeSlip = async () => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from('slips').insert({ user_id: userId, date: today });
      // Update today's checkin to slip
      await supabase.from('checkins').upsert({
        user_id: userId,
        date: today,
        status: 'slip',
      }, { onConflict: 'user_id,date' });
    } catch {}
  };

  const handleContinue = async () => {
    await writeSlip();
    router.push('/slip/recap' as any);
  };

  const handleReflect = async () => {
    await writeSlip();
    router.push('/slip/reflect' as any);
  };

  const onContinuePressIn = () => Animated.spring(continuePressAnim, { toValue: 0.985, useNativeDriver: true }).start();
  const onContinuePressOut = () => Animated.spring(continuePressAnim, { toValue: 1, useNativeDriver: true }).start();

  const totalDays = stats.totalDaysClean ?? 0;
  const hours = stats.timeDisplay?.hours ?? 0;
  const minutes = stats.timeDisplay?.minutes ?? 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={styles.center}>
          <FlameIllustration />

          {/* Headline */}
          <Text weight="semibold" color={colors.text} style={styles.headline}>
            Jedan dan ne definiše put.
          </Text>
          <Text weight="regular" color={colors.textSub} style={styles.subtext}>
            Svako ko je prestao je imao ovaj dan. Ti si i dalje ovde — to je važno.
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Total timer card — never resets */}
          <View style={styles.timerCard}>
            <Text weight="bold" style={styles.timerEyebrow}>
              {totalDays} DANA IZA TEBE.
            </Text>
            <Text weight="medium" color={colors.text} style={styles.timerValue}>
              {totalDays} dana · {String(hours).padStart(2, '0')} sati · {String(minutes).padStart(2, '0')} minuta
            </Text>
            <Text weight="regular" size="xs" color={colors.textFaint} style={styles.timerNote}>
              I dalje brojiš. Ne resetuje se.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTAs */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {/* Primary — Nastavljam */}
        <Animated.View style={{ transform: [{ scale: continuePressAnim }] }}>
          <Pressable
            onPress={handleContinue}
            onPressIn={onContinuePressIn}
            onPressOut={onContinuePressOut}
          >
            <LinearGradient
              colors={[colors.emberTop, colors.ember]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text weight="bold" size="lg" color="#fff">Nastavljam</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Secondary — Šta me je nateralo? */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleReflect}
          activeOpacity={0.7}
        >
          <Text weight="semibold" size="base" color={colors.textSub}>
            Šta me je nateralo?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: '0px 30px' as any,
    paddingHorizontal: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  illContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF0E8',
  },
  headline: {
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 24,
  },
  subtext: {
    fontSize: 16,
    lineHeight: 25.6,
    textAlign: 'center',
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 28,
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  timerEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    color: AMBER,
  },
  timerValue: {
    fontSize: 20,
    letterSpacing: -0.2,
    marginTop: 8,
  },
  timerNote: {
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 26,
    paddingTop: 12,
    gap: 12,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.ember,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
