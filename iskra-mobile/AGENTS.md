# Iskra Mobile — Agent Instructions

## CRITICAL: Read before any code change

1. **Read CLAUDE.md first** — it has the complete build log, what's been built, decisions made, and what's next.
2. **Read the design export screen JSX before building any screen:**
   `../iskra-claude-design-export/project/screens/<Name>.jsx`
   Open the sibling `.html` file in a browser for visual reference.
3. **Design tokens are in `src/theme/tokens.ts`** — never hardcode colors, radii, shadows, or spacing.
4. **All text is Manrope** — use `src/components/ui/Text.tsx`, never `<Text>` from react-native directly.
5. **Selected/active state = inverted** — ember gradient bg + white text + white chip with ember icon. Already implemented in `OptionCard` and `SelectionPill`. Reuse them, never re-implement.

## Expo Version Note

Expo SDK **56** is installed (brief says 51 — 56 is what shipped; compatible). Read docs at https://docs.expo.dev/versions/v56.0.0/ for any SDK-specific APIs.

## Design Fidelity Rules (non-negotiable)

- Manrope throughout (never system font)
- Ember `#E8621A` reserved for Iskra actions only
- Inverted selected state: ember fill + white text + white chip with ember icon
- Photo-as-texture: `blendMode: 'multiply'` over ember surface (weekly tracker, featured cards)
- No emoji — custom SVG icons only (see `src/components/icons/index.tsx`)
- Serbian copy only — informal "ti", `/na` inclusive forms
- Soft shadows everywhere: `shadows.card` on cards, `shadows.ember` on CTAs
- 56px ember buttons, 18px card radius, 26px hero card radius

## File Structure

```
app/              — Expo Router screens
src/theme/        — tokens.ts (design tokens, DO NOT modify without updating CLAUDE.md)
src/components/ui/ — shared UI components (Text, Button, Card, OptionCard, SelectionPill, etc.)
src/components/icons/ — custom SVG icon set
src/components/nav/ — BottomNav, TopBar
src/hooks/        — useQuitStats, useMilestones, useUserData, useCravingFlow
src/lib/          — supabase.ts, posthog.ts, notifications.ts
src/stores/       — onboarding.ts (Zustand)
src/types/        — index.ts (all TypeScript interfaces)
supabase/         — migrations + edge functions
assets/images/    — brand photos and logos
```

## Environment Variables

Set in `.env.local` (already configured):
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (safe for client)
- `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` — PostHog token
- `SUPABASE_SERVICE_ROLE_KEY` — **Edge functions only, NEVER import in app code**

## After Every Work Session

Update `CLAUDE.md`:
1. Mark completed items in the phase status table
2. Add to the phase's "What was built" section
3. Update "Next Session Checklist"
4. Note any key decisions made
