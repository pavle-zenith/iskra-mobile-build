import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft, IcoShare, IcoPlane, IcoRocket, IcoCalendar } from '../../src/components/icons';
import { colors, shadows } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';
import { format, parseISO } from 'date-fns';
import { ShareCard, useShareCard } from '../../src/components/ShareCard';

// Helper SVG icons
function WaveIcon({ size = 24, stroke = colors.catMoney }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <Path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <Path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </Svg>
  );
}

function MoonIcon({ size = 24, stroke = colors.catMoney }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Svg>
  );
}

function BrainIcon({ size = 24, stroke = colors.catMoney }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5a3 3 0 0 0-5.6-1.5A2.5 2.5 0 0 0 4 6.5 2.5 2.5 0 0 0 4 11a2.5 2.5 0 0 0 2 4 3 3 0 0 0 6 0V5Z" />
      <Path d="M12 5a3 3 0 0 1 5.6-1.5A2.5 2.5 0 0 1 20 6.5 2.5 2.5 0 0 1 20 11a2.5 2.5 0 0 1-2 4 3 3 0 0 1-6 0" />
    </Svg>
  );
}

function HourglassIcon({ size = 24, stroke = colors.amber }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 2h12M6 22h12" />
      <Path d="M6 2c0 4 3 5.5 6 8 3-2.5 6-4 6-8" />
      <Path d="M6 22c0-4 3-5.5 6-8 3 2.5 6 4 6 8" />
    </Svg>
  );
}

// Milestone road data
const PAST_MILESTONES = [
  { d: 'Dan 1', t: 'Let Beograd—Njujork i nazad', Icon: IcoPlane },
  { d: 'Dan 3', t: 'Astronauti stignu do ISS', Icon: IcoRocket },
  { d: 'Dan 7', t: 'Prosečan odmor na moru', Icon: WaveIcon },
  { d: 'Dan 10', t: 'Artemis 2 orbita oko Meseca', Icon: MoonIcon },
  { d: 'Dan 14', t: 'Mozak počinje da gradi novu naviku', Icon: BrainIcon },
];

const UPCOMING_MILESTONES = [
  { d: 'Dan 66', t: 'Navika postaje automatska' },
  { d: 'Dan 90', t: 'Fizička zavisnost od nikotina nestaje' },
  { d: 'Dan 100', t: 'Sto dana slobode' },
  { d: 'Dan 365', t: 'Jedna godina' },
];

// Determine which past milestones are unlocked based on days
function getUnlockedPast(days: number) {
  const dayThresholds = [1, 3, 7, 10, 14];
  return PAST_MILESTONES.filter((_, i) => days >= dayThresholds[i]);
}

function getCurrentMilestone(days: number) {
  if (days < 3) return { label: `Dan ${days}`, desc: 'Počinješ putovanje.', next: 3 };
  if (days < 7) return { label: `Dan ${days}`, desc: 'Stigao/la si dalje od Njujorka i nazad.', next: 7 };
  if (days < 10) return { label: `Dan ${days}`, desc: 'Odmorio/la si se koliko i na moru.', next: 10 };
  if (days < 14) return { label: `Dan ${days}`, desc: 'Duže od Artemis misije.', next: 14 };
  if (days < 66) return { label: `Dan ${days}`, desc: 'Mozak gradi novu naviku.', next: 66 };
  if (days < 90) return { label: `Dan ${days}`, desc: 'Navika postaje automatska.', next: 90 };
  if (days < 100) return { label: `Dan ${days}`, desc: 'Fizička zavisnost nestaje.', next: 100 };
  return { label: `Dan ${days}`, desc: 'Sto dana slobode!', next: 365 };
}

