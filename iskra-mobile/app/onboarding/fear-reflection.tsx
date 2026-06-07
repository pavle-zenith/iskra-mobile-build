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
const STEP = 11;

function BoltIcon({ size = 28, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function StormIcon({ size = 28, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Path d="m13 12-3 5h4l-3 5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function PeopleIcon({ size = 28, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} /><Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

const CARDS = [
  {
    key: 'porivi',
    label: 'Jaki porivi',
    color: colors.ember,
    Icon: BoltIcon,
    body: 'Svaki poriv traje između 3 i 5 minuta. Posle toga prolazi sam — uvek.',
    bold: 'Iskra ima alat tačno za taj trenutak.',
  },
  {
    key: 'stres',
    label: 'Stres bez cigarete',
    color: '#4A6080',
    Icon: StormIcon,
    body: 'Nikotin ne smanjuje stres — samo privremeno gasi apstinencijalni sindrom koji je on sam izazvao.',
    bold: 'Pravi oprez dolazi posle 3 nedelje.',
  },
  {
    key: 'kafana',
    label: 'Kafana i društvo',
    color: '#6B52A8',
    Icon: PeopleIcon,
    body: 'Društveni pritisak je jedan od glavnih razloga pada. Imaćeš skriptu za svaki takav trenutak.',
    bold: 'Nisi sam/a u tome.',
  },
];

function ReassureCard({ card }: { card: typeof CARDS[0] }) {
  return (
    <View style={styles.card}>
      <card.Icon size={28} color={card.color} />
      <Text weight="semibold" size="base" color={colors.text} style={styles.cardLabel}>
        {card.label}
      </Text>
      <Text weight="regular" size="sm" color={colors.textSub} style={styles.cardBody}>
        {card.body}
      </Text>
      <Text weight="bold" size="sm" color={colors.ember} style={styles.cardBold}>
        {card.bold}
      </Text>
    </View>
  );
}

export default function FearReflectionScreen() {
  const { gender } = useOnboardingStore();
  const btnLabel = gender === 'žensko' ? 'Spremna sam' : 'Spreman sam';

  return (
    <DarkLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
      scrollable
      footer={<WhiteButton label={btnLabel} onPress={() => router.push('/onboarding/triggers')} />}
    >
      <View style={styles.header}>
        <Text weight="semibold" size="2xl" color="#fff" style={styles.title}>
          Ove brige su normalne. Svi ih imaju.
        </Text>
        <Text weight="regular" size="sm" color="rgba(255,255,255,0.85)" style={styles.sub}>
          Iskra je napravljena tačno za ove trenutke.
        </Text>
      </View>

      <View style={styles.cards}>
        {CARDS.map((c) => (
          <ReassureCard key={c.key} card={c} />
        ))}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0E4DA',
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  cardLabel: {
    marginTop: 12,
  },
  cardBody: {
    marginTop: 7,
    lineHeight: 20,
  },
  cardBold: {
    marginTop: 12,
    lineHeight: 20,
  },
});
