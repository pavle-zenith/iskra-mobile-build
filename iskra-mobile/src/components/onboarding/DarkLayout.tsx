import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing } from '../../theme/tokens';
import { IcoArrowLeft } from '../icons';

// Wrapper for inverted ember [DARK] onboarding screens.
// Full ember gradient bg, white progress bar, white back arrow.

interface DarkLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  noProgress?: boolean;
  scrollable?: boolean;
  scrollEnabled?: boolean;
  footer?: React.ReactNode;
}

export function DarkLayout({
  children,
  step,
  totalSteps,
  onBack,
  showBack = true,
  noProgress = false,
  scrollable = false,
  scrollEnabled = true,
  footer,
}: DarkLayoutProps) {
  const pct = (step / totalSteps) * 100;
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradients.ember}
      start={gradients.emberVertical.start}
      end={gradients.emberVertical.end}
      style={styles.gradient}
    >
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        {/* White progress bar */}
        {!noProgress && (
          <View style={styles.trackContainer}>
            <View style={[styles.trackFill, { width: `${pct}%` }]} />
          </View>
        )}
        {/* Back button — glass style */}
        {showBack && (
          <View style={styles.backRow}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <IcoArrowLeft size={20} stroke="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.flex}>{children}</View>
        )}
        {footer && (
          <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  footerContainer: {
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  trackContainer: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  trackFill: {
    height: 2,
    backgroundColor: '#fff',
  },
  backRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
