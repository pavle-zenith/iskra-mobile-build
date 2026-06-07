import { CategoryKey } from '../theme/tokens';

export type Gender = 'muško' | 'žensko' | 'drugo';
export type Product = 'cigarete' | 'iqos';
export type Timing = 'odmah' | 'uskoro' | 'vec_prestao';
export type CravingTool = 'disem' | 'voda' | 'razlozi' | 'setam' | 'posmatram' | 'igram';
export type CravingOutcome = 'survived' | 'slipped';

export interface Profile {
  id: string;
  name: string | null;
  gender: Gender | null;
  product: Product;
  cigarettes_per_day: number;
  cigarettes_per_pack: number;
  pack_price_rsd: number;
  quit_date: string | null;           // ISO timestamptz
  reasons: string[];
  reason_text: string | null;
  fears: string[];
  triggers: string[];
  timing: Timing | null;
  onboarding_completed: boolean;
  is_premium: boolean;
  committed: boolean;
  signature_data: string | null;      // base64 canvas signature
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  date: string;                        // YYYY-MM-DD
  clean: boolean;
  created_at: string;
}

export interface Craving {
  id: string;
  user_id: string;
  strength: number;                    // 1–10
  trigger: string | null;
  tool_used: CravingTool | null;
  duration_seconds: number | null;
  outcome: CravingOutcome | null;
  created_at: string;
}

export interface Slip {
  id: string;
  user_id: string;
  trigger: string | null;
  notes: string | null;
  created_at: string;
}

export interface MilestoneRecord {
  id: string;
  user_id: string;
  key: string;
  category: CategoryKey;
  unlocked_at: string;
  shared: boolean;
}

export interface MilestoneDef {
  key: string;
  category: CategoryKey;
  days?: number;
  rsd?: number;
  cravingsSurvived?: number;
  title: string;
  unlockText: string;
}

export interface QuitStats {
  daysSmokeFreeContinuous: number;     // streak (resets on slip)
  totalDaysClean: number;              // never resets
  hoursTotal: number;
  minutesTotal: number;
  secondsTotal: number;
  cigarettesAvoided: number;
  moneySavedRSD: number;
  timeDisplay: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}
