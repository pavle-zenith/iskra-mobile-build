import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { IcoChevronRight } from '../../src/components/icons';
import { colors, radii, gradients, shadows } from '../../src/theme/tokens';
import type { Timing } from '../../src/types';
import { format } from 'date-fns';

const TOTAL_STEPS = 18;
const STEP = 13;

function BoltIcon({ size = 23, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function CalIcon({ size = 23, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function CheckCircleIcon({ size = 23, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={sw} /><Path d="m8.5 12 2.5 2.5 4.5-5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

const OPTIONS: { key: Timing; title: string; sub: string; color: string; Icon: React.ComponentType<any> }[] = [
  { key: 'odmah', title: 'Odmah', sub: 'Počinjemo danas', color: colors.ember, Icon: BoltIcon },
  { key: 'uskoro', title: 'Uskoro', sub: 'Izaberi datum', color: '#4A6080', Icon: CalIcon },
  { key: 'vec_prestao', title: 'Već sam prestao/la', sub: 'Nastavljam streak', color: '#3A7A3A', Icon: CheckCircleIcon },
];

function TimingCard({
  option,
  selected,
  onPress,
}: {
  option: typeof OPTIONS[0];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardWrapper}>
      {selected ? (
        <LinearGradient
          colors={gradients.ember}
          start={gradients.emberVertical.start}
          end={gradients.emberVertical.end}
          style={[styles.card, styles.cardSelected]}
        >
          <View style={styles.chip}>
            <option.Icon size={23} color={colors.ember} />
          </View>
          <View style={styles.textBlock}>
            <Text weight="medium" size="md" color="#fff" style={styles.cardTitle}>{option.title}</Text>
            <Text weight="regular" size="sm" color="rgba(255,255,255,0.85)" style={{ marginTop: 3 }}>{option.sub}</Text>
          </View>
          <IcoChevronRight size={9} stroke="#fff" strokeWidth={2} />
        </LinearGradient>
      ) : (
        <View style={[styles.card, styles.cardUnselected]}>
          <View style={styles.chip}>
            <option.Icon size={23} color={option.color} />
          </View>
          <View style={styles.textBlock}>
            <Text weight="medium" size="md" color={colors.text} style={styles.cardTitle}>{option.title}</Text>
            <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 3 }}>{option.sub}</Text>
          </View>
          <IcoChevronRight size={9} stroke="#CFCBC4" strokeWidth={2} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TimingScreen() {
  const { timing: stored, setTiming, setQuitDate } = useOnboardingStore();
  const [sel, setSel] = useState<Timing | null>(stored);

  function choose(key: Timing) {
    setSel(key);
    setTiming(key);

    setTimeout(() => {
      if (key === 'odmah') {
        setQuitDate(format(new Date(), 'yyyy-MM-dd'));
        router.push('/onboarding/preview');
      } else if (key === 'uskoro') {
        router.push('/onboarding/date');
      } else if (key === 'vec_prestao') {
        router.push('/onboarding/date');
      }
    }, 280);
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Kada hoćeš da prestaneš?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Nema pogrešnog odgovora.
        </Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((o) => (
          <TimingCard
            key={o.key}
            option={o}
            selected={sel === o.key}
            onPress={() => choose(o.key)}
          />
        ))}
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
  options: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 28,
    gap: 12,
  },
  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardSelected: {
    ...shadows.ember,
  },
  cardUnselected: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.borderInput,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  cardTitle: {
    letterSpacing: -0.2,
  },
});
