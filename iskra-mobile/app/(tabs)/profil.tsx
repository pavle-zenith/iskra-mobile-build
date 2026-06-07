// app/(tabs)/profil.tsx — Iskra profile / settings screen
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { format, parseISO } from 'date-fns';

import { Text } from '../../src/components/ui/Text';
import { colors, shadows } from '../../src/theme/tokens';
import { BottomNav } from '../../src/components/nav/BottomNav';
import type { NavTab } from '../../src/components/nav/BottomNav';
import {
  IcoChevronRight,
  IcoUser,
  IcoCalendar,
  IcoCigarette,
  IcoBell,
  IcoShare,
  IcoInfo,
  IcoSettings,
  IcoLogOut,
} from '../../src/components/icons';
import { useUserData } from '../../src/hooks/useUserData';
import { useQuitStats } from '../../src/hooks/useQuitStats';
import { supabase } from '../../src/lib/supabase';

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

interface SvgIconProps {
  size?: number;
  color?: string;
  sw?: number;
}

function StIcon({ size = 20, color = '#1A1A1A', sw = 1.9, children }: SvgIconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

function IcoGlobe(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Circle cx="12" cy="12" r="9.5" />
      <Path d="M2.5 12h19" />
      <Path d="M12 2.5c2.6 2.7 4 6 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-6-4-9.5s1.4-6.8 4-9.5Z" />
    </StIcon>
  );
}

function IcoStar(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Path d="M12 2.5l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17l-6 3.4 1.4-6.8L2.3 9.5l6.9-.7L12 2.5Z" />
    </StIcon>
  );
}

function IcoRefresh(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <Path d="M21 3v5h-5" />
      <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <Path d="M3 21v-5h5" />
    </StIcon>
  );
}

function IcoDoc(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <Path d="M14 2v6h6" />
      <Path d="M8 13h8M8 17h6" />
    </StIcon>
  );
}

function IcoLockSm(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Rect x="4" y="11" width="16" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </StIcon>
  );
}

function IcoFlask(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Path d="M9 3h6" />
      <Path d="M10 3v6.5L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9.5V3" />
      <Path d="M7.5 14h9" />
    </StIcon>
  );
}

function IcoChat(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </StIcon>
  );
}

function IcoMail(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Rect x="2" y="4" width="20" height="16" rx="2" />
      <Path d="m2 7 10 6 10-6" />
    </StIcon>
  );
}

function IcoInstagram(p: SvgIconProps) {
  return (
    <StIcon {...p}>
      <Rect x="3" y="3" width="18" height="18" rx="5" />
      <Circle cx="12" cy="12" r="4" />
      <Circle cx="17.5" cy="6.5" r="0.6" fill={p.color ?? '#1A1A1A'} />
    </StIcon>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <Text weight="semibold" style={s.sectionLabel}>{children}</Text>
  );
}

// ─── Settings card wrapper ────────────────────────────────────────────────────

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.settingsCard}>{children}</View>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.9}
      style={[s.toggleTrack, { backgroundColor: on ? colors.ember : '#D8D4CD' }]}
    >
      <View style={[s.toggleThumb, { left: on ? 21 : 3 }]} />
    </TouchableOpacity>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

type RowValue = { text: string; ember?: boolean };

interface RowProps {
  Icon: React.ComponentType<SvgIconProps>;
  iconColor: string;
  label: string;
  value?: RowValue;
  toggle?: boolean;
  toggleOn?: boolean;
  onToggle?: () => void;
  first?: boolean;
  onPress?: () => void;
}

