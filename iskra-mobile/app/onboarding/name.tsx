import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, spacing, radii } from '../../src/theme/tokens';
import { supabase } from '../../src/lib/supabase';
// import { identifyUser } from '../../src/lib/revenuecat'; // re-enable with dev client

const TOTAL_STEPS = 18;
const STEP = 2;

export default function NameScreen() {
  const { name: storedName, setName } = useOnboardingStore();
  const [name, setLocalName] = useState(storedName);
  const [focused, setFocused] = useState(false);
  const ready = name.trim().length > 0;

  async function handleNext() {
    if (!ready) return;
    setName(name.trim());

    // Create anonymous Supabase session if not already signed in.
    // This runs silently — no email/password needed. The session persists
    // through the entire onboarding flow so completeOnboarding can write the profile.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signInAnonymously();
      // identifyUser(userId) — re-enable with dev client
    }

    router.push('/onboarding/gender');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <View style={styles.content}>
        <Text weight="semibold" size="2xl" style={styles.title}>
          Kako da te zovemo?
        </Text>
        <Text weight="regular" size="base" color={colors.textSub} style={styles.sub}>
          Koristićemo ovo ime kroz celu aplikaciju.
        </Text>
        <TextInput
          value={name}
          onChangeText={setLocalName}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Tvoje ime"
          placeholderTextColor={colors.textGhost}
          style={[
            styles.input,
            focused && styles.inputFocused,
          ]}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleNext}
        />
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
  content: {
    flex: 1,
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
  input: {
    marginTop: 30,
    height: 56,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.borderInput,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    color: colors.text,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: colors.ember,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
