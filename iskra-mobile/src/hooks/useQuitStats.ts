import { useState, useEffect, useRef } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';
import type { Checkin, Profile, QuitStats } from '../types';

function computeStats(profile: Profile | null, checkins: Checkin[]): QuitStats {
  if (!profile?.quit_date) {
    return {
      daysSmokeFreeContinuous: 0,
      totalDaysClean: 0,
      hoursTotal: 0,
      minutesTotal: 0,
      secondsTotal: 0,
      cigarettesAvoided: 0,
      moneySavedRSD: 0,
      timeDisplay: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    };
  }

  const now = new Date();
  const quitDate = parseISO(profile.quit_date);
  const totalSeconds = Math.max(0, differenceInSeconds(now, quitDate));

  // Total clean days (never resets)
  const totalDaysClean = checkins.filter((c) => c.clean).length;

  // Streak — consecutive clean days from most recent backwards
  const sortedCheckins = [...checkins].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const c of sortedCheckins) {
    if (c.clean) streak++;
    else break;
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const { cigarettes_per_day, cigarettes_per_pack, pack_price_rsd } = profile;
  const daysFraction = totalSeconds / 86400;
  const cigarettesAvoided = Math.floor(daysFraction * cigarettes_per_day);
  const moneySavedRSD =
    cigarettes_per_pack > 0
      ? Math.floor((cigarettesAvoided / cigarettes_per_pack) * pack_price_rsd)
      : 0;

  return {
    daysSmokeFreeContinuous: streak || days, // fall back to total days if no checkins
    totalDaysClean,
    hoursTotal: Math.floor(totalSeconds / 3600),
    minutesTotal: Math.floor(totalSeconds / 60),
    secondsTotal: totalSeconds,
    cigarettesAvoided,
    moneySavedRSD,
    timeDisplay: { days, hours, minutes, seconds },
  };
}

export function useQuitStats(profile: Profile | null, checkins: Checkin[]): QuitStats {
  // Use refs so the interval always reads the latest values without recreating
  const profileRef = useRef(profile);
  const checkinsRef = useRef(checkins);
  profileRef.current = profile;
  checkinsRef.current = checkins;

  const [stats, setStats] = useState<QuitStats>(() => computeStats(profile, checkins));

  // Recompute immediately when profile/checkins change
  useEffect(() => {
    setStats(computeStats(profile, checkins));
  }, [profile?.quit_date, profile?.cigarettes_per_day, profile?.cigarettes_per_pack, profile?.pack_price_rsd, checkins.length]);

  // 1-second ticker — reads from refs so it always has fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(computeStats(profileRef.current, checkinsRef.current));
    }, 1000);
    return () => clearInterval(interval);
  }, []); // runs once, never needs recreating

  return stats;
}
