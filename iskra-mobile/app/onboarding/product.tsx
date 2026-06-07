import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { IcoCigarette, IcoCheck } from '../../src/components/icons';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, spacing, radii, gradients, shadows } from '../../src/theme/tokens';
import type { Product } from '../../src/types';

const TOTAL_STEPS = 18;
const STEP = 4;

function IqosIcon({ size = 32, color = '#4A6080' }: { size?: number; color?: string }) {
  const { Svg, Rect, Path } = require('react-native-svg');
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="8" y="2.5" width="8" height="19" rx="2.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 7h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M12 11.5v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function ProductCard({
  productId,
  icon,
  chipBg,
  iconColor,
  title,
  sub,
  selected,
  onPress,
}: {
  productId: Product;
  icon: React.ReactNode;
  chipBg: string;
  iconColor: string;
  title: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardWrapper}>
      {selected ? (
        <LinearGradient
          colors={gradients.ember}
          start={gradients.emberVertical.start}
          end={gradients.emberVertical.end}
          style={[styles.card, styles.cardSelected]}
        >
          <CardInner icon={icon} chipBg="#fff" title={title} sub={sub} selected={true} />
        </LinearGradient>
      ) : (
        <View style={[styles.card, styles.cardUnselected]}>
          <CardInner icon={icon} chipBg={chipBg} title={title} sub={sub} selected={false} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function CardInner({
  icon,
  chipBg,
  title,
  sub,
  selected,
}: {
  icon: React.ReactNode;
  chipBg: string;
  title: string;
  sub: string;
  selected: boolean;
}) {
  return (
    <View style={styles.cardRow}>
      <View style={[styles.chip, { backgroundColor: chipBg }]}>
        {icon}
      </View>
      <View style={styles.textBlock}>
        <Text
          weight="semibold"
          size="lg"
          color={selected ? '#fff' : colors.text}
        >
          {title}
        </Text>
        <Text
          weight="regular"
          size="sm"
          color={selected ? 'rgba(255,255,255,0.82)' : colors.textSub}
          style={{ marginTop: 4 }}
        >
          {sub}
        </Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && (
          <IcoCheck size={13} stroke={colors.ember} strokeWidth={3} />
        )}
      </View>
    </View>
  );
}

export default function ProductScreen() {
  const { product: storedProduct, setProduct } = useOnboardingStore();
  const [sel, setSel] = useState<Product>(storedProduct || 'cigarete');
  const ready = sel !== null;

  function handleNext() {
    if (!ready) return;
    setProduct(sel);
    router.push('/onboarding/cigarettes');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.questionBlock}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Šta koristiš?
        </Text>
        <Text weight="regular" size="base" color={colors.textSub} style={styles.sub}>
          Prilagodićemo Iskru tebi.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <ProductCard
          productId="cigarete"
          icon={<IcoCigarette size={32} stroke={sel === 'cigarete' ? colors.ember : colors.ember} strokeWidth={1.8} />}
          chipBg={colors.emberTint}
          iconColor={colors.ember}
          title="Cigarete"
          sub="Klasično pušenje"
          selected={sel === 'cigarete'}
          onPress={() => setSel('cigarete')}
        />
        <ProductCard
          productId="iqos"
          icon={<IqosIcon size={32} color={sel === 'iqos' ? colors.ember : '#4A6080'} />}
          chipBg="#EDF2F8"
          iconColor="#4A6080"
          title="IQOS"
          sub="Zagrevani duvan"
          selected={sel === 'iqos'}
          onPress={() => setSel('iqos')}
        />
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <EmberButton
          label="Nastavljam"
          onPress={handleNext}
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
  cardsContainer: {
    paddingHorizontal: 26,
    paddingTop: 32,
    gap: 12,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 23,
    minHeight: 120,
  },
  cardSelected: {
    ...shadows.ember,
  },
  cardUnselected: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.borderInput,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  chip: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderInput,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderWidth: 0,
    backgroundColor: '#fff',
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
