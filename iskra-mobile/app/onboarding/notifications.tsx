import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { OnboardingLayout } from '../../src/components/onboarding/OnboardingLayout';
import { Text } from '../../src/components/ui/Text';
import { EmberButton } from '../../src/components/ui/Button';
import { registerForPushNotifications, savePushToken } from '../../src/lib/notifications';
import { supabase } from '../../src/lib/supabase';
import { colors, shadows } from '../../src/theme/tokens';

const TOTAL_STEPS = 18;
const STEP = 17;

const NOTIFS = [
  {
    title: 'Dan 8 — streak ide dalje',
    body: 'Već 8 dana bez cigarete. Pluća ti se zahvaljuju.',
  },
  {
    title: 'Za 2 sata: novi milestone',
    body: 'Cirkulacija se poboljšava. Oseti razliku.',
  },
  {
    title: 'Vuče te? Otvori Iskru.',
    body: 'Poriv prolazi za 5 minuta. Klikni i prođi kroz njega.',
  },
];

function BellIcon({ size = 48, color = colors.ember }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.268 21a2 2 0 0 0 3.464 0M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FlameIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"
        fill="#fff"
      />
    </Svg>
  );
}

function proceed() {
  router.push('/onboarding/review');
}

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(false);

  async function handleAllow() {
    setLoading(true);
    try {
      const token = await registerForPushNotifications();
      if (token) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await savePushToken(session.user.id, token);
        }
      }
    } catch (_) {
      // permission denied — still continue
    } finally {
      setLoading(false);
      proceed();
    }
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
        showsVerticalScrollIndicator={false}
      >
        {/* Bell icon */}
        <View style={styles.bellCircle}>
          <BellIcon size={48} color={colors.ember} />
        </View>

        <Text weight="semibold" size="2xl" style={styles.title}>
          Iskra je najkorisnija kad si tu.
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
          Šaljemo ti samo ono što je važno — nikad spam.
        </Text>

        {/* Notification examples */}
        <View style={styles.notifList}>
          {NOTIFS.map((n) => (
            <View key={n.title} style={styles.notifCard}>
              <LinearGradient
                colors={['#F0701F', colors.ember]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.notifIcon}
              >
                <FlameIcon size={18} />
              </LinearGradient>
              <View style={styles.notifText}>
                <Text weight="semibold" size="sm" color={colors.text} style={styles.notifTitle}>
                  {n.title}
                </Text>
                <Text weight="regular" size="sm" color={colors.bodyText} style={styles.notifBody}>
                  {n.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <EmberButton
          label={loading ? 'Učitavanje...' : 'Dozvoli obaveštenja'}
          onPress={handleAllow}
        />
        <TouchableOpacity
          onPress={proceed}
          activeOpacity={0.7}
          style={styles.skipBtn}
        >
          <Text weight="medium" size="sm" color={colors.textSub}>Možda kasnije</Text>
        </TouchableOpacity>
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
    paddingTop: 38,
    paddingBottom: 8,
    alignItems: 'center',
  },
  bellCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.emberTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  sub: {
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  notifList: {
    width: '100%',
    marginTop: 28,
    gap: 11,
  },
  notifCard: {
    flexDirection: 'row',
    gap: 13,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  notifIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.ember,
  },
  notifText: {
    flex: 1,
  },
  notifTitle: {
    letterSpacing: -0.2,
  },
  notifBody: {
    marginTop: 3,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
