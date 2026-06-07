@AGENTS.md

# Iskra Mobile — Claude Build Log

This file is the authoritative log of everything built, every decision made, and the current state of the project.
**Update this file every session before stopping work.**

---

## Project Identity

- **App:** Iskra — premium Serbian quit-smoking app (iOS + Android)
- **Expo SDK:** 56 (installed; brief says 51 but 56 is what ships — compatible)
- **Expo Router:** v3 (file-based routing)
- **TypeScript:** strict mode
- **Supabase project:** `aaknvhlirztdglxsnbhu`
- **PostHog project:** 457365
- **Design export:** `../iskra-claude-design-export/project/` (parent repo)
- **Before building any screen:** read `../iskra-claude-design-export/project/screens/<Name>.jsx`

---

## Build Phases Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation | ✅ COMPLETE |
| 2 | Onboarding (21 screens) | ✅ COMPLETE |
| 3 | Core Home Loop | ✅ COMPLETE |
| 4 | Home Detail Screens | ✅ COMPLETE |
| 5 | Craving (Poriv) Flow | ✅ COMPLETE |
| 6 | Slip Flow | ✅ COMPLETE |
| 7 | Secondary Tabs | ✅ COMPLETE |
| 8 | Paywall + RevenueCat | ✅ COMPLETE |
| 9 | Notifications Edge Functions | ✅ COMPLETE |
| 10 | iOS + Android Widgets | ⏳ TODO |
| 11 | Shareable Achievements | ⏳ TODO |
| 12 | Polish + Analytics | ⏳ TODO |

---

## Phase 1 — Foundation (COMPLETE ✅)

### What was built

**Project bootstrap**
- `npx create-expo-app@latest iskra-mobile --template blank-typescript`
- All npm packages installed (see package.json)
- `main` set to `expo-router/entry` in package.json
- `app.json` configured: name "Iskra", scheme "iskra", bundle ID `com.iskraclub.app`, typedRoutes enabled
- `tsconfig.json` — strict TypeScript (from template)

**Directory structure created:**
```
app/onboarding/        app/(tabs)/           app/home/
app/poriv/             app/slip/             app/progress/category/
src/theme/             src/components/ui/    src/components/icons/
src/components/nav/    src/components/home/  src/components/onboarding/
src/components/poriv/  src/components/charts/
src/hooks/             src/lib/              src/stores/    src/types/
assets/images/         assets/fonts/         assets/lottie/
supabase/migrations/   supabase/functions/send-notification/
supabase/functions/schedule-notifications/
widgets/ios/           widgets/android/
```

**Brand assets copied** from design export to `assets/images/`:
- canyon-bg.png, highland-bg.png, sky-bg.webp, share-sky.webp
- sand-bg.jpeg, iskra-logo.png, iskra-flame-ember.png, iskra-flame-white.png

**Design tokens** — `src/theme/tokens.ts`
- All colors (ember brand, surfaces, text, 6 category colors, reason pills, tool backgrounds, dark surfaces)
- Gradients (ember vertical)
- Typography (Manrope, 6 weights, 10 size steps)
- Radii (input=12, chip=14, btn=16, card=18, cardLg=20, cardHero=26, pill=999)
- Shadows (sm, card, cardMd, ember, photo)
- Spacing (xs–4xl + screenH/screenV)
- categoryConfig map (zdravlje/pluca/ekologija/finansije/telo/nikotin)

**Fonts** — `app/_layout.tsx`
- `useFonts` loads all 6 Manrope weights (300–800)
- `SplashScreen.preventAutoHideAsync()` / `hideAsync()` on fonts loaded
- `Notifications.setNotificationHandler` configured
- `GestureHandlerRootView` at root
- Stack navigator with all top-level segments

