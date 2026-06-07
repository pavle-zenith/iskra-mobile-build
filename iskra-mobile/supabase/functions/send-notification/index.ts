// Supabase Edge Function: send-notification
// Input: { user_id, type, title, body }
// Fetches push_token from profiles and calls Expo Push API.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const { user_id, title, body } = await req.json();

  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', user_id)
    .single();

  if (!profile?.push_token) {
    return new Response(JSON.stringify({ error: 'No push token' }), { status: 400 });
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: profile.push_token,
      title,
      body,
      sound: 'default',
      data: { type: 'iskra' },
    }),
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
