// Supabase Edge Function: schedule-notifications
// Runs on cron: 0 8 * * * (8am UTC) and 0 21 * * * (9pm UTC)
// Sends morning check-in or evening encouragement to all users with push tokens.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const HOUR = new Date().getUTCHours();
const IS_MORNING = HOUR === 8;

function getMorningCopy(name: string, gender: string, streak: number): { title: string; body: string } {
  const messages = [
    { title: `Dobro jutro, ${name}!`, body: `Dan ${streak}. Čekamo tvoj check-in.` },
    { title: `Novi dan, nova pobeda.`, body: `${name}, kako si danas?` },
    { title: `✦ Jutarnji check-in`, body: `Dan ${streak} te čeka. Javi se.` },
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getEveningCopy(name: string, gender: string, streak: number): { title: string; body: string } {
  const isFem = gender === 'žensko';
  const messages = [
    { title: `Još jedan dan za tobom.`, body: `Dan ${streak} — ${isFem ? 'ponos' : 'ponos'}.` },
    { title: `${streak} dana bez cigarete.`, body: `${name}, to je stvarno.` },
    { title: `Večer je. Izdržao${isFem ? '/la' : ''} si.`, body: `Sutra počinje dan ${streak + 1}.` },
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

Deno.serve(async () => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, gender, push_token')
    .not('push_token', 'is', null)
    .eq('onboarding_completed', true);

  if (!profiles?.length) {
    return new Response(JSON.stringify({ sent: 0 }));
  }

  const sends = profiles.map(async (profile) => {
    const name = profile.name ?? 'Iskra';
    const gender = profile.gender ?? 'drugo';

    // Get streak count
    const { data: checkins } = await supabase
      .from('checkins')
      .select('date, clean')
      .eq('user_id', profile.id)
      .order('date', { ascending: false })
      .limit(30);

    let streak = 0;
    if (checkins) {
      for (const c of checkins) {
        if (c.clean) streak++;
        else break;
      }
    }

    const { title, body } = IS_MORNING
      ? getMorningCopy(name, gender, streak)
      : getEveningCopy(name, gender, streak);

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ user_id: profile.id, title, body }),
    });
  });

  await Promise.allSettled(sends);
  return new Response(JSON.stringify({ sent: profiles.length }));
});
