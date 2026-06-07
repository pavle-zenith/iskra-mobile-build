import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, radii, gradients, shadows } from '../../src/theme/tokens';
import { format, parseISO } from 'date-fns';

const TOTAL_STEPS = 18;
const STEP = 14;

const MONTHS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];
const DOW = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function ArrowLeft({ color = '#7A766F' }: { color?: string }) {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15">
      <Path d="M7 1.5l-6 6 6 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ArrowRight({ color = '#7A766F' }: { color?: string }) {
  return (
    <Svg width={9} height={15} viewBox="0 0 9 15">
      <Path d="M2 1.5l6 6-6 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function DateScreen() {
  const { quitDate: stored, setQuitDate } = useOnboardingStore();
  const today = new Date();
  const initialSel = stored ? parseISO(stored) : today;

  const [viewYear, setViewYear] = useState(initialSel.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialSel.getMonth());
  const [sel, setSel] = useState<Date>(initialSel);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Monday-first: getDay() returns 0=Sun, so (0+6)%7=6, (1+6)%7=0, etc.
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const atMin =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  function stepMonth(dir: number) {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  function selectDay(d: number) {
    const date = new Date(viewYear, viewMonth, d);
    const isPast = date < today && !sameDay(date, today);
    if (!isPast) setSel(date);
  }

  function handleConfirm() {
    setQuitDate(format(sel, 'yyyy-MM-dd'));
    router.push('/onboarding/preview');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Koji datum si izabrao/la?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Možeš ga promeniti kasnije.
        </Text>
      </View>

      <View style={styles.calendarWrapper}>
        <View style={styles.calendar}>
          {/* Month navigation */}
          <View style={styles.monthRow}>
            <TouchableOpacity
              onPress={() => !atMin && stepMonth(-1)}
              activeOpacity={atMin ? 1 : 0.7}
              style={[styles.navBtn, atMin && styles.navBtnDisabled]}
            >
              <ArrowLeft color={atMin ? '#D0CCC5' : '#7A766F'} />
            </TouchableOpacity>
            <Text weight="semibold" size="lg" style={styles.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={() => stepMonth(1)}
              activeOpacity={0.7}
              style={styles.navBtn}
            >
              <ArrowRight />
            </TouchableOpacity>
          </View>

          {/* Day-of-week headers */}
          <View style={styles.dowRow}>
            {DOW.map((d) => (
              <Text key={d} weight="semibold" size="xs" color={colors.textSub} style={styles.dowCell}>
                {d}
              </Text>
            ))}
          </View>

          {/* Date grid */}
          <View style={styles.dateGrid}>
            {cells.map((d, i) => {
              if (d === null) return <View key={`e${i}`} style={styles.dateCell} />;
              const date = new Date(viewYear, viewMonth, d);
              const isPast = date < today && !sameDay(date, today);
              const isToday = sameDay(date, today);
              const isSel = sameDay(date, sel);

              return (
                <View key={d} style={styles.dateCell}>
                  <TouchableOpacity
                    onPress={() => selectDay(d)}
                    activeOpacity={isPast ? 1 : 0.7}
                    disabled={isPast}
                    style={styles.dateBtnOuter}
                  >
                    {isSel ? (
                      <LinearGradient
                        colors={gradients.ember}
                        start={gradients.emberVertical.start}
                        end={gradients.emberVertical.end}
                        style={styles.dateBubble}
                      >
                        <Text weight="bold" size="base" color="#fff">{d}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[
                        styles.dateBubble,
                        isToday && styles.dateBubbleToday,
                      ]}>
                        <Text
                          weight="medium"
                          size="base"
                          color={isPast ? colors.textGhost : colors.text}
                        >
                          {d}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <Text weight="regular" size="sm" color={colors.textGhost} style={styles.footnote}>
          Istraživanja pokazuju da postavljanje konkretnog datuma{'\n'}povećava šanse uspeha.
        </Text>
      </View>

      <View style={styles.footer}>
        <EmberButton label="Potvrdi datum" onPress={handleConfirm} />
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
  calendarWrapper: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 24,
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    padding: 22,
    shadowColor: '#1A160F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
    backgroundColor: 'transparent',
  },
  monthLabel: {
    letterSpacing: -0.2,
  },
  dowRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dowCell: {
    flex: 1,
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
  },
  dateCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 2,
  },
  dateBtnOuter: {
    alignItems: 'center',
  },
  dateBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBubbleToday: {
    borderWidth: 1.5,
    borderColor: colors.borderInput,
  },
  footnote: {
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
