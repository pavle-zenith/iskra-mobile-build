import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import SignatureScreen from 'react-native-signature-canvas';
import { DarkLayout } from '../../src/components/onboarding/DarkLayout';
import { Text } from '../../src/components/ui/Text';
import { WhiteButton } from '../../src/components/ui/Button';
import { useOnboardingStore } from '../../src/stores/onboarding';
import { colors } from '../../src/theme/tokens';

const PLEDGES = [
  'Prestane da pušim, dan po dan',
  'Otvori Iskru kad bude teško',
  'Ne odustajem posle pada',
  'Biram zdravlje, porodicu i slobodu',
];

function CheckW({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#fff" />
      <Path d="M7.5 12.3l3 3 6-6.4" stroke={colors.ember} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function CommitmentScreen() {
  const { name, setSignatureData, setCommitted } = useOnboardingStore();
  const [signed, setSigned] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const sigRef = useRef<any>(null);
  const pendingNav = useRef(false);

  function handleSigned(sig: string) {
    setSignatureData(sig);
    setSigned(true);
    setCommitted(true);
    setScrollEnabled(true);
    if (pendingNav.current) {
      pendingNav.current = false;
      router.push('/onboarding/summary');
    }
  }

  function handleClear() {
    if (sigRef.current) sigRef.current.clearSignature();
    setSigned(false);
    pendingNav.current = false;
    setSignatureData(undefined);
    setCommitted(false);
  }

  function handleNext() {
    if (!signed) {
      pendingNav.current = true;
      if (sigRef.current) sigRef.current.readSignature();
      return;
    }
    router.push('/onboarding/summary');
  }

  const displayName = name || 'Moj dragi';

  const sigStyle = `
    html, body { margin: 0; padding: 0; background: transparent !important; overflow: hidden; }
    canvas { touch-action: none; display: block; background: transparent !important; }
  `;

  return (
    <DarkLayout
      step={17}
      totalSteps={18}
      onBack={() => router.back()}
      noProgress
      scrollable
      scrollEnabled={scrollEnabled}
      footer={
        <WhiteButton
          label={signed ? 'Potpisujem' : 'Potpiši da nastaviš'}
          onPress={handleNext}
          disabled={false}
        />
      }
    >
      <View style={styles.content}>
        {/* ISKRA wordmark */}
        <Text weight="bold" size="sm" color="rgba(255,255,255,0.92)" style={styles.wordmark}>
          ISKRA
        </Text>

        {/* Headline */}
        <Text weight="semibold" size="3xl" color="#fff" style={styles.title}>
          {displayName}, sklapamo dogovor.
        </Text>

        {/* Section label */}
        <Text weight="medium" size="base" color="#fff" style={styles.sectionLabel}>
          Od danas, obavezujem se da:
        </Text>

        {/* Pledges */}
        <View style={styles.pledges}>
          {PLEDGES.map((p) => (
            <View key={p} style={styles.pledgeRow}>
              <CheckW size={22} />
              <Text weight="medium" size="base" color="#fff" style={styles.pledgeText}>
                {p}
              </Text>
            </View>
          ))}
        </View>

        {/* Belief line */}
        <Text weight="regular" size="base" color="rgba(255,255,255,0.8)" style={styles.beliefLine}>
          I verujem da će me Iskra voditi svakog koraka.
        </Text>

        {/* Signature canvas — disable parent scroll while drawing */}
        <View style={styles.sigWrapper}>
          <View style={styles.sigClip}>
            <SignatureScreen
              ref={sigRef}
              onOK={handleSigned}
              onEmpty={() => setScrollEnabled(true)}
              onBegin={() => setScrollEnabled(false)}
              onEnd={() => setScrollEnabled(true)}
              descriptionText=""
              clearText="Obriši"
              confirmText="Potpiši"
              webStyle={sigStyle}
              autoClear={false}
              backgroundColor="transparent"
              penColor="#E8621A"
              style={styles.sigCanvas}
              scrollable={false}
            />
          </View>
          {!signed && (
            <View style={styles.sigPlaceholder} pointerEvents="none">
              <Text weight="regular" size="sm" color="rgba(255,255,255,0.4)" style={{ fontStyle: 'italic' }}>
                Potpiši se ovde
              </Text>
            </View>
          )}
          {signed && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Text weight="bold" size="xs" color="rgba(255,255,255,0.8)">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text weight="regular" size="xs" color="rgba(255,255,255,0.6)" style={styles.privacyNote}>
          * Potpis se ne čuva. Samo za tebe.
        </Text>
      </View>
    </DarkLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 26,
    paddingTop: 58,
    paddingBottom: 8,
  },
  wordmark: {
    letterSpacing: 3,
  },
  title: {
    marginTop: 26,
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 4,
  },
  pledges: {
    marginTop: 14,
    gap: 15,
  },
  pledgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  pledgeText: {
    flex: 1,
    lineHeight: 22,
    marginTop: 1,
  },
  beliefLine: {
    marginTop: 20,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  sigWrapper: {
    marginTop: 18,
    height: 160,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sigClip: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sigCanvas: {
    flex: 1,
  },
  sigPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  clearBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyNote: {
    marginTop: 12,
    textAlign: 'center',
  },
});
