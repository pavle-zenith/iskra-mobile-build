import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { DarkLayout } from '../../src/components/onboarding/DarkLayout';
import { Text } from '../../src/components/ui/Text';
import { WhiteButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, radii, shadows } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 6;

function formatRSD(n: number): string {
  return n.toLocaleString('sr-RS').replace(/\./g, '.');
}

export default function CostAhaScreen() {
  const store = useOnboardingStore();
  const annual = store.getAnnualCostRSD();

  return (
    <DarkLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.center}>
        <Text
          weight="bold"
          size="xs"
          color="rgba(255,255,255,0.7)"
          style={styles.eyebrow}
        >
          TVOJI PODACI
        </Text>

        <Text
          weight="regular"
          size="lg"
          color="#fff"
          style={styles.label}
        >
          Godišnje trošiš na cigarete
        </Text>

        {/* White card */}
        <View style={styles.card}>
          <Text
            weight="bold"
            size="5xl"
            color={colors.ember}
            style={styles.bigNumber}
          >
            {annual > 0 ? formatRSD(annual) : '0'}
          </Text>
          <Text
            weight="semibold"
            size="xl"
            color={colors.ember}
            style={styles.currency}
          >
            RSD
          </Text>

          <View style={styles.divider} />

          <Text
            weight="medium"
            size="sm"
            color={colors.textSub}
            style={styles.equivalent}
          >
            = 10 dana odmora na moru
          </Text>
        </View>

        <Text
          weight="medium"
          size="base"
          color="#fff"
          style={styles.tagline}
        >
          Iskra ti vraća taj novac — dan po dan.
        </Text>
      </View>

      <View style={styles.footer}>
        <WhiteButton
          label="Nastavi"
          onPress={() => router.push('/onboarding/reasons')}
        />
      </View>
    </DarkLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  eyebrow: {
    letterSpacing: 2,
    marginBottom: 16,
  },
  label: {
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 22,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 48,
    elevation: 16,
  },
  bigNumber: {
    letterSpacing: -2,
    lineHeight: 76,
  },
  currency: {
    marginTop: 8,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEECE8',
    width: '100%',
    marginVertical: 22,
  },
  equivalent: {
    textAlign: 'center',
  },
  tagline: {
    marginTop: 26,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.92,
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
