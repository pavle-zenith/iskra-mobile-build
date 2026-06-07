import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, spacing, radii, gradients, shadows } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 5;

export default function CigarettesScreen() {
  const {
    cigarettesPerDay: stored,
    cigarettesPerPack: storedPack,
    setCigarettesPerDay,
    setCigarettesPerPack,
  } = useOnboardingStore();

  const [count, setCount] = useState(stored || 20);
  const [perPack, setPerPack] = useState(String(storedPack || 20));
  const [ppFocused, setPpFocused] = useState(false);

  function dec() {
    setCount((c) => Math.max(1, c - 1));
  }
  function inc() {
    setCount((c) => Math.min(80, c + 1));
  }

  function handleNext() {
    setCigarettesPerDay(count);
    const pp = parseInt(perPack, 10);
    setCigarettesPerPack(pp > 0 ? pp : 20);
    router.push('/onboarding/price');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Koliko cigareta dnevno si pušio/la?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Koristimo ovo da izračunamo tvoje uštedine.
        </Text>
      </View>

      {/* Stepper + per-pack */}
      <View style={styles.center}>
        <View style={styles.stepperRow}>
          {/* Minus */}
          <TouchableOpacity
            onPress={dec}
            activeOpacity={count > 1 ? 0.7 : 1}
            style={[styles.circleBtn, count <= 1 && styles.circleBtnDisabled]}
          >
            <Text weight="bold" size="xl" color="#9A968F">−</Text>
          </TouchableOpacity>

          {/* Number */}
          <View style={styles.numberBlock}>
            <Text weight="semibold" size="5xl" style={styles.bigNumber}>
              {count}
            </Text>
            <Text weight="medium" size="sm" color={colors.textSub} style={{ marginTop: 8 }}>
              cigareta dnevno
            </Text>
          </View>

          {/* Plus */}
          <LinearGradient
            colors={gradients.ember}
            start={gradients.emberVertical.start}
            end={gradients.emberVertical.end}
            style={styles.plusBtn}
          >
            <TouchableOpacity
              onPress={inc}
              activeOpacity={0.8}
              style={styles.plusBtnInner}
            >
              <Text weight="bold" size="xl" color="#fff">+</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <Text weight="regular" size="sm" color={colors.textGhost} style={styles.hint}>
          Prosek u Srbiji je oko 15 cigareta dnevno.
        </Text>

        {/* Divider + cigarettes per pack */}
        <View style={styles.dividerSection}>
          <View style={styles.divider} />
          <View style={styles.perPackRow}>
            <View>
              <Text weight="medium" size="base" color={colors.text}>Cigara u pakli</Text>
              <Text weight="regular" size="sm" color={colors.textSub} style={{ marginTop: 2 }}>Najčešće 20</Text>
            </View>
            <TextInput
              value={perPack}
              onChangeText={(t) => setPerPack(t.replace(/\D/g, '').slice(0, 2))}
              onFocus={() => setPpFocused(true)}
              onBlur={() => setPpFocused(false)}
              keyboardType="number-pad"
              placeholder="20"
              placeholderTextColor={colors.textGhost}
              style={[
                styles.perPackInput,
                ppFocused && styles.perPackInputFocused,
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <EmberButton label="Nastavi" onPress={handleNext} />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnDisabled: {
    opacity: 0.45,
  },
  plusBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    ...shadows.ember,
  },
  plusBtnInner: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBlock: {
    minWidth: 86,
    alignItems: 'center',
  },
  bigNumber: {
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  hint: {
    marginTop: 40,
    textAlign: 'center',
  },
  dividerSection: {
    width: '100%',
    paddingHorizontal: 26,
    marginTop: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  perPackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  perPackInput: {
    width: 84,
    height: 52,
    textAlign: 'center',
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    backgroundColor: '#fff',
    color: colors.text,
    fontSize: 24,
    fontFamily: 'Manrope_600SemiBold',
  },
  perPackInputFocused: {
    borderColor: colors.ember,
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
