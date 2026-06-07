// Iskra Design Tokens — ported from colors_and_type.css (single source of truth)

export const colors = {
  // Brand (ember)
  ember: '#E8621A',
  emberTop: '#F0701F',        // gradient top stop
  emberDeep: '#C9530F',       // pressed / bold label-on-tint / streak number
  emberTint: '#FEF0E8',       // lightest tint — selected-card bg, icon circles, badges
  emberSoft: '#FBEAE0',       // soft tint — avatar chips, monograms

  // Surfaces
  bg: '#FDFCFA',              // app background — warm near-white
  bgWarm: '#FEF6F0',          // warm interstitial (reflection / insight screens)
  card: '#FFFFFF',
  border: '#ECE9E3',
  borderInput: '#E8E8E8',
  faint: '#F1EDE6',           // progress-track / future-day fill

  // Text
  text: '#1A1A1A',
  textSub: '#999999',
  textMuted: '#888888',
  textFaint: '#BBBBBB',
  textGhost: '#CCCCCC',       // disabled / locked / hints
  bodyText: '#555555',        // long-form body copy inside cards

  // Category stat card colors (chip + number, card stays white)
  catMoney: '#3A7A3A',
  catMoneyChip: '#E1F1E1',
  catCigarettes: '#C24A43',
  catCigChip: '#FBE9E7',
  catHealth: '#3A7A3A',
  catHealthChip: '#E1F1E1',

  // "Moj napredak" goal categories
  zdravlje: '#D4547E',        // rose
  pluca: '#4A8AC4',           // sky blue
  ekologija: '#3A7A3A',       // green
  finansije: '#2E8B80',       // teal
  telo: '#C4724A',            // terracotta
  nikotin: '#6B52A8',         // purple

  // Reason / fear / trigger icon hues (onboarding pills)
  reasonZdravlje: '#D4547E',
  reasonPorodica: '#4A6080',
  reasonPare: '#2E8B80',
  reasonForma: '#3A7A3A',
  reasonSloboda: '#6B52A8',
  reasonPritisak: '#BA7517',

  // Supporting accents
  tealDeep: '#1A5C5A',
  tealDeepTop: '#1F6B68',     // "Dnevno znanje" card gradient
  amber: '#BA7517',           // time/streak amber, countdown pills

  // Immersive craving-tool backgrounds
  toolDisem: '#1A1714',       // breathing — warm charcoal
  toolVoda: '#EBF4FB',        // water — calm light blue (screen bg)
  toolVodaDeep: '#2D6FA8',    // water blue accent
  toolPosmatram: '#1C1B35',   // urge-surf — deep indigo
  toolSetam: '#1A3A20',       // walk — forest green
  toolIgram: '#2D1F5E',       // bubble game — deep purple

  // Dark surface (Poriv Mode, ember screens)
  darkSurface: '#1A1410',
  darkCard: 'rgba(255,255,255,0.08)',

  // Functional
  success: '#3A7A3A',
  danger: '#C24A43',
  warning: '#BA7517',
} as const;

export const gradients = {
  ember: ['#F0701F', '#E8621A'] as const,
  emberVertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  tealDeep: ['#1F6B68', '#1A5C5A'] as const,
} as const;

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
  // Font family strings for StyleSheet (must match loaded font names)
  fontFamily: {
    light: 'Manrope_300Light',
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
  sizes: {
    xs: 11,    // all-caps eyebrow labels
    sm: 13,    // fine subtext
    base: 15,  // card body
    md: 17,    // body / button
    lg: 20,    // secondary headline area
    xl: 24,    // h2
    '2xl': 28, // onboarding question title
    '3xl': 32, // category title
    '4xl': 38, // display / large headline
    '5xl': 48, // AHA / share big number
    hero: 80,  // countdown hero number
  },
} as const;

export const radii = {
  sm: 10,
  input: 12,
  chip: 14,
  btn: 16,
  card: 18,
  cardLg: 20,
  cardHero: 26,
  pill: 999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#1A160F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#1A160F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  cardMd: {
    shadowColor: '#1A160F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
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
    shadowColor: 'rgba(70,110,150,1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 8,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  screenH: 20,  // horizontal screen padding
  screenV: 20,  // vertical screen padding
} as const;

// Category config map — used across goal cards, category screens, milestone timelines
export const categoryConfig = {
  zdravlje: {
    label: 'Zdravlje',
    color: colors.zdravlje,
    chipColor: '#FAE8EF',
  },
  pluca: {
    label: 'Pluća',
    color: colors.pluca,
    chipColor: '#E8F1FA',
  },
  ekologija: {
    label: 'Ekologija',
    color: colors.ekologija,
    chipColor: '#E1F1E1',
  },
  finansije: {
    label: 'Finansije',
    color: colors.finansije,
    chipColor: '#E0F3F1',
  },
  telo: {
    label: 'Telo',
    color: colors.telo,
    chipColor: '#FAF0EA',
  },
  nikotin: {
    label: 'Nikotin',
    color: colors.nikotin,
    chipColor: '#EEE9FA',
  },
} as const;

export type CategoryKey = keyof typeof categoryConfig;