function SettingsRow({
  Icon,
  iconColor,
  label,
  value,
  toggle = false,
  toggleOn = false,
  onToggle,
  first = false,
  onPress,
}: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[s.row, !first && s.rowBorder]}
    >
      <Icon size={20} color={iconColor} sw={1.9} />
      <Text weight="medium" style={s.rowLabel}>{label}</Text>
      {value && (
        <Text weight="medium" style={[s.rowValue, value.ember ? { color: colors.ember } : {}]}>
          {value.text}
        </Text>
      )}
      {toggle ? (
        <Toggle on={toggleOn} onToggle={onToggle ?? (() => {})} />
      ) : (
        <IcoChevronRight size={18} stroke="#CFCBC4" strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const [notif, setNotif] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUserId(session?.user?.id),
    );
  }, []);

  const { profile, checkins } = useUserData(userId);
  const stats = useQuitStats(profile, checkins);

  const name = profile?.name ?? '';
  const initial = name.length > 0 ? name[0].toUpperCase() : 'I';
  const gender = profile?.gender;
  const daysFree = stats.daysSmokeFreeContinuous;
  const freedomLabel = gender === 'žensko' ? `Slobodna ${daysFree} dana` : `Slobodan ${daysFree} dana`;
  const memberSince = profile?.created_at
    ? format(parseISO(profile.created_at), 'MMMM yyyy.') + '.' // e.g. "maj 2026."
    : '—';

  const quitDateFormatted = profile?.quit_date
    ? format(parseISO(profile.quit_date), 'd. MMM yyyy.')
    : '—';

  const habitsValue =
    profile
      ? `${profile.cigarettes_per_day} cig · ${profile.pack_price_rsd} RSD`
      : '—';

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/onboarding/splash' as never);
  }

  function handleNav(tab: NavTab) {
    if (tab === 'home') router.replace('/(tabs)' as never);
    else if (tab === 'milestoni') router.replace('/(tabs)/milestoni' as never);
    else if (tab === 'saznaj') router.replace('/(tabs)/saznaj' as never);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <TouchableOpacity activeOpacity={0.8} style={s.profileCard} onPress={() => router.push('/settings/profil-edit' as any)}>
          {/* Avatar */}
          <View style={s.avatarCircle}>
            <Text weight="semibold" style={s.avatarLetter}>{initial}</Text>
          </View>
          {/* Info */}
          <View style={s.profileInfo}>
            <Text weight="semibold" style={s.profileName}>{name || 'Iskra'}</Text>
            <Text weight="medium" style={s.profileFreedom}>{freedomLabel}</Text>
            <Text weight="regular" style={s.profileMember}>Član od {memberSince}</Text>
          </View>
          {/* Chevron */}
          <IcoChevronRight size={18} stroke="#CFCBC4" strokeWidth={2} />
        </TouchableOpacity>

        {/* Moj profil */}
        <SectionLabel>MOJ PROFIL</SectionLabel>
        <SettingsCard>
          <SettingsRow
            first
            Icon={IcoUser}
            iconColor={colors.ember}
            label="Ime i pol"
            onPress={() => router.push('/settings/profil-edit' as any)}
          />
          <SettingsRow
            Icon={IcoCalendar}
            iconColor="#4A6080"
            label="Datum prestanka"
            value={{ text: quitDateFormatted }}
            onPress={() => router.push('/settings/datum-edit' as any)}
          />
          <SettingsRow
            Icon={IcoCigarette}
            iconColor="#4A6080"
            label="Stare navike"
            value={{ text: habitsValue }}
            onPress={() => router.push('/settings/navike-edit' as any)}
          />
        </SettingsCard>

        {/* Podešavanja */}
        <SectionLabel>PODEŠAVANJA</SectionLabel>
        <SettingsCard>
          <SettingsRow
            first
            Icon={IcoBell}
            iconColor="#6B52A8"
            label="Notifikacije"
            toggle
            toggleOn={notif}
            onToggle={() => setNotif((v) => !v)}
          />
          <SettingsRow
            Icon={IcoGlobe}
            iconColor="#3A7A3A"
            label="Jezik"
            value={{ text: 'Srpski' }}
          />
        </SettingsCard>

        {/* Premium */}
        <SectionLabel>PREMIUM</SectionLabel>
        <SettingsCard>
          <SettingsRow
            first
            Icon={IcoStar}
            iconColor={colors.ember}
            label="Moj plan"
            value={{ text: 'Godišnje', ember: true }}
          />
          <SettingsRow
            Icon={IcoRefresh}
            iconColor="#4A6080"
            label="Obnovi kupovinu"
          />
        </SettingsCard>

        {/* O Iskri */}
        <SectionLabel>O ISKRI</SectionLabel>
        <SettingsCard>
          <SettingsRow first Icon={IcoDoc}      iconColor="#4A6080" label="Uslovi korišćenja" />
          <SettingsRow       Icon={IcoLockSm}   iconColor="#4A6080" label="Politika privatnosti" />
          <SettingsRow       Icon={IcoFlask}    iconColor="#3A7A3A" label="Naučna osnova" />
          <SettingsRow       Icon={IcoInstagram} iconColor="#6B52A8" label="Iskra na Instagramu" />
          <SettingsRow       Icon={IcoInfo}     iconColor="#4A6080" label="FAQ" />
        </SettingsCard>

        {/* Moje iskustvo */}
        <SectionLabel>MOJE ISKUSTVO</SectionLabel>
        <SettingsCard>
          <SettingsRow first Icon={IcoStar}  iconColor={colors.ember} label="Oceni aplikaciju" />
          <SettingsRow       Icon={IcoChat}  iconColor="#4A6080"      label="Predloži funkciju" />
          <SettingsRow       Icon={IcoMail}  iconColor="#4A6080"      label="Problem? Kontaktiraj nas" />
        </SettingsCard>

        {/* Danger zone */}
        <View style={s.dangerZone}>
          <SettingsCard>
            <SettingsRow
              first
              Icon={IcoSettings}
              iconColor="#999999"
              label="Počni iznova"
            />
            <TouchableOpacity
              onPress={handleSignOut}
              activeOpacity={0.7}
              style={s.signOutBtn}
            >
              <Text weight="semibold" style={s.signOutText}>Odjava</Text>
            </TouchableOpacity>
          </SettingsCard>
        </View>

        {/* Version footer */}
        <Text weight="regular" style={s.versionText}>
          Iskra v1.0.0 · Napravljeno u Srbiji
        </Text>
      </ScrollView>

      <BottomNav active="profil" onNav={handleNav} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },

  // Profile card
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    ...shadows.card,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emberTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: {
    fontSize: 22,
    color: colors.ember,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 18,
    color: colors.text,
  },
  profileFreedom: {
    fontSize: 14,
    color: colors.ember,
    marginTop: 2,
  },
  profileMember: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 2,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    color: colors.textSub,
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 8,
  },

  // Settings card
  settingsCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.card,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDE7',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15.5,
    color: colors.text,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textSub,
    flexShrink: 0,
  },

  // Toggle
  toggleTrack: {
    width: 46,
    height: 28,
    borderRadius: 999,
    flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  // Danger zone
  dangerZone: {
    marginTop: 26,
  },
  signOutBtn: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDE7',
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15.5,
    color: '#CC3333',
  },

  // Version
  versionText: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 22,
    paddingBottom: 36,
  },
});
