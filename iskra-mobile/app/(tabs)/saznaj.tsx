// app/(tabs)/saznaj.tsx — Iskra "Saznaj" knowledge base
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';

import { Text } from '../../src/components/ui/Text';
import { colors, shadows } from '../../src/theme/tokens';
import { BottomNav } from '../../src/components/nav/BottomNav';
import type { NavTab } from '../../src/components/nav/BottomNav';
import { IcoLock } from '../../src/components/icons';
// import { useIsPremium } from '../../src/hooks/useIsPremium';
// import { getOfferings, purchasePackage, syncPremiumToSupabase, isEntitlementActive } from '../../src/lib/revenuecat';

// ─── Inline category SVG icons ────────────────────────────────────────────────

interface SvgIconProps {
  size?: number;
  color?: string;
}

function IcoBrain({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5a3 3 0 0 0-5.6-1.5A2.5 2.5 0 0 0 4 6.5 2.5 2.5 0 0 0 4 11a2.5 2.5 0 0 0 2 4 3 3 0 0 0 6 0V5Z" />
      <Path d="M12 5a3 3 0 0 1 5.6-1.5A2.5 2.5 0 0 1 20 6.5 2.5 2.5 0 0 1 20 11a2.5 2.5 0 0 1-2 4 3 3 0 0 1-6 0" />
    </Svg>
  );
}

function IcoBolt({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </Svg>
  );
}

