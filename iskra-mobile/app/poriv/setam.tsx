// Walking tool — forest green, pulsing trail dots, step counter
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoX } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';

const GREEN = '#3A7A3A';
const GREEN_LIGHT = 'rgba(58,122,58,0.2)';
const NUM_DOTS = 7;

export default function PorivSetamScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();
  const [steps, setSteps] = useState(0);
  const [secs, setSecs] = useState(0);
  const dotAnims = useRef(Array.from({ length: NUM_DOTS }, () => new Animated.Value(0))).current;

  // Timer & step counter
  useEffect(() => {
    const t = setInterval(() => {
      setSecs((s) => s + 1);
      // Simulate ~1 step per second (placeholder — real pedometer would use expo-sensors)
      setSteps((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Sequential pulsing dots
  useEffect(() => {
    let i = 0;
    const pulse = () => {
      const dot = dotAnims[i % NUM_DOTS];
      Animated.sequence([
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
      i++;
    };
    const t = setInterval(pulse, 400);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke="rgba(255,255,255,0.5)" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.topLabel}>ŠETAM</Text>
        <Text weight="bold" style={styles.timerText}>{formatTime(secs)}</Text>
      </View>

      {/* Main content */}
      <View style={styles.center}>
        {/* Walking trail */}
        <View style={styles.trailContainer}>
          {dotAnims.map((anim, i) => {
            const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
            const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.trailDot,
                  {
                    transform: [{ scale }],
                    opacity,
                    marginLeft: i % 2 === 0 ? 0 : 28,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Walker icon */}
        <View style={styles.walkerIcon}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <SvgCircle cx={13} cy={4.5} r={1.8} />
            <Path d="M11 21l1.5-6-2.5-2 1-5 3 2 2 1.5" />
            <Path d="M10 13l-2 3-2 1" />
            <Path d="M12.5 15l1.5 2.5" />
          </Svg>
        </View>

        {/* Step count */}
        <Text weight="bold" color="#fff" style={styles.stepCount}>{steps}</Text>
        <Text weight="medium" size="sm" color="rgba(255,255,255,0.6)">koraka</Text>

        {/* Motivational copy */}
        <Text weight="regular" size="sm" color="rgba(255,255,255,0.5)" style={styles.copy}>
          Šetaj dok ne prođe.{'\n'}Porivi traju 3–5 minuta.
        </Text>
      </View>

      {/* Done button */}
      <TouchableOpacity
        style={[styles.doneBtn, { marginBottom: insets.bottom + 16 }]}
        onPress={() => router.replace({ pathname: '/poriv/success', params: { strength, trigger } })}
        activeOpacity={0.85}
      >
        <Text weight="bold" size="base" color={GREEN}>Završio/la sam</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.toolSetam,
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
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  timerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontVariant: ['tabular-nums'],
    fontFamily: 'Manrope_700Bold',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  trailContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
    alignItems: 'flex-start',
    width: 80,
  },
  trailDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  walkerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  stepCount: {
    fontSize: 48,
    lineHeight: 56,
    marginTop: 24,
    fontVariant: ['tabular-nums'],
  },
  copy: {
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
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
});
