import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DarkLayout } from '../../src/components/onboarding/DarkLayout';
import { Text } from '../../src/components/ui/Text';
import { WhiteButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors } from '../../src/theme/tokens';
import { format, parseISO } from 'date-fns';

const TOTAL_STEPS = 18;
const STEP = 17;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];

function CalIcon({ size = 18, color = '#E8621A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function CoinIcon({ size = 18, color = '#3A7A3A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="8" cy="8" r="6" stroke={color} strokeWidth={sw} /><Path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function CigOffIcon({ size = 18, color = '#4A6080', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2.5" y="13" width="13.5" height="4" rx="1.4" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Line x1="11.5" y1="13" x2="11.5" y2="17" stroke={color} strokeWidth={sw} strokeLinecap="round" /><Path d="M3 4l18 16.5" stroke={color} strokeWidth={sw} strokeLinecap="round" /></Svg>;
}
function FlameIcon({ size = 18, color = '#E8621A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function HeartIcon({ size = 20, color = '#D4547E', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function PeopleIcon({ size = 20, color = '#4A6080', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} /><Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function BirdIcon({ size = 20, color = '#6B52A8', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 13 Q8 7 12 13 Q16 7 20 13" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

function SavingsChart({ annualRSD }: { annualRSD: number }) {
  const W = 300, H = 130, padB = 22, padT = 12;
  const n = MONTHS.length;
  const pts = MONTHS.map((_, i) => ({
    x: (i / (n - 1)) * W,
    y: padT + (1 - i / (n - 1)) * (H - padB - padT),
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y} ${cx} ${p1.y} ${p1.x} ${p1.y}`;
  }
  const area = d + ` L ${W} ${H - padB} L 0 ${H - padB} Z`;
  const end = pts[pts.length - 1];

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="saveFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FAD9C4" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#FEF0E8" stopOpacity="0.2" />
          </SvgLinearGradient>
        </Defs>
        <Path d={area} fill="url(#saveFill)" />
        <Path d={d} fill="none" stroke={colors.ember} strokeWidth="2.5" strokeLinecap="round" />
        <Circle cx={end.x} cy={end.y} r="4.5" fill={colors.ember} stroke="#fff" strokeWidth="2" />
      </Svg>
      <View style={styles.monthLabels}>
        {MONTHS.map((m, i) => (
          <Text key={m} weight="regular" size="xs" color={colors.textSub} style={styles.monthLabel}>
            {m}
          </Text>
        ))}
      </View>
      <View style={[styles.chartTooltip]}>
        <Text weight="bold" size="xs" color="#fff">
          {annualRSD > 0 ? `${Math.round(annualRSD / 1000)}k RSD` : '146k RSD'}
        </Text>
      </View>
    </View>
  );
}

const MILESTONES = [
  { time: '20 min', text: 'Krvni pritisak se normalizuje', color: '#3A7A3A' },
  { time: '8 sati', text: 'Kiseonik u krvi se vraća', color: '#3A7A3A' },
  { time: '48 sati', text: 'Ukus i miris se vraćaju', color: '#2E8B80' },
  { time: '1 nedelja', text: 'Disanje postaje lakše', color: '#2E8B80' },
  { time: '1 mesec', text: 'Pluća rade bolje', color: '#6B52A8' },
  { time: '1 godina', text: 'Rizik od srčanog prepolovljen', color: colors.ember },
];

function WhiteCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const REASON_ICONS: Record<string, React.ComponentType<any>> = {
  zdravlje: HeartIcon,
  porodica: PeopleIcon,
  sloboda: BirdIcon,
};
const REASON_LABELS: Record<string, { label: string; color: string }> = {
  zdravlje: { label: 'Zdravlje', color: '#D4547E' },
  porodica: { label: 'Porodica', color: '#4A6080' },
  pare: { label: 'Pare', color: '#2E8B80' },
  forma: { label: 'Fizička forma', color: '#3A7A3A' },
  sloboda: { label: 'Sloboda', color: '#6B52A8' },
  pritisak: { label: 'Pritisak doktora', color: '#BA7517' },
};

export default function SummaryScreen() {
  const store = useOnboardingStore();
  const annual = store.getAnnualCostRSD();
  const { name, quitDate, cigarettesPerDay, packPriceRSD, reasons } = store;

  const displayName = name || 'Prijatelju';
  const quitDateStr = quitDate ? format(parseISO(quitDate), 'd. MMM yyyy') : 'Danas';
  const cigPerYear = cigarettesPerDay ? cigarettesPerDay * 365 : 7300;

  const stats = [
    { value: quitDateStr, label: 'Datum prestanka', color: colors.ember, chip: '#FBEAE0', Icon: CalIcon },
    { value: String(cigarettesPerDay || 20), label: 'Cigareta dnevno', color: '#4A6080', chip: '#EDF2F8', Icon: CigOffIcon },
    { value: packPriceRSD ? `${packPriceRSD} RSD` : '400 RSD', label: 'Cena kutije', color: '#3A7A3A', chip: '#EDF7ED', Icon: CoinIcon },
    { value: cigPerYear.toLocaleString('sr-RS'), label: 'Cigareta godišnje', color: colors.ember, chip: '#FBEAE0', Icon: FlameIcon },
  ];

  const reasonList = reasons && reasons.length > 0
    ? reasons.filter((r) => REASON_LABELS[r])
    : ['zdravlje', 'porodica', 'sloboda'];

  function handleNext() {
    router.push('/onboarding/notifications');
  }

  return (
    <DarkLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
      scrollable
      footer={
        <>
          <WhiteButton label="Počinjemo" onPress={handleNext} />
          <Text weight="regular" size="xs" color="rgba(255,255,255,0.7)" style={styles.footNote}>
            Možeš promeniti sve podatke u podešavanjima.
          </Text>
        </>
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text weight="bold" size="xs" color="rgba(255,255,255,0.85)" style={styles.eyebrow}>
          TVOJ PLAN
        </Text>
        <Text weight="semibold" size="2xl" color="#fff" style={styles.title}>
          {displayName}, spreman/na si.
        </Text>
        <Text weight="regular" size="sm" color="rgba(255,255,255,0.85)" style={styles.sub}>
          Na osnovu svega što si nam rekao/la, ovo je tvoje putovanje.
        </Text>
      </View>

      <View style={styles.cards}>
        {/* Savings chart */}
        <WhiteCard>
          <View style={styles.chartHeader}>
            <Text weight="medium" size="sm" color={colors.text}>Uštedine tokom godine</Text>
            <Text weight="semibold" size="lg" color="#3A7A3A" style={{ letterSpacing: -0.3 }}>
              {annual > 0 ? `${annual.toLocaleString('sr-RS')} RSD` : '146.000 RSD'}
            </Text>
          </View>
          <SavingsChart annualRSD={annual} />
          <Text weight="regular" size="xs" color={colors.textGhost} style={{ marginTop: 8 }}>
            = 10 dana odmora na moru
          </Text>
        </WhiteCard>

        {/* Quick stats 2x2 */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <View style={[styles.statChip, { backgroundColor: s.chip }]}>
                <s.Icon size={18} color={s.color} />
              </View>
              <Text weight="medium" size="lg" color={colors.text} style={styles.statValue}>{s.value}</Text>
              <Text weight="regular" size="xs" color={colors.textSub} style={{ marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Health milestones */}
        <WhiteCard>
          <Text weight="medium" size="sm" color={colors.text} style={{ marginBottom: 4 }}>Šta te čeka</Text>
          {MILESTONES.map((m, i) => (
            <View key={m.time} style={[styles.milestoneRow, i > 0 && styles.milestoneBorder]}>
              <View style={[styles.milestoneDot, { backgroundColor: m.color }]} />
              <Text weight="semibold" size="xs" color={colors.textSub} style={styles.milestoneTime}>{m.time}</Text>
              <Text weight="regular" size="sm" color={colors.text} style={styles.milestoneText}>{m.text}</Text>
            </View>
          ))}
        </WhiteCard>

        {/* Reasons */}
        <WhiteCard>
          <Text weight="medium" size="sm" color={colors.text} style={{ marginBottom: 4 }}>Tvoji razlozi</Text>
          {reasonList.map((rKey, i) => {
            const info = REASON_LABELS[rKey];
            if (!info) return null;
            const Icon = REASON_ICONS[rKey] || HeartIcon;
            return (
              <View key={rKey} style={[styles.reasonRow, i > 0 && styles.milestoneBorder]}>
                <Icon size={20} color={info.color} />
                <Text weight="medium" size="base" color={colors.text} style={styles.reasonLabel}>{info.label}</Text>
              </View>
            );
          })}
        </WhiteCard>

        <Text weight="medium" size="base" color="#fff" style={styles.closingLine}>
          Iskra je tu svaki put kad bude teško.
        </Text>
      </View>

    </DarkLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingTop: 24,
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  sub: {
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  cards: {
    paddingHorizontal: 22,
    paddingTop: 22,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0E4DA',
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  chartContainer: {
    position: 'relative',
    marginTop: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
  },
  chartTooltip: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.ember,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCell: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E4DA',
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  statChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    letterSpacing: -0.2,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  milestoneBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0E4DA',
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  milestoneTime: {
    width: 70,
    flexShrink: 0,
  },
  milestoneText: {
    flex: 1,
    lineHeight: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
  },
  reasonLabel: {
    flex: 1,
  },
  closingLine: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footNote: {
    textAlign: 'center',
    marginTop: 10,
  },
});
