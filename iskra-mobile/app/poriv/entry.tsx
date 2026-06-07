import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoX } from '../../src/components/icons';
import { colors, shadows } from '../../src/theme/tokens';
import { supabase } from '../../src/lib/supabase';

// Trigger definitions
const TRIGGERS = [
  { key: 'kafa', label: 'Trenutno pijem kafu', chip: '#FEF3E2', color: '#BA7517', Icon: CoffeeIcon },
  { key: 'budjenje', label: 'Upravo sam se probudio/la', chip: '#FEF0E8', color: colors.ember, Icon: SunIcon },
  { key: 'okolina', label: 'Svi oko mene puše', chip: '#EDF2F8', color: '#4A6080', Icon: PeopleIcon },
  { key: 'stres', label: 'Jako sam pod stresom', chip: '#EDF2F8', color: '#4A6080', Icon: StormIcon },
  { key: 'jelo', label: 'Upravo sam završio/la sa jelom', chip: '#EDF7ED', color: '#3A7A3A', Icon: ForkIcon },
  { key: 'alkohol', label: 'Pijem alkohol', chip: '#F0EDF8', color: '#6B52A8', Icon: BeerIcon },
  { key: 'dosada', label: 'Dosadno mi je', chip: '#F1EEE9', color: '#999999', Icon: ClockIcon },
  { key: 'drugo', label: 'Nešto drugo', chip: '#F1EEE9', color: '#999999', Icon: QuestionIcon },
];

// Inline trigger icons
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

export default function PorivEntryScreen() {
  const insets = useSafeAreaInsets();
  const [strength, setStrength] = useState(5);
  const [moved, setMoved] = useState(false);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const pressAnim = useRef(new Animated.Value(1)).current;

  const ready = moved && trigger !== null;
  const pct = (strength - 1) / 9;

  // Pan responder for custom slider
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        updateStrength(x);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        updateStrength(x);
      },
    })
  ).current;

  function updateStrength(x: number) {
    if (sliderWidth === 0) return;
    const clamped = Math.max(0, Math.min(x, sliderWidth));
    const val = Math.round(1 + (clamped / sliderWidth) * 9);
    setStrength(Math.max(1, Math.min(10, val)));
    setMoved(true);
  }

  const handleSliderLayout = (e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  };

  const handleStart = async () => {
    if (!ready || trigger === null) return;
    // Write craving to DB (best-effort)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from('cravings').insert({
          user_id: session.user.id,
          strength,
          trigger,
          outcome: null,
        });
      }
    } catch {}
    router.push({ pathname: '/poriv/mode', params: { strength: String(strength), trigger } });
  };

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 0.985, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Close button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke="#999" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Strength question */}
        <Text weight="medium" color={colors.text} style={styles.question}>
          Koliko jak je poriv?
        </Text>

        {/* Number display floating above thumb */}
        <View style={styles.numberRow}>
          <Text weight="bold" color={colors.ember} style={[styles.strengthNum, { marginLeft: `${pct * 85}%` as any }]}>
            {strength}
          </Text>
        </View>

        {/* Custom slider track */}
        <View
          style={styles.sliderContainer}
          onLayout={handleSliderLayout}
          {...pan.panHandlers}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          </View>
          {/* Thumb */}
          <View style={[styles.thumb, { left: `${pct * 100}%` as any, marginLeft: -14 }]} />
        </View>

        {/* Labels */}
        <View style={styles.sliderLabels}>
          <Text weight="medium" size="xs" color={colors.textSub}>Blag</Text>
          <Text weight="medium" size="xs" color={colors.textSub}>Nepodnošljiv</Text>
        </View>

        {/* Trigger question */}
        <Text weight="medium" color={colors.text} style={[styles.question, { marginTop: 28 }]}>
          Šta te navelo?
        </Text>

        {/* Trigger list */}
        <View style={styles.triggerList}>
          {TRIGGERS.map((t) => {
            const on = trigger === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTrigger(t.key)}
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

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <Pressable
            onPress={handleStart}
            onPressIn={ready ? onPressIn : undefined}
            onPressOut={ready ? onPressOut : undefined}
            disabled={!ready}
          >
            {ready ? (
              <LinearGradient
                colors={[colors.emberTop, colors.ember]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text weight="bold" size="lg" color="#fff">Pokreni</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.ctaBtn, styles.ctaBtnDisabled]}>
                <Text weight="bold" size="lg" color="#fff">Pokreni</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
        <Text weight="regular" size="xs" color={colors.textFaint} style={styles.ctaNote}>
          Porivi traju 3 do 5 minuta. Prođe uvek.
        </Text>
      </View>
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
    paddingTop: 0,
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 26,
    paddingBottom: 8,
  },
  question: {
    fontSize: 22,
    letterSpacing: -0.3,
    marginTop: 32,
  },
  numberRow: {
    height: 44,
    marginTop: 14,
    position: 'relative',
  },
  strengthNum: {
    fontSize: 36,
    lineHeight: 44,
    fontVariant: ['tabular-nums'],
  },
  sliderContainer: {
    marginTop: 4,
    paddingVertical: 18,
    position: 'relative',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.ember,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: 18 - 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.ember,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  triggerList: {
    marginTop: 14,
    gap: 9,
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
  ctaBtnDisabled: {
    backgroundColor: '#E4D3C7',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaNote: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
});
