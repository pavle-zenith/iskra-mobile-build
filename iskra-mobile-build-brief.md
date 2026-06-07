# Iskra Mobile — Claude Code Build Brief

## Overview

You are building **Iskra** — a premium Serbian-language quit-smoking app for iOS and Android. This is a full production build. Do not cut scope, do not simplify. Match the designs exactly.

The repo is `iskra-mobile`. The design source (HTML prototypes, component JSX, design tokens) lives at `iskra-claude-design-export/` inside this repo. Read `iskra-claude-design-export/project/HANDOFF.md` and `iskra-claude-design-export/project/CLAUDE.md` in full before touching any code — they are the authoritative spec. This brief adds decisions on top of those docs.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Expo SDK 51+ (React Native)** | File-based routing via Expo Router v3 |
| Language | **TypeScript** | Strict mode |
| Styling | **StyleSheet + design token constants** | No NativeWind — too much overhead for this level of custom design |
| Navigation | **Expo Router** | Stack + Tab navigators |
| Database | **Supabase** | Same project as the quiz: `aaknvhlirztdglxsnbhu` |
| Auth | **Supabase Auth** | Magic link (email) — users from quiz waitlist log in with their email |
| Backend logic | **Supabase Edge Functions** | No separate server |
| Analytics | **PostHog React Native SDK** | Same project 457365 |
| Push notifications | **Expo Notifications + Supabase Edge Function scheduler** | Scheduled cadence (see below) |
| Widget | **expo-widgets (WidgetKit iOS + Glance Android)** | Streak + time + "Imam poriv" shortcut |
| Icons | **Custom SVG icon set** (see design export) | No icon font, no emoji |
| Image assets | **expo-image** | For performance and caching |

---

## Design Tokens (port these first — everything depends on them)

Create `src/theme/tokens.ts`. Source: `iskra-claude-design-export/project/colors_and_type.css`.

```ts
// src/theme/tokens.ts
export const colors = {
  // Brand
  ember: '#E8621A',
  emberTop: '#F0701F',        // gradient top
  emberTint: '#FEF0E8',       // pale bg, category pills
  emberSoft: '#FBEAE0',
  emberShadow: 'rgba(232,98,26,0.28)',

  // Surfaces
  bg: '#FDFCFA',              // app background (warm off-white)
  card: '#FFFFFF',
  border: '#ECE9E3',
  faint: '#F1EDE6',
  warmInterstitial: '#FEF6F0', // AHA/reflection screens

  // Text
  text: '#1A1A1A',
  textSub: '#999999',
  muted: '#888888',
  mutedLight: '#BBBBBB',
  bodyText: '#555555',

  // Category colors
  zdravlje: '#D4547E',        // rose
  pluca: '#4A6EB0',           // blue
  ekologija: '#2E8B80',       // teal
  finansije: '#3A7A3A',       // green
  telo: '#BA7517',            // terracotta/amber
  nikotin: '#6B52A8',         // purple

  // Reason pill colors
  reasonZdravlje: '#D4547E',
  reasonPorodica: '#4A6080',
  reasonPare: '#2E8B80',
  reasonForma: '#3A7A3A',
  reasonSloboda: '#6B52A8',
  reasonPritisak: '#BA7517',

  // Functional
  success: '#3A7A3A',
  danger: '#C24A43',
  warning: '#BA7517',

  // Dark surface (Poriv Mode, ember screens with IOSDevice dark)
  darkSurface: '#1A1410',
  darkCard: 'rgba(255,255,255,0.08)',
};

export const gradients = {
  ember: ['#F0701F', '#E8621A'] as const,
  emberVertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
};

export const typography = {
  family: 'Manrope',
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 38,
    '5xl': 48,
  },
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  card: 18,
  cardLg: 20,
  cardHero: 26,
  pill: 999,
  btn: 16,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  ember: {
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  photo: {
    shadowColor: 'rgba(70,110,150,0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 8,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  screenH: 16, // horizontal screen padding
  screenV: 20, // vertical screen padding
};
```

---

## Font Setup

Load Manrope via `expo-google-fonts` or bundle the TTF files. Required weights: 300, 400, 500, 600, 700, 800.

```ts
// app/_layout.tsx
import { useFonts } from 'expo-font';
import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
```

All text in the app uses Manrope. Create a `Text` component wrapper that enforces this:

```ts
// src/components/ui/Text.tsx
// Props: weight ('light'|'regular'|'medium'|'semibold'|'bold'|'extrabold'), size (keyof tokens.typography.sizes), color
// Applies fontFamily: `Manrope_${weight}` automatically
```

---

## Project Structure

