import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Gender, Product, Timing } from '../types';

interface OnboardingState {
  // Profile data
  name: string;
  gender: Gender | null;
  product: Product;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  packPriceRSD: number;
  reasons: string[];
  reasonText: string;
  fears: string[];
  triggers: string[];
  timing: Timing | null;
  quitDate: string | null;        // ISO string
  signatureData: string | null;   // base64
  committed: boolean;

  // Setters
  setName: (name: string) => void;
  setGender: (gender: Gender) => void;
  setProduct: (product: Product) => void;
  setCigarettesPerDay: (n: number) => void;
  setCigarettesPerPack: (n: number) => void;
  setPackPriceRSD: (n: number) => void;
  setReasons: (reasons: string[]) => void;
  setReasonText: (text: string) => void;
  setFears: (fears: string[]) => void;
  setTriggers: (triggers: string[]) => void;
  setTiming: (timing: Timing) => void;
  setQuitDate: (date: string) => void;
  setSignatureData: (data: string | undefined) => void;
  setCommitted: (committed: boolean) => void;

  // Computed helpers
  getAnnualCostRSD: () => number;

  // Reset
  reset: () => void;
}

const defaultState = {
  name: '',
  gender: null,
  product: 'cigarete' as Product,
  cigarettesPerDay: 20,
  cigarettesPerPack: 20,
  packPriceRSD: 0,
  reasons: [],
  reasonText: '',
  fears: [],
  triggers: [],
  timing: null,
  quitDate: null,
  signatureData: null,
  committed: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setName: (name) => set({ name }),
      setGender: (gender) => set({ gender }),
      setProduct: (product) => set({ product }),
      setCigarettesPerDay: (n) => set({ cigarettesPerDay: n }),
      setCigarettesPerPack: (n) => set({ cigarettesPerPack: n }),
      setPackPriceRSD: (n) => set({ packPriceRSD: n }),
      setReasons: (reasons) => set({ reasons }),
      setReasonText: (text) => set({ reasonText: text }),
      setFears: (fears) => set({ fears }),
      setTriggers: (triggers) => set({ triggers }),
      setTiming: (timing) => set({ timing }),
      setQuitDate: (date) => set({ quitDate: date }),
      setSignatureData: (data) => set({ signatureData: data ?? null }),
      setCommitted: (committed) => set({ committed }),

      getAnnualCostRSD: () => {
        const { cigarettesPerDay, cigarettesPerPack, packPriceRSD } = get();
        if (!packPriceRSD || !cigarettesPerPack) return 0;
        return Math.round((cigarettesPerDay / cigarettesPerPack) * packPriceRSD * 365);
      },

      reset: () => set(defaultState),
    }),
    {
      name: 'iskra-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
