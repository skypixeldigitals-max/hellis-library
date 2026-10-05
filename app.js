(() => {
  'use strict';

  const { url, key } = window.LIBRARY_CONFIG;
  const sb = supabase.createClient(url, key);

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const num = (v) => (v === '' || v == null ? null : Number(v));
  const CUR = { LKR: 'Rs', USD: '$', INR: '₹' };

  const ICON = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 7v10M12 7v10M16 7v10"/>',
    shelf: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    series: '<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    sale: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    wish: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    feed: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z"/>',
    out: '<path d="M7 17 17 7M7 7h10v10"/>',
    book: '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    sort: '<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    sparkle: '<path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="currentColor" stroke="none"/>',
    feather: '<path d="M12.67 19a2 2 0 0 0 1.42-.59l6.17-6.17a6 6 0 1 0-8.49-8.49L5.6 9.92A2 2 0 0 0 5 11.34V19zM16 8 2 22M17.5 15H9"/>',
  };
  const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const hic = (n) => `<i class="h-ic" aria-hidden="true">${ic(n)}</i>`;

  // Small illustrations
  const PLANT = `<svg viewBox="0 0 60 92" aria-hidden="true">
    <g stroke="#6b7d4a" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M30 58c-1-14-6-26-12-36"/><path d="M30 58c1-16 4-30 10-42"/><path d="M30 58c0-12 0-22 1-30"/></g>
    <g fill="#a58bd0">${[[19, 24], [17.5, 20], [16, 16], [39, 18], [40.5, 14], [42, 10], [31, 30], [31, 26], [31.2, 22]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.8"/>`).join('')}</g>
    <g fill="#7d8f5a"><ellipse cx="22" cy="50" rx="7" ry="3" transform="rotate(-30 22 50)"/><ellipse cx="38" cy="49" rx="7" ry="3" transform="rotate(28 38 49)"/></g>
    <path d="M15 62h30l-4 26H19z" fill="#b5673a"/><rect x="12" y="56" width="36" height="8" rx="2" fill="#c97a4a"/><path d="M19 74h22" stroke="#e0a07a" stroke-width="1.5"/>
  </svg>`;
  const OPEN_BOOK = `<svg class="illo" viewBox="0 0 140 90" aria-hidden="true">
    <path d="M70 26c-14-10-34-12-52-8v54c18-4 38-2 52 8z" fill="#fbf4e6" stroke="#cfb894" stroke-width="2"/>
    <path d="M70 26c14-10 34-12 52-8v54c-18-4-38-2-52 8z" fill="#fbf4e6" stroke="#cfb894" stroke-width="2"/>
    <path d="M70 26v54" stroke="#7356a0" stroke-width="3"/>
    <g stroke="#e6d6bb" stroke-width="2" stroke-linecap="round"><path d="M28 32c10-2 22-1 32 3M28 42c10-2 22-1 32 3M28 52c10-2 22-1 32 3M80 35c10-4 22-5 32-3M80 45c10-4 22-5 32-3M80 55c10-4 22-5 32-3"/></g>
    <g fill="#a58bd0"><path d="M24 6l1.6 5 5 1.6-5 1.6-1.6 5-1.6-5-5-1.6 5-1.6z"/><path d="M116 2l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z"/><path d="M98 12l.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9z"/></g>
  </svg>`;
  const QUOTES = [
    ['I declare after all there is no enjoyment like reading!', 'Jane Austen'],
    ['There is no Frigate like a Book to take us Lands away.', 'Emily Dickinson'],
    ['I cannot live without books.', 'Thomas Jefferson'],
    ['Reading is to the mind what exercise is to the body.', 'Joseph Addison'],
    ['Books are the quietest and most constant of friends.', 'Charles W. Eliot'],
    ['A room without books is like a body without a soul.', 'Cicero'],
  ];

  // Open Library covers take ~3s (two redirects into archive.org). Serve them through a caching image CDN
  // as small WebP, and fall back to the original URL if the CDN fails.
  const fast = (u, w = 240) => (/covers\.openlibrary\.org|books\.google/.test(u || '') ? `https://wsrv.nl/?url=${encodeURIComponent(u)}&w=${w}&output=webp&q=80` : u);
  const FALLBACK = 'if(this.dataset.o&&this.src!==this.dataset.o){this.src=this.dataset.o}else{';
  const cover = (b, size = '') => {
    const spine = `<span class="spine"${b.cover_url ? ' hidden' : ''}><span>${esc(b.title)}</span><small>${esc(b.author)}</small></span>`;
    const img = b.cover_url
      ? `<img loading="lazy" decoding="async" alt="" src="${esc(fast(b.cover_url))}" data-o="${esc(b.cover_url)}" onload="if(this.naturalWidth<5){this.onerror()}else{this.classList.add('ld')}" onerror="${FALLBACK}this.previousElementSibling.hidden=false;this.remove()}">`
      : '';
    return `<span class="cov ${size}">${spine}${img}</span>`;
  };

  const seriesLine = (b) => (b.series ? `${b.series}${b.series_no ? ` #${b.series_no}` : ''}` : b.author || '');
  const price = (p) => (p == null ? 'Price on request' : `${CUR[S.settings.currency] || ''} ${Number(p).toLocaleString('en-US', { maximumFractionDigits: 2 })}`.trim());
  const shortDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const ago = (d) => {
    const m = (Date.now() - new Date(d)) / 60000;
    if (m < 1) return 'just now';
    if (m < 60) return `${Math.floor(m)} min ago`;
    if (m < 1440) return `${Math.floor(m / 60)} h ago`;
    if (m < 2880) return 'yesterday';
    if (m < 10080) return `${Math.floor(m / 1440)} days ago`;
    return shortDate(d);
  };
  const stars = (r) => `<span class="stars readonly" aria-label="${r} of 5 stars">${[1, 2, 3, 4, 5].map((n) => `<svg class="i" viewBox="0 0 24 24" style="${n <= r ? 'fill:currentColor' : 'opacity:.3'}">${ICON.star}</svg>`).join('')}</span>`;
  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });

  // ---------- state ----------
  const TABS = { shelf: 'Shelf', series: 'Series', sale: 'For sale', wish: 'Wishlist', feed: 'Activity' };
  const PUBLIC_TABS = ['shelf', 'series', 'sale'];
  const S = {
    books: [], lending: {}, wish: [], sales: [], feed: [],
    settings: { display_name: 'Helli', currency: 'LKR', whatsapp: null },
    user: null, admin: false, loaded: false,
    tab: TABS[location.hash.slice(1)] ? location.hash.slice(1) : 'shelf',
    q: '', filter: 'all', pending: null,
    sort: (() => { try { return localStorage.getItem('shelfSort') || 'series'; } catch { return 'series'; } })(),
  };
  const findBook = (id) => S.books.find((b) => b.id === id);
  const name = () => S.settings.display_name || 'Helli';

  // ---------- data ----------
  async function load() {
    const [b, s, st] = await Promise.all([
      sb.from('books').select('*').order('created_at', { ascending: false }),
      sb.from('sales').select('*').order('created_at', { ascending: false }),
      sb.from('settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    if (b.error) { toast("Couldn't load the library. Check your connection and refresh."); return; }
    // Shelf order: series together in reading order, standalones by title
    S.books = b.data.sort((x, y) => (x.series || x.title).localeCompare(y.series || y.title) || (x.series_no || 0) - (y.series_no || 0));
    S.sales = s.data || []; if (st.data) S.settings = st.data;
    if (S.admin) {
      const [l, w, f] = await Promise.all([
        sb.from('lending').select('*'),
        sb.from('wishlist').select('*').order('created_at', { ascending: false }),
        sb.from('activity').select('*').order('created_at', { ascending: false }).limit(40),
      ]);
      S.lending = Object.fromEntries((l.data || []).map((x) => [x.book_id, x]));
      S.wish = w.data || []; S.feed = f.data || [];
    } else { S.lending = {}; S.wish = []; S.feed = []; }
    S.loaded = true;
    document.body.classList.remove('is-loading');
    renderAll();
  }

  async function save(op, failMsg = "Couldn't save that") {
    const { error } = await op;
    if (error) {
      const denied = error.code === '42501' || /permission|row-level/i.test(error.message);
      toast(denied ? 'Only the owner can change this. Log in again and retry.' : `${failMsg}: ${error.message}`);
      await load();
      return false;
    }
    return true;
  }
  function log(text, cover_url) {
    if (!S.admin) return;
    const row = { text, cover_url: cover_url || null, created_at: new Date().toISOString() };
    S.feed.unshift(row);
    sb.from('activity').insert({ text, cover_url: row.cover_url }).then(() => {});
  }

  async function refreshAuth(session) {
    S.user = session?.user || null;
    S.admin = false;
    if (S.user) { const { data } = await sb.rpc('is_admin'); S.admin = data === true; }
    await load();
  }
  document.body.classList.add('is-loading');
  sb.auth.onAuthStateChange((_event, session) => { setTimeout(() => refreshAuth(session), 0); });
  if (/error_description=/.test(location.hash)) {
    const msg = decodeURIComponent(location.hash.match(/error_description=([^&]+)/)[1]).replace(/\+/g, ' ');
    setTimeout(() => toast(`Login link didn't work: ${msg}. Send a new one.`), 600);
    history.replaceState(null, '', location.pathname);
  }

  // ---------- render ----------
  function renderAll() { renderHeader(); renderSide(); renderNav(); renderView(); renderResults(); renderQuote(); renderFoot(); }
  function renderQuote() {
    const [q, who] = QUOTES[Math.floor(Date.now() / 864e5) % QUOTES.length];
    $('#quote').innerHTML = `${ic('feather')}<blockquote>${esc(q)}</blockquote><figcaption>${esc(who)}</figcaption>`;
  }

  function renderHeader() {
    document.querySelectorAll('.owner-name').forEach((el) => { el.textContent = name(); });
    document.title = `${name()}'s Library`;
    $('#avatar').textContent = (S.user ? (S.user.email || 'H') : name())[0].toUpperCase();
    $('#avatar').setAttribute('aria-label', S.user ? 'Account and settings' : 'Owner login');
    $('#addBtn').hidden = !S.admin;
    $('.hello').textContent = S.admin ? `Hi ${name()}. Check before you buy.` : `Browse ${name()}'s books, or buy one from the For sale shelf.`;
  }

  function renderSide() {
    const read = S.books.filter((b) => b.status === 'read').length;
    const lent = S.books.filter((b) => b.is_lent).length;
    $('#stats').innerHTML = [[S.books.length, 'Books', 'shelf'], [read, 'Read', 'check'], [lent, 'Lent out', 'out']]
      .map(([n, l, i]) => `<div class="stat"><i class="stat-ic" aria-hidden="true">${ic(i)}</i><b data-n="${n}">${n}</b><span>${l}</span></div>`).join('');
    const reading = S.books.find((b) => b.status === 'reading');
    $('#now').innerHTML = reading ? `<button class="now" data-a="open" data-id="${reading.id}"><svg class="ribbon" viewBox="0 0 20 34" aria-hidden="true"><path d="M0 0h20v34l-10-8-10 8z"/></svg>${cover(reading, 'md')}<span style="flex:1;min-width:0"><span class="k">${ic('sparkle')} Currently reading</span><span class="t" style="display:block">${esc(reading.title)}</span><span class="bar" style="display:block"><i style="width:${reading.progress || 4}%"></i></span><small>${reading.progress || 0}% · ${esc(seriesLine(reading))}</small></span></button>` : '';
  }

  function renderNav() {
    const tabs = S.admin ? Object.keys(TABS) : PUBLIC_TABS;
    $('#nav').innerHTML = tabs.map((t) => `<button data-a="tab" data-tab="${t}" ${S.tab === t ? 'aria-current="page"' : ''}>${ic(t)}${TABS[t]}</button>`).join('');
  }

  function renderFoot() {
    $('#foot').innerHTML = (S.user
      ? `<span>Signed in as ${esc(S.user.email)}${S.admin ? '' : " (this email can't edit)"}</span><button class="link" data-a="logout">Log out</button>`
      : `<span>Book covers from Open Library</span><button class="link" data-a="account">Owner login</button>`);
  }

  function renderView() {
    let h = '';
    if (S.tab === 'shelf') h = viewShelf();
    if (S.tab === 'series') h = viewSeries();
    if (S.tab === 'sale') h = viewSale();
    if (S.tab === 'wish') h = viewWish();
    if (S.tab === 'feed') h = viewFeed();
    $('#view').innerHTML = `<div class="view">${h}</div>`;
  }

  function viewShelf() {
    const F = { all: () => true, reading: (b) => b.status === 'reading', read: (b) => b.status === 'read', unread: (b) => b.status === 'unread', lent: (b) => b.is_lent };
    const SORTS = {
      series: (x, y) => (x.series || x.title).localeCompare(y.series || y.title) || (x.series_no || 0) - (y.series_no || 0),
      author: (x, y) => (x.author || '').localeCompare(y.author || '') || (x.series || x.title).localeCompare(y.series || y.title) || (x.series_no || 0) - (y.series_no || 0),
      title: (x, y) => x.title.replace(/^(the|a|an) /i, '').localeCompare(y.title.replace(/^(the|a|an) /i, '')),
      recent: (x, y) => new Date(y.created_at) - new Date(x.created_at),
    };
    const list = S.books.filter(F[S.filter]).sort(SORTS[S.sort] || SORTS.series);
    const chips = [['all', 'All'], ['reading', 'Reading'], ['read', 'Read'], ['unread', 'Unread'], ['lent', 'Lent out']]
      .map(([k, l]) => `<button class="chip" data-a="filter" data-f="${k}" aria-pressed="${S.filter === k}">${l}</button>`).join('');
    if (!S.books.length) return `<h2>${hic('shelf')}Shelf</h2>${empty('The shelf is empty', S.admin ? 'Scan a barcode or add your first book.' : 'No books yet. Check back soon.', S.admin ? `<button class="primary" data-a="add">${ic('plus')}Add a book</button>` : '')}`;
    return `<h2>${hic('shelf')}Shelf <span>${S.books.length} book${S.books.length === 1 ? '' : 's'}</span></h2>
      <div class="shelf-tools"><div class="filters" role="group" aria-label="Filter books">${chips}</div>
        <label class="sortbox"><span class="sr">Sort books by</span>${ic('sort')}<select id="sortSel">${[['series', 'Series'], ['author', 'Author'], ['title', 'Title A–Z'], ['recent', 'Recently added']].map(([k, l]) => `<option value="${k}" ${S.sort === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      ${list.length ? `<div class="shelf">${list.map((b, i) => `<button class="book" style="--i:${i}" data-a="open" data-id="${b.id}" title="${esc(b.title)}" aria-label="${esc(b.title)}${b.is_lent ? ', lent out' : ''}">${b.is_lent ? `<span class="badge lent">${ic('out')}</span>` : b.status === 'read' ? `<span class="badge read">${ic('check')}</span>` : b.status === 'reading' ? `<span class="badge reading">${ic('book')}</span>` : ''}${cover(b)}</button>`).join('')}${S.filter === 'all' ? `<div class="decor" aria-hidden="true">${PLANT}</div>` : ''}</div>
      <div class="legend"><span><i style="background:var(--ok)"></i>Read</span><span><i style="background:var(--accent)"></i>Reading</span><span><i style="background:var(--warn)"></i>Lent out</span></div>`
        : empty('Nothing here', 'No books match this filter.')}`;
  }

  function viewSeries() {
    const names = [...new Set(S.books.map((b) => b.series).filter(Boolean))];
    if (!names.length) return `<h2>${hic('series')}Series</h2>${empty('No series yet', 'Add a series name and number to a book and it shows up here, with any missing books.')}`;
    return `<h2>${hic('series')}Series <span>dashed = not owned yet</span></h2>` + names.map((s, i) => {
      const own = S.books.filter((b) => b.series === s);
      const wish = S.wish.filter((w) => w.series === s);
      const total = Math.max(...own.map((b) => b.series_total || 0), ...own.map((b) => b.series_no || 0), ...wish.map((w) => w.series_no || 0), 1);
      const nums = Array.from({ length: total }, (_, k) => k + 1);
      const missing = nums.filter((n) => !own.some((b) => b.series_no === n));
      return `<div class="series" style="--i:${i}"><div class="name">${esc(s)}<span>${own.length} of ${total}${missing.length ? '' : ' · complete'}</span></div>
        <div class="slots">${nums.map((n) => {
          const b = own.find((x) => x.series_no === n);
          const w = wish.find((x) => x.series_no === n);
          return `<div class="slot">${b ? `<button data-a="open" data-id="${b.id}" style="width:100%" aria-label="${esc(b.title)}">${cover(b)}</button>` : `<div class="miss${w ? ' wanted' : ''}" title="${w ? `On your wishlist: ${esc(w.title)}` : 'Not owned'}">${w ? ic('wish') : n}</div>`}<div class="no">#${n}</div></div>`;
        }).join('')}</div>
        ${missing.length ? `<div class="hint">${ic('info')} Missing ${missing.map((n) => `#${n}`).join(', ')}</div>` : ''}</div>`;
    }).join('');
  }

  function viewSale() {
    const order = { available: 0, reserved: 1, sold: 2 };
    const list = [...S.sales].sort((a, b) => order[a.status] - order[b.status]);
    const avail = S.sales.filter((s) => s.status === 'available').length;
    const tools = S.admin ? `<div class="filters"><button class="primary" data-a="add" data-dest="sales">${ic('plus')}List a book for sale</button><button class="ghost" data-a="copylink">${ic('link')}Copy link to this page</button></div>` : '';
    if (!list.length) return `<h2>${hic('sale')}For sale</h2>${tools}${empty('Nothing for sale right now', S.admin ? 'List a book and share the link with friends.' : 'Check back later.')}`;
    const statusPill = { available: `<span class="pill ok">${ic('check')}Available</span>`, reserved: `<span class="pill warn">${ic('hourglass')}Reserved</span>`, sold: `<span class="pill grey">${ic('sale')}Sold</span>` };
    return `<h2>${hic('sale')}For sale <span>${avail} available</span></h2>${tools}
      <div class="cards">${list.map((s, i) => `<article class="item${s.status === 'sold' ? ' sold' : ''}" style="--i:${i}">${cover(s, 'md')}<div class="grow">
        <span class="t">${esc(s.title)}</span><span class="a">${esc(s.author)}</span>
        <span class="price">${esc(price(s.price))}</span>
        <span style="display:flex;gap:6px;flex-wrap:wrap">${statusPill[s.status]}<span class="pill lav">${s.condition === 'like new' ? ic('sparkle') : ''}${esc(cap(s.condition))}</span></span>
        ${s.note ? `<span class="note-line">${esc(s.note)}</span>` : ''}
        <div class="actions">${S.admin ? `<button class="ghost" data-a="edit-sale" data-id="${s.id}">Edit</button>${s.status !== 'sold' ? `<button class="ghost" data-a="sale-status" data-id="${s.id}" data-st="${s.status === 'available' ? 'reserved' : 'sold'}">Mark ${s.status === 'available' ? 'reserved' : 'sold'}</button>` : `<button class="ghost" data-a="sale-status" data-id="${s.id}" data-st="available">Available again</button>`}` : waButton(s)}</div>
      </div></article>`).join('')}</div>`;
  }
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
  const waButton = (s) => {
    const digits = (S.settings.whatsapp || '').replace(/\D/g, '');
    if (!digits || s.status === 'sold') return '';
    const text = `Hi ${name()}! Is "${s.title}" still available?`;
    return `<a class="primary wa" href="https://wa.me/${digits}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${ic('chat')}Ask on WhatsApp</a>`;
  };

  function viewWish() {
    const tools = `<div class="filters"><button class="primary" data-a="add" data-dest="wishlist">${ic('plus')}Add to wishlist</button></div>`;
    if (!S.wish.length) return `<h2>${hic('wish')}Wishlist <span>only you can see this</span></h2>${tools}${empty('Your wishlist is empty', 'Add books you want, and the search will remind you when you spot one in a shop.')}`;
    return `<h2>${hic('wish')}Wishlist <span>only you can see this</span></h2>${tools}<div class="cards">${S.wish.map((w, i) => `<article class="item" style="--i:${i}">${cover(w, 'md')}<div class="grow">
      <span class="t">${esc(w.title)}</span><span class="a">${esc(seriesLine(w))}</span>
      ${fillsGap(w) ? '<span class="pill lav">Fills a gap in your series</span>' : ''}
      <div class="actions"><button class="ghost" data-a="got" data-id="${w.id}">${ic('check')}Got it</button><button class="ghost" data-a="sv-find" data-q="${esc(w.title)}">${ic('bag')}Sarasavi</button><button class="ghost" data-a="wish-del" data-id="${w.id}">Remove</button></div>
    </div></article>`).join('')}</div>`;
  }
  const fillsGap = (w) => w.series && S.books.some((b) => b.series === w.series) && !S.books.some((b) => b.series === w.series && b.series_no === w.series_no);

  function viewFeed() {
    if (!S.feed.length) return `<h2>${hic('feed')}Activity</h2>${empty('Nothing yet', 'Adding, finishing and lending books shows up here.')}`;
    return `<h2>${hic('feed')}Activity <span>only you can see this</span></h2><div class="feed">${S.feed.map((e, i) => `<div class="ev" style="--i:${i}">${cover({ title: '', author: '', cover_url: e.cover_url }, 'sm')}<div><p>${esc(e.text)}</p><time>${ago(e.created_at)}</time></div></div>`).join('')}</div>`;
  }

  const empty = (t, d, action = '') => `<div class="empty">${OPEN_BOOK}<b>${t}</b><span>${d}</span>${action}</div>`;

  function renderResults() {
    const q = norm(S.q), box = $('#results');
    if (!q) { box.innerHTML = ''; return; }
    const tok = q.split(' ');
    const hit = (b) => tok.every((t) => norm(`${b.title} ${b.author} ${b.series || ''} ${b.isbn || ''}`).includes(t));
    const allOwn = S.books.filter(hit);
    const own = allOwn.slice(0, 6), wish = S.wish.filter(hit).slice(0, 2), sale = S.sales.filter((s) => s.status !== 'sold' && hit(s)).slice(0, 2);
    let h = allOwn.length > 1 ? `<p class="more">${allOwn.length} matches${allOwn.length > own.length ? `, showing ${own.length}. Type more to narrow it down.` : ''}</p>` : '';
    h += own.map((b) => `<button class="verdict own" data-a="open" data-id="${b.id}">${cover(b, 'sm')}<span class="grow"><span class="head">${ic('check')} ${S.admin ? 'You own this' : `${esc(name())} has this`}</span>${esc(b.title)}<small>${esc(seriesLine(b))}${b.is_lent ? ' · lent out' : ''}</small></span></button>`).join('');
    h += wish.map((w) => `<div class="verdict wish">${cover(w, 'sm')}<span class="grow"><span class="head">${ic('wish')} Not owned, on your wishlist</span>${esc(w.title)}<small>${esc(seriesLine(w))}${fillsGap(w) ? ' · fills a gap' : ''}</small></span></div>`).join('');
    h += sale.map((s) => `<button class="verdict sale" data-a="tab" data-tab="sale">${cover(s, 'sm')}<span class="grow"><span class="head">${ic('sale')} For sale · ${esc(price(s.price))}</span>${esc(s.title)}<small>${esc(cap(s.condition))}</small></span></button>`).join('');
    if (!own.length && !wish.length) h = `<div class="verdict no"><span class="bag">${ic('bag')}</span><span class="grow"><span class="head">Not in the library</span><small>Nothing matches "${esc(S.q)}". ${S.admin ? 'Safe to buy.' : ''}</small></span>${S.admin ? `<button class="ghost" data-a="add" data-q="${esc(S.q)}">Add it</button>` : ''}</div>` + h;
    box.innerHTML = h;
  }

  // ---------- Sarasavi (titles + links from their public sitemap; prices stay on their site) ----------
  let svTimer = null, svSeq = 0;
  function searchSarasavi() {
    clearTimeout(svTimer);
    const q = S.q.trim(), box = $('#sv');
    if (norm(q).length < 3) { box.innerHTML = ''; return; }
    svTimer = setTimeout(async () => {
      const seq = ++svSeq;
      const { data, error } = await sb.rpc('search_sarasavi', { q });
      if (seq !== svSeq || S.q.trim() !== q) return;
      const rows = (data || []).filter((r) => /^[\w\-().%']+$/.test(r.slug)).slice(0, 5);
      if (error || !rows.length) {
        box.innerHTML = error ? '' : `<p class="sv-head">${ic('bag')}At Sarasavi<span>No match in their catalogue</span></p>`;
        return;
      }
      box.innerHTML = `<p class="sv-head">${ic('bag')}At Sarasavi<span>Tap for price and stock</span></p>` + rows.map((r, i) => `
        <a class="verdict sv-item" style="animation-delay:${i * 40}ms" href="https://www.sarasavi.lk/product/${esc(r.slug)}" target="_blank" rel="noopener">
          <span class="sv-cov" data-t="${esc(r.title)}">${cover({ title: r.title, author: '', cover_url: null }, 'sm')}</span>
          <span class="grow"><span class="t">${esc(r.title)}</span><small>Open at Sarasavi</small></span>${ic('out')}</a>`).join('');
      // Fill in covers from Open Library (best effort, first few only)
      box.querySelectorAll('.sv-cov').forEach(async (el, i) => {
        if (i > 3) return;
        const t = el.dataset.t.split(' – ').pop();
        try {
          const j = await (await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(t)}&fields=cover_i&limit=1`)).json();
          const id = j.docs?.[0]?.cover_i;
          if (id && el.isConnected) el.innerHTML = cover({ title: t, author: '', cover_url: olCover(id) }, 'sm');
        } catch { /* keep the plain spine */ }
      });
    }, 350);
  }

  // ---------- sheet ----------
  // Opening a sheet adds a history entry, so the phone's Back button closes it instead of leaving the site.
  let lastFocus = null, sheetEntry = false, popPending = false, afterPop = [];
  const closeBtn = `<button class="close" data-a="close" aria-label="Close">${ic('x')}</button>`;
  function sheet(html) {
    if (!document.body.classList.contains('open')) {
      lastFocus = document.activeElement;
      history.pushState({ sheet: true }, '');
      sheetEntry = true;
    }
    $('#sheet').innerHTML = `<div class="grab"></div>${html}`;
    document.body.classList.add('open');
    setTimeout(() => ($('#sheet [autofocus]') || $('#sheet .close'))?.focus({ preventScroll: true }), 50);
  }
  function closeSheet() {
    stopScanner();
    document.body.classList.remove('open');
    lastFocus?.focus?.({ preventScroll: true });
    if (sheetEntry) { sheetEntry = false; popPending = true; history.back(); }
  }
  // Run after any pending history.back() from closeSheet has landed, so hash updates aren't undone.
  const setHash = (tab) => { const f = () => history.replaceState(null, '', `#${tab}`); popPending ? afterPop.push(f) : f(); };
  window.addEventListener('popstate', () => {
    if (popPending) { popPending = false; afterPop.splice(0).forEach((f) => f()); return; }
    if (document.body.classList.contains('open')) { sheetEntry = false; closeSheet(); }
  });
  // Phones: drag a sheet down from its top to close it
  (() => {
    let y0 = null, dy = 0;
    const el = $('#sheet');
    el.addEventListener('touchstart', (e) => {
      if (window.innerWidth >= 700 || el.scrollTop > 0) { y0 = null; return; }
      y0 = e.touches[0].clientY; dy = 0; el.style.transition = 'none';
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      if (y0 == null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (dy > 0) el.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    el.addEventListener('touchend', () => {
      if (y0 == null) return;
      el.style.transition = ''; el.style.transform = '';
      if (dy > 110) closeSheet();
      y0 = null;
    });
  })();

  // Keep keyboard focus inside an open sheet
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !document.body.classList.contains('open')) return;
    const f = [...$('#sheet').querySelectorAll('button, a[href], input, select, textarea')].filter((el) => !el.disabled && el.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  function openBook(id) {
    const b = findBook(id); if (!b) return;
    const l = S.lending[b.id];
    const head = `<div class="sheet-head"><span></span>${closeBtn}</div>
      <div class="detail">${S.admin ? `<button class="cov-edit" data-a="cover" data-id="${b.id}" aria-label="Change cover">${cover(b, 'lg')}<span class="cov-badge">${ic('image')}</span></button>` : cover(b, 'lg')}<div class="grow"><h3 id="sheetTitle">${esc(b.title)}</h3><p>${esc(b.author)}</p><p>${b.series ? `Book ${b.series_no || '?'}${b.series_total ? ` of ${b.series_total}` : ''} · ${esc(b.series)}` : 'Standalone'}</p></div></div>`;
    if (!S.admin) {
      const digits = (S.settings.whatsapp || '').replace(/\D/g, '');
      const borrow = digits && !b.is_lent
        ? `<a class="primary wa" style="margin-top:18px" href="https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${name()}! Could I borrow "${b.title}"?`)}" target="_blank" rel="noopener">${ic('chat')}Ask to borrow on WhatsApp</a>` : '';
      sheet(`${head}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">${b.is_lent ? `<span class="pill warn">${ic('out')}Lent out</span>` : `<span class="pill ok">${ic('check')}On the shelf</span>`}<span class="pill lav">${cap(b.status)}</span>${b.rating ? stars(b.rating) : ''}</div>${borrow}`);
      return;
    }
    sheet(`${head}
      <span class="lbl">Status</span><div class="seg" role="group" aria-label="Reading status">${['unread', 'reading', 'read'].map((s) => `<button data-a="status" data-id="${b.id}" data-st="${s}" aria-pressed="${b.status === s}">${cap(s)}</button>`).join('')}</div>
      ${b.status === 'reading' ? `<label class="lbl" for="prog">Progress: <span id="progv">${b.progress}%</span></label><input id="prog" type="range" min="0" max="100" step="1" value="${b.progress}" data-id="${b.id}">` : ''}
      <span class="lbl">Your rating</span><div class="stars" role="group" aria-label="Rating">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= b.rating ? 'on' : ''}" data-a="rate" data-id="${b.id}" data-r="${n}" aria-label="${n} star${n > 1 ? 's' : ''}" aria-pressed="${n === b.rating}">${ic('star')}</button>`).join('')}</div>
      <span class="lbl">Lending</span><div class="lend">${b.is_lent
        ? `<span class="handnote">With ${esc(l?.borrower || 'a friend')}${l ? ` since ${shortDate(l.lent_on)}` : ''}</span><button class="primary" data-a="return" data-id="${b.id}">Returned</button>`
        : `<label for="lendto" class="sr">Friend's name</label><input id="lendto" class="inline-input" placeholder="Lend to…" autocomplete="off"><button class="primary" data-a="lend" data-id="${b.id}">Lend</button>`}</div>
      <div class="sheet-actions"><button class="ghost" data-a="edit" data-id="${b.id}">Edit details</button><button class="ghost" data-a="sell" data-id="${b.id}">${ic('sale')}List a copy for sale</button><button class="ghost danger" data-a="del" data-id="${b.id}" style="margin-left:auto">Delete</button></div>`);
  }

  // ---------- add / edit form ----------
  let F = null, olTimer = null;
  function openForm({ mode = 'add', table = 'books', row = {}, q = '' } = {}) {
    F = { mode, table, id: row.id, cover_url: row.cover_url || null, isbn: row.isbn || null };
    const dest = mode === 'add' ? `<div class="field"><span class="lbl" style="margin:0 0 4px">Add to</span><div class="seg" role="group" aria-label="Where to add">${[['books', 'Library'], ['wishlist', 'Wishlist'], ['sales', 'For sale']].map(([k, l]) => `<button type="button" data-a="dest" data-dest="${k}" aria-pressed="${table === k}">${l}</button>`).join('')}</div></div>` : '';
    const title = mode === 'add' ? 'Add a book' : table === 'sales' ? 'Edit listing' : 'Edit details';
    sheet(`<div class="sheet-head"><h3 id="sheetTitle">${title}</h3>${closeBtn}</div>
      <div class="field"><label for="olq">Find it online</label>
        <div class="search"><span class="muted">${ic('search')}</span><input id="olq" type="search" placeholder="Title, author or ISBN" value="${esc(q)}" autocomplete="off" ${mode === 'add' && !row.title ? 'autofocus' : ''}><button type="button" class="scanbtn" data-a="scan" aria-label="Scan a barcode">${ic('scan')}</button></div>
        <span class="help">Pick a result to fill in the cover and details.</span></div>
      <div class="olist" id="olist"></div>
      <form class="form" id="bookForm" novalidate style="margin-top:18px">
        ${dest}
        <div style="display:flex;gap:12px;align-items:flex-end"><span id="fcov">${cover({ title: row.title || '', author: row.author || '', cover_url: F.cover_url }, 'md')}</span>
          <div class="field" style="flex:1;min-width:0"><label for="ft">Title *</label><input id="ft" name="title" required value="${esc(row.title)}" autocomplete="off"></div></div>
        <span class="errbox" id="ferr" hidden>Add a title so you can find this book later.</span>
        <button type="button" class="ghost" data-a="form-cover" style="justify-self:start">${ic('image')}Choose a different cover</button>
        <div id="fcp" hidden></div>
        <div id="fdup"></div>
        <div class="field"><label for="fa">Author</label><input id="fa" name="author" value="${esc(row.author)}" autocomplete="off"></div>
        <div class="row3" id="fseries">
          <div class="field"><label for="fs">Series</label><input id="fs" name="series" value="${esc(row.series)}" placeholder="e.g. The Mortal Instruments" list="serieslist" autocomplete="off"></div>
          <div class="field"><label for="fn">Book #</label><input id="fn" name="series_no" type="number" inputmode="numeric" min="1" value="${esc(row.series_no)}"></div>
          <div class="field" id="ftotwrap"><label for="fto">Of</label><input id="fto" name="series_total" type="number" inputmode="numeric" min="1" value="${esc(row.series_total)}"></div>
        </div>
        <datalist id="serieslist">${[...new Set(S.books.map((b) => b.series).filter(Boolean))].map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
        <div class="form" id="fsale">
          <div class="row2">
            <div class="field"><label for="fp">Price (${esc(CUR[S.settings.currency] || S.settings.currency)})</label><input id="fp" name="price" type="number" inputmode="decimal" min="0" step="any" value="${esc(row.price)}"></div>
            <div class="field"><label for="fc">Condition</label><select id="fc" name="condition">${['like new', 'good', 'worn'].map((c) => `<option value="${c}" ${row.condition === c || (!row.condition && c === 'good') ? 'selected' : ''}>${cap(c)}</option>`).join('')}</select></div>
          </div>
          <div class="field"><label for="fnote">Note</label><input id="fnote" name="note" value="${esc(row.note)}" placeholder="e.g. Slight crease on the spine" autocomplete="off"></div>
          ${mode === 'edit' ? `<div class="field"><label for="fst">Status</label><select id="fst" name="status">${['available', 'reserved', 'sold'].map((s) => `<option value="${s}" ${row.status === s ? 'selected' : ''}>${cap(s)}</option>`).join('')}</select></div>` : ''}
        </div>
        <button class="primary wide" type="submit" id="fsave">Save</button>
        ${mode === 'edit' && table === 'sales' ? `<button type="button" class="ghost danger" data-a="del-sale" data-id="${row.id}">Delete listing</button>` : ''}
      </form>`);
    syncDest();
    dupCheck();
    if (q) searchOnline(q);
  }
  function syncDest() {
    if (!F) return;
    $('#fseries').hidden = F.table === 'sales';
    $('#ftotwrap').hidden = F.table === 'wishlist';
    $('#fseries').style.gridTemplateColumns = F.table === 'wishlist' ? '2fr 1fr' : '';
    $('#fsale').hidden = F.table !== 'sales';
    $('#fsave').textContent = F.mode === 'edit' ? 'Save changes' : { books: 'Add to library', wishlist: 'Add to wishlist', sales: 'List for sale' }[F.table];
    document.querySelectorAll('[data-a=dest]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.dest === F.table));
    dupCheck();
  }
  function dupCheck() {
    const box = $('#fdup'); if (!box) return;
    const t = norm($('#ft').value);
    if (F.mode !== 'add' || F.table === 'sales' || t.length < 3) { box.innerHTML = ''; return; }
    const same = S.books.find((b) => norm(b.title) === t || (F.isbn && b.isbn === F.isbn));
    box.innerHTML = same ? `<div class="warnbox">${ic('info')} You already own "${esc(same.title)}".</div>` : '';
  }
  function setCoverPreview() { $('#fcov').innerHTML = cover({ title: $('#ft').value, author: $('#fa').value, cover_url: F.cover_url }, 'md'); }

  async function olSearch(q) {
    const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=title,author_name,cover_i,isbn,first_publish_year&limit=8`);
    const j = await r.json();
    return (j.docs || []).map((d) => ({
      title: d.title, author: d.author_name?.[0] || '', year: d.first_publish_year,
      isbn: (d.isbn || []).find((x) => x.length === 13) || d.isbn?.[0] || null,
      cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    }));
  }
  async function isbnLookup(isbn) {
    try {
      const r = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}&fields=title,author_name,cover_i&limit=1`);
      const d = (await r.json()).docs?.[0];
      if (d) return { isbn, title: d.title, author: d.author_name?.[0] || '', cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false` };
    } catch { /* fall through to Google Books */ }
    try {
      const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const v = (await r.json()).items?.[0]?.volumeInfo;
      if (v) return { isbn, title: v.title, author: v.authors?.[0] || '', cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') || null };
    } catch { /* not found */ }
    return null;
  }
  const isIsbn = (s) => /^(97[89])?\d{9}[\dX]$/i.test(s.replace(/[-\s]/g, ''));

  let olResults = [];
  async function searchOnline(q) {
    const box = $('#olist'); if (!box) return;
    q = q.trim();
    if (q.length < 2) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="scanmsg" style="display:flex;justify-content:center"><span class="spinner"></span></div>';
    try {
      if (isIsbn(q)) { const r = await isbnLookup(q.replace(/[-\s]/g, '')); olResults = r ? [r] : []; }
      else olResults = await olSearch(q);
    } catch { box.innerHTML = '<p class="errbox">Couldn\'t reach the book database. Fill in the details below instead.</p>'; return; }
    if ($('#olq')?.value.trim() !== q) return;
    box.innerHTML = olResults.length
      ? olResults.map((r, i) => `<button type="button" class="opick" data-a="pick" data-i="${i}">${cover(r, 'sm')}<span class="grow"><span class="t" style="display:block">${esc(r.title)}</span><small>${esc(r.author)}${r.year ? ` · ${r.year}` : ''}</small></span></button>`).join('')
      : '<p class="muted" style="font-size:15px">No matches. Fill in the details below.</p>';
  }

  async function submitForm() {
    const fd = Object.fromEntries(new FormData($('#bookForm')));
    if (!fd.title?.trim()) { $('#ferr').hidden = false; $('#ft').focus(); return; }
    const base = { title: fd.title.trim(), author: fd.author?.trim() || null, isbn: F.isbn, cover_url: F.cover_url };
    let row;
    if (F.table === 'books') row = { ...base, series: fd.series?.trim() || null, series_no: num(fd.series_no), series_total: num(fd.series_total) };
    if (F.table === 'wishlist') row = { ...base, series: fd.series?.trim() || null, series_no: num(fd.series_no) };
    if (F.table === 'sales') { row = { ...base, price: num(fd.price), condition: fd.condition, note: fd.note?.trim() || null }; if (fd.status) row.status = fd.status; }
    const btn = $('#fsave'); btn.disabled = true; btn.textContent = 'Saving…';
    const q = F.mode === 'add' ? sb.from(F.table).insert(row) : sb.from(F.table).update(row).eq('id', F.id);
    if (!(await save(q))) { btn.disabled = false; syncDest(); return; }
    cacheCovers();
    if (F.mode === 'add') log({ books: `Added ${row.title}`, wishlist: `Added ${row.title} to the wishlist`, sales: `Listed ${row.title} for sale` }[F.table], row.cover_url);
    const msg = F.mode === 'edit' ? 'Saved' : { books: `Added ${row.title} to your library`, wishlist: `Added ${row.title} to your wishlist`, sales: `Listed ${row.title} for sale` }[F.table];
    const goTab = F.mode === 'add' ? { books: 'shelf', wishlist: 'wish', sales: 'sale' }[F.table] : S.tab;
    closeSheet(); S.tab = goTab; setHash(goTab);
    await load(); toast(msg);
  }

  // Copy any newly saved outside cover into our own storage (runs in the background, then refreshes)
  function cacheCovers() {
    if (!S.admin) return;
    sb.functions.invoke('cache-covers').then(({ data }) => { if (data?.cached) load(); }).catch(() => {});
  }

  // ---------- cover picker ----------
  let CP = null;
  const olCover = (id) => `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
  async function coverOptions(title, author) {
    const enc = encodeURIComponent, found = [];
    const ol = (async () => {
      const r = await fetch(`https://openlibrary.org/search.json?title=${enc(title)}${author ? `&author=${enc(author)}` : ''}&fields=key,cover_i&limit=3`);
      const docs = (await r.json()).docs || [];
      docs.forEach((d) => d.cover_i && found.push(olCover(d.cover_i)));
      if (docs[0]?.key) {
        const e = await (await fetch(`https://openlibrary.org${docs[0].key}/editions.json?limit=80`)).json();
        (e.entries || []).forEach((en) => (en.covers || []).filter((c) => c > 0).forEach((c) => found.push(olCover(c))));
      }
    })().catch(() => {});
    const gb = (async () => {
      const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${enc(title)}${author ? `+inauthor:${enc(author)}` : ''}&maxResults=15`);
      ((await r.json()).items || []).forEach((it) => {
        const u = it.volumeInfo?.imageLinks?.thumbnail;
        if (u) found.push(u.replace('http:', 'https:').replace('&edge=curl', ''));
      });
    })().catch(() => {});
    await Promise.all([ol, gb]);
    return [...new Set(found)].slice(0, 60);
  }

  async function mountCoverPicker(el, { title, author, current, onPick }) {
    CP = { onPick };
    el.innerHTML = `<div class="cp-tools"><button type="button" class="ghost" data-a="cp-upload">${ic('camera')}Upload a photo</button><button type="button" class="ghost" data-a="cp-pick" data-u="">No cover</button>
      <input type="file" id="cpfile" accept="image/*" hidden></div>
      <p class="cp-msg muted" id="cpmsg">Finding covers for "${esc(title)}"…</p><div class="cp-grid" id="cpgrid"></div>`;
    if (!title.trim()) { $('#cpmsg').textContent = 'Type the title first, or upload a photo of your copy.'; return; }
    const opts = await coverOptions(title, author);
    if (!el.isConnected) return;
    $('#cpmsg').textContent = opts.length ? 'Tap the one that matches your copy.' : 'No covers found online. Upload a photo of your copy instead.';
    $('#cpgrid').innerHTML = opts.map((u) => `<button type="button" class="cp-opt" data-a="cp-pick" data-u="${esc(u)}" aria-pressed="${u === current}"><img loading="lazy" decoding="async" alt="Cover option" src="${esc(fast(u, 200))}" data-o="${esc(u)}" onload="if(this.naturalWidth<5)this.parentNode.remove()" onerror="${FALLBACK}this.parentNode.remove()}"></button>`).join('');
  }

  async function resizeImage(file, maxW = 600) {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxW / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
  }
  async function uploadCover(file) {
    const blob = await resizeImage(file);
    const path = `${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from('covers').upload(path, blob, { contentType: 'image/jpeg' });
    if (error) throw error;
    return sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
  }

  function openCoverSheet(id) {
    const b = findBook(id); if (!b) return;
    sheet(`<div class="sheet-head"><h3 id="sheetTitle">Pick a cover</h3>${closeBtn}</div>
      <p class="muted" style="margin:-8px 0 12px">${esc(b.title)}</p><div id="cpwrap"></div>
      <div class="sheet-actions"><button class="ghost" data-a="open" data-id="${b.id}">Back</button></div>`);
    mountCoverPicker($('#cpwrap'), {
      title: b.title, author: b.author, current: b.cover_src || b.cover_url,
      onPick: async (url) => {
        if (!(await save(sb.from('books').update({ cover_url: url || null, cover_src: null }).eq('id', b.id)))) return;
        cacheCovers();
        await load(); openBook(b.id); toast('Cover updated');
      },
    });
  }

  // ---------- scanner ----------
  let scanner = null, scanDone = false;
  async function openScanner() {
    scanDone = false;
    sheet(`<div class="sheet-head"><h3 id="sheetTitle">Scan a barcode</h3>${closeBtn}</div>
      <div class="finder"><div id="reader"></div><span id="camwait" style="position:absolute">Starting camera…</span></div>
      <p class="scanmsg" id="scanmsg">Point the camera at the barcode on the back cover.</p>
      <form id="isbnForm" style="display:flex;gap:8px"><label for="isbnIn" class="sr">ISBN</label><input id="isbnIn" class="inline-input" inputmode="numeric" placeholder="Or type the ISBN" autocomplete="off"><button class="ghost" type="submit">Check</button></form>
      <div id="scanres" style="margin-top:14px"></div>`);
    try {
      if (!window.Html5Qrcode) await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');
      if (!document.body.classList.contains('open') || !$('#reader')) return;
      const fmts = window.Html5QrcodeSupportedFormats;
      scanner = new Html5Qrcode('reader', { verbose: false, formatsToSupport: [fmts.EAN_13, fmts.EAN_8, fmts.UPC_A] });
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: (w, h) => ({ width: Math.floor(Math.min(w * 0.85, 320)), height: Math.floor(Math.min(h * 0.45, 150)) }) }, onScan, () => {});
      $('#camwait')?.remove();
    } catch (err) {
      $('#camwait') && ($('#camwait').textContent = 'Camera not available');
      $('#scanmsg').textContent = "Couldn't open the camera. Allow camera access in your browser settings, or type the ISBN below.";
    }
  }
  function stopScanner() {
    if (scanner) { const s = scanner; scanner = null; s.isScanning ? s.stop().then(() => s.clear()).catch(() => {}) : s.clear?.(); }
  }
  function onScan(code) {
    if (scanDone) return; scanDone = true;
    navigator.vibrate?.(60);
    stopScanner();
    checkIsbn(code);
  }
  async function checkIsbn(raw) {
    const isbn = String(raw).replace(/[^\dX]/gi, '');
    $('#scanmsg').textContent = `Barcode ${isbn}. Looking it up…`;
    $('#scanres').innerHTML = '<div style="display:flex;justify-content:center"><span class="spinner"></span></div>';
    const local = S.books.find((b) => b.isbn === isbn) || S.wish.find((w) => w.isbn === isbn);
    const info = local || (await isbnLookup(isbn)) || { isbn, title: '', author: '', cover_url: null };
    info.isbn = info.isbn || isbn;
    const own = S.books.find((b) => (b.isbn && b.isbn === isbn) || (info.title && norm(b.title) === norm(info.title)));
    const wish = S.wish.find((w) => (w.isbn && w.isbn === isbn) || (info.title && norm(w.title) === norm(info.title)));
    S.pending = { title: info.title, author: info.author, isbn: info.isbn, cover_url: info.cover_url, series: info.series, series_no: info.series_no };
    $('#scanmsg').textContent = info.title ? 'Found it.' : `Couldn't find barcode ${isbn} in the book databases.`;
    let h;
    if (own) h = `<div class="verdict own">${cover(own, 'md')}<span class="grow"><span class="head">${ic('check')} ${S.admin ? "Don't buy, you own this" : `${esc(name())} already has this`}</span>${esc(own.title)}<small>${esc(seriesLine(own))} · ${cap(own.status)}</small></span></div>`;
    else if (wish) h = `<div class="verdict wish">${cover(wish, 'md')}<span class="grow"><span class="head">${ic('wish')} Buy it! It's on your wishlist</span>${esc(wish.title)}<small>${esc(seriesLine(wish))}${fillsGap(wish) ? ' · fills a gap in your series' : ''}</small></span></div>`;
    else h = `<div class="verdict no">${info.title ? cover(info, 'md') : `<span class="muted">${ic('info')}</span>`}<span class="grow"><span class="head">Not in the library</span>${esc(info.title || 'Unknown book')}<small>${esc(info.author || '')}${info.title ? ' · safe to buy' : ''}</small></span></div>`;
    const acts = S.admin && !own ? `<div class="filters" style="margin-top:10px">${wish ? `<button class="primary" data-a="got" data-id="${wish.id}">${ic('check')}Bought it</button>` : `<button class="primary" data-a="add-pending" data-dest="books">Add to library</button><button class="ghost" data-a="add-pending" data-dest="wishlist">Add to wishlist</button>`}</div>` : '';
    $('#scanres').innerHTML = h + acts + `<button class="ghost" data-a="scan" style="margin-top:10px">${ic('scan')}Scan another</button>`;
  }

  // ---------- account ----------
  function openAccount(mode = 'login') {
    if (!S.user) {
      const create = mode === 'create';
      sheet(`<div class="sheet-head"><h3 id="sheetTitle">${create ? 'Create your password' : 'Owner login'}</h3>${closeBtn}</div>
        <p class="muted" style="margin-bottom:14px">${create ? 'First time here? Use the email you gave for this library and choose a password.' : `Only ${esc(name())} can add or edit books.`}</p>
        <form id="loginForm" class="form" data-mode="${mode}">
          <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required autofocus></div>
          <div class="field"><label for="pw">Password</label><input id="pw" name="password" type="password" autocomplete="${create ? 'new-password' : 'current-password'}" minlength="8" required>${create ? '<span class="help">At least 8 characters.</span>' : ''}</div>
          ${create ? '<div class="field"><label for="pw2">Type it again</label><input id="pw2" name="password2" type="password" autocomplete="new-password" required></div>' : ''}
          <span class="errbox" id="loginErr" role="alert" hidden></span>
          <button class="primary wide" type="submit" id="loginBtn">${create ? 'Create password and log in' : 'Log in'}</button>
        </form>
        <p style="margin-top:14px;display:flex;justify-content:center;gap:18px;flex-wrap:wrap"><button class="link" data-a="account-mode" data-mode="${create ? 'login' : 'create'}">${create ? 'Already have a password? Log in' : 'First time? Create your password'}</button>${create ? '' : '<button class="link" data-a="forgot">Forgot password?</button>'}</p>`);
      return;
    }
    if (!S.admin) {
      sheet(`<div class="sheet-head"><h3 id="sheetTitle">Signed in</h3>${closeBtn}</div><p>You're signed in as <b>${esc(S.user.email)}</b>, but this email can't edit this library.</p><div class="sheet-actions"><button class="ghost" data-a="logout">Log out</button></div>`);
      return;
    }
    const st = S.settings;
    sheet(`<div class="sheet-head"><h3 id="sheetTitle">Settings</h3>${closeBtn}</div>
      <form id="setForm" class="form">
        <div class="field"><label for="sname">Your name</label><input id="sname" name="display_name" value="${esc(st.display_name)}" required></div>
        <div class="field"><label for="swa">WhatsApp number</label><input id="swa" name="whatsapp" type="tel" inputmode="tel" value="${esc(st.whatsapp)}" placeholder="94771234567"><span class="help">Include the country code. Visitors see an "Ask on WhatsApp" button on books for sale. Leave empty to hide it.</span></div>
        <div class="field"><label for="scur">Currency</label><select id="scur" name="currency">${Object.keys(CUR).map((c) => `<option value="${c}" ${st.currency === c ? 'selected' : ''}>${c} (${CUR[c]})</option>`).join('')}</select></div>
        <button class="primary wide" type="submit">Save settings</button>
      </form>
      <details class="pwbox"><summary>${ic('key')}Change my password</summary>
        <form id="pwForm" class="form"><div class="field"><label for="npw">New password</label><input id="npw" type="password" autocomplete="new-password" minlength="8" required><span class="help">At least 8 characters.</span></div>
        <div class="field"><label for="npw2">Type it again</label><input id="npw2" type="password" autocomplete="new-password" required></div>
        <span class="errbox" id="pwErr" role="alert" hidden></span><button class="primary wide" type="submit">Change password</button></form></details>
      <details class="pwbox"><summary>${ic('key')}Reset another owner's password</summary>
        <p class="muted" style="margin:8px 14px 12px">For when the other owner forgets theirs. Set a new password here, send it to them, and they can change it in their own Settings.</p>
        <form id="resetForm" class="form"><div class="field"><label for="remail">Their email</label><input id="remail" type="email" autocomplete="off" required></div>
        <div class="field"><label for="rpw">New password for them</label><input id="rpw" type="text" autocomplete="off" minlength="8" required><span class="help">At least 8 characters. Shown as text so you can copy it.</span></div>
        <span class="errbox" id="resetErr" role="alert" hidden></span><button class="primary wide" type="submit">Set their password</button></form></details>
      <div class="sheet-actions"><span class="muted" style="flex:1">${esc(S.user.email)}</span><button class="ghost" data-a="logout">Log out</button></div>`);
  }

  // ---------- toast ----------
  let undoFn = null, toastT;
  function toast(msg, undo) {
    undoFn = undo || null;
    $('#toast .msg').textContent = msg;
    $('#undoBtn').hidden = !undo;
    $('#toast').classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => $('#toast').classList.remove('show'), undo ? 5000 : 3500);
  }
  $('#undoBtn').addEventListener('click', async () => { $('#toast').classList.remove('show'); const f = undoFn; undoFn = null; if (f) { await f(); await load(); } });

  // ---------- actions ----------
  const A = {
    tab: (t) => { S.tab = t.dataset.tab; setHash(S.tab); renderNav(); renderView(); if (window.innerWidth < 768) window.scrollTo({ top: $('#main').getBoundingClientRect().top + window.scrollY - $('.finderbar').offsetHeight - 8, behavior: 'smooth' }); },
    filter: (t) => { S.filter = t.dataset.f; renderView(); },
    open: (t) => openBook(t.dataset.id),
    close: () => closeSheet(),
    scan: () => openScanner(),
    account: () => openAccount(),
    'account-mode': (t) => openAccount(t.dataset.mode),
    logout: async () => { closeSheet(); await sb.auth.signOut(); toast('Logged out'); },
    add: (t) => openForm({ table: t.dataset.dest || 'books', q: t.dataset.q || '' }),
    'add-pending': (t) => openForm({ table: t.dataset.dest, row: S.pending || {} }),
    dest: (t) => { F.table = t.dataset.dest; syncDest(); },
    pick: (t) => {
      const r = olResults[+t.dataset.i]; if (!r) return;
      $('#ft').value = r.title || ''; $('#fa').value = r.author || '';
      F.cover_url = r.cover_url; F.isbn = r.isbn;
      $('#ferr').hidden = true; setCoverPreview(); dupCheck();
      $('#olist').innerHTML = `<p class="muted" style="font-size:15px">Filled in from Open Library. Add the series below if it's part of one.</p>`;
      $('#fs').focus({ preventScroll: true });
    },
    edit: (t) => openForm({ mode: 'edit', table: 'books', row: findBook(t.dataset.id) }),
    'edit-sale': (t) => openForm({ mode: 'edit', table: 'sales', row: S.sales.find((s) => s.id === t.dataset.id) }),
    sell: (t) => { const b = findBook(t.dataset.id); openForm({ table: 'sales', row: { title: b.title, author: b.author, isbn: b.isbn, cover_url: b.cover_url } }); },
    status: async (t) => {
      const b = findBook(t.dataset.id), prev = b.status, st = t.dataset.st;
      if (prev === st) return;
      const patch = { status: st }; if (st === 'read') patch.progress = 100; if (st === 'reading' && (prev === 'read' || !b.progress)) patch.progress = 0;
      Object.assign(b, patch); openBook(b.id); renderSide(); renderView();
      if (!(await save(sb.from('books').update(patch).eq('id', b.id)))) { openBook(b.id); return; }
      if (st === 'read') log(`Finished ${b.title}`, b.cover_url);
      if (st === 'reading') log(`Started ${b.title}`, b.cover_url);
      if (st === 'read') toast(`Marked ${b.title} as read`, () => sb.from('books').update({ status: prev }).eq('id', b.id));
    },
    rate: async (t) => {
      const b = findBook(t.dataset.id), r = +t.dataset.r; b.rating = b.rating === r ? 0 : r;
      openBook(b.id); if (!(await save(sb.from('books').update({ rating: b.rating }).eq('id', b.id)))) openBook(b.id);
    },
    lend: async (t) => {
      const input = $('#lendto'), who = input.value.trim();
      if (!who) { input.focus(); input.placeholder = 'Type a name first'; return; }
      const b = findBook(t.dataset.id);
      if (!(await save(sb.from('lending').upsert({ book_id: b.id, borrower: who, lent_on: new Date().toISOString().slice(0, 10) })))) return;
      await save(sb.from('books').update({ is_lent: true }).eq('id', b.id));
      log(`Lent ${b.title} to ${who}`, b.cover_url);
      await load(); openBook(b.id);
      toast(`Lent to ${who}`, async () => { await sb.from('lending').delete().eq('book_id', b.id); await sb.from('books').update({ is_lent: false }).eq('id', b.id); });
    },
    return: async (t) => {
      const b = findBook(t.dataset.id), l = S.lending[b.id];
      await save(sb.from('lending').delete().eq('book_id', b.id));
      await save(sb.from('books').update({ is_lent: false }).eq('id', b.id));
      log(`${b.title} came back${l ? ` from ${l.borrower}` : ''}`, b.cover_url);
      await load(); openBook(b.id); toast('Marked as returned');
    },
    del: async (t) => {
      if (!t.classList.contains('armed')) { t.classList.add('armed'); t.textContent = 'Tap again to delete'; setTimeout(() => { if (t.isConnected) { t.classList.remove('armed'); t.textContent = 'Delete'; } }, 4000); return; }
      const b = { ...findBook(t.dataset.id) };
      closeSheet();
      if (!(await save(sb.from('books').delete().eq('id', b.id)))) return;
      await load();
      toast(`Deleted ${b.title}`, () => sb.from('books').insert({ ...b, is_lent: false }));
    },
    cover: (t) => openCoverSheet(t.dataset.id),
    'sv-find': (t) => { const q = $('#q'); q.value = t.dataset.q; S.q = q.value; renderResults(); searchSarasavi(); window.scrollTo({ top: 0, behavior: 'smooth' }); q.focus({ preventScroll: true }); },
    forgot: () => sheet(`<div class="sheet-head"><h3 id="sheetTitle">Forgot your password?</h3>${closeBtn}</div>
      <p>Ask the other owner of this library to reset it:</p>
      <ol class="steps"><li>They log in and tap the round initial at the top.</li><li>They open <b>Reset another owner's password</b>, enter your email and a new password, and send it to you.</li><li>You log in with it, then change it under <b>Change my password</b>.</li></ol>
      <div class="sheet-actions"><button class="ghost" data-a="account-mode" data-mode="login">Back to login</button></div>`),
    'cp-pick': (t) => CP?.onPick(t.dataset.u || null),
    'cp-upload': () => $('#cpfile')?.click(),
    'form-cover': () => {
      const box = $('#fcp');
      box.hidden = !box.hidden;
      if (box.hidden) return;
      mountCoverPicker(box, {
        title: $('#ft').value, author: $('#fa').value, current: F.cover_url,
        onPick: (url) => { F.cover_url = url; setCoverPreview(); box.hidden = true; toast(url ? 'Cover picked. Save to keep it.' : 'Cover removed. Save to keep it.'); },
      });
    },
    'del-sale': async (t) => {
      if (!t.classList.contains('armed')) { t.classList.add('armed'); t.textContent = 'Tap again to delete'; return; }
      const s = { ...S.sales.find((x) => x.id === t.dataset.id) };
      closeSheet();
      if (!(await save(sb.from('sales').delete().eq('id', s.id)))) return;
      await load(); toast(`Removed ${s.title} from sale`, () => sb.from('sales').insert(s));
    },
    'sale-status': async (t) => {
      const s = S.sales.find((x) => x.id === t.dataset.id), prev = s.status;
      s.status = t.dataset.st; renderView();
      if (!(await save(sb.from('sales').update({ status: s.status }).eq('id', s.id)))) return;
      if (s.status === 'sold') log(`Sold ${s.title}`, s.cover_url);
      toast(`Marked ${s.title} as ${s.status}`, () => sb.from('sales').update({ status: prev }).eq('id', s.id));
    },
    got: async (t) => {
      const w = S.wish.find((x) => x.id === t.dataset.id); if (!w) return;
      const row = { title: w.title, author: w.author, isbn: w.isbn, cover_url: w.cover_url, series: w.series, series_no: w.series_no };
      const { data, error } = await sb.from('books').insert(row).select().single();
      if (error) { toast(`Couldn't add it: ${error.message}`); return; }
      await save(sb.from('wishlist').delete().eq('id', w.id));
      log(`Added ${w.title}`, w.cover_url); cacheCovers();
      closeSheet(); await load();
      toast(`${w.title} moved to your library`, async () => { await sb.from('books').delete().eq('id', data.id); await sb.from('wishlist').insert(w); });
    },
    'wish-del': async (t) => {
      const w = { ...S.wish.find((x) => x.id === t.dataset.id) };
      if (!(await save(sb.from('wishlist').delete().eq('id', w.id)))) return;
      await load(); toast(`Removed ${w.title}`, () => sb.from('wishlist').insert(w));
    },
    copylink: async () => {
      const link = `${location.origin}${location.pathname}#sale`;
      try { await navigator.clipboard.writeText(link); toast('Link copied. Paste it in WhatsApp or Instagram.'); }
      catch { toast(link); }
    },
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-a]');
    if (t && A[t.dataset.a]) { e.preventDefault(); A[t.dataset.a](t, e); return; }
    if (e.target.id === 'scrim') closeSheet();
  });
  $('#avatar').addEventListener('click', () => openAccount());
  window.addEventListener('hashchange', () => {
    const t = location.hash.slice(1);
    if (TABS[t] && (S.admin || PUBLIC_TABS.includes(t)) && t !== S.tab) { S.tab = t; renderNav(); renderView(); }
  });
  $('#addBtn').addEventListener('click', () => openForm());
  $('#scanBtn').addEventListener('click', openScanner);
  // Shadow under the search bar once it sticks to the top on phones
  new IntersectionObserver(([e]) => $('.finderbar').classList.toggle('stuck', !e.isIntersecting)).observe($('.top'));
  $('#q').addEventListener('input', (e) => { S.q = e.target.value; renderResults(); searchSarasavi(); });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'olq') { clearTimeout(olTimer); const v = e.target.value; olTimer = setTimeout(() => searchOnline(v), 380); }
    if (e.target.id === 'ft') { $('#ferr').hidden = true; dupCheck(); }
    if (e.target.id === 'prog') $('#progv').textContent = `${e.target.value}%`;
  });
  document.addEventListener('change', async (e) => {
    if (e.target.id === 'sortSel') {
      S.sort = e.target.value;
      try { localStorage.setItem('shelfSort', S.sort); } catch { /* private mode: keep for this visit only */ }
      renderView(); $('#sortSel')?.focus();
      return;
    }
    if (e.target.id === 'cpfile' && e.target.files[0]) {
      const msg = $('#cpmsg');
      msg.textContent = 'Uploading your photo…';
      try { const url = await uploadCover(e.target.files[0]); await CP?.onPick(url); }
      catch (err) { msg.textContent = /permission|row-level|unauthor/i.test(err.message || '') ? 'Only the owner can upload covers. Log in and try again.' : `Couldn't upload that photo: ${err.message}`; }
      return;
    }
    if (e.target.id === 'prog') {
      const b = findBook(e.target.dataset.id); b.progress = +e.target.value; renderSide();
      await save(sb.from('books').update({ progress: b.progress }).eq('id', b.id));
    }
  });
  document.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (e.target.id === 'bookForm') submitForm();
    if (e.target.id === 'isbnForm') { const v = $('#isbnIn').value.trim(); if (v) { scanDone = true; stopScanner(); checkIsbn(v); } }
    if (e.target.id === 'loginForm') {
      const create = e.target.dataset.mode === 'create';
      const email = $('#email').value.trim(), password = $('#pw').value, btn = $('#loginBtn'), err = $('#loginErr');
      const fail = (msg) => { err.hidden = false; err.textContent = msg; btn.disabled = false; btn.textContent = create ? 'Create password and log in' : 'Log in'; };
      if (!email.includes('@')) return fail('Enter a full email address.');
      if (password.length < 8) return fail('The password needs at least 8 characters.');
      if (create && password !== $('#pw2').value) return fail("The two passwords don't match. Type them again.");
      btn.disabled = true; btn.textContent = create ? 'Creating…' : 'Logging in…';
      if (create) {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) {
          if (/already|registered/i.test(error.message)) return fail('This email already has a password. Use "Log in" instead.');
          if (/database error|owner/i.test(error.message)) return fail("This email isn't set up as an owner of this library.");
          // Other errors (e.g. the welcome email failing to send) can still leave a usable account, so try logging in.
        }
      }
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return fail(/invalid/i.test(error.message) ? "That email and password don't match. Check for typos and try again." : `Couldn't log in: ${error.message}`);
      closeSheet(); toast(`Welcome, ${name()}!`);
    }
    if (e.target.id === 'pwForm') {
      const p1 = $('#npw').value, p2 = $('#npw2').value, err = $('#pwErr');
      const fail = (m) => { err.hidden = false; err.textContent = m; };
      if (p1.length < 8) return fail('The password needs at least 8 characters.');
      if (p1 !== p2) return fail("The two passwords don't match. Type them again.");
      const { error } = await sb.auth.updateUser({ password: p1 });
      if (error) return fail(`Couldn't change it: ${error.message}`);
      closeSheet(); toast('Password changed');
    }
    if (e.target.id === 'resetForm') {
      const email = $('#remail').value.trim(), password = $('#rpw').value, err = $('#resetErr'), btn = e.target.querySelector('button[type=submit]');
      const fail = (m) => { err.hidden = false; err.textContent = m; btn.disabled = false; btn.textContent = 'Set their password'; };
      if (!email.includes('@')) return fail('Enter their full email address.');
      if (password.length < 8) return fail('The new password needs at least 8 characters.');
      btn.disabled = true; btn.textContent = 'Saving…';
      const { data, error } = await sb.functions.invoke('reset-owner-password', { body: { email, password } });
      if (error) {
        let msg = error.message;
        try { msg = (await error.context.json()).error || msg; } catch { /* keep generic message */ }
        return fail(msg);
      }
      if (data?.ok) { closeSheet(); toast(`Done. Send ${email} their new password.`); }
    }
    if (e.target.id === 'setForm') {
      const fd = Object.fromEntries(new FormData(e.target));
      const row = { display_name: fd.display_name.trim() || 'Helli', whatsapp: fd.whatsapp.replace(/[^\d+]/g, '') || null, currency: fd.currency };
      if (!(await save(sb.from('settings').update(row).eq('id', 1)))) return;
      closeSheet(); await load(); toast('Settings saved');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('open')) closeSheet();
    if (e.key === 'Enter' && e.target.id === 'lendto') { e.preventDefault(); $('[data-a=lend]')?.click(); }
  });
})();
