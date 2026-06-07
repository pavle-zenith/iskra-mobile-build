import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme/tokens';
import { IcoArrowLeft } from '../icons';

// Shared wrapper for all light onboarding screens.
// Renders: 2px ember progress bar + back button + safe-area-aware children.

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;           // current step (1-based)
  totalSteps: number;     // total steps for progress calc
  onBack?: () => void;
  showBack?: boolean;
  noProgress?: boolean;   // for commitment screen
}

export function OnboardingLayout({
  children,
  step,
  totalSteps,
  onBack,
  showBack = true,
  noProgress = false,
}: OnboardingLayoutProps) {
  const pct = (step / totalSteps) * 100;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      {/* Progress bar */}
      {!noProgress && (
        <View style={styles.trackContainer}>
          <View style={[styles.trackFill, { width: `${pct}%` }]} />
        </View>
      )}
      {/* Back button */}
      {showBack && (
        <View style={styles.backRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IcoArrowLeft size={20} stroke="#A8A5A0" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  trackContainer: {
    height: 2,
    backgroundColor: '#E8E8E8',
  },
  trackFill: {
    height: 2,
    backgroundColor: colors.ember,
  },
  backRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FAF9F7',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
