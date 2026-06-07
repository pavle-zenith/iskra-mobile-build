import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, radii, gradients, shadows } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 12;

function CoffeeIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function ForkIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2M5 11v11M19 2v20M19 14c2 0 2.5-2 2.5-5 0-4-1-7-2.5-7s-2.5 3-2.5 7c0 3 .5 5 2.5 5Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function BeerIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 11h1a3 3 0 0 1 0 6h-1M9 12v6M13 12v6M14 7.5c1.5 0 3 .8 3 2.5v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10c0-1.7 1.5-2.5 3-2.5M7 7.5a2.5 2.5 0 0 1 .5-4.5A3 3 0 0 1 13 3a2.5 2.5 0 0 1 1 4.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function StormIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="m13 12-3 5h4l-3 5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function PeopleIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} /><Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function LaptopIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="5" width="18" height="11" rx="2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="M2 20h20" stroke={color} strokeWidth={sw} strokeLinecap="round" /></Svg>;
}
function ClockIcon({ size = 24, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={sw} /><Path d="M12 7v5l3.5 2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

const TRIGGERS = [
  { key: 'kafa', label: 'Jutarnja kafa', color: '#BA7517', Icon: CoffeeIcon },
  { key: 'jelo', label: 'Posle jela', color: '#3A7A3A', Icon: ForkIcon },
  { key: 'alkohol', label: 'Kafana i alkohol', color: '#6B52A8', Icon: BeerIcon },
  { key: 'stres', label: 'Stres na poslu', color: '#4A6080', Icon: StormIcon },
  { key: 'kolege', label: 'Pauza sa kolegama', color: '#D4547E', Icon: PeopleIcon },
  { key: 'komp', label: 'Sedenje za kompom', color: '#2E8B80', Icon: LaptopIcon },
  { key: 'dosada', label: 'Čekanje i dosada', color: '#999999', Icon: ClockIcon },
];

function TriggerPill({
  trigger,
  selected,
  onPress,
  fullWidth,
}: {
  trigger: typeof TRIGGERS[0];
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.pillWrapper, fullWidth && styles.pillFull]}
    >
      {selected ? (
        <LinearGradient
          colors={gradients.ember}
          start={gradients.emberVertical.start}
          end={gradients.emberVertical.end}
          style={[styles.pill, styles.pillSelected, fullWidth && styles.pillFullHeight]}
        >
          <trigger.Icon size={24} color="#fff" />
          <Text weight="semibold" size="xs" color="#fff" style={styles.pillLabel}>{trigger.label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.pill, styles.pillUnselected, fullWidth && styles.pillFullHeight]}>
          <trigger.Icon size={24} color={trigger.color} />
          <Text weight="semibold" size="xs" color={colors.text} style={styles.pillLabel}>{trigger.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TriggersScreen() {
  const { triggers: stored, setTriggers } = useOnboardingStore();
  const [sel, setSel] = useState<string[]>(stored || []);
  const ready = sel.length >= 1;

  function toggle(key: string) {
    setSel((cur) => cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  }

  function handleNext() {
    if (!ready) return;
    setTriggers(sel);
    router.push('/onboarding/timing');
  }

  // First 6 in 2-col grid, last one full width
  const gridTriggers = TRIGGERS.slice(0, 6);
  const fullWidthTrigger = TRIGGERS[6];

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Kada ti se najviše puši?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Koristićemo ovo da ti pomognemo u tim konkretnim momentima.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {gridTriggers.map((t) => (
            <TriggerPill
              key={t.key}
              trigger={t}
              selected={sel.includes(t.key)}
              onPress={() => toggle(t.key)}
            />
          ))}
          {fullWidthTrigger && (
            <TriggerPill
              trigger={fullWidthTrigger}
              selected={sel.includes(fullWidthTrigger.key)}
              onPress={() => toggle(fullWidthTrigger.key)}
              fullWidth
            />
          )}
        </View>
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pillWrapper: {
    width: '47.5%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  pillFull: {
    width: '100%',
  },
  pill: {
    minHeight: 104,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },
  pillFullHeight: {
    minHeight: 68,
    flexDirection: 'row',
    gap: 14,
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