```
iskra-mobile/
├── app/                          # Expo Router — all screens
│   ├── _layout.tsx               # Root layout: fonts, Supabase provider, PostHog, auth gate
│   ├── index.tsx                 # Redirect: if authed → /home, else → /onboarding/splash
│   ├── onboarding/
│   │   ├── _layout.tsx           # Stack navigator, no header
│   │   ├── splash.tsx
│   │   ├── name.tsx
│   │   ├── gender.tsx
│   │   ├── product.tsx
│   │   ├── cigarettes.tsx
│   │   ├── price.tsx
│   │   ├── cost-aha.tsx          # Dark/ember AHA reveal
│   │   ├── reasons.tsx
│   │   ├── reason-text.tsx
│   │   ├── reflection.tsx        # Dark
│   │   ├── fears.tsx
│   │   ├── fear-reflection.tsx   # Dark
│   │   ├── triggers.tsx
│   │   ├── timing.tsx
│   │   ├── date.tsx
│   │   ├── preview.tsx           # Dark
│   │   ├── panic.tsx
│   │   ├── commitment.tsx        # Dark, canvas signature
│   │   ├── summary.tsx           # Dark, scrollable
│   │   ├── notifications.tsx
│   │   ├── review.tsx            # iOS rate prompt
│   │   └── paywall.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigator
│   │   ├── index.tsx             # Home (Početna)
│   │   ├── milestoni.tsx
│   │   ├── saznaj.tsx            # Knowledge base
│   │   └── profil.tsx            # Settings/profile
│   ├── home/
│   │   ├── time.tsx              # Time detail
│   │   ├── money.tsx             # Money saved detail
│   │   ├── cigarettes.tsx        # Cigarettes avoided detail
│   │   └── quote.tsx             # Quote dana detail
│   ├── poriv/
│   │   ├── entry.tsx
│   │   ├── mode.tsx
│   │   ├── disem.tsx             # Breathing tool
│   │   ├── voda.tsx              # Water tool
│   │   ├── razlozi.tsx           # Reasons tool
│   │   ├── setam.tsx             # Walking tool
│   │   ├── posmatram.tsx         # Observation tool
│   │   ├── igram.tsx             # Game tool
│   │   └── success.tsx
│   ├── slip/
│   │   ├── index.tsx
│   │   ├── reflect.tsx
│   │   ├── recap.tsx
│   │   └── progress-sheet.tsx
│   ├── progress/
│   │   ├── roadmap.tsx           # Goals roadmap
│   │   └── category/
│   │       └── [key].tsx         # Dynamic: zdravlje/pluca/ekologija/finansije/telo/nikotin
│   └── settings.tsx
├── src/
│   ├── theme/
│   │   └── tokens.ts             # All design tokens (above)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Text.tsx          # Manrope wrapper
│   │   │   ├── Button.tsx        # EmberButton, BackButton, OutlinedButton
│   │   │   ├── Card.tsx          # Base card with shadow
│   │   │   ├── OptionCard.tsx    # Selected/unselected inverted pattern
│   │   │   ├── SelectionPill.tsx # Multi-select pill (reasons/fears/triggers)
│   │   │   ├── ProgressBar.tsx   # Thin ember progress bar
│   │   │   ├── CategoryPill.tsx  # Uppercase eyebrow pill, ember tint bg
│   │   │   ├── StatCard.tsx      # Home stat card (navigable)
│   │   │   ├── EmberGradient.tsx # LinearGradient wrapper with ember colors
│   │   │   └── PhotoHeroCard.tsx # Liven-style photo header card with scrim
│   │   ├── icons/                # Custom SVG icon components
│   │   │   ├── IcoFlame.tsx
│   │   │   ├── IcoHeart.tsx
│   │   │   ├── IcoCigarette.tsx
│   │   │   ├── IcoMoney.tsx
│   │   │   ├── IcoTime.tsx
│   │   │   ├── IcoBook.tsx
│   │   │   ├── IcoBell.tsx
│   │   │   ├── IcoShare.tsx
│   │   │   ├── IcoCheck.tsx
│   │   │   ├── IcoLock.tsx
│   │   │   ├── IcoTrophy.tsx
│   │   │   ├── IcoWater.tsx
│   │   │   └── ... (full set from design export)
│   │   ├── nav/
│   │   │   ├── BottomNav.tsx
│   │   │   └── TopBar.tsx
│   │   ├── home/
│   │   │   ├── WeeklyTracker.tsx       # Ember surface + sand photo blend + check circles
│   │   │   ├── CountdownCard.tsx       # Live ticking Dan/sati/minuta/sekunde
│   │   │   ├── DailyCheckinOverlay.tsx # Blurred backdrop modal
│   │   │   ├── ConfettiCelebration.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   └── GoalCard.tsx            # Category goal card with progress bar
│   │   ├── onboarding/
│   │   │   ├── OnboardingLayout.tsx    # Progress bar + nav wrapper
│   │   │   ├── DarkLayout.tsx          # Full ember bg layout for AHA screens
│   │   │   └── SignaturePad.tsx        # Canvas signature input (commitment screen)
│   │   ├── poriv/
│   │   │   ├── CountdownRing.tsx       # Circular 5-min countdown arc
│   │   │   ├── BreathingRing.tsx       # 4-4-4 breathing animation
│   │   │   ├── WaterRise.tsx           # Animated water fill with text flip
│   │   │   ├── BubblePop.tsx           # Bubble game with smoke particle
│   │   │   ├── WalkingTrail.tsx        # Animated dashed trail
│   │   │   └── WaveSurface.tsx         # Drifting wave + reflection
│   │   └── charts/
│   │       ├── AreaChart.tsx           # Money saved SVG area chart
│   │       ├── BarChart.tsx            # Cigarettes weekly bar chart
│   │       └── DriverBar.tsx           # Horizontal % breakdown bar
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── posthog.ts            # PostHog RN client
│   │   └── notifications.ts     # Expo Notifications helpers
│   ├── hooks/
│   │   ├── useUserData.ts        # Supabase user + profile
│   │   ├── useQuitStats.ts       # Streak, time, money, cigarettes (computed live)
│   │   ├── useMilestones.ts      # Achievement unlock logic
│   │   └── useCravingFlow.ts     # Poriv state machine
│   ├── stores/
│   │   └── onboarding.ts         # Zustand store for onboarding state
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── widgets/
│   ├── ios/                      # WidgetKit Swift extension
│   └── android/                  # Glance Kotlin extension
├── assets/
│   ├── fonts/                    # Manrope TTFs
│   ├── images/
│   │   ├── canyon-bg.png
│   │   ├── sky-bg.webp
│   │   ├── sand-bg.jpeg
│   │   ├── highland-bg.png
│   │   ├── iskra-logo.png
│   │   ├── iskra-flame-ember.png
│   │   └── iskra-flame-white.png
│   └── lottie/                   # Confetti animation (use lottie-react-native)
└── supabase/
    ├── migrations/               # DB schema
    └── functions/
        ├── send-notification/    # Edge function: push notification sender
        └── schedule-notifications/ # Edge function: daily scheduler (cron)
```

---

## Supabase Schema

Run these migrations. The quiz app already has `quiz_submissions`. Add:

```sql
-- users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  gender text check (gender in ('muško', 'žensko', 'drugo')),
  product text check (product in ('cigarete', 'iqos')) default 'cigarete',
  cigarettes_per_day int,
  cigarettes_per_pack int default 20,
  pack_price_rsd int,
  quit_date timestamptz,
  reasons text[],           -- ['zdravlje', 'porodica', etc.]
  reason_text text,         -- personal written reason
  fears text[],
  triggers text[],
  timing text,              -- 'odmah' | 'uskoro' | 'vec_prestao'
  onboarding_completed boolean default false,
  is_premium boolean default false,
  committed boolean default false,
  signature_data text,      -- base64 canvas signature from commitment screen
  push_token text,          -- Expo push token
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- daily check-ins
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  clean boolean not null,   -- true = smoke-free, false = slip
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- craving events
create table public.cravings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  strength int check (strength between 1 and 10),
  trigger text,
  tool_used text,           -- 'disem' | 'voda' | 'razlozi' | 'setam' | 'posmatram' | 'igram'
  duration_seconds int,
  outcome text check (outcome in ('survived', 'slipped')),
  created_at timestamptz default now()
);

-- slip events
create table public.slips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  trigger text,
  notes text,
  created_at timestamptz default now()
);

-- milestones
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  key text not null,        -- 'dan_1' | 'dan_7' | 'dan_30' | etc.
  category text,            -- 'zdravlje' | 'finansije' | etc.
  unlocked_at timestamptz default now(),
  shared boolean default false,
  unique(user_id, key)
);

-- RLS policies: all tables — users can only read/write their own rows
alter table public.profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.cravings enable row level security;
alter table public.slips enable row level security;
alter table public.milestones enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own checkins" on public.checkins for all using (auth.uid() = user_id);
create policy "own cravings" on public.cravings for all using (auth.uid() = user_id);
create policy "own slips" on public.slips for all using (auth.uid() = user_id);
create policy "own milestones" on public.milestones for all using (auth.uid() = user_id);
```

