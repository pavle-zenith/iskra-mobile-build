import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft, IcoMoney, IcoCigarette, IcoShare, IcoTrophy } from '../../src/components/icons';
import { colors, shadows } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';
import { ShareCard, useShareCard } from '../../src/components/ShareCard';

const GREEN = '#3A7A3A';
const GREEN_BG = '#EDF7ED';

function ForkIcon({ size = 20, stroke = GREEN }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
      <Path d="M5 11v11" />
      <Path d="M19 2v20" />
      <Path d="M19 14c2 0 2.5-2 2.5-5 0-4-1-7-2.5-7s-2.5 3-2.5 7c0 3 .5 5 2.5 5Z" />
    </Svg>
  );
}
function BedIcon({ size = 20, stroke = GREEN }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 4v16" />
      <Path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <Path d="M2 17h20" />
      <Path d="M6 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}
function TvIcon({ size = 20, stroke = GREEN }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={2} y={7} width={20} height={13} rx={2} />
      <Path d="m17 2-5 5-5-5" />
    </Svg>
  );
}

// Smooth bezier area chart using react-native-svg
function AreaChart({ cigarettesAvoided, days }: { cigarettesAvoided: number; days: number }) {
  const W = 280;
  const H = 120;
  const pad = 6;

  // Bezier points
  const rawPts = [0, 0.08, 0.2, 0.34, 0.52, 0.72, 1];
  const pts = rawPts.map((v, i, a) => ({
    x: pad + (i / (a.length - 1)) * (W - pad * 2),
    y: H - pad - v * (H - pad * 2),
  }));

  let path = '';
  pts.forEach((p, i) => {
    if (i === 0) {
      path += `M ${p.x} ${p.y}`;
    } else {
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2;
      path += ` C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    }
  });

  const last = pts[pts.length - 1];
  const fillPath = `${path} L ${last.x} ${H} L ${pts[0].x} ${H} Z`;

  const labels = days > 20
    ? ['Dan 1', `Dan ${Math.floor(days / 3)}`, `Dan ${Math.floor(days * 2 / 3)}`, `Dan ${days}`]
    : ['Dan 1', 'Dan 10', 'Dan 20', `Dan ${days}`];

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={fillPath} fill={GREEN_BG} />
        <Path d={path} fill="none" stroke={GREEN} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={last.x} cy={last.y} r={4.5} fill={GREEN} />
      </Svg>
      <View style={styles.chartLabels}>
        {labels.map((l) => (
          <Text key={l} weight="medium" size="xs" color={colors.textSub}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function MoneyScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);
  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  const days = stats.timeDisplay.days;
  const moneySaved = stats.moneySavedRSD;
  const formattedMoney = moneySaved.toLocaleString('sr-RS');

  // Projections based on daily rate
  const dailyRate = days > 0 ? moneySaved / days : 0;
  const weeklyRate = Math.round(dailyRate * 7);
  const monthlyRate = Math.round(dailyRate * 30);
  const yearlyRate = Math.round(dailyRate * 365);

  const PROJ = [
    { n: `${weeklyRate.toLocaleString('sr-RS')} RSD`, l: 'nedeljno' },
    { n: `${monthlyRate.toLocaleString('sr-RS')} RSD`, l: 'mesečno' },
    { n: `${yearlyRate.toLocaleString('sr-RS')} RSD`, l: 'godišnje' },
  ];

  // Next money milestone (round up to nearest 5000)
  const nextGoal = Math.ceil((moneySaved + 1) / 5000) * 5000;
  const progressPct = Math.min(1, moneySaved / nextGoal);

  const { shotRef, captureAndShare } = useShareCard();

  return (
    <>
    <ShareCard shotRef={shotRef} variant={{ type: 'money', amountRSD: moneySaved, days }} />
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="semibold" size="base" color={colors.text}>Uštedine</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={captureAndShare}>
          <IcoShare size={19} stroke={colors.textSub} strokeWidth={1.9} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <IcoMoney size={40} stroke="#D9A227" strokeWidth={1.7} />
          <View style={styles.heroAmountRow}>
            <Text weight="bold" color={GREEN} style={styles.heroAmount}>{formattedMoney}</Text>
            <Text weight="semibold" color={GREEN} style={styles.heroUnit}>RSD</Text>
          </View>
          <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 12 }}>
            u {days} {days === 1 ? 'danu' : 'dana'} slobode
          </Text>
        </View>

        {/* Area chart */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={styles.cardTitle}>Rast uštedina</Text>
          <AreaChart cigarettesAvoided={stats.cigarettesAvoided} days={days} />
        </View>

        {/* Projections */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={styles.cardTitle}>Ako nastaviš</Text>
          {PROJ.map((p, i) => (
            <View key={p.l} style={[styles.projRow, i > 0 && styles.projRowBorder]}>
              <Text weight="bold" color={GREEN} style={styles.projAmount}>{p.n}</Text>
              <Text weight="medium" size="sm" color={colors.textSub}>{p.l}</Text>
            </View>
          ))}
        </View>

        {/* Equivalents */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={styles.cardTitle}>To je kao...</Text>
          {[
            { Icon: ForkIcon, t: `${Math.round(moneySaved / 400)} ćevaba u kafani` },
            { Icon: BedIcon, t: `${(moneySaved / 12000).toFixed(1)} vikenda u Beogradu` },
            { Icon: TvIcon, t: `${Math.round(moneySaved / 1200)} meseci Netflix pretplate` },
          ].map((e, i) => (
            <View key={e.t} style={[styles.equivRow, i > 0 && styles.equivRowBorder]}>
              <e.Icon size={20} stroke={GREEN} />
              <Text weight="medium" size="sm" color={colors.bodyText} style={{ marginLeft: 13 }}>{e.t}</Text>
            </View>
          ))}
          <Text weight="regular" size="xs" color={colors.textGhost} style={{ marginTop: 10 }}>
            Ekvivalenti se menjaju kako rasteš.
          </Text>
        </View>

        {/* Next goal milestone */}
        <View style={[styles.card, { borderWidth: 1.5, borderColor: '#E8E8E8' }]}>
          <View style={styles.milestoneRow}>
            <IcoTrophy size={24} stroke={colors.ember} strokeWidth={1.9} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text weight="medium" size="base" color={colors.text}>
                Sledeći cilj: {nextGoal.toLocaleString('sr-RS')} RSD
              </Text>
              <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 2 }}>
                još {(nextGoal - moneySaved).toLocaleString('sr-RS')} RSD
              </Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
          </View>
        </View>

        {/* Cigarettes crosslink */}
        <TouchableOpacity
          style={styles.crosslink}
          onPress={() => router.push('/home/cigarettes')}
          activeOpacity={0.8}
        >
          <IcoCigarette size={24} stroke={colors.catCigarettes} strokeWidth={1.9} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text weight="regular" size="sm" color={colors.textSub}>Odbio/la si i</Text>
            <Text weight="semibold" color={colors.catCigarettes} style={styles.crosslinkNum}>
              {stats.cigarettesAvoided} cigareta
            </Text>
          </View>
          <Svg width={8} height={14} viewBox="0 0 8 14">
            <Path d="M1 1l6 6-6 6" stroke="#CCC" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={captureAndShare} activeOpacity={0.8}>
          <IcoShare size={18} stroke={colors.ember} strokeWidth={2} />
          <Text weight="medium" size="base" color={colors.ember} style={{ marginLeft: 9 }}>
            Podeli svoju pobedu
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FAF9F7',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 16,
  },
  heroAmount: {
    fontSize: 56,
    lineHeight: 70,
    letterSpacing: -1.5,
  },
  heroUnit: {
    fontSize: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    ...shadows.card,
    marginTop: 13,
  },
  cardTitle: {
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  projRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  projRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  projAmount: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
  equivRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  equivRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.ember,
    borderRadius: 3,
  },
  crosslink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 18,
    padding: 18,
    marginTop: 13,
  },
  crosslinkNum: {
    fontSize: 18,
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ember,
    backgroundColor: '#fff',
    marginTop: 17,
  },
});
