// Settings: Edit name and gender
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
import type { Gender } from '../../src/types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'muško', label: 'Muško' },
  { value: 'žensko', label: 'Žensko' },
  { value: 'drugo', label: 'Preferiram da ne kažem' },
];

export default function ProfilEditScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('muško');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      const { data } = await supabase
        .from('profiles')
        .select('name, gender')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setName(data.name ?? '');
        setGender((data.gender as Gender) ?? 'muško');
      }
    });
  }, []);

  async function handleSave() {
    if (!userId) return;
    if (!name.trim()) { Alert.alert('Greška', 'Ime ne može biti prazno.'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), gender })
      .eq('id', userId);
    setSaving(false);
    if (error) { Alert.alert('Greška', 'Nije moguće sačuvati. Pokušaj ponovo.'); return; }
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        <Text weight="semibold" size="base" color={colors.text}>Ime i pol</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          <Text weight="semibold" size="base" color={saving ? colors.textGhost : colors.ember}>
            {saving ? 'Čuvam...' : 'Sačuvaj'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text weight="medium" size="sm" color={colors.textSub} style={styles.label}>IME</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tvoje ime"
          placeholderTextColor={colors.textGhost}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <Text weight="medium" size="sm" color={colors.textSub} style={[styles.label, { marginTop: 28 }]}>POL</Text>
        <View style={styles.genderGroup}>
          {GENDERS.map((g, i) => (
            <TouchableOpacity
              key={g.value}
              onPress={() => setGender(g.value)}
              activeOpacity={0.8}
              style={[
                styles.genderRow,
                i > 0 && styles.genderRowBorder,
                gender === g.value && styles.genderRowSelected,
              ]}
            >
              <Text
                weight={gender === g.value ? 'semibold' : 'medium'}
                size="base"
                color={gender === g.value ? colors.ember : colors.text}
              >
                {g.label}
              </Text>
              {gender === g.value && (
                <View style={styles.checkDot} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: '#FAF9F7', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  content: { padding: 24 },
  label: { letterSpacing: 0.8, marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    color: colors.text,
  },
  genderGroup: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  genderRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  genderRowSelected: { backgroundColor: colors.emberTint },
  checkDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.ember,
  },
});
