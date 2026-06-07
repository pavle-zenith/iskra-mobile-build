import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, radii, gradients, shadows } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 7;
const MAX_REASONS = 3;

function HeartIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function PeopleIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CoinIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth={sw} />
      <Path d="M18.09 10.37A6 6 0 1 1 10.34 18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M7 6h1v4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}
function DumbbellIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 7v10M4 9.5v5M18 7v10M20 9.5v5M6 12h12" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function BirdIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 13 Q8 7 12 13 Q16 7 20 13" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function StethoIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3v5a4 4 0 0 0 8 0V3" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12v3a5 5 0 0 0 10 0v-1.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="19" cy="11" r="2" stroke={color} strokeWidth={sw} />
    </Svg>
  );
}

const REASONS = [
  { key: 'zdravlje', label: 'Zdravlje', color: '#D4547E', Icon: HeartIcon },
  { key: 'porodica', label: 'Porodica', color: '#4A6080', Icon: PeopleIcon },
  { key: 'pare', label: 'Pare', color: '#2E8B80', Icon: CoinIcon },
  { key: 'forma', label: 'Fizička forma', color: '#3A7A3A', Icon: DumbbellIcon },
  { key: 'sloboda', label: 'Sloboda', color: '#6B52A8', Icon: BirdIcon },
  { key: 'pritisak', label: 'Pritisak doktora ili partnera', color: '#BA7517', Icon: StethoIcon },
];

function ReasonPill({
  reason,
  selected,
  onPress,
}: {
  reason: typeof REASONS[0];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.pillWrapper}>
      {selected ? (
        <LinearGradient
          colors={gradients.ember}
          start={gradients.emberVertical.start}
          end={gradients.emberVertical.end}
          style={[styles.pill, styles.pillSelected]}
        >
          <reason.Icon size={24} color="#fff" />
          <Text weight="semibold" size="sm" color="#fff" style={styles.pillLabel}>{reason.label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.pill, styles.pillUnselected]}>
          <reason.Icon size={24} color={reason.color} />
          <Text weight="semibold" size="sm" color={colors.text} style={styles.pillLabel}>{reason.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ReasonsScreen() {
  const { reasons: stored, setReasons } = useOnboardingStore();
  const [sel, setSel] = useState<string[]>(stored || []);
  const ready = sel.length >= 1;

  function toggle(key: string) {
    setSel((cur) => {
      if (cur.includes(key)) return cur.filter((k) => k !== key);
      if (cur.length >= MAX_REASONS) return cur;
      return [...cur, key];
    });
  }

  function handleNext() {
    if (!ready) return;
    setReasons(sel);
    router.push('/onboarding/reason-text');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Zašto hoćeš da prestaneš?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Izaberi do 3 razloga. Koristićemo ih tokom tvog putovanja.
        </Text>
      </View>

      <View style={styles.grid}>
        {REASONS.map((r) => (
          <ReasonPill
            key={r.key}
            reason={r}
            selected={sel.includes(r.key)}
            onPress={() => toggle(r.key)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <EmberButton
          label="Nastavi"
          onPress={handleNext}
          disabled={!ready}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  questionBlock: {
    paddingHorizontal: 26,
    paddingTop: 34,
  },
  title: {
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  sub: {
    marginTop: 12,
    lineHeight: 22,
  },
  grid: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignContent: 'flex-start',
  },
  pillWrapper: {
    width: '47.5%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  pill: {
    minHeight: 104,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },
  pillSelected: {
    ...shadows.ember,
  },
  pillUnselected: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.borderInput,
  },
  pillLabel: {
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 26,
    paddingVertical: 16,
    paddingBottom: 16,
  },
});
