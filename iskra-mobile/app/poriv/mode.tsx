import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { colors } from '../../src/theme/tokens';

const TOTAL_SECS = 5 * 60; // 5 minutes

const TOOLS = [
  { key: 'disem', label: 'Dišem', bg: '#2E8B80', Icon: LungsIcon },
  { key: 'igram', label: 'Igram se', bg: '#6B52A8', Icon: PuzzleIcon },
  { key: 'razlozi', label: 'Moji razlozi', bg: '#E8621A', Icon: HeartIcon },
  { key: 'voda', label: 'Pijem vodu', bg: '#4A8AC4', Icon: DropIcon },
  { key: 'setam', label: 'Šetam', bg: '#3A7A3A', Icon: WalkIcon },
  { key: 'posmatram', label: 'Posmatram', bg: '#3D3830', Icon: EyeIcon },
];

// Tool icons
function LungsIcon() {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 4v8" /><Path d="M9.5 9.5c-2 0-4 2-4 6 0 2 .5 4 2.2 4 1.3 0 1.8-1.1 1.8-2.6V11c0-.85-.7-1.5-1.5-1.5Z" /><Path d="M14.5 9.5c2 0 4 2 4 6 0 2-.5 4-2.2 4-1.3 0-1.8-1.1-1.8-2.6V11c0-.85.7-1.5 1.5-1.5Z" /></Svg>;
}
function PuzzleIcon() {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M19.4 13a2 2 0 0 0 0-2.8 2 2 0 0 0-2.4-.3 1.5 1.5 0 0 1-2-2 2 2 0 0 0-.3-2.4 2 2 0 0 0-2.8 0 2 2 0 0 0-.3 2.4 1.5 1.5 0 0 1-2 2 2 2 0 0 0-2.4.3 2 2 0 0 0 0 2.8 1.5 1.5 0 0 1 0 2.8 2 2 0 0 0 0 2.8 2 2 0 0 0 2.4.3 1.5 1.5 0 0 1 2 2 2 2 0 0 0 .3 2.4" /></Svg>;
}
function HeartIcon() {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" /></Svg>;
}
function DropIcon() {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 2.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5Z" /></Svg>;
}
function WalkIcon() {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><SvgCircle cx={13} cy={4.5} r={1.8} /><Path d="M11 21l1.5-6-2.5-2 1-5 3 2 2 1.5" /><Path d="M10 13l-2 3-2 1" /><Path d="M12.5 15l1.5 2.5" /></Svg>;
}
function EyeIcon() {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><SvgCircle cx={12} cy={12} r={3} /></Svg>;
}

// SVG countdown ring
function CountdownRing({ frac }: { frac: number }) {
  const R = 92;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - frac);

  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      <SvgCircle cx={100} cy={100} r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={8} />
      <SvgCircle
        cx={100} cy={100} r={R}
        fill="none"
        stroke="#fff"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        rotation={-90}
        origin="100, 100"
      />
    </Svg>
  );
}

export default function PorivModeScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();
  const level = parseInt(strength ?? '5', 10);

  const [secs, setSecs] = useState(TOTAL_SECS);
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Breathing dot animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 2.4, duration: 1600, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  const frac = secs / TOTAL_SECS;

  const handleTool = (toolKey: string) => {
    router.push({ pathname: `/poriv/${toolKey}` as any, params: { strength: String(level), trigger: trigger ?? '' } });
  };

  return (
    <View style={styles.root}>
      {/* Ember top half */}
      <View style={[styles.topHalf, { paddingTop: insets.top }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/(tabs)')}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round">
              <Path d="M6 6l12 12M18 6L6 18" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text weight="bold" style={styles.modeLabelText}>PORIV MODE</Text>
          </View>
          <View style={styles.levelPill}>
            <Text weight="bold" style={styles.levelText}>Nivo {level}</Text>
          </View>
        </View>

        {/* Countdown ring */}
        <View style={styles.ringContainer}>
          <CountdownRing frac={frac} />
          <View style={styles.ringInner}>
            <Text weight="light" style={styles.timerText}>{mm}:{ss}</Text>
            <Text weight="medium" size="xs" color="rgba(255,255,255,0.8)" style={{ marginTop: 7 }}>minuta</Text>
          </View>
        </View>

        {/* Breathing hint */}
        <View style={styles.breatheRow}>
          <Animated.View style={[styles.breatheDot, { transform: [{ scale: breatheAnim }] }]} />
          <Text weight="regular" size="sm" color="rgba(255,255,255,0.7)" style={{ fontStyle: 'italic', marginLeft: 9 }}>
            Udahni...
          </Text>
        </View>
      </View>

      {/* White bottom half */}
      <ScrollView style={styles.bottomHalf} contentContainerStyle={styles.bottomContent} showsVerticalScrollIndicator={false}>
        {/* Section label */}
        <Text weight="bold" style={styles.sectionLabel}>IZABERI ALAT</Text>

        {/* 2×3 tool grid */}
        <View style={styles.toolGrid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.key}
              style={[styles.toolCard, { backgroundColor: tool.bg }]}
              onPress={() => handleTool(tool.key)}
              activeOpacity={0.85}
            >
              <tool.Icon />
              <Text weight="medium" size="sm" color="#fff" style={{ marginTop: 'auto' as any }}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom progress bar + footer */}
        <View style={[styles.bottomFooter, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${frac * 100}%` }]} />
          </View>
          <View style={styles.footerRow}>
            <Text weight="regular" size="xs" color="#BBB">Porivi traju 3 do 5 minuta.</Text>
            <TouchableOpacity onPress={() => router.push('/slip' as any)}>
              <Text weight="regular" size="xs" color="#999" style={styles.slipLink}>
                Ipak sam zapalio/la
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHalf: {
    backgroundColor: colors.ember,
    paddingBottom: 30,
    flexShrink: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 0,
    position: 'relative',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  topBarCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  modeLabelText: {
    fontSize: 11,
    color: '#fff',
    letterSpacing: 2,
  },
  levelPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    zIndex: 1,
  },
  levelText: {
    fontSize: 11,
    color: '#fff',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    position: 'relative',
    height: 200,
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 52,
    lineHeight: 52,
    color: '#fff',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    fontFamily: 'Manrope_300Light',
  },
  breatheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  breatheDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  bottomHalf: {
    flex: 1,
  },
  bottomContent: {
    padding: 22,
    paddingTop: 22,
    flexGrow: 1,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 13,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '47%',
    height: 88,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bottomFooter: {
    marginTop: 'auto' as any,
    paddingTop: 16,
  },
  progressTrack: {
    height: 2,
    borderRadius: 999,
    backgroundColor: '#EDEAE4',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.ember,
    borderRadius: 999,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  slipLink: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});