function IcoPeople({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

function IcoLeafCat({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <Path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </Svg>
  );
}

function IcoWind({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <Path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <Path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </Svg>
  );
}

function IcoHeartCat({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" />
    </Svg>
  );
}

function IcoFlask({ size = 24, color = '#fff' }: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 3h6" />
      <Path d="M10 3v6.5L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9.5V3" />
      <Path d="M7.5 14h9" />
    </Svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type CatItem = {
  label: string;
  n: string;
  bg: string;
  Icon: React.ComponentType<SvgIconProps>;
};

const CATS: CatItem[] = [
  { label: 'Razumeti zavisnost',   n: '5 članaka', bg: '#6B52A8', Icon: IcoBrain },
  { label: 'Nositi se sa porivima', n: '6 članaka', bg: '#E8621A', Icon: IcoBolt },
  { label: 'Kafana i društvo',     n: '4 članka',  bg: '#4A6080', Icon: IcoPeople },
  { label: 'Ishrana i gojenje',    n: '4 članka',  bg: '#3A7A3A', Icon: IcoLeafCat },
  { label: 'Stres bez cigarete',   n: '5 članaka', bg: '#4A8AC4', Icon: IcoWind },
  { label: 'Priče iz prve ruke',   n: '6 članaka', bg: '#D4547E', Icon: IcoHeartCat },
  { label: 'Naučni fakti',         n: '8 članaka', bg: '#2E8B80', Icon: IcoFlask },
];

type Article = {
  tag: string;
  color: string;
  title: string;
  min: string;
  lock?: boolean;
};

const POPULAR: Article[] = [
  { tag: 'Porivi',    color: '#E8621A', title: 'Šta zaista radi mozak tokom poriva',               min: '4 min', lock: true },
  { tag: 'Kafana',   color: '#4A6080', title: 'Skripta za odbijanje cigarete bez nelagode',        min: '3 min', lock: false },
  { tag: 'Zavisnost', color: '#6B52A8', title: 'Mit o nikotinu kao leku za stres',                  min: '5 min', lock: true },
];

type NewArticle = {
  tag: string;
  color: string;
  min: string;
  title: string;
  desc: string;
};

const NEW_ARTICLES: NewArticle[] = [
  { tag: 'Ishrana',  color: '#3A7A3A', min: '5 min', title: 'Kako izbeći gojenje posle prestanka',    desc: 'Praktični saveti za apetit u prvim nedeljama.' },
  { tag: 'Zdravlje', color: '#D4547E', min: '6 min', title: 'Šta se dešava u telu prvih 30 dana',     desc: 'Dan po dan kroz oporavak organizma.' },
];

// ─── Tag pill ─────────────────────────────────────────────────────────────────

function TagPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.tagPill, { backgroundColor: color + '1A' }]}>
      <Text weight="bold" style={{ fontSize: 11, color, letterSpacing: 0.2 }}>{label}</Text>
    </View>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <Text weight="medium" style={s.sectionLabel}>{children}</Text>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SaznajScreen() {
  const insets = useSafeAreaInsets();
  const isPremium = false; // TODO: restore useIsPremium() when building dev client

  function handleNav(tab: NavTab) {
    if (tab === 'home') router.replace('/(tabs)' as never);
    else if (tab === 'milestoni') router.replace('/(tabs)/milestoni' as never);
    else if (tab === 'profil') router.replace('/(tabs)/profil' as never);
  }

  function handleLockedArticle() {
    // TODO: restore full RC purchase flow when building dev client
    Alert.alert('ISKRA Club', 'Premium sadržaj će biti dostupan u finalnoj verziji aplikacije.');
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text weight="medium" style={s.headline}>Saznaj</Text>
        <Text weight="regular" style={s.subline}>Sve što treba da znaš o prestanku</Text>

        {/* Featured card */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {/* article detail not yet built */}}
          style={s.featuredWrap}
        >
          <LinearGradient
            colors={['#F0701F', colors.ember]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.featuredCard}
          >
            {/* Canyon texture */}
            <Image
              source={require('../../assets/images/canyon-bg.png')}
              style={s.featuredImage}
              resizeMode="cover"
            />
            {/* Top pill */}
            <View style={s.recoPill}>
              <Text weight="bold" style={s.recoText}>PREPORUČENO</Text>
            </View>
            {/* Bottom text */}
            <View style={s.featuredBottom}>
              <Text weight="medium" style={s.featuredTitle}>
                Zašto porivi traju samo 5 minuta — nauka iza toga
              </Text>
              <Text weight="medium" style={s.featuredMeta}>6 min čitanja</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories section */}
        <SectionLabel>KATEGORIJE</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hScrollContent}
          style={s.hScroll}
        >
          {CATS.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              activeOpacity={0.82}
              onPress={() => {/* category articles not yet built */}}
              style={[s.catCard, { backgroundColor: cat.bg }]}
            >
              <cat.Icon size={24} color="#fff" />
              <View>
                <Text weight="bold" style={s.catLabel}>{cat.label}</Text>
                <Text weight="medium" style={s.catN}>{cat.n}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular section */}
        <SectionLabel>POPULARNO</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hScrollContent}
          style={s.hScroll}
        >
          {POPULAR.map((art) => (
            <TouchableOpacity
              key={art.title}
              activeOpacity={0.82}
              style={s.popularCard}
              onPress={art.lock && !isPremium ? handleLockedArticle : undefined}
            >
              <View>
                <TagPill label={art.tag} color={art.color} />
              </View>
              <Text weight="medium" style={s.popularTitle}>{art.title}</Text>
              <View style={s.popularFooter}>
                <Text weight="medium" style={s.readMin}>{art.min}</Text>
                {art.lock && <IcoLock size={15} stroke={colors.textGhost} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Novo section */}
        <SectionLabel>NOVO</SectionLabel>
        <View style={s.newList}>
          {NEW_ARTICLES.map((art) => (
            <TouchableOpacity
              key={art.title}
              activeOpacity={0.82}
              style={s.newCard}
            >
              <View style={s.newTopRow}>
                <TagPill label={art.tag} color={art.color} />
                <Text weight="medium" style={s.readMin}>{art.min}</Text>
              </View>
              <Text weight="medium" style={s.newTitle}>{art.title}</Text>
              <Text weight="regular" style={s.newDesc}>{art.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNav active="saznaj" onNav={handleNav} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  headline: {
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subline: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 6,
  },

  // Featured card
  featuredWrap: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.ember,
  },
  featuredCard: {
    minHeight: 160,
    padding: 24,
    borderRadius: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  featuredImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.6,
  },
  recoPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  recoText: {
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.04 * 11,
  },
  featuredBottom: {
    marginTop: 18,
  },
  featuredTitle: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  featuredMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    color: colors.textSub,
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 14,
  },

  // Horizontal scroll
  hScroll: {
    marginHorizontal: -22,
  },
  hScrollContent: {
    paddingHorizontal: 22,
    gap: 10,
    paddingBottom: 4,
  },

  // Category cards
  catCard: {
    flexShrink: 0,
    width: 176,
    minHeight: 150,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    gap: 14,
  },
  catLabel: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 16,
  },
  catN: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
  },

  // Popular cards
  popularCard: {
    flexShrink: 0,
    width: 176,
    minHeight: 150,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    ...shadows.card,
  },
  popularTitle: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 19,
    flex: 1,
    marginTop: 12,
  },
  popularFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  readMin: {
    fontSize: 12,
    color: colors.textSub,
  },

  // Tag pill
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  // Novo (new) section
  newList: {
    gap: 12,
  },
  newCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    ...shadows.card,
  },
  newTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newTitle: {
    fontSize: 15,
    color: colors.text,
    marginTop: 11,
    letterSpacing: -0.2,
  },
  newDesc: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
    lineHeight: 19,
  },
});
