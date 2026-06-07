import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, spacing, radii, gradients } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 5;

type Currency = 'RSD' | 'EUR';
const EUR_TO_RSD = 117;

function CurrencyToggle({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
}) {
  const opts: Currency[] = ['RSD', 'EUR'];
  return (
    <View style={styles.toggleContainer}>
      {opts.map((o) => {
        const active = value === o;
        return active ? (
          <LinearGradient
            key={o}
            colors={gradients.ember}
            start={gradients.emberVertical.start}
            end={gradients.emberVertical.end}
            style={styles.toggleOption}
          >
            <TouchableOpacity
              onPress={() => onChange(o)}
              activeOpacity={0.85}
              style={styles.toggleBtn}
            >
              <Text weight="bold" size="sm" color="#fff">{o}</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <TouchableOpacity
            key={o}
            onPress={() => onChange(o)}
            activeOpacity={0.7}
            style={[styles.toggleOption, styles.toggleInactive]}
          >
            <Text weight="bold" size="sm" color={colors.textSub}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function PriceScreen() {
  const { packPriceRSD: stored, setPackPriceRSD } = useOnboardingStore();
  const [amount, setAmount] = useState(stored ? String(stored) : '400');
  const [currency, setCurrency] = useState<Currency>('RSD');
  const [focused, setFocused] = useState(false);

  const ready = amount.trim() !== '' && Number(amount) > 0;

  function handleNext() {
    if (!ready) return;
    const numericAmount = parseFloat(amount);
    const inRSD = currency === 'EUR' ? Math.round(numericAmount * EUR_TO_RSD) : Math.round(numericAmount);
    setPackPriceRSD(inRSD);
    router.push('/onboarding/cost-aha');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Koliko košta tvoja kutija?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Koristimo ovo da izračunamo koliko ćeš uštedeti.
        </Text>

        {/* Input + currency toggle */}
        <View style={styles.inputRow}>
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <TextInput
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/\D/g, ''))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              placeholder="400"
              placeholderTextColor={colors.textGhost}
              style={styles.input}
            />
          </View>
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </View>

        <Text weight="regular" size="sm" color={colors.textGhost} style={styles.hint}>
          Marlboro u Srbiji košta oko 400–500 RSD.
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <EmberButton
          label="Nastavi"
          onPress={handleNext}
          disabled={!ready}
        />
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  inputWrapper: {
    flex: 1,
    height: 56,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: colors.ember,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    fontSize: 17,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.text,
    letterSpacing: -0.2,
  },
  toggleContainer: {
    flexDirection: 'row',
    height: 56,
    padding: 4,
    backgroundColor: '#F4F3F0',
    borderRadius: radii.input,
    gap: 3,
    flexShrink: 0,
  },
  toggleOption: {
    borderRadius: 9,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 15,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleInactive: {
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 14,
    marginLeft: 2,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
