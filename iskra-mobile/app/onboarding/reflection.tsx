import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { DarkLayout } from '../../src/components/onboarding/DarkLayout';
import { Text } from '../../src/components/ui/Text';
import { WhiteButton } from '../../src/components/ui/Button';
import { colors } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 9;

function HeartIcon({ size = 28, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function PeopleIcon({ size = 28, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function BirdIcon({ size = 28, color = '#1A1A1A', sw = 1.9 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 13 Q8 7 12 13 Q16 7 20 13" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const CARDS = [
  {
    key: 'zdravlje',
    label: 'Zdravlje',
    color: '#D4547E',
    Icon: HeartIcon,
    body: 'Već 20 minuta nakon poslednje cigarete, krvni pritisak počinje da se normalizuje.',
    bold: 'Tvoje telo je već spremno da počne.',
  },
  {
    key: 'porodica',
    label: 'Porodica',
    color: '#4A6080',
    Icon: PeopleIcon,
    body: 'Pasivno pušenje utiče na ljude oko tebe — posebno decu.',
    bold: 'Oni su tvoj razlog broj jedan.',
  },
  {
    key: 'sloboda',
    label: 'Sloboda',
    color: '#6B52A8',
    Icon: BirdIcon,
    body: 'Nikotin stvara iluziju opuštanja. Bez njega, stres se zapravo lakše podnosi.',
    bold: 'Sloboda počinje prvim danom.',
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

export default function ReflectionScreen() {
  return (
    <DarkLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
      scrollable
      footer={<WhiteButton label="Razumem" onPress={() => router.push('/onboarding/fears')} />}
    >
      <View style={styles.header}>
        <Text weight="semibold" size="2xl" color="#fff" style={styles.title}>
          Znamo da prestanak nije lako.
        </Text>
        <Text weight="regular" size="sm" color="rgba(255,255,255,0.85)" style={styles.sub}>
          Ali tvoji razlozi su jači od navike.
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
  footer: {
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 38,
  },
});
