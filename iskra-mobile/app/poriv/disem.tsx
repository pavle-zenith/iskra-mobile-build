// Breathing tool — 4-4-4-4 box breathing, 4 rounds → success
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoX } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';

const PHASES = ['Udahni', 'Zadrži', 'Izdahni', 'Zadrži'] as const;
const PHASE_SECS = 4;
const TOTAL_ROUNDS = 4;

const TEAL = '#2E8B80';
const TEAL_LIGHT = 'rgba(46,139,128,0.2)';

export default function PorivDisemScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();

  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(PHASE_SECS);
  const [done, setDone] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  // Phase tick
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTick((prev) => {
        if (prev <= 1) {
          // Advance phase
          setPhaseIdx((p) => {
            const next = (p + 1) % 4;
            if (next === 0) {
              // Completed a round
              setRound((r) => {
                if (r >= TOTAL_ROUNDS) {
                  setDone(true);
                }
                return r + 1;
              });
            }
            return next;
          });
          return PHASE_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  // Ring animation — expand on inhale, contract on exhale
  useEffect(() => {
    if (done) return;
    const isExpand = phaseIdx === 0; // Udahni
    const isContract = phaseIdx === 2; // Izdahni

    if (isExpand) {
      Animated.timing(scaleAnim, { toValue: 1.35, duration: PHASE_SECS * 1000, useNativeDriver: true }).start();
      Animated.timing(opacityAnim, { toValue: 0.9, duration: PHASE_SECS * 1000, useNativeDriver: true }).start();
    } else if (isContract) {
      Animated.timing(scaleAnim, { toValue: 0.8, duration: PHASE_SECS * 1000, useNativeDriver: true }).start();
      Animated.timing(opacityAnim, { toValue: 0.35, duration: PHASE_SECS * 1000, useNativeDriver: true }).start();
    }
    // Hold phases stay at current scale
  }, [phaseIdx, done]);

  const phase = PHASES[phaseIdx];
  const phasePct = 1 - (tick / PHASE_SECS);
  const totalPct = ((round - 1 + phasePct / 4) / TOTAL_ROUNDS);

  if (done) {
    router.replace({ pathname: '/poriv/success', params: { strength, trigger } });
    return null;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke="rgba(255,255,255,0.6)" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.topLabel}>DIŠEM</Text>
        <Text weight="medium" size="sm" color="rgba(255,255,255,0.5)">{round}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Main breathing ring */}
      <View style={styles.center}>
        {/* Outer glow rings */}
        <Animated.View style={[styles.glowOuter, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
        <Animated.View style={[styles.glowMid, { transform: [{ scale: scaleAnim }] }]} />

        {/* Inner text */}
        <View style={styles.ringInner}>
          <Text weight="semibold" color="#fff" style={styles.phaseText}>{phase}</Text>
          <Text weight="bold" color={TEAL} style={styles.tickText}>{tick}</Text>
        </View>
      </View>

      {/* Round indicators */}
      <View style={styles.roundDots}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.roundDot,
              i < round - 1 && styles.roundDotDone,
              i === round - 1 && !done && styles.roundDotActive,
            ]}
          />
        ))}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressArea, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${totalPct * 100}%` }]} />
        </View>
        <Text weight="regular" size="xs" color="rgba(255,255,255,0.4)" style={{ textAlign: 'center', marginTop: 12 }}>
          Svaki ciklus: 4 sekunde × 4 faze
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.toolDisem,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: TEAL_LIGHT,
  },
  glowMid: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(46,139,128,0.35)',
  },
  ringInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  phaseText: {
    fontSize: 14,
    color: '#fff',
  },
  tickText: {
    fontSize: 32,
    lineHeight: 36,
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  roundDots: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  roundDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roundDotDone: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  roundDotActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  progressArea: {
    width: '100%',
    paddingHorizontal: 26,
  },
  progressTrack: {
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 999,
  },
});
