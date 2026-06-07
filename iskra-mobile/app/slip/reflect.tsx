// Slip reflect screen — single-select trigger + inline contextual response
import React, { useState, useRef } from 'react';
import {
  View,
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
import { IcoX } from '../../src/components/icons';
import { colors, shadows } from '../../src/theme/tokens';
import { supabase } from '../../src/lib/supabase';

// Trigger icon components
function CoffeeIcon({ size = 18, stroke = '#BA7517' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M17 8h1a4 4 0 0 1 0 8h-1" /><Path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><Path d="M6 2v2M10 2v2M14 2v2" /></Svg>;
}
function SunIcon({ size = 18, stroke = colors.ember }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Circle cx={12} cy={12} r={4} /><Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Svg>;
}
function PeopleIcon({ size = 18, stroke = '#4A6080' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><Circle cx={9} cy={7} r={4} /><Path d="M22 21v-2a4 4 0 0 0-3-3.87" /><Path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>;
}
function StormIcon({ size = 18, stroke = '#4A6080' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" /><Path d="m13 12-3 5h4l-3 5" /></Svg>;
}
function ForkIcon({ size = 18, stroke = '#3A7A3A' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" /><Path d="M5 11v11" /><Path d="M19 2v20" /><Path d="M19 14c2 0 2.5-2 2.5-5 0-4-1-7-2.5-7s-2.5 3-2.5 7c0 3 .5 5 2.5 5Z" /></Svg>;
}
function BeerIcon({ size = 18, stroke = '#6B52A8' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M17 11h1a3 3 0 0 1 0 6h-1" /><Path d="M9 12v6M13 12v6" /><Path d="M14 7.5c1.5 0 3 .8 3 2.5v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10c0-1.7 1.5-2.5 3-2.5" /><Path d="M7 7.5a2.5 2.5 0 0 1 .5-4.5A3 3 0 0 1 13 3a2.5 2.5 0 0 1 1 4.5" /></Svg>;
}
function ClockIcon({ size = 18, stroke = '#999' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Circle cx={12} cy={12} r={9.5} /><Path d="M12 7v5l3.5 2" /></Svg>;
}
function QuestionIcon({ size = 18, stroke = '#999' }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Circle cx={12} cy={12} r={9.5} /><Path d="M9.2 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.8 2.6-2.8 2.6" /><Path d="M12 17h.01" /></Svg>;
}
function InfoIcon({ size = 16, stroke = colors.ember }: { size?: number; stroke?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Circle cx={12} cy={12} r={9.5} /><Path d="M12 16v-5" /><Path d="M12 8h.01" /></Svg>;
}

const TRIGGERS = [
  { key: 'kafa', label: 'Trenutno sam pio/la kafu', chip: '#FEF3E2', color: '#BA7517', Icon: CoffeeIcon, resp: 'Kafa i cigareta su jedan od najjačih uslovnih refleksa. Sad znaš gde da paziš.' },
  { key: 'budjenje', label: 'Upravo sam se probudio/la', chip: '#FEF0E8', color: colors.ember, Icon: SunIcon, resp: 'Jutarnji poriv je najjači jer je nivo nikotina najniži. Prođe za par minuta.' },
  { key: 'okolina', label: 'Svi oko mene su pušili', chip: '#EDF2F8', color: '#4A6080', Icon: PeopleIcon, resp: 'Društveni okidač je stvaran. Sledeći put — voda u ruci, korak u stranu.' },
  { key: 'stres', label: 'Bio/la sam jako pod stresom', chip: '#EDF2F8', color: '#4A6080', Icon: StormIcon, resp: 'Nikotin ne smanjuje stres — samo gasi apstinenciju. Disanje radi bolje.' },
  { key: 'jelo', label: 'Upravo sam završio/la sa jelom', chip: '#EDF7ED', color: '#3A7A3A', Icon: ForkIcon, resp: 'Cigareta posle jela je navika, ne potreba. Probaj šetnju ili čaj.' },
  { key: 'alkohol', label: 'Pio/la sam alkohol', chip: '#F0EDF8', color: '#6B52A8', Icon: BeerIcon, resp: 'Alkohol ruši odbranu i pojačava poriv. Dobro je znati svoj okidač.' },
  { key: 'dosada', label: 'Bilo mi je dosadno', chip: '#F1EEE9', color: '#999', Icon: ClockIcon, resp: 'Dosada traži stimulaciju. Telefon, voda, pokret — sve radi umesto dima.' },
  { key: 'drugo', label: 'Nešto drugo', chip: '#F1EEE9', color: '#999', Icon: QuestionIcon, resp: 'Svaki okidač koji prepoznaš je jedan manje koji te iznenadi.' },
];

export default function SlipReflectScreen() {
  const insets = useSafeAreaInsets();
  const [sel, setSel] = useState<string | null>(null);
  const pressAnim = useRef(new Animated.Value(1)).current;
  const responseAnim = useRef(new Animated.Value(0)).current;

  const selected = TRIGGERS.find((t) => t.key === sel) ?? null;

  const handleSelect = (key: string) => {
    if (sel === key) return;
    setSel(key);
    responseAnim.setValue(0);
    Animated.timing(responseAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  const handleContinue = async () => {
    // Save trigger to the most recent slip record
    if (sel) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data } = await supabase
            .from('slips')
            .select('id')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          if (data && data.length > 0) {
            await supabase.from('slips').update({ trigger: sel }).eq('id', data[0].id);
          }
        }
      } catch {}
    }
    router.push('/slip/recap' as any);
  };

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 0.985, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke="#999" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* Question */}
      <View style={styles.questionArea}>
        <Text weight="semibold" color={colors.text} style={styles.question}>
          Šta te je nateralo?
        </Text>
        <Text weight="regular" size="sm" color={colors.textSub} style={styles.questionSub}>
          Tapni — razumećemo zajedno.
        </Text>
      </View>

      {/* Trigger list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.triggerList}>
          {TRIGGERS.map((t) => {
            const on = sel === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => handleSelect(t.key)}
                activeOpacity={0.8}
              >
                {on ? (
                  <LinearGradient
                    colors={[colors.emberTop, colors.ember]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.triggerRow, styles.triggerRowActive]}
                  >
                    <View style={[styles.triggerChip, { backgroundColor: '#fff' }]}>
                      <t.Icon size={18} stroke={colors.ember} />
                    </View>
                    <Text weight="semibold" size="base" color="#fff">{t.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.triggerRow}>
                    <View style={[styles.triggerChip, { backgroundColor: t.chip }]}>
                      <t.Icon size={18} stroke={t.color} />
                    </View>
                    <Text weight="semibold" size="base" color={colors.text}>{t.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed bottom: response card + CTA */}
      {selected && (
        <Animated.View
          style={[
            styles.bottomFixed,
            { paddingBottom: insets.bottom + 16 },
            {
              opacity: responseAnim,
              transform: [{ translateY: responseAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            },
          ]}
        >
          {/* Contextual response card */}
          <View style={styles.responseCard}>
            <View style={styles.responseIconWrap}>
              <InfoIcon size={16} stroke={colors.ember} />
            </View>
            <Text weight="regular" size="sm" color={colors.bodyText} style={styles.responseText}>
              {selected.resp}
            </Text>
          </View>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
            <Pressable onPress={handleContinue} onPressIn={onPressIn} onPressOut={onPressOut}>
              <LinearGradient
                colors={[colors.emberTop, colors.ember]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text weight="bold" size="lg" color="#fff">Razumem</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    paddingHorizontal: 22,
    paddingBottom: 0,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionArea: {
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 0,
  },
  question: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  questionSub: {
    marginTop: 8,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 8,
  },
  triggerList: {
    gap: 8,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 12,
    padding: 13.5,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#fff',
  },
  triggerRowActive: {
    borderWidth: 1.5,
    borderColor: colors.ember,
    padding: 13,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  triggerChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bottomFixed: {
    paddingHorizontal: 26,
    paddingTop: 10,
    gap: 14,
  },
  responseCard: {
    backgroundColor: '#FEF6F0',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F7D9C5',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  responseIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEF0E8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  responseText: {
    flex: 1,
    lineHeight: 22.5,
    paddingTop: 1,
  },
  ctaBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.ember,
  },
});
