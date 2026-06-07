// Settings: Edit quit date
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';
import { supabase } from '../../src/lib/supabase';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay } from 'date-fns';

const DAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const MONTH_NAMES = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

function mondayFirst(d: Date): number {
  const day = getDay(d);
  return day === 0 ? 6 : day - 1;
}

export default function DatumEditScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>();
  const [selected, setSelected] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      const { data } = await supabase
        .from('profiles')
        .select('quit_date')
        .eq('id', session.user.id)
        .single();
      if (data?.quit_date) {
        const d = parseISO(data.quit_date);
        setSelected(d);
        setViewMonth(d);
      }
    });
  }, []);

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const leadingBlanks = mondayFirst(days[0]);
  const today = startOfDay(new Date());

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ quit_date: selected.toISOString() })
      .eq('id', userId);
    setSaving(false);
    if (error) { Alert.alert('Greška', 'Nije moguće sačuvati.'); return; }
    router.back();
  }

  function prevMonth() {
    setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    if (next > today) return;
    setViewMonth(next);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="semibold" size="base" color={colors.text}>Datum prestanka</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          <Text weight="semibold" size="base" color={saving ? colors.textGhost : colors.ember}>
            {saving ? 'Čuvam...' : 'Sačuvaj'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
            <Text weight="semibold" size="xl" color={colors.textSub}>‹</Text>
          </TouchableOpacity>
          <Text weight="semibold" size="base" color={colors.text}>
            {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}.
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
            <Text weight="semibold" size="xl" color={new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) > today ? colors.textGhost : colors.textSub}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View style={styles.weekRow}>
          {DAY_LABELS.map((d) => (
            <Text key={d} weight="medium" size="xs" color={colors.textSub} style={styles.weekLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <View key={`b${i}`} style={styles.calCell} />
          ))}
          {days.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd');
            const isFuture = isBefore(today, startOfDay(day));
            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => !isFuture && setSelected(day)}
                activeOpacity={isFuture ? 1 : 0.75}
                style={[styles.calCell, isSelected && styles.calCellSelected]}
              >
                <Text
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#fff' : isFuture ? colors.textGhost : colors.text}
                  style={styles.calDay}
                >
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected date display */}
        <View style={styles.selectedCard}>
          <Text weight="medium" size="sm" color={colors.textSub}>Odabrani datum</Text>
          <Text weight="semibold" size="lg" color={colors.text} style={{ marginTop: 4 }}>
            {format(selected, 'd. MMMM yyyy.')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const CELL = 46;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: '#FAF9F7', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  content: { padding: 22 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 18,
  },
  monthBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { width: CELL, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: CELL, height: CELL,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: CELL / 2,
  },
  calCellSelected: { backgroundColor: colors.ember },
  calDay: { fontSize: 15, fontFamily: 'Manrope_500Medium' },
  selectedCard: {
    marginTop: 24, backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 16,
  },
});