**UI Component Library** — `src/components/ui/`
- `Text.tsx` — Manrope wrapper (weight + size + color + italic props)
- `Button.tsx` — EmberButton (56px, gradient, ember shadow), WhiteButton (dark screens), OutlinedButton, TextButton
- `Card.tsx` — white card with configurable shadow (sm/md/lg/none) and radius
- `OptionCard.tsx` — full-width stacked card with **inverted selected state** (ember gradient + white chip with ember icon)
- `SelectionPill.tsx` — 2-col grid pill with same inverted selected pattern
- `ProgressBar.tsx` — ember fill, configurable track/color/height
- `CategoryPill.tsx` — uppercase 11px eyebrow, ember tint bg
- `StatCard.tsx` — category chip circle + big number + label, tappable
- `EmberGradient.tsx` — LinearGradient wrapper (horizontal or vertical)
- `PhotoHeroCard.tsx` — 26px radius hero card with photo bg + legibility scrim + text bottom-left

**Custom SVG Icons** — `src/components/icons/index.tsx` (25 icons)
- IcoFlame, IcoSpark, IcoMoney, IcoCigarette, IcoHeart, IcoTime, IcoLeaf
- IcoHome, IcoFlag, IcoBook, IcoUser
- IcoArrowLeft, IcoX, IcoCheck, IcoChevronRight, IcoShare, IcoBell, IcoLock, IcoTrophy
- IcoPeople, IcoBird, IcoRunner, IcoCalendar
- IcoWater, IcoBrain, IcoWave, IcoSnowflake, IcoStar, IcoPlane, IcoRocket
- IcoSettings, IcoLogOut, IcoMoon, IcoInfo

**Navigation components** — `src/components/nav/`
- `BottomNav.tsx` — 4 tabs (Početna/Milestoni/Saznaj/Profil), ember active state, safe area aware
- `TopBar.tsx` — back arrow + centered title + optional right element, dark mode support

**Supabase client** — `src/lib/supabase.ts`
- `createClient` with AsyncStorage, autoRefreshToken, persistSession

**PostHog client** — `src/lib/posthog.ts`
- All 13 analytics events from brief pre-wired as `track.*` helpers

**Push notifications helper** — `src/lib/notifications.ts`
- `registerForPushNotifications()` — requests permission, returns Expo push token
- `savePushToken()` — upserts token to profiles table

**TypeScript types** — `src/types/index.ts`
- Gender, Product, Timing, CravingTool, CravingOutcome
- Profile, Checkin, Craving, Slip, MilestoneRecord, MilestoneDef, QuitStats interfaces

**Supabase migration** — `supabase/migrations/001_initial_schema.sql`
- Tables: profiles, checkins, cravings, slips, milestones
- RLS policies: all tables, "own row" using auth.uid()
- updated_at trigger on profiles

**Supabase Edge Functions**
- `supabase/functions/send-notification/index.ts` — fetches push_token, calls Expo Push API
- `supabase/functions/schedule-notifications/index.ts` — cron sender (8am/9pm), gender-aware copy, computes streak

**Zustand onboarding store** — `src/stores/onboarding.ts`
- All profile fields with typed setters
- `getAnnualCostRSD()` computed helper
- Persisted via AsyncStorage

**Hooks**
- `src/hooks/useQuitStats.ts` — live 1-second ticker, computes streak/total/cigarettes/money/timeDisplay
- `src/hooks/useMilestones.ts` — MILESTONES array (15 milestones: days, RSD, craving), auto-unlock logic, PostHog track
- `src/hooks/useUserData.ts` — loads profile + checkins + milestones from Supabase

**Auth gate** — `app/index.tsx`
- Checks `supabase.auth.getSession()`
- If no session → `/onboarding/splash`
- If session + `onboarding_completed` → `/(tabs)`
- Else → `/onboarding/splash`

**Routing stubs**
- `app/onboarding/_layout.tsx` — Stack, no header, slide_from_right animation
- `app/(tabs)/_layout.tsx` — Tabs with hidden default tab bar (using custom BottomNav)
- `app/(tabs)/index.tsx` — stub "coming Phase 3"
- `app/(tabs)/milestoni.tsx` — stub
- `app/(tabs)/saznaj.tsx` — stub
- `app/(tabs)/profil.tsx` — stub
- `app/onboarding/splash.tsx` — **FULL BUILD** (matches SplashScreen.jsx exactly)

**Environment** — `.env.local`
- EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN
- SUPABASE_SERVICE_ROLE_KEY (for edge functions only, never exposed to client)

---

## Phase 2 — Onboarding (COMPLETE ✅)

### What was built

