import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { Text } from '../ui/Text';
import { colors, gradients, radii, shadows } from '../../theme/tokens';
import type { Gender } from '../../types';

function FlameIcon({ size = 60, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? colors.ember : 'none'}>
      <Path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"
        stroke={filled ? undefined : colors.ember}
        strokeWidth={filled ? undefined : '1.9'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 12l5 5L20 6" />
    </Svg>
  );
}

function CigOffIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2.5" y="13" width="13.5" height="4" rx="1.4" />
      <Line x1="11.5" y1="13" x2="11.5" y2="17" />
      <Path d="M18 8.5c.9.7.9 1.8 0 2.5" />
      <Path d="M20.5 7c1.3 1 1.3 2.6 0 3.6" />
      <Line x1="3" y1="4" x2="21" y2="20.5" />
    </Svg>
  );
}

interface Props {
  visible: boolean;
  gender: Gender | null;
  dayNumber: number;
  onClose: () => void;
  onClean: () => void;
  onSlip: () => void;
}

export function DailyCheckinOverlay({ visible, gender, dayNumber, onClose, onClean, onSlip }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 180, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.94);
    }
  }, [visible]);

  const cleanLabel = gender === 'žensko' ? 'Čista sam danas' : 'Čist sam danas';
  const subLabel = gender === 'žensko' ? 'Budi iskrena sa sobom.' : 'Budi iskren sa sobom.';

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Flame + day badge */}
          <View style={styles.flameArea}>
            <View style={styles.flameCircle} />
            <View style={styles.flameIcon}>
              <FlameIcon size={60} filled />
            </View>
            <View style={styles.dayBadge}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill={colors.ember}>
                <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
              </Svg>
              <Text weight="medium" size="sm" color={colors.ember}>
                Dan {dayNumber}
              </Text>
            </View>
          </View>

          {/* Copy */}
          <Text weight="semibold" size="xl" color={colors.text} style={styles.title}>
            Kako je prošao dan?
          </Text>
          <Text weight="regular" size="sm" color={colors.textSub} style={styles.sub}>
            {subLabel}
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClean} activeOpacity={0.88} style={styles.cleanBtn}>
              <LinearGradient
                colors={gradients.ember}
                start={gradients.emberVertical.start}
                end={gradients.emberVertical.end}
                style={styles.cleanBtnGrad}
              >
                <CheckIcon />
                <Text weight="medium" size="md" color="#fff">{cleanLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSlip} activeOpacity={0.88} style={styles.slipBtn}>
              <CigOffIcon />
              <Text weight="regular" size="md" color={colors.textSub}>Zapalio/la sam</Text>
            </TouchableOpacity>
          </View>

          <Text weight="regular" size="xs" color={colors.textGhost} style={styles.hint}>
            Ako zatvoriš, podrazumevamo da si čist/a.
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    ...shadows.cardMd,
    shadowOpacity: 0.15,
    shadowRadius: 60,
  },
  flameArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  flameCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.emberSoft,
    position: 'absolute',
    top: 20,
  },
  flameIcon: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.emberTint,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 2,
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sub: {
    textAlign: 'center',
    marginTop: 6,
  },
  buttons: {
    marginTop: 24,
    gap: 10,
  },
  cleanBtn: {
    borderRadius: radii.btn,
    overflow: 'hidden',
    ...shadows.ember,
  },
  cleanBtnGrad: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radii.btn,
  },
  slipBtn: {
    height: 56,
    borderRadius: radii.btn,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  hint: {
    textAlign: 'center',
    marginTop: 16,
  },
});
