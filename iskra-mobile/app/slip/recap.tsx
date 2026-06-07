// Slip recap — "N dana su tvoja zauvek." health card + reason card + CTA
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { colors, shadows } from '../../src/theme/tokens';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';

const BLUE = '#4A8AC4';
const ROSE = '#D4547E';

function LungsIcon({ size = 20, stroke = BLUE }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4v8" />
      <Path d="M9.5 9.5c-2 0-4 2-4 6 0 2 .5 4 2.2 4 1.3 0 1.8-1.1 1.8-2.6V11c0-.85-.7-1.5-1.5-1.5Z" />
      <Path d="M14.5 9.5c2 0 4 2 4 6 0 2-.5 4-2.2 4-1.3 0-1.8-1.1-1.8-2.6V11c0-.85.7-1.5 1.5-1.5Z" />
    </Svg>
  );
}

function HeartIcon({ size = 20, stroke = ROSE }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" />
    </Svg>
  );
}

// Health milestone text based on days clean
function getHealthMilestone(days: number): string {
  if (days >= 365) return 'Rizik od srčanih bolesti prepolovio se.';
  if (days >= 180) return 'Plućna funkcija je značajno bolja.';
  if (days >= 90) return 'Cirkulacija i disanje su znatno poboljšani.';
  if (days >= 30) return 'Tvoja plućna funkcija je već 30% bolja.';
  if (days >= 14) return 'Krvni pritisak se normalizovao.';
  if (days >= 7) return 'Tvoje telo je eliminisalo nikotin.';
  if (days >= 3) return 'Dijanica i ukus su se poboljšali.';
  if (days >= 1) return 'Kiseonik u krvi je na normalnom nivou.';
  return 'Telo počinje oporavak od prvog sata.';
}

export default function SlipRecapScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);

  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  const totalDays = stats.totalDaysClean ?? 0;
  const healthText = getHealthMilestone(totalDays);
  const reasonText = profile?.reason_text ?? 'Hoću da vidim decu kako odrastaju.';
  const signatureData = profile?.signature_data;

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 0.985, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />

        {/* Headline */}
        <Text weight="bold" style={styles.eyebrow}>TVOJE</Text>
        <Text weight="semibold" color={colors.text} style={styles.headline}>
          {totalDays} dana su tvoja zauvek.
        </Text>

        {/* Health card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LungsIcon size={20} stroke={BLUE} />
            <Text weight="bold" style={styles.cardEyebrow}>ZDRAVLJE</Text>
          </View>
          <Text weight="medium" color={colors.text} style={styles.cardTitle}>
            {healthText}
          </Text>
          <Text weight="regular" size="sm" color={colors.textSub} style={styles.cardNote}>
            Jedna cigareta to ne menja.
          </Text>
        </View>

        {/* Personal reason card */}
        <View style={[styles.card, styles.reasonCard]}>
          <View style={styles.cardHeader}>
            <HeartIcon size={20} stroke={ROSE} />
            <Text weight="bold" style={[styles.cardEyebrow, { color: ROSE }]}>ZAŠTO SI POČEO/LA</Text>
          </View>
          <Text weight="medium" color={colors.text} style={styles.reasonText}>
            {reasonText}
          </Text>

          <View style={styles.reasonDivider} />

          <Text weight="bold" style={styles.signatureLabel}>TVOJ POTPIS</Text>
          {signatureData ? (
            <Image
              source={{ uri: signatureData }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.signaturePlaceholder} />
          )}

          {/* Faded quote mark */}
          <Text style={styles.quoteMark}>"</Text>
        </View>

        <View style={styles.spacer} />

        {/* Bridge line */}
        <Text weight="regular" size="base" color={colors.textSub} style={styles.bridgeLine}>
          Dan 1 počinje upravo sad.
        </Text>

        <View style={styles.spacerSmall} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <Pressable onPress={() => router.replace('/(tabs)')} onPressIn={onPressIn} onPressOut={onPressOut}>
            <LinearGradient
              colors={[colors.emberTop, colors.ember]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.ctaBtn}
            >
              <Text weight="bold" size="lg" color="#fff">Nastavljam dalje</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FEF6F0',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  spacer: { height: 12 },
  spacerSmall: { height: 8 },
  eyebrow: {
    fontSize: 11,
    color: colors.ember,
    letterSpacing: 1,
    textAlign: 'center',
  },
  headline: {
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginTop: 28,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(120,44,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  reasonCard: {
    borderWidth: 1.5,
    borderColor: '#F3C3A6',
    marginTop: 12,
    shadowColor: 'rgba(232,98,26,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    color: BLUE,
  },
  cardTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
    marginTop: 8,
  },
  cardNote: {
    marginTop: 6,
  },
  reasonText: {
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: -0.2,
    marginTop: 14,
    fontStyle: 'italic',
  },
  reasonDivider: {
    height: 1,
    backgroundColor: '#F0E8E0',
    marginTop: 16,
  },
  signatureLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#CCC',
    marginTop: 14,
  },
  signatureImage: {
    width: '100%',
    height: 52,
    marginTop: 4,
    marginLeft: 6,
  },
  signaturePlaceholder: {
    width: '100%',
    height: 52,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  quoteMark: {
    position: 'absolute',
    right: 14,
    top: -18,
    fontSize: 120,
    lineHeight: 120,
    color: colors.ember,
    opacity: 0.1,
    fontFamily: 'serif',
    pointerEvents: 'none',
  },
  bridgeLine: {
    textAlign: 'center',
    paddingBottom: 4,
  },
  footer: {
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  ctaBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.ember,
  },
});
