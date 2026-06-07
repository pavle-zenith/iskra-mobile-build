import { useEffect, useState } from 'react';
import type { MilestoneDef, MilestoneRecord, QuitStats } from '../types';
import type { CategoryKey } from '../theme/tokens';
import { supabase } from '../lib/supabase';
import { track } from '../lib/posthog';

export const MILESTONES: MilestoneDef[] = [
  // Time milestones
  { key: 'dan_1',   category: 'zdravlje',  days: 1,   title: 'Dan 1',          unlockText: 'Počelo je. Srce već profitira.' },
  { key: 'dan_3',   category: 'zdravlje',  days: 3,   title: '72 sata',         unlockText: 'Nikotin napušta telo. Pluća počinju da dišu.' },
  { key: 'dan_7',   category: 'zdravlje',  days: 7,   title: 'Nedelja dana',    unlockText: 'Krvni pritisak se normalizovao.' },
  { key: 'dan_14',  category: 'pluca',     days: 14,  title: '2 nedelje',       unlockText: 'Krvotok se poboljšao. Disanje lakše.' },
  { key: 'dan_30',  category: 'zdravlje',  days: 30,  title: 'Mesec dana',      unlockText: 'Pluća su čistija. Energija raste.' },
  { key: 'dan_60',  category: 'pluca',     days: 60,  title: '2 meseca',        unlockText: 'Rizik od srčanog udara se smanjio za 50%.' },
  { key: 'dan_90',  category: 'finansije', days: 90,  title: '3 meseca',        unlockText: 'Uštedeo/la si više nego što misliš.' },
  { key: 'dan_180', category: 'telo',      days: 180, title: '6 meseci',        unlockText: 'Koža, kosa, zubi — sve se vraća.' },
  { key: 'dan_365', category: 'zdravlje',  days: 365, title: 'Godinu dana',     unlockText: 'Rizik od raka pluća prepolovljen.' },

  // Financial milestones
  { key: 'rsd_10k',  category: 'finansije', rsd: 10000,  title: '10.000 RSD',   unlockText: 'To je vikend na moru.' },
  { key: 'rsd_20k',  category: 'finansije', rsd: 20000,  title: '20.000 RSD',   unlockText: 'Pravi novac. Tvoj.' },
  { key: 'rsd_50k',  category: 'finansije', rsd: 50000,  title: '50.000 RSD',   unlockText: 'Pola miliona za 5 godina ako nastaviš.' },
  { key: 'rsd_100k', category: 'finansije', rsd: 100000, title: '100.000 RSD',  unlockText: 'Sto hiljada. Od pakli koje nisi kupio/la.' },

  // Craving milestones
  { key: 'poriv_1',  category: 'nikotin', cravingsSurvived: 1,  title: 'Prva pobeda',  unlockText: 'Dokazao/la si sebi da možeš.' },
  { key: 'poriv_10', category: 'nikotin', cravingsSurvived: 10, title: '10 porива',     unlockText: 'Mozak uči. Porivi slabe.' },
  { key: 'poriv_50', category: 'nikotin', cravingsSurvived: 50, title: '50 porива',     unlockText: 'Maratonac. Svaki poriv je prošao.' },
];

export function useMilestones(
  userId: string | undefined,
  stats: QuitStats,
  unlockedKeys: string[]
) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<MilestoneDef[]>([]);

  useEffect(() => {
    if (!userId) return;

    const check = async () => {
      const toUnlock: MilestoneDef[] = [];

      for (const m of MILESTONES) {
        if (unlockedKeys.includes(m.key)) continue;

        let shouldUnlock = false;
        if (m.days !== undefined && stats.daysSmokeFreeContinuous >= m.days) {
          shouldUnlock = true;
        } else if (m.rsd !== undefined && stats.moneySavedRSD >= m.rsd) {
          shouldUnlock = true;
        }
        // cravingsSurvived checked externally (passed via stats or separate hook)

        if (shouldUnlock) {
          toUnlock.push(m);
        }
      }

      if (toUnlock.length === 0) return;

      for (const m of toUnlock) {
        await supabase.from('milestones').upsert({
          user_id: userId,
          key: m.key,
          category: m.category,
          unlocked_at: new Date().toISOString(),
        });
        track.milestoneUnlocked(m.key, m.category);
      }

      setNewlyUnlocked(toUnlock);
    };

    check();
  }, [userId, stats.daysSmokeFreeContinuous, stats.moneySavedRSD]);

  const clearNewlyUnlocked = () => setNewlyUnlocked([]);
  return { newlyUnlocked, clearNewlyUnlocked };
}
