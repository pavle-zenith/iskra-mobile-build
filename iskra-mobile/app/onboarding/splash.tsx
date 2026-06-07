import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../src/components/ui/Text';
import { EmberButton, TextButton } from '../../src/components/ui/Button';
import { IcoFlame } from '../../src/components/icons';
import { colors, spacing } from '../../src/theme/tokens';
import { track } from '../../src/lib/posthog';

// SplashScreen — matches SplashScreen.jsx from design export exactly.
// Wordmark ISKRA (weight 500, letterSpacing 4px) + ember accent line +
// tagline + "Počni" CTA + "Već imam nalog" link.

export default function SplashScreen() {
  const handleStart = () => {
    track.onboardingStarted();
    router.push('/onboarding/name');
  };

  const handleLogin = () => {
    // TODO: navigate to magic link login screen
    router.push('/onboarding/name');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Brand mark — top third */}
        <View style={styles.brandBlock}>
          <Text
            weight="medium"
            size="3xl"
            color={colors.text}
            style={styles.wordmark}
          >
            ISKRA
          </Text>
          <View style={styles.accentLine} />
        </View>

        {/* Tagline — center */}
        <View style={styles.taglineBlock}>
          <Text
            weight="semibold"
            size="xl"
            color={colors.text}
            style={styles.tagline}
          >
            {'Znaš da treba.\nIskra ti pomaže da konačno i hoćeš.'}
          </Text>
        </View>

        {/* Actions — bottom */}
        <View style={styles.actionsBlock}>
          <EmberButton label="Počni" onPress={handleStart} />
          <TextButton
            label="Već imam nalog"
            onPress={handleLogin}
            color={colors.textSub}
            style={styles.loginLink}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 16,
  },
  brandBlock: {
    marginTop: 78 + 58,
    alignItems: 'center',
  },
  wordmark: {
    letterSpacing: 4,
    paddingLeft: 4,
  },
  accentLine: {
    width: 30,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.ember,
    marginTop: 18,
  },
  taglineBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.15,
  },
  actionsBlock: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  loginLink: {
    marginTop: 4,
  },
});
