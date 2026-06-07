import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../ui/Text';
import { colors, gradients, radii, shadows } from '../../theme/tokens';
import type { Checkin } from '../../types';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { sr } from 'date-fns/locale';

const DAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

function CheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 14 14" fill="none">
      <Path d="M2.5 7.5 6 11l5.5-7" stroke={colors.ember} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type DayStatus = 'done' | 'today' | 'future' | 'slip';

interface WeekDay {
  label: string;
  date: string; // YYYY-MM-DD
  status: DayStatus;
}

function buildWeekDays(checkins: Checkin[], todayStr: string): WeekDay[] {
  const today = new Date(todayStr + 'T12:00:00');
  // Monday-first week start
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const checkinMap: Record<string, boolean> = {};
  checkins.forEach((c) => { checkinMap[c.date] = c.clean; });

  return DAY_LABELS.map((label, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    let status: DayStatus;
    if (dateStr === todayStr) {
      status = 'today';
    } else if (dateStr > todayStr) {
      status = 'future';
    } else if (checkinMap[dateStr] === true) {
      status = 'done';
    } else if (checkinMap[dateStr] === false) {
      status = 'slip';
    } else {
      status = 'done'; // assume clean if before today and no check-in
    }
    return { label, date: dateStr, status };
  });
}

interface Props {
  checkins: Checkin[];
  onCheckIn: () => void;
}

export function WeeklyTracker({ checkins, onCheckIn }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const days = buildWeekDays(checkins, todayStr);
  const cleanCount = days.filter((d) => d.status === 'done').length;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.45, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <TouchableOpacity onPress={onCheckIn} activeOpacity={0.92} style={styles.wrapper}>
      <LinearGradient
        colors={['#F0701F', colors.ember, '#D2581A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={styles.card}
      >
        {/* canyon texture overlay */}
        <Image
          source={require('../../../assets/images/canyon-bg.png')}
          style={styles.texture}
          resizeMode="cover"
          blurRadius={0}
        />
        {/* depth gradient */}
        <View style={styles.depthGradient} pointerEvents="none" />

        {/* Header row */}
        <View style={styles.header}>
          <Text weight="bold" size="base" color="#fff" style={styles.headerTitle}>
            Ova nedelja
          </Text>
          <Text weight="bold" size="sm" color="rgba(255,255,255,0.92)">
            {cleanCount} / 7
          </Text>
        </View>

        {/* Day columns */}
        <View style={styles.daysRow}>
          {days.map((d) => (
            <View key={d.date} style={styles.dayCol}>
              <Text weight="bold" size="xs" color="#fff" style={styles.dayLabel}>
                {d.label}
              </Text>
              {d.status === 'done' && (
                <View style={styles.dotDone}>
                  <CheckIcon />
                </View>
              )}
              {d.status === 'slip' && (
                <View style={[styles.dotDone, { backgroundColor: 'rgba(255,255,255,0.4)' }]}>
                  <Text weight="bold" size="xs" color={colors.ember}>✕</Text>
                </View>
              )}
              {d.status === 'today' && (
                <Animated.View style={[styles.dotToday, { opacity: pulseAnim }]}>
                  <Text weight="bold" size="md" color="#fff" style={{ lineHeight: 18 }}>?</Text>
                </Animated.View>
              )}
              {d.status === 'future' && (
                <View style={styles.dotFuture} />
              )}
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.ember,
  },
  card: {
    borderRadius: radii.card,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  texture: {
    ...StyleSheet.absoluteFill,
    opacity: 0.38,
    mixBlendMode: 'soft-light',
  } as any,
  depthGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    letterSpacing: -0.2,
    textShadowColor: 'rgba(120,50,10,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 9,
  },
  dayLabel: {
    textShadowColor: 'rgba(120,50,10,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  dotDone: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(120,50,10,1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  dotToday: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFuture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
});