**Layout wrappers**
- `src/components/onboarding/OnboardingLayout.tsx` — white bg, ember progress bar, ISKRA wordmark, solid back button, safe area
- `src/components/onboarding/DarkLayout.tsx` — full-screen ember LinearGradient, white progress bar track, glass back button (rgba(255,255,255,0.16)), optional `scrollable` + `noProgress` props

**All 21 onboarding screens** (full production builds):

| Screen | Step | Type | Key features |
|--------|------|------|------|
| `splash.tsx` | — | Light | Wordmark, tagline, Počni + "Već imam nalog", no progress |
| `name.tsx` | 2/18 | Light | TextInput, ember focus border, disabled until ≥1 char |
| `gender.tsx` | 3/18 | Light | 2 tall GenderCards (ember scrim + white label pill), "Preferiram da ne kažem" link |
| `product.tsx` | 4/18 | Light | 2 OptionCards (Cigarete/IQOS), inverted selected state |
| `cigarettes.tsx` | 5/18 | Light | Stepper (−/+) + cigarettes-per-pack TextInput |
| `price.tsx` | 5/18 | Light | Numeric input + RSD/EUR toggle (ember gradient active) |
| `cost-aha.tsx` | 6/18 | **DARK** | Computed annual cost, white card, equivalence line |
| `reasons.tsx` | 7/18 | Light | 2-col SelectionPill grid, max 3 selectable |
| `reason-text.tsx` | 8/18 | Light | Multiline TextInput (120 chars), example chips, privacy note |
| `reflection.tsx` | 9/18 | **DARK** | 3 white reassurance cards (Zdravlje/Porodica/Sloboda) |
| `fears.tsx` | 10/18 | Light | 2-col SelectionPill grid, no max |
| `fear-reflection.tsx` | 11/18 | **DARK** | 3 fear-address cards, gender-aware button (Spreman/Spremna) |
| `triggers.tsx` | 12/18 | Light | 6 pills + 1 full-width pill (Čekanje i dosada) |
| `timing.tsx` | 13/18 | Light | 3 TimingCards, auto-advance after 280ms |
| `date.tsx` | 14/18 | Light | Full interactive calendar, Monday-first, past dates disabled |
| `preview.tsx` | 15/18 | **DARK** | 3 benefit cards, annual cost from store, Marija testimonial |
| `panic.tsx` | 16/18 | Light | 160px circular ember button, 2-ring pulse animation |
| `commitment.tsx` | 17/18 | **DARK** | No progress; 4 pledges + react-native-signature-canvas; noProgress=true |
| `summary.tsx` | 17/18 | **DARK** | SVG bezier area chart, 2×2 stats grid, health milestones, reasons list |
| `notifications.tsx` | 17/18 | Light | Bell icon, 3 notif cards, push permission flow, save token to profiles |
| `review.tsx` | — | Silent | expo-store-review passthrough, routes to paywall |
| `paywall.tsx` | — | Light | Countdown timer, 3 pricing tiers, FAQ accordion, completeOnboarding() |

**Navigation flow:**
`splash → name → gender → product → cigarettes → price → cost-aha → reasons → reason-text → reflection → fears → fear-reflection → triggers → timing → (odmah: preview | uskoro/vec_prestao: date → preview) → panic → commitment → summary → notifications → review → paywall → /(tabs)`

**Onboarding completion (paywall.tsx):**
- `completeOnboarding(snap)` — upserts full profile to Supabase `profiles`, sets `onboarding_completed: true`, calls `track.onboardingCompleted()`
- Both `handleBuy()` and `handleFree()` call completion then `router.replace('/(tabs)')`

**Store fix:**
- `setSignatureData` now typed as `(data: string | undefined) => void`; implementation uses `data ?? null`

**TypeScript fixes applied (2026-06-07):**
- `gender.tsx`: Gender values corrected to `'muško'/'žensko'/'drugo'` (was `'male'/'female'/'na'`)
- `fear-reflection.tsx`: Gender comparison corrected to `=== 'žensko'` (was `=== 'female'`)
- `timing.tsx`: Timing value corrected to `'vec_prestao'` (was `'vec'`)
- `commitment.tsx`: Removed invalid `strokeWidth` prop from `SignatureScreen`
- `paywall.tsx`: Fixed `store` typing (now uses per-field selectors + `StoreSnap` interface), fixed `track.paywallConverted(sel, 0)` args, fixed `track.onboardingCompleted({gender, product, quit_date})` args, replaced `fontVariantNumeric` with `fontVariant: ['tabular-nums']`
- **Result: 0 TypeScript errors**