export default function TimeScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);
  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  const days = stats.timeDisplay.days;
  const hours = String(stats.timeDisplay.hours).padStart(2, '0');
  const minutes = String(stats.timeDisplay.minutes).padStart(2, '0');
  const seconds = String(stats.timeDisplay.seconds).padStart(2, '0');

  const unlockedPast = getUnlockedPast(days);
  const current = getCurrentMilestone(days);

  // Time recovered: ~7 min per cigarette
  const minutesPerCig = 7;
  const hoursRecovered = Math.floor((stats.cigarettesAvoided * minutesPerCig) / 60);
  const daysRecovered = (stats.cigarettesAvoided * minutesPerCig / 60 / 24).toFixed(1);

  const { shotRef, captureAndShare } = useShareCard();

  return (
    <>
    <ShareCard shotRef={shotRef} variant={{ type: 'streak', days }} />
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="semibold" size="base" color={colors.text}>Tvoje vreme</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={captureAndShare}>
          <IcoShare size={19} stroke={colors.textSub} strokeWidth={1.9} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ember hero card */}
        <View style={styles.hero}>
          <Text weight="bold" size="xs" color="rgba(255,255,255,0.7)" style={styles.heroLabel}>
            SLOBODAN/NA VEĆ
          </Text>
          <View style={styles.heroGrid}>
            {[
              { v: String(days), l: 'DANA' },
              { v: hours, l: 'SATI' },
              { v: minutes, l: 'MINUTA' },
              { v: seconds, l: 'SEKUNDE' },
            ].map((cell) => (
              <View key={cell.l} style={styles.heroCell}>
                <Text weight="medium" color="#fff" style={styles.heroBigNum}>
                  {cell.v}
                </Text>
                <Text weight="bold" size="xs" color="rgba(255,255,255,0.7)" style={styles.heroSmallLabel}>
                  {cell.l}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.heroDivider} />
          <Text weight="regular" size="sm" color="rgba(255,255,255,0.6)" style={{ textAlign: 'center', fontStyle: 'italic' }}>
            od poslednje cigarete
          </Text>
        </View>

        {/* Milestone road label */}
        <Text weight="medium" size="sm" color={colors.text} style={styles.sectionLabel}>
          Šta si sve preživeo/la
        </Text>

        {/* Past milestone cards */}
        {unlockedPast.map((m, idx) => (
          <React.Fragment key={m.d}>
            <View style={styles.milestoneCard}>
              <View style={{ flex: 1 }}>
                <Text weight="regular" size="xs" color={colors.textSub}>{m.d}</Text>
                <Text weight="medium" size="base" color={colors.text} style={{ marginTop: 3, letterSpacing: -0.2 }}>
                  {m.t}
                </Text>
              </View>
              <m.Icon size={24} stroke={colors.catMoney} />
            </View>
            <View style={styles.dottedLine} />
          </React.Fragment>
        ))}

        {/* Current "TI SI OVDE" card */}
        <View style={styles.currentCard}>
          <View style={styles.currentBadge}>
            <Text weight="bold" style={styles.currentBadgeText}>TI SI OVDE</Text>
          </View>
          <Text weight="medium" size="sm" color={colors.ember} style={{ marginTop: 11 }}>
            {current.label}
          </Text>
          <Text weight="medium" size="lg" color={colors.text} style={{ marginTop: 3, letterSpacing: -0.2 }}>
            {current.desc}
          </Text>
          <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 6 }}>
            Samo još {current.next - days} dana do sledećeg.
          </Text>
        </View>

        {/* Upcoming milestones */}
        {UPCOMING_MILESTONES.map((m) => (
          <React.Fragment key={m.d}>
            <View style={styles.dottedLine} />
            <View style={[styles.milestoneCard, styles.upcomingCard]}>
              <View style={{ flex: 1 }}>
                <Text weight="regular" size="xs" color={colors.textSub}>{m.d}</Text>
                <Text weight="regular" size="base" color={colors.textSub} style={{ marginTop: 3 }}>
                  {m.t}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ))}

        <View style={{ height: 8 }} />

        {/* Previous relapse card (if profile has data) */}
        {profile?.created_at && (
          <View style={styles.card}>
            <IcoCalendar size={24} stroke="#D4547E" strokeWidth={1.9} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text weight="medium" size="xs" color={colors.textSub}>Početak putovanja</Text>
              <Text weight="medium" size="base" color={colors.text} style={{ marginTop: 1 }}>
                {format(parseISO(profile.created_at), 'd. MMMM yyyy.')}
              </Text>
            </View>
          </View>
        )}

        {/* Time recovered */}
        <View style={styles.card}>
          <Text weight="medium" size="sm" color={colors.text} style={{ marginBottom: 14 }}>
            Vreme koje si povratio/la
          </Text>
          <View style={styles.timeSavedRow}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text weight="medium" color={colors.amber} style={styles.timeSavedNum}>
                {hoursRecovered} sati
              </Text>
              <Text weight="medium" size="xs" color={colors.textSub} style={{ marginTop: 4 }}>
                provedenih na paljenju
              </Text>
            </View>
            <View style={styles.timeSavedDivider} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text weight="medium" color={colors.amber} style={styles.timeSavedNum}>
                {daysRecovered} dana
              </Text>
              <Text weight="medium" size="xs" color={colors.textSub} style={{ marginTop: 4 }}>
                čistog vremena
              </Text>
            </View>
          </View>
          <Text weight="regular" size="xs" color={colors.textFaint} style={styles.timeSavedNote}>
            Svaka cigareta = ~7 minuta
          </Text>
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={captureAndShare} activeOpacity={0.8}>
          <IcoShare size={18} stroke={colors.amber} strokeWidth={2} />
          <Text weight="medium" size="base" color={colors.amber} style={{ marginLeft: 9 }}>
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
    backgroundColor: colors.ember,
    borderRadius: 20,
    padding: 28,
    marginTop: 8,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 10,
  },
  heroLabel: {
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 18,
  },
  heroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  heroBigNum: {
    fontSize: 48,
    lineHeight: 60,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  heroSmallLabel: {
    letterSpacing: 0.4,
    marginTop: 8,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 20,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    ...shadows.card,
    marginTop: 8,
  },
  upcomingCard: {
    opacity: 0.5,
    borderColor: '#EEEEEE',
  },
  dottedLine: {
    width: 2,
    height: 22,
    borderLeftWidth: 2,
    borderLeftColor: '#D8D4CD',
    borderStyle: 'dashed',
    alignSelf: 'center',
    marginTop: 0,
  },
  currentCard: {
    backgroundColor: '#FEF0E8',
    borderWidth: 2,
    borderColor: colors.ember,
    borderRadius: 16,
    padding: 20,
    marginTop: 0,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.ember,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontSize: 10,
    color: colors.ember,
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    ...shadows.card,
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSavedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeSavedNum: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  timeSavedDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  timeSavedNote: {
    textAlign: 'center',
    marginTop: 14,
    fontStyle: 'italic',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.amber,
    backgroundColor: '#fff',
    marginTop: 17,
  },
});
