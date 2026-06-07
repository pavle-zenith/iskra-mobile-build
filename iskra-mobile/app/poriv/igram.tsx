// Bubble pop game — deep purple, glassy bubbles, tap to pop, score counter
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../src/components/ui/Text';
import { IcoX } from '../../src/components/icons';
import { colors } from '../../src/theme/tokens';

const { width: W, height: H } = Dimensions.get('window');
const PURPLE = '#6B52A8';
const NUM_BUBBLES = 10;
const GAME_DURATION = 60; // seconds

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  isEmber: boolean;
  popped: boolean;
  opacity: Animated.Value;
  scale: Animated.Value;
};

const BUBBLE_COLORS = [
  'rgba(107,82,168,0.5)',
  'rgba(74,138,196,0.45)',
  'rgba(46,139,128,0.45)',
  'rgba(58,122,58,0.4)',
  'rgba(212,84,126,0.4)',
];

function makeBubble(id: number): Bubble {
  const size = 48 + (id % 3) * 16;
  return {
    id,
    x: 20 + ((id * 73) % (W - size - 40)),
    y: 100 + ((id * 97) % (H * 0.55)),
    size,
    color: id === 3 ? colors.ember : BUBBLE_COLORS[id % BUBBLE_COLORS.length],
    isEmber: id === 3,
    popped: false,
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  };
}

export default function PorivIgramScreen() {
  const insets = useSafeAreaInsets();
  const { strength, trigger } = useLocalSearchParams<{ strength: string; trigger: string }>();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    Array.from({ length: NUM_BUBBLES }, (_, i) => makeBubble(i))
  );

  // Game timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Respawn popped bubbles
  const respawnBubble = useCallback((id: number) => {
    const newBubble = makeBubble(id + NUM_BUBBLES + score);
    setBubbles((prev) => prev.map((b) => (b.id === id ? newBubble : b)));
  }, [score]);

  const popBubble = (bubble: Bubble) => {
    if (bubble.popped) return;

    // Mark popped
    setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, popped: true } : b));
    setScore((s) => s + (bubble.isEmber ? 3 : 1));

    // Pop animation
    Animated.parallel([
      Animated.timing(bubble.scale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(bubble.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => respawnBubble(bubble.id), 600);
    });
  };

  const isDone = timeLeft === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IcoX size={16} stroke="rgba(255,255,255,0.4)" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.topLabel}>IGRAM SE</Text>
        <View style={styles.scorePill}>
          <Text weight="bold" style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Timer */}
      <Text weight="bold" style={styles.timer} numberOfLines={1}>
        {timeLeft}s
      </Text>

      {/* Game area */}
      <View style={styles.gameArea} pointerEvents={isDone ? 'none' : 'auto'}>
        {bubbles.map((bubble) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                backgroundColor: bubble.color,
                borderColor: bubble.isEmber ? colors.ember : 'rgba(255,255,255,0.25)',
                transform: [{ scale: bubble.scale }],
                opacity: bubble.opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => popBubble(bubble)}
              activeOpacity={0.7}
            />
            {bubble.isEmber && (
              <View style={styles.emberGlow} />
            )}
          </Animated.View>
        ))}
      </View>

      {/* Instruction */}
      {!isDone && (
        <Text weight="regular" size="xs" color="rgba(255,255,255,0.3)" style={styles.hint}>
          Pucaj mehuriće! Ember mehurić = 3 boda
        </Text>
      )}

      {/* Done overlay */}
      {isDone && (
        <View style={styles.doneOverlay}>
          <Text weight="bold" color="#fff" style={styles.doneTitle}>Kraj igre!</Text>
          <Text weight="regular" size="sm" color="rgba(255,255,255,0.7)" style={{ marginTop: 8 }}>
            Popcao/la si {score} mehuriće
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { marginTop: 24 }]}
            onPress={() => router.replace({ pathname: '/poriv/success', params: { strength, trigger } })}
            activeOpacity={0.85}
          >
            <Text weight="bold" size="base" color={PURPLE}>Nastavi</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.toolIgram,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
  scorePill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  scoreText: {
    fontSize: 13,
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  timer: {
    fontSize: 40,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emberGlow: {
    position: 'absolute',
    inset: -4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.ember,
    opacity: 0.5,
  },
  hint: {
    textAlign: 'center',
    paddingBottom: 16,
    paddingHorizontal: 32,
  },
  doneOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(45,31,94,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  doneTitle: {
    fontSize: 36,
    letterSpacing: -0.5,
  },
  doneBtn: {
    paddingHorizontal: 40,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