---

## Key Decisions & Architecture Notes

1. **Expo Router tabs with hidden default tab bar** — Custom `BottomNav` component handles all tab navigation, giving full design control. Tabs still registered in `(tabs)/_layout.tsx` for routing.

2. **Font loading in `_layout.tsx`** — `useFonts` from `@expo-google-fonts/manrope`, all 6 weights. SplashScreen held until loaded.

3. **Inverted selected state** implemented once in `OptionCard` + `SelectionPill` via `LinearGradient` — reused everywhere.

4. **useQuitStats** recomputes every second via `setInterval`. Dependency on `profile.quit_date` and `checkins.length` for re-sync.

5. **useMilestones** runs on every stats update but only writes to DB when a new milestone is found (keys checked against already-unlocked).

6. **Service role key** stored in `.env.local` — used ONLY by edge functions. Never import `SUPABASE_SERVICE_ROLE_KEY` in app code.

---

## NPM Packages Installed

```
expo ~56, expo-router, expo-font, expo-image, expo-blur, expo-linear-gradient,
expo-notifications, expo-store-review, expo-media-library, expo-secure-store,
expo-web-browser, @expo-google-fonts/manrope,
react-native-svg, react-native-gesture-handler, react-native-reanimated,
react-native-safe-area-context, react-native-screens,
@supabase/supabase-js, @react-native-async-storage/async-storage,
posthog-react-native, zustand, lottie-react-native, date-fns,
react-native-view-shot, react-native-signature-canvas, react-native-purchases
```

---

## Running the App

```bash
cd /Users/zenith/iskra-mobile-build/iskra-mobile
npx expo start
```

Scans → open Expo Go on device or press `i` for iOS simulator.

---

## Phase 3 — Core Home Loop (COMPLETE ✅)

### What was built

**Components**
- `src/components/home/WeeklyTracker.tsx` — ember LinearGradient card, canyon-bg.png texture, 7 day columns (done=white circle+check, today=pulsing ?, future=ghost circle, slip=muted X), taps → DailyCheckinOverlay
- `src/components/home/CountdownCard.tsx` — live ticking 2×2 grid (DANA/SATI/MINUTA/SEKUNDE), tabular-nums, SparkIcon header, taps → `/home/time`
- `src/components/home/DailyCheckinOverlay.tsx` — Modal + BlurView (intensity 20), spring entrance animation, gender-aware labels (Čist/Čista sam danas), flame icon + day badge, ember CTA + outlined slip button

**Home screen** — `app/(tabs)/index.tsx` — full HomeScreenV3-1 production build:
- Greeting row: ember-gradient avatar ring + name + `StreakBadge` (flame + day count)
- `WeeklyTracker` — wired to real `checkins` from Supabase
- `CountdownCard` — wired to live `useQuitStats` ticker
- 2× `StatCard` — RSD (green chip) + cigarettes (red chip), both tappable to detail screens
- Quote of the day card → `/home/quote`
- Dnevno znanje teal card (highland-bg.png texture) → Saznaj tab
- Moj napredak: next-goal card (Pluća) + 3×2 category goal grid (6 categories with GoalBar) → category/roadmap screens
- Total time tracker (never resets)
- "Zapalio/la sam" muted slip button → `/slip`
- Fixed "Imam poriv" ember button with press-scale animation → `/poriv/entry`
- `BottomNav` wired with tab routing

**Hooks wired**
- `useQuitStats(profile, checkins)` — live 1s ticker, fully connected
- `useUserData(userId)` — loads profile + checkins + milestones from Supabase
- `useMilestones(userId, stats, unlockedKeys)` — auto-unlock logic

