import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { radii, shadows, spacing } from '../../theme/tokens';

// Liven-style photo hero card. Photo fills card, legibility scrim overlays from bottom.
// Title + subtitle sit bottom-left above the scrim.

interface PhotoHeroCardProps {
  image: ImageSource | number;
  title: string;
  subtitle?: string;
  minHeight?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function PhotoHeroCard({
  image,
  title,
  subtitle,
  minHeight = 188,
  style,
  children,
}: PhotoHeroCardProps) {
  return (
    <View style={[styles.card, shadows.photo, { minHeight }, style]}>
      <Image
        source={image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={{ top: '28%', left: '50%' }}
      />
      {/* Legibility scrim from bottom */}
      <LinearGradient
        colors={['rgba(40,70,110,0)', 'rgba(40,70,110,0.22)', 'rgba(40,70,110,0.42)']}
        locations={[0.32, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Text bottom-left */}
      <View style={styles.textContainer}>
        <Text
          weight="bold"
          size="3xl"
          color="#fff"
          style={styles.title}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            weight="medium"
            size="sm"
            color="rgba(255,255,255,0.92)"
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.cardHero,
    overflow: 'hidden',
  },
  textContainer: {
    justifyContent: 'flex-end',
    flex: 1,
    padding: spacing['2xl'],
    paddingTop: 80,
  },
  title: {
    textShadowColor: 'rgba(30,60,100,0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  subtitle: {
    marginTop: 4,
    textShadowColor: 'rgba(30,60,100,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
