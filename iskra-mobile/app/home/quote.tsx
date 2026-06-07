import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../src/components/ui/Text';
import { IcoArrowLeft, IcoFlame } from '../../src/components/icons';
import { colors, gradients, shadows } from '../../src/theme/tokens';
import { supabase } from '../../src/lib/supabase';

// Heart icon (filled on fav)
function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? colors.ember : 'none'} stroke={filled ? colors.ember : '#999'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" />
    </Svg>
  );
}

function ShareIconInline() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v12" />
      <Path d="M8 7l4-4 4 4" />
      <Path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </Svg>
  );
}

// Quotes pool
const QUOTES = [
  {
    n: 47,
    tag: 'Humor',
    full: 'Lako je prestati pušiti. Prestajao sam stotinu puta.',
    author: 'Mark Twain',
    desc: 'Američki književnik, 1835–1910',
    comment: 'Mark Twain je pušio čibuke ceo život. Ali je ovo razumeo. Ti si na danu koji on nikad nije dostigao.',
  },
  {
    n: 48,
    tag: 'Motivacija',
    full: 'Nije pitanje hoćeš li. Pitanje je — ko si ti kad ne puriš?',
    author: 'Iskra',
    desc: '',
    comment: 'Identitet se menja polako. Ali menja se sigurno.',
  },
  {
    n: 49,
    tag: 'Nauka',
    full: 'Telo počinje da se oporavlja posle prve minute bez dima.',
    author: 'WHO, 2022',
    desc: 'Svetska zdravstvena organizacija',
    comment: 'Ugljen-monoksid pada za pola u prvih 12 sati. Ti si već prošao/la kroz to.',
  },
];

export default function QuoteScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
  }, []);
  const [fav, setFav] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const pressAnim = useRef(new Animated.Value(1)).current;

  const quote = QUOTES[quoteIdx];

  const initials = quote.author
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${quote.full}" — ${quote.author}\n\nDan ${quote.n} na Iskra app.`,
      });
    } catch {}
  };

  const onPressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.985, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <IcoArrowLeft size={20} stroke={colors.textSub} strokeWidth={2} />
        </TouchableOpacity>
        {/* Centered title */}
        <Text weight="medium" size="sm" color={colors.textSub} style={styles.topTitle}>
          Quote dana #{quote.n}
        </Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: 'transparent', borderWidth: 0 }]}
          onPress={() => setFav(!fav)}
        >
          <HeartIcon filled={fav} />
        </TouchableOpacity>
      </View>

      {/* Category pill */}
      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <Text weight="bold" style={styles.tagText}>{quote.tag}</Text>
        </View>
      </View>

      {/* Quote content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Faded opening quote mark */}
        <Text style={styles.quoteMark}>"</Text>

        {/* Quote text */}
        <Text weight="medium" color={colors.text} style={styles.quoteText}>
          {quote.full}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Author chip */}
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text weight="bold" color={colors.ember} style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View>
            <Text weight="medium" size="base" color={colors.text}>{quote.author}</Text>
            {quote.desc ? (
              <Text weight="medium" size="sm" color={colors.textSub} style={{ marginTop: 3 }}>{quote.desc}</Text>
            ) : null}
          </View>
        </View>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {QUOTES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setQuoteIdx(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={[
                styles.dot,
                i === quoteIdx && styles.dotActive,
              ]} />
            </TouchableOpacity>
          ))}
        </View>
        <Text weight="regular" size="xs" color="#CCC" style={styles.swipeHint}>
          Prevuci za sledeći quote
        </Text>
      </ScrollView>

      {/* Bottom: fun fact + share */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        {/* Iskra fun-fact card */}
        <View style={styles.factCard}>
          <IcoFlame size={16} stroke={colors.ember} strokeWidth={1.9} />
          <Text weight="regular" size="sm" color={colors.bodyText} style={styles.factText}>
            {quote.comment}
          </Text>
        </View>

        {/* Share button */}
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <Pressable
            style={styles.shareBtn}
            onPress={handleShare}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <LinearGradient
              colors={[colors.emberTop, colors.ember]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.shareBtnGradient}
            >
              <ShareIconInline />
              <Text weight="bold" size="base" color="#fff" style={{ marginLeft: 8 }}>
                Podeli quote
              </Text>
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
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  topTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tagRow: {
    alignItems: 'center',
    paddingTop: 12,
  },
  tag: {
    backgroundColor: colors.emberTint,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    color: colors.ember,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    justifyContent: 'center',
    flexGrow: 1,
    paddingVertical: 24,
  },
  quoteMark: {
    fontSize: 48,
    lineHeight: 34,
    color: colors.ember,
    opacity: 0.3,
    fontFamily: 'serif',
  },
  quoteText: {
    fontSize: 26,
    lineHeight: 39,
    letterSpacing: -0.26,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginTop: 24,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.emberTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,98,26,0.18)',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDDDDD',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ember,
  },
  swipeHint: {
    textAlign: 'center',
    marginTop: 10,
  },
  bottom: {
    paddingHorizontal: 26,
    paddingTop: 8,
  },
  factCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  factText: {
    flex: 1,
    lineHeight: 20.8,
  },
  shareBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.ember,
  },
  shareBtnGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