---

## Auth Flow

Users come from the quiz waitlist (they submitted their email at quiz.iskraclub.com). Login = magic link (passwordless email).

- Splash screen: "Već imam nalog" → magic link login flow
- After onboarding: `supabase.auth.signUp({ email })` then write profile row
- `app/index.tsx` checks session → routes to onboarding or home
- Session stored in SecureStore via `@supabase/async-storage`

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

---

## Live Stats Hook

This is the core of the app. Every number the user sees derives from their quit date and check-in history.

```ts
// src/hooks/useQuitStats.ts
// Returns — update every second via setInterval:
// {
//   daysSmokeFreeContinuous: number,   // streak (resets on slip)
//   totalDaysClean: number,            // never resets
//   hoursTotal: number,
//   minutesTotal: number,
//   secondsTotal: number,
//   cigarettesAvoided: number,         // based on cigarettes_per_day
//   moneySavedRSD: number,             // cigarettesAvoided / per_pack * pack_price
//   timeDisplay: { days, hours, minutes, seconds }, // for countdown card
// }
```

- Streak = consecutive clean check-ins from latest streak start date
- Total = sum of all clean days across all streaks (never resets on slip)
- Cigarettes/money = based on `cigarettes_per_day` from profile

---

## Milestone Definitions

```ts
// src/hooks/useMilestones.ts

const MILESTONES = [
  // Time milestones
  { key: 'dan_1',   category: 'zdravlje',  days: 1,   title: 'Dan 1',        unlockText: 'Počelo je.' },
  { key: 'dan_3',   category: 'zdravlje',  days: 3,   title: '72 sata',      unlockText: 'Nikotin napušta telo.' },
  { key: 'dan_7',   category: 'zdravlje',  days: 7,   title: 'Nedelja dana', unlockText: '...' },
  { key: 'dan_14',  category: 'pluca',     days: 14,  title: '2 nedelje',    unlockText: '...' },
  { key: 'dan_30',  category: 'zdravlje',  days: 30,  title: 'Mesec dana',   unlockText: '...' },
  { key: 'dan_60',  category: 'pluca',     days: 60,  title: '2 meseca',     unlockText: '...' },
  { key: 'dan_90',  category: 'finansije', days: 90,  title: '3 meseca',     unlockText: '...' },
  { key: 'dan_180', category: 'telo',      days: 180, title: '6 meseci',     unlockText: '...' },
  { key: 'dan_365', category: 'zdravlje',  days: 365, title: 'Godinu dana',  unlockText: '...' },
  // Financial milestones (based on computed savings)
  { key: 'rsd_10k',  category: 'finansije', rsd: 10000,  title: '10.000 RSD', unlockText: '...' },
  { key: 'rsd_20k',  category: 'finansije', rsd: 20000,  title: '20.000 RSD', unlockText: '...' },
  { key: 'rsd_50k',  category: 'finansije', rsd: 50000,  title: '50.000 RSD', unlockText: '...' },
  { key: 'rsd_100k', category: 'finansije', rsd: 100000, title: '100.000 RSD', unlockText: '...' },
  // Craving milestones
  { key: 'poriv_1',  category: 'nikotin', cravingsSurvived: 1,  title: 'Prva pobeda', unlockText: '...' },
  { key: 'poriv_10', category: 'nikotin', cravingsSurvived: 10, title: '10 porива',    unlockText: '...' },
  { key: 'poriv_50', category: 'nikotin', cravingsSurvived: 50, title: '50 porива',    unlockText: '...' },
];
// Fill in Serbian copy for all unlockText fields from the health timeline in the design
```

On each milestone unlock: write to `milestones` table, fire push notification, show confetti on home.

---

## Onboarding State (Zustand)

```ts
// src/stores/onboarding.ts
import { create } from 'zustand';

interface OnboardingState {
  name: string;
  gender: 'muško' | 'žensko' | 'drugo' | null;
  product: 'cigarete' | 'iqos';
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  packPriceRSD: number;
  reasons: string[];
  reasonText: string;
  fears: string[];
  triggers: string[];
  timing: string | null;
  quitDate: Date | null;
  signatureData: string | null;  // base64
  committed: boolean;
  // setters...
}
```

Persist via `zustand/middleware` + AsyncStorage. On completion of onboarding, write the full profile to Supabase and clear the store.

---

## Screen-by-Screen Spec

### A. Onboarding

All onboarding screens share an `OnboardingLayout` wrapper that provides:
- Thin 2px ember progress bar at top
- "ISKRA" wordmark (all caps, semibold) in top bar
- Back arrow (`onBack`)
- Safe area insets

**Dark/ember screens** (`cost-aha`, `reflection`, `fear-reflection`, `preview`, `commitment`, `summary`) use `DarkLayout`:
- Full screen ember gradient (`#F0701F → #E8621A`) background
- White text throughout
- `<StatusBar style="light" />`
- White CTA button with ember text (not the standard ember button)

#### splash.tsx
- ISKRA wordmark (large, centered, `#1A1A1A` on white)
- Ember spark/flame icon above wordmark
- Tagline: "Znaš da treba. / Iskra ti pomaže da konačno i hoćeš." — two lines, center, semibold 24px / regular 17px
- "Počni" ember button (full width, bottom)
- "Već imam nalog" text link below button (ember color)
- No progress bar on this screen

#### name.tsx
- Title: "Kako da te zovemo?" (semibold 28px)
- Single text input, border turns ember on focus
- "Nastavi" button disabled until ≥1 char typed
- Keyboard avoidance

#### gender.tsx
- Title: "Kako da te oslovljavamo?"
- Two tall photo cards side by side: **Muško** / **Žensko** (use fillable image slots from design)
- Each card: photo fills card, white label pill + chevron at bottom, selected = ember border + ember tint overlay
- Tapping a card auto-advances (no Nastavi button)
- "Preferiram da ne kažem" small text link below cards
- Image slots: use `iskra-man.png` / `iskra-woman.png` from assets (already in quiz repo, copy them)

#### product.tsx
- Title: "Šta koristiš?"
- Two stacked full-width option cards: **Cigarete** / **IQOS**
- Each: icon chip (left) + title (bold) + subtitle (muted) + radio circle (right)
- Selected = ember gradient fill, white text, white icon chip with ember icon (inverted pattern)
- Tapping auto-advances

#### cigarettes.tsx
- Title: "Koliko cigareta dnevno pušiš?"
- Large stepper: `−` / big number / `+` (number: 56px extrabold ember)
- Below divider: "Cigareta u pakli" label + numeric input (default 20)
- "Nastavi" always enabled (default 20)