**Bug fixes**
- `notifications.ts`: fixed `NotificationPermissionsStatus` type access (cast to `{ status: string }`)
- `tsconfig.json`: added `"ignoreDeprecations": "6.0"` for moduleResolution deprecation
- All `StyleSheet.absoluteFillObject` → `StyleSheet.absoluteFill`
- **Result: 0 TypeScript errors**

---

## Phase 4 — Home Detail Screens (COMPLETE ✅)

### What was built

All 4 home detail screens, full production builds, 0 TypeScript errors:

- **`app/home/time.tsx`** — "Tvoje vreme": ember hero card (SLOBODAN/NA VEĆ eyebrow + 2×2 DANA/SATI/MINUTA/SEKUNDE cells with tabular-nums + divider + italic caption). Milestone road: unlocked past milestones (white card + day label + contextual text + category icon), dotted connectors, "TI SI OVDE" current card (ember border + orange badge pill + day label + contextual desc + days-to-next), upcoming milestones (50% opacity, no icon). Time-recovered card (dual-column amber, hoursRecovered sati / daysRecovered dana, "7 min × N cigareta" footnote). Amber outlined "Podeli svoju pobedu" share button. Dynamic — all values computed from live useQuitStats.

- **`app/home/money.tsx`** — "Uštedine": gold coin + 56px green RSD number hero. SVG bezier area chart (green fill + line, 7-point bezier path via cubic control points, circle at tip). Dynamic projections (nedeljno/mesečno/godišnje computed from daily rate). "To je kao..." equivalents (fork/bed/tv icons, amounts computed). Next-money-milestone progress bar (rounds up to nearest 5000 RSD). Cigarettes crosslink card → `/home/cigarettes`. Ember outlined share button.

- **`app/home/cigarettes.tsx`** — "Odbijene cigarete": red hero icon + 56px red count + "cigareta odbijeno" label. SVG bezier area chart (red fill + line). Health impact card: 3 rows (470g/katar via lungs icon, nicotine mg via molecule icon, hours-on-lighting via clock icon — all computed from real stats). 3-cell pack count card (cigarettes / kutija / days equivalent). Projections (nedeljno→za 5 godina). Money crosslink card → `/home/money`. Red outlined share button.

- **`app/home/quote.tsx`** — "Quote dana": back + centered title + heart favorite top bar. "Humor" ember pill. Faded 48px ember quote mark (opacity 0.3). 26px quote text. Divider + author avatar chip (ember bg, 2-letter initials, rounded-square). 5 pagination dots (tappable to switch quotes, active = ember 8px, inactive = gray 6px). "Prevuci za sledeći quote" hint. Iskra fun-fact card (flame icon + italic body text). Ember gradient "Podeli quote" button with spring press animation.

**TypeScript**: 0 errors after build

---

## Phase 5 — Craving (Poriv) Flow (COMPLETE ✅)

### What was built

All 9 poriv screens, full production builds, 0 TypeScript errors:

