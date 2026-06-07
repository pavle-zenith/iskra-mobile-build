import React, { useEffect } from 'react';
import { router } from 'expo-router';
import * as StoreReview from 'expo-store-review';

// Silently request store review and immediately continue.
// If review is unavailable (simulator), proceeds anyway.

export default function ReviewScreen() {
  useEffect(() => {
    (async () => {
      try {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
          await StoreReview.requestReview();
        }
      } catch (_) {
        // ignore
      } finally {
        router.replace('/onboarding/paywall');
      }
    })();
  }, []);

  return null;
}