#### price.tsx
- Title: "Koliko košta tvoja kutija?"
- Large numeric input (center, 48px semibold)
- RSD / EUR toggle pill below input (default RSD)
- "Nastavi" enabled once >0

#### cost-aha.tsx `[DARK]`
- Full ember gradient bg
- White card (18px radius, subtle shadow): displays computed annual cost
- Big number: `{annualCost.toLocaleString('sr')} RSD` (48px extrabold white)
- Equivalents line: `= 10 dana odmora na moru` (compute from cost)
- White "Nastavi" button
- Compute: `(cigarettesPerDay / cigarettesPerPack) * packPriceRSD * 365`

#### reasons.tsx
- Title: "Zašto hoćeš da prestaneš?"
- Subtitle: "Izaberi do 3 razloga"
- 2-column grid of selection pills (each has small icon + label):
  - Zdravlje (rose icon), Porodica (slate), Pare (teal), Forma (green), Sloboda (purple), Pritisak (amber)
- Max 3 selected; 4th tap replaces oldest or shows shake animation
- Selected = inverted (ember fill, white text, white icon chip with ember icon)
- "Nastavi" enabled when ≥1 selected

#### reason-text.tsx
- Title: "Zapiši to svojim rečima."
- Subtitle: "Zašto prestanak znači nešto tebi lično?"
- Textarea (120 char limit, char counter bottom right)
- Scrollable example chips above textarea that fill the field on tap
- Privacy note: small muted text below ("Samo ti vidiš ovo.")
- "Nastavi" always enabled (skip allowed)

#### reflection.tsx `[DARK]`
- Full ember bg
- Title: "Tvoji razlozi su pravi." (white, 28px semibold)
- Subtitle (white, 16px regular)
- 3 white cards:
  - Zdravlje: rose icon + "Zdravlje" + ember bold takeaway line
  - Porodica: slate icon + "Porodica" + ember bold line
  - Sloboda: purple icon + "Sloboda" + ember bold line
- White "Razumem" button

#### fears.tsx
- Title: "Šta te brine kod prestanka?"
- Same pill grid pattern as reasons.tsx
- Options: porivi / stres / kafana / neuspeh / razdražljivost / kilaža
- No max limit

#### fear-reflection.tsx `[DARK]`
- Same pattern as reflection.tsx but 3 cards addressing the fears:
  - Jaki porivi: with bold ember line about how they last only 3–5 minutes
  - Stres: with ember line about alternative tools
  - Kafana i društvo: with ember line about social strategies
- "Spreman/na sam" button (gender-aware: Spreman for muško, Spremna for žensko/drugo)

#### triggers.tsx
- Title: "Kada ti se najviše puši?"
- 2-col grid of 6 pills: Jutarnja kafa / Posle jela / Stres / Kafana / Dosada / Vožnja
- Full-width pill: "Čekanje i dosada"
- Same inverted selected pattern

#### timing.tsx
- Title: "Kada hoćeš da prestaneš?"
- 3 stacked full-width option cards with icons:
  - Odmah (ember flame icon)
  - Uskoro — za koji dan (calendar icon)
  - Već sam prestao/la (check icon)
- Tapping auto-advances
- Selected = ember fill (brief flash before advancing)

#### date.tsx
- Title: "Koji datum si izabrao/la?"
- Interactive calendar (month view, ember-filled selected day circle)
- Research footnote below calendar (small muted text)
- "Potvrdi datum" button (enabled when date selected)
- Default: today + 1 day for Odmah; today + 7 for Uskoro; today for Već

#### preview.tsx `[DARK]`
- Full ember bg
- 3 white benefit cards:
  - Finansije: green coin icon + title + description
  - Zdravlje: rose heart icon + title + description
  - Sloboda: purple icon + title + description
- Marija testimonial at bottom: white card, avatar circle (M initial), "Marija K.", verified green checkmark ✓, 5 yellow stars, quote text
- "Jedva čekam" white button

#### panic.tsx
- Title: "Kada dođe poriv, Iskra je tu."
- Subtitle: "Probaj dugme."
- Large circular ember button (120px diameter) center screen, pulsing dashed ring animation around it
- "IMAM PORIV" label inside circle
- Tapping the circle advances (no separate Nastavi)
- `Animated.loop` with scale + opacity pulse