- **`app/poriv/entry.tsx`** — bg `#FDFCFA`. X close top-left. "Koliko jak je poriv?" label + floating ember strength number + custom PanResponder range slider (1–10, ember fill, white thumb with ember border). "Šta te navelo?" trigger list: 8 rows (kafa/budjenje/okolina/stres/jelo/alkohol/dosada/drugo), each with colored chip icon, ember gradient when selected. "Pokreni" disabled until BOTH slider moved AND trigger selected. Writes craving to Supabase `cravings` table on submit. Routes to `/poriv/mode`.
- **`app/poriv/mode.tsx`** — Split layout: ember top + white bottom. Top: X close (34px circle), "PORIV MODE" eyebrow centered, "Nivo N" pill. 200px SVG countdown ring (R=92, C≈578, white-25% track, white arc, strokeDashoffset depletes over 5min). 52px weight-300 timer. Pulsing breathing dot + "Udahni..." italic. Bottom: "IZABERI ALAT" eyebrow + 2×3 colored tool grid (88px: Dišem/Igram se/Moji razlozi/Pijem vodu/Šetam/Posmatram). 2px ember progress bar + "Ipak sam zapalio/la" slip link.
- **`app/poriv/disem.tsx`** — Warm charcoal bg. 4-4-4-4 box breathing: 4 phases × 4 seconds each × 4 rounds. Animated expanding/contracting glow rings (scale anim: 1→1.35 on inhale, →0.8 on exhale). Teal inner circle with phase name + countdown tick. 4 round-dot indicators. Routes to success on completion.
- **`app/poriv/voda.tsx`** — Blue bg `#EBF4FB`. Water rise animation: `Animated.timing` riseAnim → translates waterContainer top from full-height to 0 over 45s. Wave oscillation side-to-side. 45s countdown badge. Completes to success automatically.
- **`app/poriv/razlozi.tsx`** — Warm white `#FFFDF9`. Loads `profile.reason_text` and `profile.signature_data` from `useUserData`. Quote card with faded quote mark + 20px reason text. Signature as `<Image>` (base64 URI). Motivational fact card. Ember outlined "Završio/la sam" CTA.
- **`app/poriv/setam.tsx`** — Forest green bg `#1A3A20`. Pulsing sequential trail dots (7 dots, alternating margins, scale+opacity anim). Walker SVG icon circle (green glow). Step counter (simulated 1/sec). Elapsed timer. White "Završio/la sam" button.
- **`app/poriv/posmatram.tsx`** — Deep indigo bg `#1C1B35`. Slow wave translate animations (3 layered blobs). 5 urge-surfing statements, one every 8 seconds, with fade transition. Progress dots. "Preskočiti" until done, then "Završio/la sam".
- **`app/poriv/igram.tsx`** — Deep purple bg `#2D1F5E`. 10 glassy bubbles (varied sizes/colors/positions). Tap-to-pop with scale+fade animation. Score pill top right. 1 ember-glow "Iskra bubble" (3 points). 60s game timer. Done overlay with score + Nastavi button → success.
- **`app/poriv/success.tsx`** — Ember gradient bg. Two concentric glow rings (scale pulse anim) + 64px white filled flame SVG (scale pulse anim). Thin white accent line. "Izdržao/la si." 36px bold. Subtext. 3 white cards with ember shadow: (1) flame icon + "Danas si odoleo/la već N puta" (Supabase query); (2) brain chip (purple bg) + brain fact; (3) trophy chip (amber bg) + next milestone day + days remaining. White "Nazad na početnu" button.

**TypeScript**: 0 errors after build

---

## Phase 6 — Slip Flow (COMPLETE ✅)

### What was built

3 screens, full production builds, 0 TypeScript errors:

- **`app/slip/index.tsx`** — bg `#FEF6F0`. Centered flame illustration (ember icon + glow ring). "Jedan dan ne definiše put." 28px headline. Subtext. Divider. Total-time-never-resets card: amber eyebrow "N DANA IZA TEBE.", 20px time string, note "I dalje brojiš. Ne resetuje se." Two CTAs: "Nastavljam" (ember gradient) → recap; "Šta me je nateralo?" (outlined) → reflect. Writes slip record to Supabase `slips` + updates `checkins` status to 'slip' on either path.

- **`app/slip/reflect.tsx`** — bg `#FDFCFA`. X close top-left. "Šta te je nateralo?" + "Tapni — razumećemo zajedno." subtitle. 8 trigger rows (same icons/chips as poriv/entry, ember gradient when selected). Fixed bottom panel that fades in on selection: orange info card (trigger-specific contextual response text) + ember gradient "Razumem" CTA → recap. Saves selected trigger to most recent `slips` row.

- **`app/slip/recap.tsx`** — bg `#FEF6F0`. Scrollable. "TVOJE" eyebrow + "N dana su tvoja zauvek." 28px headline. Health card (lungs icon blue + dynamic health milestone text based on total days + "Jedna cigareta to ne menja."). Personal reason card (rose heart icon, italic `reason_text`, divider, "TVOJ POTPIS" label, base64 signature Image, faded 120px quote mark in corner). "Dan 1 počinje upravo sad." bridge line. Ember gradient "Nastavljam dalje" → `/(tabs)`.

**Key constraints met:**
- Total time card shows `useQuitStats.totalDaysClean` — never resets on slip
- Slip record written to Supabase before navigating
- Health milestone text is dynamic based on days clean

---

## Phase 7 — Secondary Tabs (COMPLETE ✅)

### What was built

