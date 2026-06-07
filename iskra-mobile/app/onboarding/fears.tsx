import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
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
const STEP = 10;

function BoltIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function StormIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="m13 12-3 5h4l-3 5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function ChatIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function WarnIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function FlameIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function ScaleIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

const FEARS = [
  { key: 'porivi', label: 'Jaki porivi', color: '#E8621A', Icon: BoltIcon },
  { key: 'stres', label: 'Stres bez cigarete', color: '#4A6080', Icon: StormIcon },
  { key: 'kafana', label: 'Kafana i društvo', color: '#6B52A8', Icon: ChatIcon },
  { key: 'neuspeh', label: 'Strah od neuspeha', color: '#BA7517', Icon: WarnIcon },
  { key: 'razdraz', label: 'Razdražljivost', color: '#D4547E', Icon: FlameIcon },
  { key: 'kilaza', label: 'Dobitak na kilaži', color: '#3A7A3A', Icon: ScaleIcon },
];

function FearPill({
  fear,
  selected,
  onPress,
}: {
  fear: typeof FEARS[0];
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
          <fear.Icon size={24} color="#fff" />
          <Text weight="semibold" size="sm" color="#fff" style={styles.pillLabel}>{fear.label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.pill, styles.pillUnselected]}>
          <fear.Icon size={24} color={fear.color} />
          <Text weight="semibold" size="sm" color={colors.text} style={styles.pillLabel}>{fear.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function FearsScreen() {
  const { fears: stored, setFears } = useOnboardingStore();
  const [sel, setSel] = useState<string[]>(stored || []);
  const ready = sel.length >= 1;

  function toggle(key: string) {
    setSel((cur) => cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  }

  function handleNext() {
    if (!ready) return;
    setFears(sel);
    router.push('/onboarding/fear-reflection');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Šta te brine kod prestanka?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Budi iskren/a. Tu smo da pomognemo.
        </Text>
      </View>

      <View style={styles.grid}>
        {FEARS.map((f) => (
          <FearPill
            key={f.key}
            fear={f}
            selected={sel.includes(f.key)}
            onPress={() => toggle(f.key)}
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
