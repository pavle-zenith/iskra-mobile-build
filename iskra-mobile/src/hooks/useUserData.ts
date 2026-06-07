import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Checkin, MilestoneRecord } from '../types';

export function useUserData(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async (uid: string) => {
    const [profileRes, checkinsRes, milestonesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase.from('checkins').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('milestones').select('*').eq('user_id', uid),
    ]);

    if (profileRes.data) setProfile(profileRes.data as Profile);
    if (checkinsRes.data) setCheckins(checkinsRes.data as Checkin[]);
    if (milestonesRes.data) setMilestones(milestonesRes.data as MilestoneRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadAll(userId);

    // Realtime subscription so home screen updates immediately after onboarding writes
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.new) setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const refreshProfile = async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data as Profile);
  };

  const refreshCheckins = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (data) setCheckins(data as Checkin[]);
  };

  return { profile, checkins, milestones, loading, refreshProfile, refreshCheckins };
}
