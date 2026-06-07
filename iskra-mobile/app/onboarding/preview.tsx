import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { DarkLayout } from '../../src/components/onboarding/DarkLayout';
import { Text } from '../../src/components/ui/Text';
import { WhiteButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 15;

function CoinIcon({ size = 24, color = '#3A7A3A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="8" cy="8" r="6" stroke={color} strokeWidth={sw} /><Path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function LungsIcon({ size = 24, color = '#2E8B80', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 4v8M9.5 9.5c-2 0-4 2-4 6 0 2 .5 4 2.2 4 1.3 0 1.8-1.1 1.8-2.6V11c0-.85-.7-1.5-1.5-1.5ZM14.5 9.5c2 0 4 2 4 6 0 2-.5 4-2.2 4-1.3 0-1.8-1.1-1.8-2.6V11c0-.85.7-1.5 1.5-1.5Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function BirdIcon({ size = 24, color = '#6B52A8', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M4 13 Q8 7 12 13 Q16 7 20 13" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17l-6 3.4 1.4-6.8L2.3 9l6.9-.7L12 2Z" fill={colors.ember} />
    </Svg>
  );
}
function VerifiedIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={colors.ember} />
      <Path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const BENEFITS = [
  { key: 'money', title: '146.000 RSD', sub: 'uštedeno za godinu dana', color: '#3A7A3A', chip: '#EDF7ED', Icon: CoinIcon },
  { key: 'lungs', title: 'Plućna funkcija +30%', sub: 'u prvih 90 dana bez cigarete', color: '#2E8B80', chip: '#EBF6F5', Icon: LungsIcon },
  { key: 'free', title: 'Slobodan/na od nikotina', sub: 'mozak se vraća u prirodno stanje', color: '#6B52A8', chip: '#F0EDF8', Icon: BirdIcon },
];

function Stars() {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} size={14} />)}
    </View>
  );
}

export default function PreviewScreen() {
  const store = useOnboardingStore();
  const annual = store.getAnnualCostRSD();

  const benefits = BENEFITS.map((b) =>
    b.key === 'money' && annual > 0
      ? { ...b, title: `${annual.toLocaleString('sr-RS')} RSD` }
      : b
  );

  return (
    <DarkLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
      scrollable
      footer={<WhiteButton label="Jedva čekam" onPress={() => router.push('/onboarding/panic')} />}
    >
      <View style={styles.header}>
        <Text weight="semibold" size="2xl" color="#fff" style={styles.title}>
          Za 3 meseca, ovo te čeka.
        </Text>
        <Text weight="regular" size="sm" color="rgba(255,255,255,0.85)" style={styles.sub}>
          Na osnovu tvojih podataka.
        </Text>
      </View>

      <View style={styles.cards}>
        {benefits.map((b) => (
          <View key={b.key} style={styles.benefitCard}>
            <View style={[styles.benefitChip, { backgroundColor: b.chip }]}>
              <b.Icon size={24} color={b.color} />
            </View>
            <View style={styles.benefitText}>
              <Text weight="semibold" size="lg" color={b.color} style={styles.benefitTitle}>
                {b.title}
              </Text>
              <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 3 }}>
                {b.sub}
              </Text>
            </View>
          </View>
        ))}

        {/* Social proof */}
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialHeader}>
            <View style={styles.testimonialAvatar}>
              <Text weight="bold" size="base" color={colors.ember}>M</Text>
            </View>
            <View style={styles.testimonialMeta}>
              <View style={styles.testimonialNameRow}>
                <Text weight="semibold" size="base" color={colors.text}>Marija, 34</Text>
                <VerifiedIcon size={15} />
              </View>
            </View>
            <Stars />
          </View>
          <Text weight="regular" size="sm" color={colors.bodyText} style={styles.testimonialQuote}>
            „Nisam verovala da mogu. Ali posle prvog meseca, cigareta mi više nije ni na umu. Iskra me drži."
          </Text>
          <Text weight="medium" size="xs" color={colors.textGhost} style={styles.verified}>
            Verified Iskra korisnik
          </Text>
        </View>
      </View>
    </DarkLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 26,
    paddingTop: 28,
  },
  title: {
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  sub: {
    marginTop: 12,
    lineHeight: 22,
  },
  cards: {
    paddingHorizontal: 26,
    paddingTop: 22,
    gap: 12,
  },
  benefitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0E4DA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  benefitChip: {
    width: 46,
    height: 46,
    borderRadius: 13,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    letterSpacing: -0.3,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0E4DA',
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.emberSoft,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialMeta: {
    flex: 1,
  },
  testimonialNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialQuote: {
    marginTop: 13,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  verified: {
    marginTop: 12,
  },
});
