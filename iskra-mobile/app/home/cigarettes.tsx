import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft, IcoCigarette, IcoMoney, IcoShare } from '../../src/components/icons';
import { colors, shadows } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';
import { ShareCard, useShareCard } from '../../src/components/ShareCard';

const RED = '#C24A43';
const RED_BG = '#FBE9E7';
const GREEN = '#3A7A3A';

function LungsIcon({ size = 22, stroke = RED }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4v8" />
      <Path d="M9.5 9.5c-2 0-4 2-4 6 0 2 .5 4 2.2 4 1.3 0 1.8-1.1 1.8-2.6V11c0-.85-.7-1.5-1.5-1.5Z" />
      <Path d="M14.5 9.5c2 0 4 2 4 6 0 2-.5 4-2.2 4-1.3 0-1.8-1.1-1.8-2.6V11c0-.85.7-1.5 1.5-1.5Z" />
    </Svg>
  );
}

function MoleculeIcon({ size = 22, stroke = '#6B52A8' }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={5} cy={6} r={2.2} />
      <Circle cx={19} cy={8} r={2.2} />
      <Circle cx={12} cy={17} r={2.2} />
      <Path d="M6.8 7.2 10.5 15M17.2 9.4 13.4 15.6M7 6.6l9.8 1" />
    </Svg>
  );
}

function ClockIcon({ size = 22, stroke = GREEN }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9.5} />
      <Path d="M12 7v5l3.5 2" />
    </Svg>
  );
}

