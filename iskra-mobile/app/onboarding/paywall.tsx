import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
// import { PurchasesOffering, PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
// import { getOfferings, purchasePackage, restorePurchases, isEntitlementActive } from '../../src/lib/revenuecat';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../../src/lib/supabase';
import { track } from '../../src/lib/posthog';
import { colors, radii, gradients, shadows, spacing } from '../../src/theme/tokens';

// Paywall screen — Phase 2 stub.
// Full RevenueCat integration wired in Phase 8.

type TierId = 'mesecno' | 'godisnje' | 'dozivotno';

function FlameIcon({ size = 20, color = colors.ember }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function CigOffIcon({ size = 17, color = colors.ember }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2.5" y="13" width="13.5" height="4" rx="1.4" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><Line x1="11.5" y1="13" x2="11.5" y2="17" stroke={color} strokeWidth="1.9" strokeLinecap="round" /><Path d="M3 4l18 16.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" /></Svg>;
}
function CoinIcon({ size = 17, color = colors.ember }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.9" /><Path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function ShieldIcon({ size = 32, color = colors.catMoney }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1ZM9 12l2 2 4-4" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function CheckIcon({ size = 19 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="11" fill={colors.emberTint} /><Path d="M7.5 12.2l3 3 6-6.5" stroke={colors.ember} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function XIcon({ size = 19 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="11" fill="#FBE4E4" /><Path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#CC3333" strokeWidth="2.2" strokeLinecap="round" /></Svg>;
}
function CheckGreenIcon({ size = 19 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="11" fill="#E4F3E0" /><Path d="M7.5 12.2l3 3 6-6.5" stroke="#2E8B2E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function StarIcon({ size = 13 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17l-6 3.4 1.4-6.8L2.3 9l6.9-.7L12 2Z" fill={colors.ember} /></Svg>;
}

const BENEFITS = [
  'Panic button — dostupan 24/7',
  'Health milestones i live countdown',
  'RSD brojač u realnom vremenu',
  'Quote dana + edukativni sadržaj',
  'Personalizovani plan prestanka',
  'Slip flow — bez osude, bez reseta',
];

const WITHOUT = [
  'Porivi te savladavaju bez alata',
  'Svaki pad deluje kao kraj',
  'Niko ne razume tvoj kontekst',
  'Para odlazi na cigarete i dalje',
  'Još jedna godina bez promene',
];
const WITH = [
  'Panic button za svaki poriv',
  'Pad nije kraj — nastavljaš dalje',
  'Aplikacija napravljena za naš život',
  'Svaki dan bez cigarete štediš pare',
  'Streak koji raste dan po dan',
];

const REVIEWS = [
  { initial: 'M', name: 'Marija, 34', quote: 'Nisam verovala da mogu. Posle prvog meseca, cigareta mi više nije ni na umu.' },
  { initial: 'N', name: 'Nikola, 29', quote: 'Panic button me spasio u kafani tri puta za prvu nedelju. Radi.' },
  { initial: 'J', name: 'Jelena, 41', quote: 'Konačno aplikacija koja govori našim jezikom i razume naš život.' },
];

const FAQS = [
  { q: 'Šta ako posrnem?', a: 'Ništa strašno. Slip flow te vraća na pravi put bez osude i bez resetovanja tvog streaka.' },
  { q: 'Šta ako su porivi prejaki?', a: 'Panic button te vodi kroz svaki poriv korak po korak. Većina prolazi za 3 do 5 minuta.' },
  { q: 'Šta ako ne izdržim u kafani?', a: 'Imaćeš gotovu skriptu za društvene situacije i brzi pristup panic button-u.' },
];

function RadioDot({ on }: { on: boolean }) {
  return (
    <View style={[styles.radioDot, on && styles.radioDotOn]} />
  );
}

function Stars() {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} size={13} />)}
    </View>
  );
}

interface StoreSnap {
  name: string;
  gender: string | null;
  product: string;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  packPriceRSD: number;
  reasons: string[];
  reasonText: string;
  fears: string[];
  triggers: string[];
  timing: string | null;
  quitDate: string | null;
  signatureData: string | null;
}

async function completeOnboarding(snap: StoreSnap, isPremium = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No session');

  const quitDateISO = snap.timing === 'odmah'
    ? new Date().toISOString()
    : snap.quitDate
      ? new Date(snap.quitDate + 'T00:00:00').toISOString()
      : new Date().toISOString();

  const { error } = await supabase.from('profiles').upsert({
    id: session.user.id,
    name: snap.name,
    gender: snap.gender,
    product: snap.product,
    cigarettes_per_day: snap.cigarettesPerDay,
    cigarettes_per_pack: snap.cigarettesPerPack,
    pack_price_rsd: snap.packPriceRSD,
    reasons: snap.reasons,
    reason_text: snap.reasonText,
    fears: snap.fears,
    triggers: snap.triggers,
    timing: snap.timing,
    quit_date: quitDateISO,
    signature_data: snap.signatureData,
    onboarding_completed: true,
    is_premium: isPremium,
  });

  if (error) throw error;

  track.onboardingCompleted({
    gender: snap.gender ?? 'unknown',
    product: snap.product,
    quit_date: quitDateISO,
  });
}

export default function PaywallScreen() {
  const getAnnualCostRSD = useOnboardingStore((s) => s.getAnnualCostRSD);
  const snap = useOnboardingStore(useShallow((s) => ({
    name: s.name,
    gender: s.gender,
    product: s.product,
    cigarettesPerDay: s.cigarettesPerDay,
    cigarettesPerPack: s.cigarettesPerPack,
    packPriceRSD: s.packPriceRSD,
    reasons: s.reasons,
    reasonText: s.reasonText,
    fears: s.fears,
    triggers: s.triggers,
    timing: s.timing,
    quitDate: s.quitDate,
    signatureData: s.signatureData,
  })));
  const [sel, setSel] = useState<TierId>('godisnje');
  const [secs, setSecs] = useState(9 * 60 + 47);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const annual = getAnnualCostRSD();

  useEffect(() => {
    track.paywallSeen();
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  async function handleBuy() {
    // TODO: wire RevenueCat purchase here when building with dev client
    setLoading(true);
    try {
      await completeOnboarding(snap, false);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Greška', `Nije moguće sačuvati profil: ${e?.message ?? 'Nepoznata greška'}. Provjeri internet vezu.`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    // TODO: wire RevenueCat restorePurchases here
    Alert.alert('Uskoro', 'Obnavljanje kupovine će biti dostupno u finalnoj verziji.');
  }

  async function handleFree() {
    setLoading(true);
    try {
      await completeOnboarding(snap, false);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Greška', `Nije moguće sačuvati profil: ${e?.message ?? 'Nepoznata greška'}. Provjeri internet vezu.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Close X */}
      <View style={styles.closeRow}>
        <TouchableOpacity onPress={handleFree} style={styles.closeBtn} activeOpacity={0.7}>
          <Text weight="bold" size="sm" color="#8A867F">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <Text weight="semibold" size="2xl" style={styles.title}>
        {snap.name ? `${snap.name}, tvoj plan je spreman.` : 'Tvoj plan je spreman.'}
      </Text>
      <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
        Manje od jedne cigarete dnevno.
      </Text>

      {/* Countdown */}
      <View style={styles.countdownCard}>
        <View style={styles.countdownLeft}>
          <View style={styles.countdownIcon}>
            <FlameIcon size={20} color={colors.ember} />
          </View>
          <Text weight="medium" size="sm" color={colors.text} style={styles.countdownLabel}>
            Specijalna cena ističe za:
          </Text>
        </View>
        <View style={styles.countdownTime}>
          <Text weight="bold" size="xl" color={colors.ember} style={styles.countdownDigits}>
            {mm} : {ss}
          </Text>
          <Text weight="regular" size="xs" color={colors.textSub}>min : sek</Text>
        </View>
      </View>

      {/* Data pills */}
      <View style={styles.pillsRow}>
        <View style={styles.pill}>
          <CigOffIcon size={17} color={colors.ember} />
          <Text weight="semibold" size="xs" color={colors.text}>{snap.cigarettesPerDay || 20} cigareta dnevno</Text>
        </View>
        <View style={styles.pill}>
          <CoinIcon size={17} color={colors.ember} />
          <Text weight="semibold" size="xs" color={colors.text}>
            {annual > 0 ? `${Math.round(annual / 1000)}k RSD` : '146k RSD'} godišnje
          </Text>
        </View>
      </View>

      {/* Pricing tiers */}
      <View style={styles.tiers}>
        {/* Mesečno */}
        <TouchableOpacity onPress={() => setSel('mesecno')} activeOpacity={0.85} style={[styles.tier, sel === 'mesecno' && styles.tierSelected]}>
          <RadioDot on={sel === 'mesecno'} />
          <View style={styles.tierText}>
            <Text weight="medium" size="md" color={colors.text}>Mesečno</Text>
            <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 2 }}>590 RSD/mesečno</Text>
          </View>
          <View style={styles.tierRight}>
            <Text weight="bold" size="xl" color={colors.text}>20 RSD</Text>
            <Text weight="regular" size="xs" color={colors.textSub}>/dnevno</Text>
          </View>
        </TouchableOpacity>

        {/* Godišnje — popular */}
        <View style={styles.popularWrapper}>
          <LinearGradient
            colors={gradients.ember}
            start={gradients.emberVertical.start}
            end={gradients.emberVertical.end}
            style={styles.popularBanner}
          >
            <Text weight="bold" size="xs" color="#fff" style={styles.popularLabel}>★ Najpopularnije</Text>
          </LinearGradient>
          <TouchableOpacity
            onPress={() => setSel('godisnje')}
            activeOpacity={0.85}
            style={[styles.tier, styles.tierPopular, sel === 'godisnje' && styles.tierSelected]}
          >
            <RadioDot on={sel === 'godisnje'} />
            <View style={styles.tierText}>
              <Text weight="medium" size="md" color={colors.text}>Godišnje</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 2, alignItems: 'center' }}>
                <Text weight="regular" size="sm" color={colors.textSub}>2.990 RSD</Text>
                <Text weight="regular" size="sm" color={colors.textGhost} style={{ textDecorationLine: 'line-through' }}>7.080 RSD</Text>
              </View>
              <View style={styles.savingsPill}>
                <Text weight="semibold" size="xs" color={colors.catMoney}>Manje od jedne cigarete dnevno</Text>
              </View>
            </View>
            <View style={styles.tierRight}>
              <Text weight="bold" size="2xl" color={colors.ember}>8 RSD</Text>
              <Text weight="regular" size="xs" color={colors.textSub}>/dnevno</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Doživotno */}
        <TouchableOpacity onPress={() => setSel('dozivotno')} activeOpacity={0.85} style={[styles.tier, sel === 'dozivotno' && styles.tierSelected]}>
          <RadioDot on={sel === 'dozivotno'} />
          <View style={styles.tierText}>
            <Text weight="medium" size="md" color={colors.text}>Doživotno</Text>
            <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 2 }}>4.990 RSD jednokratno</Text>
          </View>
          <View style={styles.tierRight}>
            <Text weight="medium" size="sm" color={colors.bodyText}>Bez pretplate</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <EmberButton
        label={loading ? 'Učitavanje...' : 'Uzmi moj plan'}
        onPress={handleBuy}
        style={{ marginTop: 20, marginHorizontal: 22 }}
      />
      <Text weight="regular" size="xs" color={colors.textGhost} style={styles.ctaNote}>
        Otkazuješ kad hoćeš. Bez obaveza.
      </Text>

      {/* Payment trust */}
      <View style={styles.trustRow}>
        {['Apple Pay', 'Visa', 'Mastercard', 'PayPal'].map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && <Text weight="regular" size="sm" color="#D8D4CD">·</Text>}
            <Text weight="semibold" size="sm" color="#A8A5A0">{p}</Text>
          </React.Fragment>
        ))}
      </View>

      {/* What you get */}
      <View style={styles.sectionCard}>
        <Text weight="semibold" size="base" color={colors.text} style={styles.sectionTitle}>Šta dobijaš</Text>
        {BENEFITS.map((b, i) => (
          <View key={b} style={[styles.listRow, i > 0 && styles.listBorder]}>
            <CheckIcon size={19} />
            <Text weight="medium" size="sm" color={colors.text} style={styles.listText}>{b}</Text>
          </View>
        ))}
      </View>

      {/* Money back */}
      <View style={[styles.sectionCard, { flexDirection: 'row', gap: 15, alignItems: 'flex-start' }]}>
        <ShieldIcon size={32} color={colors.catMoney} />
        <View style={{ flex: 1 }}>
          <Text weight="semibold" size="base" color={colors.text}>30 dana garancija povraćaja</Text>
          <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 5, lineHeight: 20 }}>
            Ako nisi zadovoljan/na, vraćamo novac. Bez pitanja.
          </Text>
        </View>
      </View>

      {/* Two paths */}
      <Text weight="semibold" size="lg" color={colors.text} style={styles.sectionHeadline}>Dva puta napred</Text>
      <View style={styles.twoPaths}>
        <View style={[styles.pathCard, { backgroundColor: '#FFF8F8', borderColor: '#FFDDDD' }]}>
          <Text weight="bold" size="base" color="#CC3333" style={{ marginBottom: 4 }}>✕ Bez Iskre</Text>
          {WITHOUT.map((t, i) => (
            <View key={t} style={[styles.pathRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#FFDDDD' }]}>
              <XIcon size={19} />
              <Text weight="medium" size="sm" color={colors.text} style={styles.pathText}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.pathCard, { backgroundColor: '#F8FFF5', borderColor: '#DDEECC' }]}>
          <Text weight="bold" size="base" color="#2E8B2E" style={{ marginBottom: 4 }}>✓ Sa Iskrom</Text>
          {WITH.map((t, i) => (
            <View key={t} style={[styles.pathRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#DDEECC' }]}>
              <CheckGreenIcon size={19} />
              <Text weight="medium" size="sm" color={colors.text} style={styles.pathText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reviews */}
      <Text weight="semibold" size="lg" color={colors.text} style={styles.sectionHeadline}>Šta kažu korisnici</Text>
      <View style={styles.reviews}>
        {REVIEWS.map((r) => (
          <View key={r.name} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text weight="bold" size="base" color={colors.ember}>{r.initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="semibold" size="sm" color={colors.text}>{r.name}</Text>
                <Stars />
              </View>
            </View>
            <Text weight="regular" size="sm" color={colors.bodyText} style={styles.reviewQuote}>
              „{r.quote}"
            </Text>
          </View>
        ))}
        <Text weight="regular" size="xs" color={colors.textGhost} style={{ textAlign: 'center' }}>
          Recenzije su od verifikovanih korisnika.
        </Text>
      </View>

      {/* FAQ */}
      <Text weight="semibold" size="lg" color={colors.text} style={styles.sectionHeadline}>Često pitaju</Text>
      <View style={styles.sectionCard}>
        {FAQS.map((f, i) => (
          <View key={f.q} style={[i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
              activeOpacity={0.7}
              style={styles.faqQuestion}
            >
              <Text weight="medium" size="base" color={colors.text} style={{ flex: 1 }}>{f.q}</Text>
              <Text weight="medium" size="base" color={colors.textGhost}>{openFaq === i ? '−' : '+'}</Text>
            </TouchableOpacity>
            {openFaq === i && (
              <Text weight="regular" size="sm" color={colors.bodyText} style={styles.faqAnswer}>{f.a}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Secondary free link */}
      <TouchableOpacity onPress={handleFree} activeOpacity={0.7} style={styles.freeLink}>
        <Text weight="medium" size="sm" color={colors.textSub}>Nastavi sa besplatnom verzijom</Text>
      </TouchableOpacity>

      <View style={styles.legalRow}>
        <Text weight="regular" size="xs" color={colors.textGhost}>Uslovi korišćenja</Text>
        <Text weight="regular" size="xs" color={colors.textGhost}> · </Text>
        <Text weight="regular" size="xs" color={colors.textGhost}>Politika privatnosti</Text>
        <Text weight="regular" size="xs" color={colors.textGhost}> · </Text>
        <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
          <Text weight="semibold" size="xs" color={colors.textSub}>Obnovi kupovinu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 40,
  },
  closeRow: {
    paddingTop: 52,
    paddingHorizontal: 22,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECE8E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingHorizontal: 22,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  sub: {
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 22,
  },
  countdownCard: {
    marginHorizontal: 22,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  countdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.emberTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownLabel: {
    flex: 1,
    lineHeight: 20,
  },
  countdownTime: {
    alignItems: 'flex-end',
  },
  countdownDigits: {
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 12,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    backgroundColor: '#F1EEE9',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tiers: {
    marginHorizontal: 22,
    marginTop: 20,
    gap: 13,
  },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 19,
  },
  tierSelected: {
    borderColor: colors.ember,
    borderWidth: 2,
    ...shadows.ember,
  },
  popularWrapper: {
    borderRadius: 16,
  },
  popularBanner: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  popularLabel: {
    letterSpacing: 0.5,
  },
  tierPopular: {
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  tierText: {
    flex: 1,
  },
  tierRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  savingsPill: {
    marginTop: 9,
    backgroundColor: '#EDF7ED',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  radioDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D8D4CD',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  radioDotOn: {
    borderWidth: 7,
    borderColor: colors.ember,
  },
  ctaNote: {
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 22,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 22,
  },
  sectionCard: {
    marginHorizontal: 22,
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  listBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listText: {
    flex: 1,
    lineHeight: 20,
  },
  sectionHeadline: {
    marginTop: 30,
    marginHorizontal: 22,
    letterSpacing: -0.3,
  },
  twoPaths: {
    marginHorizontal: 22,
    marginTop: 16,
    gap: 12,
  },
  pathCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  pathText: {
    flex: 1,
    lineHeight: 20,
  },
  reviews: {
    marginHorizontal: 22,
    marginTop: 16,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.emberTint,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewQuote: {
    marginTop: 13,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  faqAnswer: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    lineHeight: 22,
  },
  freeLink: {
    alignSelf: 'center',
    marginTop: 26,
    paddingVertical: 8,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
});
