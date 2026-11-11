// Lets one library owner set a new password for another owner who forgot theirs.
// Caller must be signed in as an owner (email in public.admins); target must also be an owner.
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function isOwner(email?: string | null) {
  if (!email) return false;
  const { data } = await admin.from('admins').select('email').ilike('email', email).maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply(405, { error: 'Use POST' });

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: who } = await admin.auth.getUser(token);
  if (!who?.user || !(await isOwner(who.user.email))) return reply(403, { error: 'Only a library owner can reset passwords.' });

  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return reply(400, { error: 'Send JSON with email and password.' }); }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (password.length < 8) return reply(400, { error: 'The new password needs at least 8 characters.' });
  if (email === (who.user.email || '').toLowerCase()) return reply(400, { error: 'To change your own password, use "Change my password".' });
  if (!(await isOwner(email))) return reply(400, { error: "That email isn't an owner of this library." });

  // Find the target account
  let target: { id: string } | undefined;
  for (let page = 1; page <= 10 && !target; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return reply(500, { error: error.message });
    target = data.users.find((u) => (u.email || '').toLowerCase() === email);
    if (data.users.length < 200) break;
  }
  if (!target) return reply(404, { error: "That owner hasn't created a password yet. They can use 'First time? Create your password'." });

  const { error } = await admin.auth.admin.updateUserById(target.id, { password });
  if (error) return reply(500, { error: error.message });
  return reply(200, { ok: true });
});