// Smooth area chart in red
function AreaChart({ cigarettesAvoided, days }: { cigarettesAvoided: number; days: number }) {
  const W = 280;
  const H = 120;
  const pad = 6;

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

  const labels = ['Dan 1', 'Dan 10', 'Dan 20', 'Dan 30', `Dan ${days}`];

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={fillPath} fill={RED_BG} />
        <Path d={path} fill="none" stroke={RED} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={last.x} cy={last.y} r={4.5} fill={RED} />
      </Svg>
      <View style={styles.chartLabels}>
        {labels.map((l) => (
          <Text key={l} weight="medium" size="xs" color={colors.textFaint}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function CigarettesScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);
  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  const days = stats.timeDisplay.days;
  const cigs = stats.cigarettesAvoided;
  const packs = profile?.cigarettes_per_pack
    ? Math.floor(cigs / profile.cigarettes_per_pack)
    : Math.floor(cigs / 20);

  // ~7 min per cig = time lost on lighting
  const hoursLighting = Math.floor((cigs * 7) / 60);
  // tar per cigarette: ~10mg → in grams
  const tarGrams = (cigs * 10 / 1000).toFixed(0);
  // nicotine per cigarette: ~1mg
  const nicMg = cigs;

  const IMPACT = [
    { Icon: LungsIcon, color: RED, big: `${tarGrams}g katrana`, sub: 'nije ušlo u tvoja pluća' },
    { Icon: MoleculeIcon, color: '#6B52A8', big: `${nicMg}mg nikotina`, sub: 'nisi uneo/la u krv' },
    { Icon: ClockIcon, color: GREEN, big: `${hoursLighting} sati`, sub: 'uštedeo/la si na paljenju', fine: `(7 min × ${cigs} cigareta)` },
  ];

  // Pack-days equivalence (how many days of smoking that would have been)
  const cigDays = profile?.cigarettes_per_day
    ? (cigs / profile.cigarettes_per_day).toFixed(0)
    : Math.floor(cigs / 20).toString();

  const dailyCigs = profile?.cigarettes_per_day ?? 20;
  const PROJ = [
    { n: String(dailyCigs * 7), l: 'nedeljno' },
    { n: String(dailyCigs * 30), l: 'mesečno' },
    { n: String(dailyCigs * 365), l: 'godišnje' },
    { n: String(dailyCigs * 365 * 5), l: 'za 5 godina' },
  ];

  const { shotRef, captureAndShare } = useShareCard();

  return (
    <>
    <ShareCard shotRef={shotRef} variant={{ type: 'cigarettes', count: cigs, days }} />
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="semibold" size="base" color={colors.text}>Odbijene cigarete</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={captureAndShare}>
          <IcoShare size={19} stroke={colors.textSub} strokeWidth={1.9} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <IcoCigarette size={40} stroke={RED} strokeWidth={1.7} />
          <Text weight="semibold" color={RED} style={styles.heroNum}>{cigs.toLocaleString('sr-RS')}</Text>
          <Text weight="semibold" color={RED} style={styles.heroLabel}>cigareta odbijeno</Text>
          <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 10 }}>
            u {days} {days === 1 ? 'danu' : 'dana'} slobode
          </Text>
        </View>

        {/* Area chart */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={styles.cardTitle}>Ukupno odbijeno</Text>
          <AreaChart cigarettesAvoided={cigs} days={days} />
          <Text weight="regular" size="xs" color={colors.textSub} style={{ marginTop: 12 }}>
            {dailyCigs} cigareta dnevno nisi zapalio/la
          </Text>
        </View>

        {/* Health impact */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={styles.cardTitle}>Šta nisi uneo/la u sebe</Text>
          {IMPACT.map((m, i) => (
            <View key={m.big} style={[styles.impactRow, i > 0 && styles.impactRowBorder]}>
              <View style={{ marginTop: 1 }}>
                <m.Icon size={22} stroke={m.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text weight="bold" color={colors.text} style={styles.impactBig}>{m.big}</Text>
                <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 2 }}>{m.sub}</Text>
                {m.fine && (
                  <Text weight="regular" size="xs" color={colors.textFaint} style={{ marginTop: 2 }}>{m.fine}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Pack count 3-cell */}
        <View style={[styles.card, styles.packRow]}>
          {[
            { n: cigs.toLocaleString('sr-RS'), l: 'cigareta' },
            { n: String(packs), l: 'kutija' },
            { n: `${cigDays} dana`, l: 'pušenja' },
          ].map((s, i) => (
            <React.Fragment key={s.l}>
              {i > 0 && <View style={styles.cellDivider} />}
              <View style={styles.packCell}>
                <Text weight="medium" color={colors.text} style={styles.packNum}>{s.n}</Text>
                <Text weight="medium" size="xs" color={colors.textSub} style={{ marginTop: 4 }}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Projections */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={styles.cardTitle}>Ako nastaviš</Text>
          {PROJ.map((p, i) => (
            <View key={p.l} style={[styles.projRow, i > 0 && styles.projRowBorder]}>
              <Text weight="bold" color={RED} style={styles.projNum}>{p.n}</Text>
              <Text weight="medium" size="sm" color={colors.textSub}>{p.l}</Text>
            </View>
          ))}
        </View>

        {/* Money crosslink */}
        <TouchableOpacity
          style={styles.crosslink}
          onPress={() => router.push('/home/money')}
          activeOpacity={0.8}
        >
          <IcoMoney size={24} stroke={GREEN} strokeWidth={1.9} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text weight="regular" size="sm" color={colors.textSub}>Uštedeo/la si i</Text>
            <Text weight="semibold" color={GREEN} style={styles.crosslinkNum}>
              {stats.moneySavedRSD.toLocaleString('sr-RS')} RSD
            </Text>
          </View>
          <Svg width={8} height={14} viewBox="0 0 8 14">
            <Path d="M1 1l6 6-6 6" stroke="#CCC" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={captureAndShare} activeOpacity={0.8}>
          <IcoShare size={18} stroke={RED} strokeWidth={2} />
          <Text weight="medium" size="base" color={RED} style={{ marginLeft: 9 }}>
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
  heroNum: {
    fontSize: 56,
    lineHeight: 70,
    letterSpacing: -1.5,
    marginTop: 16,
  },
  heroLabel: {
    fontSize: 18,
    marginTop: 8,
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
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  impactRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  impactBig: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  packRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packCell: {
    flex: 1,
    alignItems: 'center',
  },
  packNum: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  cellDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
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
  projNum: {
    fontSize: 18,
    letterSpacing: -0.2,
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
    borderColor: RED,
    backgroundColor: '#fff',
    marginTop: 17,
  },
});
