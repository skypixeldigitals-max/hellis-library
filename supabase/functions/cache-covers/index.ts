// Copies external book covers (Open Library, Google Books) into the project's own 'covers' bucket
// and points the row at the stored copy, so covers load fast and never depend on outside services.
// The original link is kept in cover_src. Takes no input: it only processes covers already saved on
// books / wishlist / sales rows.
import { createClient } from 'npm:@supabase/supabase-js@2';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const sb = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const STORED = `${URL_}/storage/v1/object/public/covers/`;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const BATCH = 24;

async function grab(src: string): Promise<{ bytes: Uint8Array; type: string; ext: string } | null> {
  const tries = [
    { url: `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=400&output=webp&q=82`, type: 'image/webp' },
    { url: src, type: 'image/jpeg' },
  ];
  for (const t of tries) {
    try {
      const r = await fetch(t.url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (!r.ok) continue;
      const bytes = new Uint8Array(await r.arrayBuffer());
      if (bytes.length < 1000) continue; // 1x1 "no cover" placeholders
      const ct = (r.headers.get('content-type') || t.type).split(';')[0];
      if (!/^image\/(jpeg|png|webp)$/.test(ct)) continue;
      return { bytes, type: ct, ext: ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : 'jpg' };
    } catch { /* try next */ }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  let cached = 0, failed = 0, remaining = 0;
  for (const table of ['books', 'wishlist', 'sales']) {
    const { data, error, count } = await sb.from(table)
      .select('id, cover_url', { count: 'exact' })
      .not('cover_url', 'is', null)
      .not('cover_url', 'like', `${STORED}%`)
      .limit(BATCH);
    if (error) continue;
    remaining += Math.max(0, (count ?? 0) - (data?.length ?? 0));
    const queue = [...(data ?? [])];
    await Promise.all(Array.from({ length: 6 }, async () => {
      for (let row = queue.shift(); row; row = queue.shift()) {
        const img = await grab(row.cover_url);
        if (!img) { failed++; continue; }
        const path = `cache/${table}-${row.id}-${Date.now()}.${img.ext}`;
        const up = await sb.storage.from('covers').upload(path, img.bytes, { contentType: img.type, cacheControl: '31536000' });
        if (up.error) { failed++; continue; }
        const stored = sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
        // Only swap if the cover wasn't changed meanwhile
        await sb.from(table).update({ cover_url: stored, cover_src: row.cover_url }).eq('id', row.id).eq('cover_url', row.cover_url);
        cached++;
      }
    }));
  }
  return new Response(JSON.stringify({ cached, failed, remaining }), { headers: { ...cors, 'Content-Type': 'application/json' } });
});
