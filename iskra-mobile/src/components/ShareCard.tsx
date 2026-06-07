import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Share,
  Alert,
} from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './ui/Text';
import { colors } from '../theme/tokens';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShareCardVariant =
  | { type: 'milestone'; title: string; unlockText: string; category: string; gradientColors: readonly [string, string] }
  | { type: 'streak'; days: number; name?: string }
  | { type: 'money'; amountRSD: number; days: number }
  | { type: 'cigarettes'; count: number; days: number };

// ── Category gradient map ─────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  zdravlje: 'ZDRAVLJE',
  pluca: 'PLUĆA',
  finansije: 'FINANSIJE',
  telo: 'TELO',
  nikotin: 'NIKOTIN',
  ekologija: 'EKOLOGIJA',
};

// ── The offscreen card (1080×1920 logical scale) ──────────────────────────────

interface CardContentProps {
  variant: ShareCardVariant;
}

function CardContent({ variant }: CardContentProps) {
  if (variant.type === 'milestone') {
    return (
      <LinearGradient
        colors={[variant.gradientColors[0], variant.gradientColors[1]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.card}
      >
        {/* Texture overlay */}
        <Image
          source={require('../../assets/images/share-sky.webp')}
          style={styles.texture}
          resizeMode="cover"
        />

        {/* Top: wordmark + category */}
        <View style={styles.topRow}>
          <Text weight="bold" style={styles.wordmark}>ISKRA</Text>
          <View style={styles.catPill}>
            <Text weight="bold" style={styles.catPillText}>
              {CATEGORY_LABEL[variant.category] ?? variant.category.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Center: milestone text */}
        <View style={styles.centerContent}>
          <Text weight="bold" style={styles.milestoneTitle}>{variant.title}</Text>
          <Text weight="medium" style={styles.milestoneUnlock}>{variant.unlockText}</Text>
        </View>

        {/* Bottom: tagline */}
        <View style={styles.bottomRow}>
          <Text weight="regular" style={styles.tagline}>iskraclub.com</Text>
          <View style={styles.dot} />
          <Text weight="regular" style={styles.tagline}>Slobodan/na</Text>
        </View>
      </LinearGradient>
    );
  }

  if (variant.type === 'streak') {
    return (
      <LinearGradient
        colors={[colors.emberTop, colors.emberDeep]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.card}
      >
        <Image
          source={require('../../assets/images/share-sky.webp')}
          style={styles.texture}
          resizeMode="cover"
        />

        <View style={styles.topRow}>
          <Text weight="bold" style={styles.wordmark}>ISKRA</Text>
        </View>

        <View style={styles.centerContent}>
          <Text weight="bold" style={styles.bigNumber}>{variant.days}</Text>
          <Text weight="medium" style={styles.bigNumberLabel}>
            {variant.days === 1 ? 'DAN BEZ DIMA' : 'DANA BEZ DIMA'}
          </Text>
          {variant.name ? (
            <Text weight="regular" style={styles.streakName}>{variant.name}</Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <Text weight="regular" style={styles.tagline}>iskraclub.com</Text>
        </View>
      </LinearGradient>
    );
  }

  if (variant.type === 'money') {
    return (
      <LinearGradient
        colors={['#3A7A3A', '#2D6A2D']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.card}
      >
        <Image
          source={require('../../assets/images/share-sky.webp')}
          style={styles.texture}
          resizeMode="cover"
        />

        <View style={styles.topRow}>
          <Text weight="bold" style={styles.wordmark}>ISKRA</Text>
          <View style={[styles.catPill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Text weight="bold" style={styles.catPillText}>FINANSIJE</Text>
          </View>
        </View>

        <View style={styles.centerContent}>
          <Text weight="regular" style={styles.moneyLabel}>Uštedeo/la sam</Text>
          <Text weight="bold" style={styles.moneyAmount}>
            {variant.amountRSD.toLocaleString('sr-RS')} RSD
          </Text>
          <Text weight="medium" style={styles.moneyDays}>
            za {variant.days} {variant.days === 1 ? 'dan' : 'dana'} bez cigarete
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text weight="regular" style={styles.tagline}>iskraclub.com</Text>
        </View>
      </LinearGradient>
    );
  }

  // cigarettes
  return (
    <LinearGradient
      colors={['#C24A43', '#A83A33']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.card}
    >
      <Image
        source={require('../../assets/images/share-sky.webp')}
        style={styles.texture}
        resizeMode="cover"
      />

      <View style={styles.topRow}>
        <Text weight="bold" style={styles.wordmark}>ISKRA</Text>
      </View>

      <View style={styles.centerContent}>
        <Text weight="bold" style={styles.bigNumber}>{variant.count}</Text>
        <Text weight="medium" style={styles.bigNumberLabel}>
          {variant.count === 1 ? 'CIGARETA ODBIJENA' : 'CIGARETA ODBIJENO'}
        </Text>
        <Text weight="regular" style={styles.moneyDays}>
          za {variant.days} {variant.days === 1 ? 'dan' : 'dana'} slobode
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text weight="regular" style={styles.tagline}>iskraclub.com</Text>
      </View>
    </LinearGradient>
  );
}

// ── Hook: capture and share ───────────────────────────────────────────────────

export function useShareCard() {
  const shotRef = useRef<ViewShotRef>(null);

  const captureAndShare = useCallback(async () => {
    try {
      const uri = await shotRef.current?.capture?.();
      if (!uri) throw new Error('capture failed');
      await Share.share({ url: uri });
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Greška', 'Nije moguće podeliti sliku. Pokušaj ponovo.');
      }
    }
  }, []);

  return { shotRef, captureAndShare };
}

// ── ShareCard component ───────────────────────────────────────────────────────

interface ShareCardProps {
  variant: ShareCardVariant;
  shotRef: React.RefObject<ViewShotRef | null>;
}

export function ShareCard({ variant, shotRef }: ShareCardProps) {
  return (
    // Positioned offscreen so it renders but isn't visible
    <View style={styles.offscreen} pointerEvents="none">
      <ViewShot
        ref={shotRef}
        options={{ format: 'jpg', quality: 0.95, width: 1080, height: 1080 }}
        style={styles.shotContainer}
      >
        <CardContent variant={variant} />
      </ViewShot>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_SIZE = 360; // logical pts — ViewShot scales to 1080 via width option

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -2000,
    left: -2000,
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  shotContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 0,
    padding: 32,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  texture: {
    ...StyleSheet.absoluteFill,
    opacity: 0.10,
  },

  // Layout sections
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Wordmark
  wordmark: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 3.5,
    fontFamily: 'Manrope_700Bold',
  },

  // Category pill
  catPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  catPillText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
    fontFamily: 'Manrope_700Bold',
  },

  // Milestone card text
  milestoneTitle: {
    fontSize: 42,
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 48,
    fontFamily: 'Manrope_700Bold',
  },
  milestoneUnlock: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 10,
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium',
  },

  // Streak / cigarettes big number
  bigNumber: {
    fontSize: 96,
    color: '#fff',
    letterSpacing: -3,
    lineHeight: 100,
    fontFamily: 'Manrope_800ExtraBold',
  },
  bigNumberLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 2,
    marginTop: 4,
    fontFamily: 'Manrope_600SemiBold',
  },
  streakName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
    fontFamily: 'Manrope_400Regular',
  },

  // Money card
  moneyLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.2,
    fontFamily: 'Manrope_400Regular',
  },
  moneyAmount: {
    fontSize: 52,
    color: '#fff',
    letterSpacing: -1.5,
    lineHeight: 62,
    marginTop: 6,
    fontFamily: 'Manrope_700Bold',
  },
  moneyDays: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    fontFamily: 'Manrope_500Medium',
  },

  // Bottom tagline
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
    fontFamily: 'Manrope_400Regular',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
