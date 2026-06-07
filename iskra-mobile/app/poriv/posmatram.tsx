// Urge-surfing observation tool — deep indigo, wave surface animation
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { IcoX } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';

const INDIGO = '#4B5E8A';
const INDIGO_LIGHT = 'rgba(75,94,138,0.3)';
const STEPS = [
  'Primeti poriv. Ne bori se.',
  'Posmatraj ga kao talas.',
  'Talas raste, ali i prolazi.',
  'Ostani sa njim još malo.',
  'Sada ga pusti.',
];

export default function PorivPosmatramScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();

  const [stepIdx, setStepIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  const waveAnim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Wave animations
  useEffect(() => {
    const w1 = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    );
    const w2 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(wave2Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    w1.start();
    w2.start();
    return () => { w1.stop(); w2.stop(); };
  }, []);

  // Step progression every 8s
  useEffect(() => {
    const t = setInterval(() => {
      setSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const targetStep = Math.min(Math.floor(secs / 8), STEPS.length - 1);
    if (targetStep !== stepIdx) {
      // Fade out, change, fade in
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setStepIdx(targetStep);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }
  }, [secs, stepIdx]);

  const waveX = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });
  const wave2X = wave2Anim.interpolate({ inputRange: [0, 1], outputRange: [15, -15] });

  const isDone = secs >= STEPS.length * 8;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke="rgba(255,255,255,0.4)" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.topLabel}>POSMATRAM</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Waves */}
      <View style={styles.waveArea}>
        <Animated.View style={[styles.wave, styles.wave1, { transform: [{ translateX: waveX }] }]} />
        <Animated.View style={[styles.wave, styles.wave2, { transform: [{ translateX: wave2X }] }]} />
        <Animated.View style={[styles.wave, styles.wave3, { transform: [{ translateX: waveX }] }]} />
      </View>

      {/* Center instruction */}
      <View style={styles.center}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text weight="medium" color="rgba(255,255,255,0.9)" style={styles.stepText}>
            {STEPS[stepIdx]}
          </Text>
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.stepDots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i <= stepIdx && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Done button */}
      {isDone ? (
        <TouchableOpacity
          style={[styles.doneBtn, { marginBottom: insets.bottom + 16 }]}
          onPress={() => router.replace({ pathname: '/poriv/success', params: { strength, trigger } })}
          activeOpacity={0.85}
        >
          <Text weight="bold" size="base" color={INDIGO}>Završio/la sam</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.skipBtn, { marginBottom: insets.bottom + 16 }]}
          onPress={() => router.replace({ pathname: '/poriv/success', params: { strength, trigger } })}
        >
          <Text weight="medium" size="sm" color="rgba(255,255,255,0.3)" style={{ textDecorationLine: 'underline' }}>
            Preskočiti
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.toolPosmatram,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
  waveArea: {
    position: 'absolute',
    top: '30%',
    left: -40,
    right: -40,
    height: 200,
    opacity: 0.25,
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: INDIGO_LIGHT,
  },
  wave1: { top: 0 },
  wave2: { top: 40, opacity: 0.6 },
  wave3: { top: 80, opacity: 0.4 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stepText: {
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepDotActive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  doneBtn: {
    marginHorizontal: 26,
    width: '86%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
