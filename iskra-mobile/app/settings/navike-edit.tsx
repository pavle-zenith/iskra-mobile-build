// Settings: Edit smoking habits (cigarettes/day, pack size, price)
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';
import { supabase } from '../../src/lib/supabase';

function NumInput({
  label, value, onChange, unit, hint,
}: { label: string; value: string; onChange: (v: string) => void; unit?: string; hint?: string }) {
  return (
    <View style={ni.wrapper}>
      <Text weight="medium" size="sm" color={colors.textSub} style={ni.label}>{label}</Text>
      <View style={ni.row}>
        <TextInput
          style={ni.input}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholderTextColor={colors.textGhost}
        />
        {unit ? <Text weight="medium" size="base" color={colors.textSub} style={ni.unit}>{unit}</Text> : null}
      </View>
      {hint ? <Text weight="regular" size="xs" color={colors.textGhost} style={ni.hint}>{hint}</Text> : null}
    </View>
  );
}
const ni = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  label: { letterSpacing: 0.8, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 22, fontFamily: 'Manrope_700Bold', color: colors.text,
  },
  unit: { minWidth: 40 },
  hint: { marginTop: 8 },
});

export default function NavikeEditScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>();
  const [cigsPerDay, setCigsPerDay] = useState('20');
  const [cigsPerPack, setCigsPerPack] = useState('20');
  const [packPrice, setPackPrice] = useState('400');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      const { data } = await supabase
        .from('profiles')
        .select('cigarettes_per_day, cigarettes_per_pack, pack_price_rsd')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setCigsPerDay(String(data.cigarettes_per_day ?? 20));
        setCigsPerPack(String(data.cigarettes_per_pack ?? 20));
        setPackPrice(String(data.pack_price_rsd ?? 400));
      }
    });
  }, []);

  async function handleSave() {
    if (!userId) return;
    const cpd = parseInt(cigsPerDay, 10);
    const cpp = parseInt(cigsPerPack, 10);
    const price = parseInt(packPrice, 10);
    if (!cpd || !cpp || !price) {
      Alert.alert('Greška', 'Sva polja moraju biti popunjena.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ cigarettes_per_day: cpd, cigarettes_per_pack: cpp, pack_price_rsd: price })
      .eq('id', userId);
    setSaving(false);
    if (error) { Alert.alert('Greška', 'Nije moguće sačuvati.'); return; }
    router.back();
  }

  const dailyCost = packPrice && cigsPerPack && cigsPerDay
    ? Math.round((parseInt(cigsPerDay, 10) / parseInt(cigsPerPack, 10)) * parseInt(packPrice, 10))
    : 0;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="semibold" size="base" color={colors.text}>Stare navike</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          <Text weight="semibold" size="base" color={saving ? colors.textGhost : colors.ember}>
            {saving ? 'Čuvam...' : 'Sačuvaj'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <NumInput
          label="CIGARETA DNEVNO"
          value={cigsPerDay}
          onChange={setCigsPerDay}
          unit="cig"
        />
        <NumInput
          label="CIGARETA U PAKLI"
          value={cigsPerPack}
          onChange={setCigsPerPack}
          unit="kom"
        />
        <NumInput
          label="CENA PAKLE"
          value={packPrice}
          onChange={setPackPrice}
          unit="RSD"
          hint="Koliko košta jedna pakla kod tebe."
        />

        {dailyCost > 0 && (
          <View style={styles.summaryCard}>
            <Text weight="medium" size="sm" color={colors.textSub}>Dnevni trošak koji štediš</Text>
            <Text weight="bold" style={styles.summaryValue}>{dailyCost} RSD</Text>
            <Text weight="regular" size="xs" color={colors.textGhost} style={{ marginTop: 4 }}>
              = {Math.round(dailyCost * 365).toLocaleString('sr-RS')} RSD godišnje
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: '#FAF9F7', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  content: { padding: 24 },
  summaryCard: {
    backgroundColor: colors.emberTint,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0D8C8',
  },
  summaryValue: {
    fontSize: 32,
    color: colors.ember,
    letterSpacing: -0.8,
    lineHeight: 40,
    fontFamily: 'Manrope_700Bold',
    marginTop: 6,
  },
});
