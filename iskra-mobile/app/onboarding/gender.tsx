import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { IcoChevronRight } from '../../src/components/icons';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, spacing, radii, shadows } from '../../src/theme/tokens';
import type { Gender } from '../../src/types';

const TOTAL_STEPS = 18;
const STEP = 3;

// Placeholder silhouettes (no real photos yet — design uses image-slots)
const GENDER_IMAGES: Record<string, any> = {
  'muško': null,
  'žensko': null,
};

function GenderCard({
  genderId,
  label,
  selected,
  onPress,
}: {
  genderId: 'muško' | 'žensko';
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      {/* Photo placeholder bg */}
      <View style={styles.cardPhotoArea}>
        {GENDER_IMAGES[genderId] ? (
          <Image
            source={GENDER_IMAGES[genderId]}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardPhotoArea, { backgroundColor: '#E0DBD3' }]} />
        )}
        {/* Ember gradient scrim at bottom */}
        <LinearGradient
          colors={['rgba(232,98,26,0)', 'rgba(232,98,26,0.55)', 'rgba(232,98,26,0.92)']}
          locations={[0, 0.55, 1]}
          style={styles.scrim}
          pointerEvents="none"
        />
      </View>
      {/* Label pill at bottom */}
      <View style={styles.labelPill}>
        <Text
          weight="bold"
          size="base"
          color={selected ? colors.ember : colors.text}
        >
          {label}
        </Text>
        <IcoChevronRight
          size={18}
          stroke={selected ? colors.ember : colors.text}
          strokeWidth={2.4}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function GenderScreen() {
  const { gender: storedGender, setGender } = useOnboardingStore();
  const [sel, setSel] = useState<Gender | null>(storedGender);
  const ready = sel !== null;

  function handleNext() {
    if (!ready) return;
    setGender(sel!);
    router.push('/onboarding/product');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Kako da te oslovljavamo?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Personalizujemo tvoj zdravstveni napredak na osnovu ovoga.
        </Text>
      </View>

      <View style={styles.cardsArea}>
        <View style={styles.cardsRow}>
          <GenderCard
            genderId="muško"
            label="Muško"
            selected={sel === 'muško'}
            onPress={() => setSel('muško')}
          />
          <GenderCard
            genderId="žensko"
            label="Žensko"
            selected={sel === 'žensko'}
            onPress={() => setSel('žensko')}
          />
        </View>

        <TouchableOpacity
          onPress={() => setSel('drugo')}
          activeOpacity={0.7}
          style={styles.naBtn}
        >
          <Text
            weight="medium"
            size="base"
            color={sel === 'drugo' ? colors.ember : colors.textSub}
            style={styles.naBtnText}
          >
            Preferiram da ne kažem
          </Text>
        </TouchableOpacity>
      </View>

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
  cardsArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    height: 248,
    backgroundColor: '#E9E5E0',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.ember,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  cardPhotoArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '46%',
  },
  labelPill: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  naBtn: {
    marginTop: 22,
    alignSelf: 'center',
  },
  naBtnText: {
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
