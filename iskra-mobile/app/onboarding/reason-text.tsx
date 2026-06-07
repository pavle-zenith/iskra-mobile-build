import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors, spacing, radii } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 8;
const MAX = 120;

const CHIPS = ['Zbog zdravlja', 'Zbog dece', 'Zbog para', 'Zbog sebe', 'Zbog partnera'];

export default function ReasonTextScreen() {
  const { reasonText: stored, setReasonText } = useOnboardingStore();
  const [val, setVal] = useState(stored || '');
  const [focused, setFocused] = useState(false);
  const ready = val.trim().length > 0;

  function handleNext() {
    if (!ready) return;
    setReasonText(val.trim());
    router.push('/onboarding/reflection');
  }

  return (
    <OnboardingLayout
      step={STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => router.back()}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text weight="semibold" size="2xl" style={styles.title}>
          Zapiši to svojim rečima.
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Pokazaćemo ti ovo svaki put kad bude najteže.
        </Text>

        {/* TextArea */}
        <View style={[styles.textareaWrapper, focused && styles.textareaFocused]}>
          <TextInput
            value={val}
            onChangeText={(t) => setVal(t.slice(0, MAX))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Hoću da uštedim za letovanje"
            placeholderTextColor={colors.textGhost}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textarea}
          />
          <Text weight="medium" size="xs" color={colors.textGhost} style={styles.charCount}>
            {val.length} / {MAX}
          </Text>
        </View>

        {/* Example chips */}
        <View style={styles.chipsRow}>
          {CHIPS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setVal(c.slice(0, MAX))}
              activeOpacity={0.7}
              style={styles.chip}
            >
              <Text weight="medium" size="xs" color={colors.textMuted}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text weight="regular" size="sm" color={colors.textGhost} style={styles.privacyNote}>
          Samo ti ovo vidiš. Nikad ne delimo.
        </Text>
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 16,
  },
  title: {
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  sub: {
    marginTop: 12,
    lineHeight: 22,
  },
  textareaWrapper: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    padding: 20,
    minHeight: 160,
  },
  textareaFocused: {
    borderColor: colors.ember,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textarea: {
    fontSize: 17,
    fontFamily: 'Manrope_500Medium',
    color: colors.text,
    lineHeight: 26,
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },
  chip: {
    backgroundColor: '#F1EEE9',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  privacyNote: {
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
});
