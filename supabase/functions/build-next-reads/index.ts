// Builds "Your next reads" from the owner's shelf using Open Library:
//   1. books from series she owns that she doesn't have yet
//   2. popular books by her favourite authors that she doesn't have
//   3. her wishlist (private: owners only)
// Takes no input. Rebuilds at most once every 10 minutes.
import { createClient } from 'npm:@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const norm = (s = '') => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const core = (s = '') => norm(s.split(/[:(]/)[0]).replace(/^(the|a|an) /, '');
const clean = (t: string) => t.replace(/\s*\([^)]*\)\s*$/, '').trim();
const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'series', 'book', 'books', 'saga', 'trilogy', 'chronicles']);
const words = (s: string) => norm(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w));
// Skip companion editions that aren't really "the next book"
const JUNK = /box(ed)? set|collection|boxset|colou?ring|graphic novel|manga|prequel|anthology|official|guide to|companion|journal|calendar|sampler|summary|untitled|\bset\b|books? \d+ ?(-|to|&) ?\d+|trilogy|omnibus|deluxe|illustrated|anniversary|special edition|\btome\b|\bband\b|\btomo\b/i;
// Translations often lack a language tag; accented letters are a good tell for these titles
const FOREIGN = /[à-ÿĀ-ſ]/i;
const cover = (id?: number) => (id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg` : null);

type Doc = { title: string; author_name?: string[]; cover_i?: number; first_publish_year?: number; language?: string[] };

async function ol(params: Record<string, string>): Promise<Doc[]> {
  const qs = new URLSearchParams({ ...params, fields: 'title,author_name,cover_i,first_publish_year,language', limit: '40' });
  try {
    const r = await fetch(`https://openlibrary.org/search.json?${qs}`, { signal: AbortSignal.timeout(20000) });
    return ((await r.json()).docs ?? []) as Doc[];
  } catch { return []; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const { data: run } = await sb.from('job_runs').select('ran_at').eq('name', 'next_reads').maybeSingle();
  if (run && Date.now() - new Date(run.ran_at).getTime() < 10 * 60 * 1000) return reply({ skipped: 'built less than 10 minutes ago' });
  await sb.from('job_runs').upsert({ name: 'next_reads', ran_at: new Date().toISOString() });

  const [{ data: books }, { data: wish }] = await Promise.all([
    sb.from('books').select('title, author, series'),
    sb.from('wishlist').select('title, author, cover_url'),
  ]);
  const owned = (books ?? []).map((b) => core(b.title)).filter((t) => t.length > 2);
  const seriesNames = [...new Set((books ?? []).map((b) => core(b.series ?? '')).filter(Boolean))];
  const wanted = new Set((wish ?? []).map((w) => core(w.title)));
  const isOwned = (t: string) => { const c = core(t); return owned.some((o) => o === c || (o.length > 6 && (c.includes(o) || o.includes(c)))); };
  // "The Mortal Instruments 6" is just another name for a numbered book she may already own
  const isSeriesNumber = (c: string) => seriesNames.some((s) => c === s || (c.startsWith(s) && /^\s*(book\s*)?\d+\s*$/.test(c.slice(s.length))));
  const byFirstAuthor = (d: Doc, a?: string | null) => !a || norm(d.author_name?.[0] ?? '') === norm(a);

  const picks: { title: string; author: string | null; cover_url: string | null; reason: string; private: boolean; rank: number }[] = [];
  const seen = new Set<string>();
  const add = (d: Doc, reason: string, rank: number) => {
    const c = core(d.title);
    if (!d.cover_i || c.length < 3 || seen.has(c) || isSeriesNumber(c) || isOwned(d.title) || wanted.has(c)) return false;
    if (JUNK.test(d.title) || FOREIGN.test(d.title) || (d.language && !d.language.includes('eng'))) return false;
    // "Freed" next to "Fifty Shades Freed" (same author) reads as the same book twice: keep the first
    const who = norm(d.author_name?.[0] ?? '');
    const within = (a: string, b: string) => ` ${a} `.includes(` ${b} `);
    if (picks.some((p) => norm(p.author ?? '') === who && (within(core(p.title), c) || within(c, core(p.title))))) return false;
    seen.add(c);
    picks.push({ title: clean(d.title), author: d.author_name?.[0] ?? null, cover_url: cover(d.cover_i), reason, private: false, rank });
    return true;
  };

  // 1. Series she's reading: earliest unowned books by the same author that match the series.
  //    If a result doesn't share a word with the series name, label it by author instead.
  const series = [...new Map((books ?? []).filter((b) => b.series).map((b) => [b.series, b.author])).entries()];
  await Promise.all(series.slice(0, 8).map(async ([name, author]) => {
    const docs = (await ol({ q: name!, ...(author ? { author } : {}) })).filter((d) => byFirstAuthor(d, author));
    docs.sort((a, b) => (a.first_publish_year ?? 9999) - (b.first_publish_year ?? 9999));
    const sw = words(name!);
    let n = 0;
    for (const d of docs) {
      if (n >= 2) break;
      const inSeries = sw.some((w) => norm(d.title).split(' ').includes(w));
      if (add(d, inSeries ? `Next in ${name}` : `More from ${author}`, inSeries ? 1 : 2)) n++;
    }
  }));

  // 2. Favourite authors (most books on her shelf), their most-loved books first
  const counts = new Map<string, number>();
  for (const b of books ?? []) if (b.author) counts.set(b.author, (counts.get(b.author) ?? 0) + 1);
  const authors = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([a]) => a);
  const byAuthor = (await Promise.all(authors.map((a) => ol({ author: a, sort: 'editions' }))))
    .map((docs, i) => docs.filter((d) => byFirstAuthor(d, authors[i])));
  for (let round = 0; round < 3; round++) {
    authors.forEach((a, i) => {
      while (byAuthor[i].length) { if (add(byAuthor[i].shift()!, `More from ${a}`, 2)) break; }
    });
  }

  // 3. Wishlist (owners only)
  for (const w of wish ?? []) {
    picks.push({ title: w.title, author: w.author, cover_url: w.cover_url, reason: 'On your wishlist', private: true, rank: 0 });
  }

  const rows = picks.sort((a, b) => a.rank - b.rank).slice(0, 24);
  // Open Library covers take seconds to load. Keep a copy in our own 'covers' bucket (one file per
  // cover id, reused on later rebuilds) so the slideshow loads as fast as the shelf.
  await Promise.all(rows.map(async (r) => {
    const id = r.cover_url?.match(/covers\.openlibrary\.org\/b\/id\/(\d+)-/)?.[1];
    if (!id) return;
    const path = `next/${id}.webp`;
    const stored = sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
    try {
      const have = await fetch(stored, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (!have.ok) {
        const img = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(r.cover_url!)}&w=400&output=webp&q=82`, { signal: AbortSignal.timeout(20000) });
        if (!img.ok || !(img.headers.get('content-type') ?? '').startsWith('image/webp')) return;
        const bytes = new Uint8Array(await img.arrayBuffer());
        if (bytes.length < 1000) return; // 1x1 "no cover" placeholder
        const up = await sb.storage.from('covers').upload(path, bytes, { contentType: 'image/webp', cacheControl: '31536000', upsert: true });
        if (up.error) return;
      }
      r.cover_url = stored;
    } catch { /* keep the Open Library link */ }
  }));
  await sb.from('next_reads').delete().gte('id', 0);
  if (rows.length) {
    const { error } = await sb.from('next_reads').insert(rows);
    if (error) return reply({ error: error.message }, 500);
  }
  return reply({ built: rows.length, series: series.length, authors });
});
