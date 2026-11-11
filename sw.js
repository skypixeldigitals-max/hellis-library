// Offline support for Helli's Library.
// The site always tries the network first, so new code and new books show up as usual.
// When there is no signal (in a bookshop, say) it falls back to the last copy it saved:
// the page itself, the public shelf data, and any covers already seen. Editing needs a connection.
const CACHE = 'library-v1';
const SHELL = ['./', 'app.css', 'app.js', 'config.js', 'manifest.webmanifest', 'icon-192.png'];
// Public tables only. Owner-only data (wishlist, lending, activity, wishes) is never stored.
const PUBLIC_DATA = /\/rest\/v1\/(books|sales|settings)\?/;
const COVERS = /\/storage\/v1\/object\/public\/covers\//;
const STATIC_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Keep one copy per file: app.js?v=1 is replaced by app.js?v=2
async function putShell(cache, req, res) {
  const path = new URL(req.url).pathname;
  for (const k of await cache.keys()) if (new URL(k.url).pathname === path && k.url !== req.url) await cache.delete(k);
  await cache.put(req, res);
}

async function networkFirst(req, shell) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) { const copy = res.clone(); shell ? putShell(cache, req, copy) : cache.put(req.url, copy); }
    return res;
  } catch (err) {
    const hit = await cache.match(shell ? req : req.url, { ignoreSearch: shell, ignoreVary: true });
    if (hit) return hit;
    throw err;
  }
}

// Covers, fonts and the Supabase library never change at a given address, so saved copies are used first.
// Fetching with CORS keeps the saved copy small (opaque copies count as several MB each).
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req.url, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
    if (res.ok) cache.put(req.url, res.clone());
    return res;
  } catch {
    return fetch(req);
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) { e.respondWith(networkFirst(req, true)); return; }
  if (PUBLIC_DATA.test(url.pathname + url.search)) { e.respondWith(networkFirst(req, false)); return; }
  if (COVERS.test(url.pathname) || STATIC_HOSTS.includes(url.hostname)) { e.respondWith(cacheFirst(req)); return; }
});
