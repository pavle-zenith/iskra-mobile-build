import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN!,
  { host: 'https://us.i.posthog.com' }
);

// ── Event helpers ─────────────────────────────────────────────────────────────

export const track = {
  onboardingStarted: () => posthog.capture('onboarding_started'),
  onboardingStep: (step_name: string) => posthog.capture('onboarding_step_completed', { step_name }),
  onboardingCompleted: (props: { gender: string; product: string; quit_date: string }) =>
    posthog.capture('onboarding_completed', props),
  paywallSeen: () => posthog.capture('paywall_seen'),
  paywallConverted: (plan: string, price_rsd: number) =>
    posthog.capture('paywall_converted', { plan, price_rsd }),
  dailyCheckin: (clean: boolean) => posthog.capture('daily_checkin', { clean }),
  cravingStarted: (strength: number, trigger: string) =>
    posthog.capture('craving_started', { strength, trigger }),
  cravingToolUsed: (tool: string) => posthog.capture('craving_tool_used', { tool }),
  cravingSurvived: (tool: string, duration_seconds: number) =>
    posthog.capture('craving_survived', { tool, duration_seconds }),
  slipLogged: (trigger: string) => posthog.capture('slip_logged', { trigger }),
  milestoneUnlocked: (milestone_key: string, category: string) =>
    posthog.capture('milestone_unlocked', { milestone_key, category }),
  milestoneShared: (milestone_key: string) =>
    posthog.capture('milestone_shared', { milestone_key }),
  articleOpened: (category: string, title: string, is_premium: boolean) =>
    posthog.capture('knowledge_article_opened', { category, title, is_premium }),
};