#### commitment.tsx `[DARK]`
- No progress bar on this screen
- ISKRA wordmark centered top
- "Pavle, sklapamo dogovor." (use user's name — gendered: no change for this line)
- 4 pledge rows, each with white-circle + ember-tick checkbox:
  1. "Dajem sve od sebe."
  2. "Koristim Iskru kada mi je teško."
  3. "Praštam sebi ako posrnem."
  4. "Ovo radim za sebe."
- `SignaturePad` component below: white canvas area, draw with finger, X button to clear, pre-filled sample scrawl that clears on first touch
- "Potpisujem" white button (always enabled)
- Save signature as base64 to onboarding store

`SignaturePad` implementation:
- Use `react-native-canvas` or `expo-canvas` / `react-native-signature-canvas`
- White background, ember stroke color, 2px stroke width
- Pre-populate with a light sample signature path on mount; clear on first touch

#### summary.tsx `[DARK]`
- Full ember bg, scrollable
- Savings area chart (white line/fill on ember bg, showing projected savings over 12 months)
- 2×2 stat grid: Dan prestanka / Cigareta godišnje / Uštedine godišnje / Zdravlja povraćeno
- Health milestone timeline: chronological list of first N milestones with days + health fact
- User's reasons cards (from their selection, each white card with colored icon)
- "Počinjemo" white button pinned at bottom

#### notifications.tsx
- Bell icon in ember circle
- Title: "Iskra te podseća."
- 3 sample notification preview cards (white, shadowed, notification format):
  - "✦ Jutarnji check-in" — 8:00
  - "🏆 Dostigao/la si Dan 7!" — milestone example
  - "💪 Jak poriv? Otvori Iskru." — craving support
- "Dozvoli obaveštenja" ember button
- "Možda kasnije" text link
- On "Dozvoli": call `Notifications.requestPermissionsAsync()`, save token to profile

#### review.tsx
- iOS-style system review prompt (use `expo-store-review`)
- `StoreReview.requestReview()` — call it, then advance
- If not available (Android/unavailable), skip

#### paywall.tsx
- Long scrollable screen
- Countdown timer at top (24h countdown to "offer expiry" — cosmetic)
- Data pills: "2.341 korisnika" / "4.8★ ocena" / "93% uspešnost"
- Section: "Izaberi plan"
  - Mesečno: 299 RSD/mesec
  - Godišnje: 1.990 RSD/god (full-width "NAJPOPULARNIJE" banner header, ember bg)
  - Doživotno: 4.990 RSD
  - Selected plan = ember border + ember tint bg
- Ember CTA button: "Nastavi"
- Payment trust row: lock icon + "Sigurno plaćanje" + Apple/Google Pay icons
- Benefits list (6 items with ember check icons)
- Money-back: "30-dnevna garancija povrata novca"
- "Dva puta napred" compare table: red column (bez Iskre) vs green column (sa Iskrom)
- 3 user reviews (star rating + quote + name)
- FAQ accordion (5–6 questions)
- "Nastavi besplatno" small text link at very bottom (→ home, free tier)
- Use `react-native-purchases` (RevenueCat) for in-app purchase handling

---

### B. Home Screen

File: `app/(tabs)/index.tsx`

Build HomeScreenV3-1 exactly. Key implementation details:

**Weekly tracker** (the signature texture move):
```
- EmberGradient container, borderRadius 20, overflow hidden
- Image (sand-bg.jpeg) absolutely positioned, full size, blendMode 'soft-light', opacity 0.35
- 7 day columns: Su/Po/Ut/Sr/Če/Pe/Su
- Past days: white check circle (clean) or white X circle (slip) or gray empty circle
- Today: white circle with pulsing opacity animation (Animated.loop), "?" label
- Tapping today → DailyCheckinOverlay
- Future days: 50% opacity empty circles
```

**CountdownCard** (live ticking):
```
- Updates every second via useEffect + setInterval
- Displays: Dan N / HH sati / MM minuta / SS sekunde in 2×2 grid
- Tapping → router.push('/home/time')
```

**Stat cards**:
- Left: "RSD ušteđeno" — green text, tapping → `/home/money`
- Right: "cigareta odbijeno" — red text, tapping → `/home/cigarettes`

**Daily check-in overlay**:
- Modal with BlurView backdrop (blur intensity 20)
- "Čist sam/čista sam danas" ember button (gender-aware)
- "Zapalio/la sam" bordered text button
- Appears on tap of today's weekly tracker circle
- On "Čist": write checkin (clean: true), animate confetti
- On "Zapalio": write checkin (clean: false), navigate to `/slip`

**Confetti celebration**:
- Use `lottie-react-native` with a confetti Lottie file
- Play once on successful check-in, on milestone unlock

**Category goal cards** (6, in 2-col grid):
- Category color border-left accent
- Category icon + title + "N/M postignuto"
- Progress bar (ember fill, category color option)
- Tapping → `/progress/category/[key]`

**State variants**:
- Day 0: streak = 1, all stat cards show 0, goal cards 50% opacity, countdown from quit date (may be future)
- Slip: render `HomeScreenSlip` layout — snowflake ❄ icon in streak badge (muted purple), "NOV POČETAK" label on countdown (counting up from slip), X mark on slip day in weekly tracker

---

### C. Home Detail Screens

#### home/time.tsx
- Top bar: back arrow + "Tvoje vreme" + share icon
- Ember hero card: "SLOBODAN/NA VEĆ" eyebrow, 2×2 translucent-white time grid (Dan/Sati/Minuta/Sekunde, live ticking), divider, italic "od poslednje cigarete"
- Milestone road: vertical timeline
  - Past achieved: white card, green dot, day number, title, green icon, achieved date
  - Current ("TI SI OVDE"): ember-tint card, "TI SI OVDE" badge, day + description + "Samo još N dana do sledećeg."
  - Upcoming: 50% opacity cards, future day + title
- "Prethodni pad" card (rose calendar icon, date of last slip if any)
- "Vreme koje si povratio/la": N sati / N dana (amber accent)
- Outlined amber "Podeli svoju pobedu" button → share sheet

#### home/money.tsx
- Top bar: back + "Uštedine" + share
- Hero: gold coin icon, big green number `{moneySavedRSD.toLocaleString()} RSD`, "u N dana slobode"
- SVG area chart: green line + light-green fill, x-axis Dan 1 to today, y-axis RSD
- "To je kao..." equivalents card (compute 3 equivalents: ćevapi/vikend/Netflix based on amount)
- "Ako nastaviš" projections: dnevno / nedeljno / mesečno / godišnje
- Crosslink card: red cig-off icon, cigarettes count, chevron → `/home/cigarettes`
- Outlined ember "Podeli" button

#### home/cigarettes.tsx
- Top bar: back + "Odbijene cigarete" + share
- Hero: cig-off icon, big blue number (cigarettes count), "cigareta odbijeno", "u N dana slobode"
- Bar chart: 7 bars (last 7 days avoided per day), blue bars
- "Šta nisi uneo/la u sebe":
  - N grama katrana (lung icon, blue)
  - N mg nikotina (molecule icon, purple)
  - N sati zagađenja (clock icon, green)
- Pack count: "= N kutija / N dana pušenja"
- "Ako nastaviš" projections
- Crosslink card → `/home/money`
- Outlined blue "Podeli" button

#### home/quote.tsx
- Top bar: back + "Quote dana #N" + heart (favorite) icon
- Centered "Humor" category pill (or whichever category the quote is)
- Large faded ember quote mark (128px, 5% opacity)
- 26px quote text, centered
- Divider
- Author avatar (rounded square, initials or photo) + author name + description
- Pagination dots (5, first active) + "Prevuci za sledeći quote" hint
- Iskra fun-fact card at bottom (ember flame icon + fact text)
- Full-width ember "Podeli quote" button

---

### D. Milestoni Tab

File: `app/(tabs)/milestoni.tsx`

- `PhotoHeroCard` at top: sky-bg.webp, title "Milestoni", subtitle "Svaka pobeda se računa."
- 2-column achievement grid below:
  - Unlocked cards: category color bg, day/title, unlocked date, white "PODELI" share row at bottom
  - Locked cards: white bg, 50% opacity, category annotation pill, "još N dana" countdown
- Locked cards use lock icon overlay
- On PODELI tap: `Share.share()` with milestone text + deep link

---

### E. Goals Roadmap

File: `app/progress/roadmap.tsx`

- Top bar: back + "Moj napredak" (centered)
- Progress overview card: "Ukupno postignuto" header, 6 category pills each with "N/M", ember progress bar "21 od 50 ukupnih ciljeva"
- "Postignuto" section: 3 most recent achieved rows (colored dot + title + date) + "Vidi sve →"
- "Predstojeće" section: vertical timeline with connecting line
  - Highlighted current card: category-tinted bg + left border + "SLEDEĆE" badge + progress bar + "Za N dana"
  - Upcoming rows: category badge pill + title + "Za N dana"
- Italic motivational footer

---

### F. Category Detail

File: `app/progress/category/[key].tsx`

- Key = `zdravlje` | `pluca` | `ekologija` | `finansije` | `telo` | `nikotin`
- Config map with title, color, icon, and milestone list for each category
- Top bar: back + category-color countdown pill "Za HH:MM:SS do sledećeg" + "N/M postignuto"
- Title + category icon row: "Zdravlje" 32px + heart icon
- Vertical milestone timeline:
  - Achieved: filled category-color dot + title + date (green check icon)
  - Current: ring dot + title + category-color progress bar + %
  - Upcoming: empty gray dot + muted title + "Za N dana"
  - All connected by a vertical line
- WHO/CDC disclaimer info card at bottom (gray, small text)

---

### G. Craving (Poriv) Flow

#### poriv/entry.tsx
- Warm bg `#F0EDE8`
- X close button (→ back to home)
- Title: "Koliko jak je poriv?"
- Custom slider 1–10:
  - Ember fill left of thumb, gray track right
  - Large ember number above thumb that follows it
  - Labels below: "Blag" (1) / "Jak" (5) / "Nepodnošljiv" (10)
- "Šta te navelo?" label
- Single-select trigger pills: Jutarnja kafa / Stres / Posle jela / Kafana / Dosada / Nešto drugo
- Ember pill selected state
- "Pokreni" ember button — disabled until slider has been moved AND trigger selected
- Small text below: "Porivi traju 3 do 5 minuta. Prođe uvek."
- On "Pokreni": write craving record to Supabase, navigate to `/poriv/mode`

#### poriv/mode.tsx `[DARK]`
- Full dark bg `#1A1410`, `<StatusBar style="light" />`
- Top bar: X close, "PORIV MODE" ember eyebrow (centered), "Nivo N" ember pill (right)
- `CountdownRing`: 200px SVG circle, ember arc depletes over 5 minutes via `Animated.timing`
  - Inside: "4:23" (large white) + "minuta" (small muted)
- Below ring: pulsing ember dot + "Udahni..." italic text (gentle fade loop animation)
- "IZABERI ALAT" label (12px uppercase, muted white)
- 2×3 tool grid:
  - Dišem — teal `#2E8B80`
  - Igram se — purple `#6B52A8`
  - Moji razlozi — ember `#E8621A`
  - Pijem vodu — blue `#4A6EB0`
  - Šetam — forest green `#2D6A4F`
  - Posmatram — dark warm `#3D3830`
  - Each: colored rounded square (60px), icon + label below
- Bottom: 2px ember progress bar + "Porivi traju 3 do 5 minuta." (left) + "Ipak sam zapalio/la" (right, underlined, → slip flow)
- CountdownRing continues ticking even after navigating to tool (pass remaining time as param)

#### poriv/disem.tsx `[DARK]` charcoal
- Bg: `#1C1C1E` (near-black charcoal)
- 4-4-4 breathing animation:
  - Large circle, border grows/shrinks with Animated.timing
  - 3 phases: Udahni (4s, expand) / Zadrži (4s, hold) / Izdahni (4s, contract)
  - Phase label inside circle, count-up number
  - 4 rounds total, then → success screen
- Phase color: teal `#2E8B80`
- "Završio/la sam" text link bottom (skip to success)

#### poriv/voda.tsx
- Bg: light blue `#EBF4FB`
- Water rises from bottom to top over 45s via animated clip path / Animated.timing on height
- Text in center: "Pij vodu polako." — flips to white as water submerges it
  - Implement via two overlapping Text components with clipPath mask
- Blue accent `#4A6EB0`
- "Završio/la sam" text link

#### poriv/razlozi.tsx
- Bg: warm white `#FEF6F0`
- User's personal reason text in a quote card:
  - Large faded ember quote mark
  - Their `reason_text` from profile
  - Their signature (display base64 canvas as Image)
- Below: "DAN N" fact card (ember, white text, a fact about their quit day)
- "Završio/la sam" text link

#### poriv/setam.tsx `[DARK]` forest green
- Bg: `#1B3A2B`
- Dashed walking trail (path of dots) across screen, dots pulse along it in sequence via Animated.loop
- Step counter pill at top (simulated, increments every ~1s)
- "Šetaj malo. Pomeranje pomaže." instruction text
- "Završio/la sam" text link

#### poriv/posmatram.tsx `[DARK]` indigo
- Bg: `#1E1B3A`
- ACT urge-surfing: slow drifting sine wave at center, mirrored reflection below (flipped vertically, reduced opacity)
- Text above: "Posmatraj poriv kao talas. / Neka dođe i prođe."
- Indigo/purple accent `#6B52A8`
- Gentle animation: wave drifts horizontally via `Animated.loop`
- "Završio/la sam" text link

#### poriv/igram.tsx `[DARK]` purple
- Bg: `#1A1225`
- Bubble pop game:
  - 8–12 glassy bubbles floating at random velocities (Animated.timing per bubble)
  - Tapping a bubble: pop animation (scale + opacity out) + rising smoke particles above
  - One bubble (the "Iskra bubble") has a subtle ember glow — on pop, more dramatic smoke
  - New bubbles appear after pop to keep count roughly constant
- Score counter top right (bubbles popped)
- "Završio/la sam" text link

#### poriv/success.tsx `[DARK]` ember
- Full ember gradient bg
- "Izdržao/la si." (white, 36px semibold, centered) — gender-aware
- Micro-stat: "odoleo/la si već N puta" (white, muted)
- Brain fact card: white card, brain icon (ember), 2–3 sentence neuroscience fact about craving resistance
- Next-milestone card: white card, "Sledeći cilj" label, milestone title + days remaining
- White "Nazad na početnu" button → home
- Update craving record: set `outcome: 'survived'`, `tool_used`, `duration_seconds`

All poriv tool screens: on mount, start a timer. On "Završio/la sam" → `/poriv/success` with elapsed seconds.

---

### H. Slip / Relapse Flow

#### slip/index.tsx
- Warm white bg
- Ember "Ne osuđujemo." eyebrow pill at top
- Title: "Jedan dan ne definiše put." (28px semibold)
- Large white card with amber accent:
  - "UKUPNO VREME" label
  - Total smoke-free time (never resets): "47 dana, 6 sati"
  - Bold: "I dalje brojiš. Ne resetuje se."
  - Smaller: "Sve što si uradio/la ostaje tvoje zauvek."
- "Nastavljam" ember button
- Bordered "Šta me je nateralo?" button → `/slip/reflect`
- Update today's checkin to `clean: false`; write slip record

#### slip/reflect.tsx
- Title: "Šta te je nateralo?"
- Single-select trigger list (full-width rows, inverted-selected):
  - Jutarnja kafa / Stres / Posle jela / Kafana / Dosada / Nešto drugo / Emocije / Alkohol
- Fixed ember info card pinned above bottom: "Znanje o okidačima pomaže." + fact
- "Razumem" ember button → `/slip/recap`
- Save trigger to slip record

#### slip/recap.tsx
- Center-aligned layout
- Title: "N dana su tvoja zauvek." (N = total clean days, not streak)
- Health card: what physically improved during those N days (computed from milestones achieved)
- Personal reason card: faded ember quote mark (128px, low opacity), user's `reason_text`, their signature image
- "Dan 1 počinje upravo sad." (muted, centered)
- Ember "Nastavljam dalje" button → `/slip/progress-sheet`

#### slip/progress-sheet.tsx
- Renders as a bottom sheet (50% screen height, rounded top, backdrop)
- "Ažurirali smo tvoj napredak." title
- Two stat rows:
  - Streak: "Dan 1" (reset) with note "Streak se resetuje"
  - Ukupno vreme: unchanged with note "Ovo nikad ne resetuje"
- Ember support card: "Jedno posrtanje nije pad. Pad bi bio odustati." + ember flame icon
- "Razumem" ember button → home
- After dismiss: home should re-render in slip state

---

### I. Knowledge Base (Saznaj Tab)

File: `app/(tabs)/saznaj.tsx`

Content is static for now (hardcode 10–15 articles). Wire for CMS later.

- `PhotoHeroCard`: canyon-bg.png, title "Saznaj", subtitle "Sve što treba da znaš o prestanku."
- "PREPORUČENO" ember category pill
- Featured article card: large, ember pill, "6 min čitanja", title, tap → article detail screen
- "Kategorije" section: 2-col colored icon grid:
  - Razumeti zavisnost — purple `#6B52A8`
  - Nositi se sa porivima — ember `#E8621A`
  - Kafana i društvo — slate `#4A6080`
  - Ishrana i gojenje — green `#3A7A3A`
  - Stres bez cigarete — blue `#4A6EB0`
  - Priče iz prve ruke — rose `#D4547E`
  - Naučni fakti — teal `#2E8B80` (full-width)
- "Popularno" horizontal scroll: article cards (category tag + title + min čitanja + lock icon if premium)
- "Novo" vertical list: same card style
- Lock icon on premium articles → paywall

---

### J. Settings (Profil Tab)

File: `app/(tabs)/profil.tsx`

- Profile card: initial avatar circle (ember bg, white initial), name, "Slobodan/na N dana", "Član od [date]"
- Grouped setting sections:
  - **Moj profil**: Ime / Datum prestanka / Broj cigareta / Cena pakle (each → edit screen)
  - **Podešavanja**: Notifikacije (toggle, controls push) / Jezik (Serbian, toggle RSD/EUR)
  - **Premium**: "Tvoj plan: Besplatan" → paywall
  - **O Iskri**: Verzija / Uslovi / Privatnost / Kontakt
  - **Moje iskustvo**: "Oceni Iskru" / "Podeli Iskru"
- Danger zone (gray card):
  - "Počni iznova" (gray, destructive — resets streak, keeps total time) — confirm dialog
  - "Odjava" (red) — `supabase.auth.signOut()` → splash

---

## Push Notifications

### Scheduled Cadence

Three notification types — implemented as a Supabase Edge Function triggered by a cron job:

| Type | Time | Copy examples |
|---|---|---|
| Morning check-in | 8:00 AM daily | "Dobro jutro, Pavle. Kako si danas?" / "Dan N. Čekamo tvoj check-in." |
| Evening encouragement | 21:00 daily | "Još jedan dan za tobom. Ponos." / "N cigareta manje. Dan N gotov." |
| Milestone unlock | Immediate | "🏆 Dostigao/la si Dan 7! Otvori Iskru." / "💰 Uštedeo/la si 10.000 RSD!" |

All copy is Serbian, gender-aware (pull gender from profile to personalize).

### Implementation

```ts
// supabase/functions/send-notification/index.ts
// Input: { user_id, type, title, body }
// Fetch push_token from profiles
// Call Expo Push API: https://exp.host/--/api/v2/push/send
// Log result

// supabase/functions/schedule-notifications/index.ts
// Runs on cron: 0 8 * * * (8am) and 0 21 * * * (9pm)
// SELECT id, name, gender, push_token, daysSmokeFreeContinuous FROM profiles
// For each user with valid push_token: call send-notification

// Milestone notifications: triggered from the app when a milestone is first unlocked
// Call send-notification edge function from the app via supabase.functions.invoke()
```

```ts
// src/lib/notifications.ts
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
// Save token to profiles.push_token via Supabase upsert
```

Notification handler config in `app/_layout.tsx`:
```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

---

## Home Screen Widget

### iOS Widget (WidgetKit)

Location: `widgets/ios/IskraWidget/`

Creates a Swift WidgetKit extension. Three widget sizes: small, medium.

**Small widget**: Ember gradient bg + ISKRA wordmark + streak count ("Dan 93") + "bez cigarete"

**Medium widget**: Same + time smoke-free (HH:MM:SS, ticking) + "Imam poriv" deep-link button

Data bridge via App Groups:
```ts
// In React Native (expo-modules or @bacons/apple-targets):
// Write to shared UserDefaults group: "group.com.iskraclub.app"
// Keys: streak_days, hours_clean, minutes_clean, seconds_clean, last_updated
// Widget reads from UserDefaults and refreshes every 15 minutes (WidgetKit minimum)
```

Widget timeline entry refreshes on:
- App foreground (write fresh data to UserDefaults)
- Every 15 min via `TimelineReloadPolicy.atEnd`

Use `@bacons/apple-targets` or `expo-apple-targets` to manage the extension in the Expo build.

**Deep link**: Tapping "Imam poriv" opens app at `/poriv/entry` via URL scheme `iskra://poriv`

### Android Widget (Glance)

Location: `widgets/android/`

Kotlin Glance widget. Same data via `DataStore` shared preference.

**Small**: Ember bg + streak + "bez cigarete"
**Medium**: Streak + time + "Imam poriv" button (launches activity → Poriv entry)

Update frequency: `WorkManager` periodic task every 15 minutes to refresh widget data.

Use `expo-modules-core` with a custom native module to write shared data from RN layer, or use `react-native-shared-preferences` bridge.

---

## Shareable Achievements

Each milestone unlock generates a shareable 9:16 card.

```ts
// src/components/ShareCard.tsx
// Renders offscreen via react-native-view-shot
// Card: 1080×1920 (scale 2.5× from 432×768)
// Design: ember gradient bg + canyon texture (soft-light, opacity 0.12)
// ISKRA wordmark top
// Big milestone: "DAN 93" (96px extrabold white)
// Subtitle: milestone unlock text ("Pluća se potpuno oporavila.")
// Bottom: "iskraclub.com" + flame logo

// Share flow:
// 1. ViewShot.captureRef() → base64 PNG
// 2. saveToLibrary (expo-media-library) optional
// 3. Share.share({ url: tmpFilePath }) → system share sheet
```

Each milestone card in `MilestoniScreen` and `home/time.tsx` has a PODELI button that triggers this.

---

## PostHog Analytics

```ts
// src/lib/posthog.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN!,
  { host: 'https://us.i.posthog.com' }
);
```

Key events to capture:

| Event | When | Properties |
|---|---|---|
| `onboarding_started` | Splash CTA | — |
| `onboarding_step_completed` | Each step | `step_name` |
| `onboarding_completed` | After notifications | `gender`, `product`, `quit_date` |
| `paywall_seen` | Paywall mount | — |
| `paywall_converted` | Purchase success | `plan`, `price_rsd` |
| `daily_checkin` | Check-in overlay submit | `clean` (bool) |
| `craving_started` | Poriv entry submit | `strength`, `trigger` |
| `craving_tool_used` | Tool selected | `tool` |
| `craving_survived` | Poriv success | `tool`, `duration_seconds` |
| `slip_logged` | Slip screen | `trigger` |
| `milestone_unlocked` | Milestone check | `milestone_key`, `category` |
| `milestone_shared` | PODELI tapped | `milestone_key` |
| `knowledge_article_opened` | Article tap | `category`, `title`, `is_premium` |

---

## Environment Variables

```env
# .env.local (and Expo EAS Secrets for production)
EXPO_PUBLIC_SUPABASE_URL=https://aaknvhlirztdglxsnbhu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_vrjAHNqp9U3iA3uCH6RK8vbcc8hFiqsyxnzKuWRH2B3j
```

---

## Key npm Packages

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-font": "~12.0.0",
    "@expo-google-fonts/manrope": "latest",
    "expo-image": "~1.12.0",
    "expo-blur": "~13.0.0",
    "expo-linear-gradient": "~13.0.0",
    "expo-notifications": "~0.28.0",
    "expo-store-review": "~7.0.0",
    "expo-media-library": "~16.0.0",
    "react-native-view-shot": "^3.8.0",
    "react-native-svg": "15.2.0",
    "react-native-gesture-handler": "~2.16.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-safe-area-context": "4.10.0",
    "react-native-screens": "~3.31.0",
    "@supabase/supabase-js": "^2.43.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "posthog-react-native": "^3.3.0",
    "zustand": "^4.5.0",
    "react-native-canvas": "^0.1.38",
    "lottie-react-native": "^6.7.0",
    "react-native-purchases": "^7.27.0",
    "date-fns": "^3.6.0"
  }
}
```

---

## Build Order

Build in this sequence — each phase is independently testable:

### Phase 1 — Foundation (do this first, everything depends on it)
1. Expo project init with TypeScript + Expo Router
2. Port `tokens.ts` with all design values
3. Load Manrope font (all weights)
4. Build shared UI component library: `Text`, `Button`, `Card`, `OptionCard`, `SelectionPill`, `EmberGradient`, `PhotoHeroCard`, `ProgressBar`
5. Build all custom SVG icons (reference the icon components in the design export's `screens/*.jsx`)
6. Supabase client + auth (magic link flow)
7. Database migrations

### Phase 2 — Onboarding
Build all 21 onboarding screens + `OnboardingLayout` + `DarkLayout` + `SignaturePad`. Test the full flow end-to-end. Write profile to Supabase on completion.

### Phase 3 — Core Home Loop
1. `useQuitStats` hook (live ticking, all computed values)
2. `useMilestones` hook
3. Home screen (V3-1) — full build including weekly tracker, stat cards, goal cards
4. Daily check-in overlay + confetti
5. Bottom tab navigator (Početna / Milestoni / Saznaj / Profil)
6. Push notifications setup (permissions + token save)

### Phase 4 — Home Detail Screens
Time / Money / Cigarettes / Quote detail screens.

### Phase 5 — Craving Flow
Poriv Entry → Mode → all 6 tools → Success. Each tool is its own animation challenge — build them in order listed.

### Phase 6 — Slip Flow
All 4 screens. Wire to home state variants (Day 0 state, Slip state home).

### Phase 7 — Secondary Tabs
Milestoni / Goals Roadmap / Category Detail (×6) / Knowledge Base / Settings.

### Phase 8 — Paywall + RevenueCat
Wire RevenueCat, build paywall screen, gate premium content in Knowledge Base.

### Phase 9 — Notifications
Supabase Edge Functions (send-notification + schedule-notifications). Wire milestone push. Test scheduled cadence.

### Phase 10 — Widget
iOS WidgetKit extension + Android Glance widget. Data bridge from app. Deep link wiring.

### Phase 11 — Shareable Achievements
`ShareCard` component + `ViewShot` capture + system share sheet. Wire to all PODELI buttons.

### Phase 12 — Polish
Animations (entrance transitions, loading states), PostHog events, error states, empty states, offline handling.

---

## Design Fidelity Rules

These are non-negotiable — match the design exactly:

1. **Manrope throughout.** Never use system font.
2. **Ember `#E8621A` is Iskra's exclusive color.** Never use it for anything that isn't an Iskra action/state.
3. **Selected/active = inverted.** Ember fill + white text + white icon chip with ember icon. This pattern repeats on every multi-select in the app. Implement once in `OptionCard` / `SelectionPill`, reuse everywhere.
4. **Photo-as-texture.** The weekly tracker and featured cards use a photo image with `blendMode: 'soft-light'` over an ember or colored surface. This is a signature visual move — do not omit it.
5. **No emoji in UI.** Custom SVG icons only.
6. **Serbian copy.** All copy is in Serbian (Latin script), informal "ti", gender-aware forms ("/na" suffixes where appropriate). Never hardcode gender-specific Serbian grammar without checking `profile.gender`.
7. **Soft shadows everywhere.** Cards always have the `shadows.card` shadow. Ember buttons always have `shadows.ember`. Never flat.
8. **18–20px card radius.** Cards use `radii.card` (18) or `radii.cardLg` (20). The photo hero cards use `radii.cardHero` (26).
9. **56px ember buttons.** All primary CTA buttons are 56px height, 16px border radius, ember gradient, bold 700 white text, with ember shadow.

---

## Cross-Reference

All screens have a pixel-accurate reference in the design export:
- `iskra-claude-design-export/project/screens/<Name>.jsx` — component source
- `iskra-claude-design-export/project/Iskra <Name>.html` — launches screen in iPhone 15 Pro frame
- `iskra-claude-design-export/project/handoff_screenshots/` — rendered PNG targets
- `iskra-claude-design-export/project/colors_and_type.css` — authoritative token values

Open any `.html` launcher file in a browser to see the screen as intended before implementing it. The prototype (`Iskra Prototype.html`) shows the complete wired flow.

The design export is already inside this repo. Read every screen's JSX source before building that screen — the copy, icon names, layout details, and animation timing are all there.