- **`app/(tabs)/milestoni.tsx`** — PhotoHeroCard (sky-bg.webp), dynamic "N otključano · M čeka" subtitle. 2-col grid: UnlockedCard (LinearGradient per category, white icon, title, unlockText, PODELI → Share.share()), LockedCard (white, category pill, IcoLock, ghost title, ember remaining text). Data from useUserData + MILESTONES + useQuitStats.

- **`app/progress/roadmap.tsx`** — TopBar "Moj napredak" + back. Single chronological timeline through all MILESTONES: achieved (filled dot, muted text + date via date-fns sr locale), current (ember-bordered dot + white highlight card with SLEDEĆE eyebrow + progress bar + %), upcoming (outline dot + category name + days remaining). Footer italic note.

- **`app/progress/category/[key].tsx`** — Dynamic route. useLocalSearchParams for key. Per-category timeline filtered from MILESTONES. Amber countdown pill top-right. Category title in category color + N/M count. Achieved/current/upcoming timeline with progress bar. WHO/CDC info card at bottom.

- **`app/(tabs)/saznaj.tsx`** — bg #F7F6F3. Header. Featured ember gradient card (canyon-bg.png texture overlay). Horizontal scroll of 7 category cards (inline SVG icons). Horizontal scroll "Popularno" (3 white article cards, tag pills, IcoLock). Vertical "Novo" list (2 full-width article cards). BottomNav active="saznaj".

- **`app/(tabs)/profil.tsx`** — Profile card (ember-tint avatar, name, gender-aware freedom days, member since). 6 grouped SettingsCard sections (Moj profil, Podešavanja, Premium, O Iskri, Moje iskustvo, Danger zone). SettingsRow reusable component with icon/label/value/toggle/chevron. Toggle component. Sign-out → supabase.auth.signOut() + router.replace splash. BottomNav active="profil".

**TypeScript**: 0 errors

---

---

## Phase 8 — Paywall + RevenueCat (COMPLETE ✅)

### What was built

- **`src/lib/revenuecat.ts`** — `configureRevenueCat(userId?)`, `identifyUser()`, `getOfferings()`, `purchasePackage()`, `restorePurchases()`, `syncPremiumToSupabase()`, `isEntitlementActive()`. API key: `test_bPeWvJlIOhmGgbcIBPHHtspjXPz`. Entitlement ID: `"ISKRA Club"`.

- **`src/hooks/useIsPremium.ts`** — checks `profile.is_premium` (from Supabase) OR live RC entitlement; returns boolean.

- **`app/_layout.tsx`** — calls `configureRevenueCat(userId?)` on mount after session check. Also registers `settings` stack screen.

- **`app/onboarding/paywall.tsx`** — full RC integration:
  - Loads offerings on mount; maps packages to `mesecno/godisnje/dozivotno` by `PACKAGE_TYPE`
  - `handleBuy()`: calls `purchasePackage(pkg)` → on active entitlement: `syncPremiumToSupabase()` → `completeOnboarding()` → home. USER_CANCELLED (code 1) silently ignored.
  - `handleRestore()`: calls `restorePurchases()` → updates Supabase if active. Wired to "Obnovi kupovinu" legal link.
  - `handleFree()`: skip purchase, just `completeOnboarding()` → home.
  - Price strings from RC shown when available (fallback to hardcoded RSD values).

- **`app/(tabs)/saznaj.tsx`** — locked articles show Alert when tapped if `!isPremium`; Alert offers inline purchase flow via `getOfferings()` + `purchasePackage()`.

### Critical pending step

**RLS fix still must be run manually** in Supabase SQL Editor (MCP permission denied):
```sql
drop policy if exists "own profile" on public.profiles;
create policy "own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

## Next Session Checklist (Phase 9+)

**Phase 9 — Notifications Edge Functions (COMPLETE ✅):**
- `send-notification` and `schedule-notifications` deployed and ACTIVE
- Project ID was wrong in `.env.local` (`aaknvhlirztdglxsnbhu` → `aaknvhlirztdglxsnbho`), now fixed

**Phase 10 — Widgets (iOS + Android)**
**Phase 11 — Shareable Achievements**
**Phase 12 — Polish + Analytics**
