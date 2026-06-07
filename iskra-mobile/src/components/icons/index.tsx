// Iskra custom SVG icon set — 24×24, 1.9px stroke, round joins, round caps.
// Extracted from ui_kits/app/components.jsx and screens/*.jsx

import React from 'react';
import Svg, { Path, Circle, Line, Rect, G, Polyline } from 'react-native-svg';

interface IconProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

function Ico({
  size = 24,
  stroke = '#1A1A1A',
  strokeWidth = 1.9,
  fill = 'none',
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

// ── Brand / action ────────────────────────────────────────────────────────────

export function IcoFlame(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
    </Ico>
  );
}

export function IcoSpark(p: IconProps) {
  return (
    <Ico {...p} strokeWidth={p.strokeWidth ?? 1.8}>
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </Ico>
  );
}

// ── Stat / detail screens ─────────────────────────────────────────────────────

export function IcoMoney(p: IconProps) {
  return (
    <Ico {...p}>
      <Circle cx="8" cy="8" r="6" />
      <Path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <Path d="M7 6h1v4" />
      <Path d="m16.71 13.88.7.71-2.82 2.82" />
    </Ico>
  );
}

export function IcoCigarette(p: IconProps) {
  return (
    <Ico {...p}>
      <Rect x="2.5" y="13" width="13.5" height="4" rx="1.4" />
      <Line x1="11.5" y1="13" x2="11.5" y2="17" />
      <Path d="M18 8.5c.9.7.9 1.8 0 2.5" />
      <Path d="M20.5 7c1.3 1 1.3 2.6 0 3.6" />
      <Line x1="3" y1="4" x2="21" y2="20.5" />
    </Ico>
  );
}

export function IcoHeart(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Ico>
  );
}

export function IcoTime(p: IconProps) {
  return (
    <Ico {...p}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Ico>
  );
}

export function IcoLeaf(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <Path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </Ico>
  );
}

// ── Navigation ────────────────────────────────────────────────────────────────

export function IcoHome(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20Z" />
      <Path d="M9 21.5V13h6v8.5" />
    </Ico>
  );
}

export function IcoFlag(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M4 22V4" />
      <Path d="M4 4h11l-1.5 3.5L15 11H4" />
    </Ico>
  );
}

export function IcoBook(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z" />
    </Ico>
  );
}

export function IcoUser(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Ico>
  );
}

// ── Actions ───────────────────────────────────────────────────────────────────

export function IcoArrowLeft(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M19 12H5" />
      <Path d="m12 19-7-7 7-7" />
    </Ico>
  );
}

export function IcoX(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Ico>
  );
}

export function IcoCheck(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M20 6 9 17l-5-5" />
    </Ico>
  );
}

export function IcoChevronRight(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="m9 18 6-6-6-6" />
    </Ico>
  );
}

export function IcoShare(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <Polyline points="16 6 12 2 8 6" />
      <Line x1="12" y1="2" x2="12" y2="15" />
    </Ico>
  );
}

export function IcoBell(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Ico>
  );
}

export function IcoLock(p: IconProps) {
  return (
    <Ico {...p}>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Ico>
  );
}

export function IcoTrophy(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <Path d="M4 22h16" />
      <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Ico>
  );
}

// ── Onboarding / reasons ──────────────────────────────────────────────────────

export function IcoPeople(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Ico>
  );
}

export function IcoBird(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M16 7h.01" />
      <Path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
      <Path d="m20 7 2 .5-2 .5" />
      <Path d="M10 18v3" />
      <Path d="M14 17.75v3.25" />
      <Path d="M7 18a6 6 0 0 0 3.84-10.61" />
    </Ico>
  );
}

export function IcoRunner(p: IconProps) {
  return (
    <Ico {...p}>
      <Circle cx="13" cy="4" r="1" />
      <Path d="M5 20l2-4 3 2 3-6 2 3h4" />
      <Path d="M13.5 8.5L15 10l3-3" />
    </Ico>
  );
}

export function IcoCalendar(p: IconProps) {
  return (
    <Ico {...p}>
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </Ico>
  );
}

// ── Craving tools ─────────────────────────────────────────────────────────────

export function IcoWater(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Ico>
  );
}

export function IcoBrain(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </Ico>
  );
}

export function IcoWave(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <Path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <Path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </Ico>
  );
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function IcoSnowflake(p: IconProps) {
  return (
    <Ico {...p}>
      <Line x1="2" y1="12" x2="22" y2="12" />
      <Line x1="12" y1="2" x2="12" y2="22" />
      <Path d="m20 16-4-4 4-4" />
      <Path d="m4 8 4 4-4 4" />
      <Path d="m16 4-4 4-4-4" />
      <Path d="m8 20 4-4 4 4" />
    </Ico>
  );
}

export function IcoStar(p: IconProps) {
  return (
    <Ico {...p} fill={p.stroke ?? '#1A1A1A'}>
      <Path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Ico>
  );
}

export function IcoPlane(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2l-1.6 1.7 6.5 3.8-2.1 2.9-2.5.3L4.6 14l3.2 1.6 1.6 3.2.8-.5.3-2.4 2.9-2.1 3.8 6.5 1.7-1.6Z" />
    </Ico>
  );
}

export function IcoRocket(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <Path d="m3.5 11.5 1.4 2.6c.09.17.24.3.43.36l2.5.75 3.25-3.25-.75-2.5a.6.6 0 0 0-.36-.43L7.5 7.5C9 5 12 3 12 3s3 2.5 4.5 4.5l-5 5a8.5 8.5 0 0 1-8 .5Z" />
      <Path d="m13.5 7.5 2 2" />
    </Ico>
  );
}

export function IcoSettings(p: IconProps) {
  return (
    <Ico {...p}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Ico>
  );
}

export function IcoLogOut(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Ico>
  );
}

export function IcoMoon(p: IconProps) {
  return (
    <Ico {...p}>
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Ico>
  );
}

export function IcoInfo(p: IconProps) {
  return (
    <Ico {...p}>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="16" x2="12" y2="12" />
      <Line x1="12" y1="8" x2="12.01" y2="8" />
    </Ico>
  );
}
