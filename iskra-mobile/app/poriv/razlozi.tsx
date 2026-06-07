// Reasons tool — user's personal reason text + signature
import React from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { IcoX, IcoFlame } from '../../src/components/icons';
import { colors, shadows } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { supabase } from '../../src/lib/supabase';

export default function PorivRazloziScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();
  const [userId, setUserId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);

  const { profile } = useUserData(userId);

  const reasonText = profile?.reason_text ?? 'Odlučio/la sam da prestanem pušiti jer mi je stalo do zdravlja i do onih koje volim.';
  const signatureData = profile?.signature_data;
  const daysSincePledge = profile?.quit_date
    ? Math.floor((Date.now() - new Date(profile.quit_date).getTime()) / 86400000)
    : 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke={colors.textSub} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.topLabel}>MOJI RAZLOZI</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Day fact */}
        <View style={styles.dayBadge}>
          <IcoFlame size={14} stroke={colors.ember} strokeWidth={2} />
          <Text weight="bold" size="xs" color={colors.ember} style={{ marginLeft: 6 }}>
            Dan {daysSincePledge} bez cigarete
          </Text>
        </View>

        {/* Quote card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>"</Text>
          <Text weight="medium" color={colors.text} style={styles.quoteText}>
            {reasonText}
          </Text>
        </View>

        {/* Signature */}
        {signatureData ? (
          <View style={styles.signatureCard}>
            <Text weight="medium" size="xs" color={colors.textSub} style={styles.signatureLabel}>
              Tvoj potpis — potvrda dogovora
            </Text>
            <Image
              source={{ uri: signatureData }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {/* Motivational card */}
        <View style={styles.factCard}>
          <IcoFlame size={16} stroke={colors.ember} strokeWidth={1.9} />
          <Text weight="regular" size="sm" color={colors.bodyText} style={styles.factText}>
            Ovaj razlog si zapisao/la u trenutku kada si bio/la najspremniji/a. Veruj sebi od tada.
          </Text>
        </View>
      </ScrollView>

      {/* Done button */}
      <TouchableOpacity
        style={[styles.doneBtn, { marginBottom: insets.bottom + 16 }]}
        onPress={() => router.replace({ pathname: '/poriv/success', params: { strength, trigger } })}
        activeOpacity={0.85}
      >
        <Text weight="bold" size="base" color={colors.ember}>Završio/la sam</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1EDE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontSize: 11,
    color: colors.textSub,
    letterSpacing: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 26,
    paddingBottom: 8,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.emberTint,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 24,
    marginTop: 8,
  },
  quoteCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  quoteMark: {
    fontSize: 40,
    lineHeight: 30,
    color: colors.ember,
    opacity: 0.3,
    fontFamily: 'serif',
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: -0.2,
    marginTop: 8,
  },
  signatureCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginTop: 16,
  },
  signatureLabel: {
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  signatureImage: {
    width: '100%',
    height: 100,
  },
  factCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  factText: {
    flex: 1,
    lineHeight: 20,
  },
  doneBtn: {
    marginHorizontal: 26,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ember,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
