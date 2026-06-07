import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { colors } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 16;

function FlameIcon({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
      <Path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </Svg>
  );
}

export default function PanicScreen() {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.55)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.035, duration: 1700, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1700, useNativeDriver: true }),
      ])
    ).start();

    // Pulse ring 1
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulse1, { toValue: 1.7, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulse1Opacity, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();

    // Pulse ring 2 (staggered)
    const t2 = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(pulse2, { toValue: 1.7, duration: 2400, useNativeDriver: true }),
          Animated.timing(pulse2Opacity, { toValue: 0, duration: 2400, useNativeDriver: true }),
        ])
      ).start();
    }, 1200);

    return () => clearTimeout(t2);
  }, []);

  function handlePress() {
    router.push('/onboarding/commitment');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      {/* Top copy */}
      <View style={styles.topBlock}>
        <Text weight="bold" size="xs" color={colors.ember} style={styles.eyebrow}>
          PROBA
        </Text>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Hajde da vežbamo jedan trenutak.
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Zatvori oči. Zamisli da ti se sada puši. Oseti taj osećaj. Kad budeš spreman/na — pritisni.
        </Text>
      </View>

      {/* Panic button */}
      <View style={styles.btnArea}>
        <View style={styles.btnContainer}>
          {/* Pulse rings */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulse1 }],
                opacity: pulse1Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulse2 }],
                opacity: pulse2Opacity,
              },
            ]}
          />
          {/* Dashed outer ring */}
          <View style={styles.dashedRing} />
          {/* Main button */}
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.88}
            style={styles.bigBtn}
          >
            <Animated.View
              style={[
                styles.bigBtnInner,
                { transform: [{ scale: breatheAnim }] },
              ]}
            >
              <FlameIcon size={48} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Text weight="medium" size="base" color={colors.ember} style={styles.btnLabel}>
          Imam poriv
        </Text>
      </View>

      {/* Bottom note */}
      <View style={styles.bottomNote}>
        <Text weight="regular" size="sm" color={colors.textGhost} style={styles.noteText}>
          Svaki poriv traje 3 do 5 minuta. Iskra će te provesti kroz njega.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  topBlock: {
    paddingHorizontal: 26,
    paddingTop: 30,
  },
  eyebrow: {
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  sub: {
    marginTop: 14,
    lineHeight: 24,
  },
  btnArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.ember,
  },
  dashedRing: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 1.5,
    borderColor: 'rgba(232,98,26,0.3)',
    borderStyle: 'dashed',
  },
  bigBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.42,
    shadowRadius: 44,
    elevation: 14,
  },
  bigBtnInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.ember,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    marginTop: 30,
  },
  bottomNote: {
    paddingHorizontal: 40,
    paddingBottom: 16,
    flexShrink: 0,
  },
  noteText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
