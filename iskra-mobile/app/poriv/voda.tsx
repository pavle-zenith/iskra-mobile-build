// Water tool — animated water rise over 45s
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { IcoX } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';

const BLUE = '#2D6FA8';
const BLUE_LIGHT = '#EBF4FB';
const DURATION = 45000; // 45 seconds

const { height: SCREEN_H } = Dimensions.get('window');
const WATER_HEIGHT = SCREEN_H * 0.72;

export default function PorivVodaScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();
  const [secs, setSecs] = useState(45);
  const riseAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rise animation
    Animated.timing(riseAnim, {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: false,
    }).start(() => {
      router.replace({ pathname: '/poriv/success', params: { strength, trigger } });
    });

    // Countdown
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);

    // Wave oscillation
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    );
    loop.start();

    return () => {
      clearInterval(t);
      loop.stop();
    };
  }, []);

  const waterTop = riseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [WATER_HEIGHT, 0],
  });

  const waveX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke={BLUE} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.topLabel}>PIJEM VODU</Text>
        <Text weight="bold" style={styles.timerBadge}>{secs}s</Text>
      </View>

      {/* Main area */}
      <View style={styles.main}>
        {/* Text that changes color as water covers it */}
        <View style={styles.textContainer}>
          <Text weight="medium" color={BLUE} style={styles.mainText}>
            Svaki gutljaj
          </Text>
          <Text weight="medium" color={BLUE} style={styles.mainText}>
            smiruje nervni sistem.
          </Text>
          <Text weight="regular" size="sm" color={BLUE} style={styles.subText}>
            Pij polako, svaki gutljaj sa pažnjom.
          </Text>
        </View>

        {/* Water rise */}
        <Animated.View style={[styles.waterContainer, { top: waterTop }]}>
          {/* Wave top */}
          <Animated.View style={[styles.waveLine, { transform: [{ translateX: waveX }] }]} />
          <View style={styles.waterBody} />
        </Animated.View>
      </View>

      {/* Skip button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity onPress={() => router.replace({ pathname: '/poriv/success', params: { strength, trigger } })}>
          <Text weight="medium" size="sm" color="rgba(45,111,168,0.5)" style={{ textDecorationLine: 'underline' }}>
            Završio/la sam
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
  },
  topBar: {
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
    backgroundColor: 'rgba(45,111,168,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontSize: 11,
    color: BLUE,
    letterSpacing: 2,
  },
  timerBadge: {
    fontSize: 13,
    color: BLUE,
    fontVariant: ['tabular-nums'],
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 40,
    zIndex: 2,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 28,
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 38,
  },
  subText: {
    marginTop: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  waterContainer: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: 0,
  },
  waveLine: {
    height: 24,
    backgroundColor: 'rgba(45,111,168,0.15)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  waterBody: {
    backgroundColor: 'rgba(45,111,168,0.12)',
    height: SCREEN_H,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
});
