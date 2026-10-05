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
  };
  const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

  const cover = (b, size = '') => {
    const spine = `<span class="spine"${b.cover_url ? ' hidden' : ''}><span>${esc(b.title)}</span><small>${esc(b.author)}</small></span>`;
    const img = b.cover_url
      ? `<img loading="lazy" alt="" src="${esc(b.cover_url)}" onload="if(this.naturalWidth<5){this.onerror()}else{this.classList.add('ld')}" onerror="this.previousElementSibling.hidden=false;this.remove()">`
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
    if (S.user) { const { data } = await sb.rpc('is_admin'); S.admin = data === true; }    if (!S.admin && !PUBLIC_TABS.includes(S.tab)) S.tab = 'shelf';
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
  function renderAll() { renderHeader(); renderSide(); renderNav(); renderView(); renderResults(); renderFoot(); }

  function renderHeader() {
    document.querySelectorAll('.owner-name').forEach((el) => { el.textContent = name(); });
    document.title = `${name()}'s Library`;
    $('#avatar').textContent = (S.user ? (S.user.email || 'H') : name())[0].toUpperCase();
    $('#avatar').setAttribute('aria-label', S.user ? 'Account and settings' : 'Owner login');
    $('#addBtn').hidden = !S.admin;
    $('.hello').textContent = S.admin ? `Hi ${name()}. Check before you buy.` : 'Check before you buy.';
  }

  function renderSide() {
    const read = S.books.filter((b) => b.status === 'read').length;
    const lent = S.books.filter((b) => b.is_lent).length;
    $('#stats').innerHTML = [[S.books.length, 'Books'], [read, 'Read'], [lent, 'Lent out']]
      .map(([n, l]) => `<div class="stat"><b data-n="${n}">${n}</b><span>${l}</span></div>`).join('');
    const reading = S.books.find((b) => b.status === 'reading');
    $('#now').innerHTML = reading ? `<button class="now" data-a="open" data-id="${reading.id}">${cover(reading, 'md')}<span style="flex:1;min-width:0"><span class="k">Currently reading</span><span class="t" style="display:block">${esc(reading.title)}</span><span class="bar" style="display:block"><i style="width:${reading.progress || 4}%"></i></span><small>${reading.progress || 0}% · ${esc(seriesLine(reading))}</small></span></button>` : '';
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
    const list = S.books.filter(F[S.filter]);
    const chips = [['all', 'All'], ['reading', 'Reading'], ['read', 'Read'], ['unread', 'Unread'], ['lent', 'Lent out']]
      .map(([k, l]) => `<button class="chip" data-a="filter" data-f="${k}" aria-pressed="${S.filter === k}">${l}</button>`).join('');
    if (!S.books.length) return `<h2>Shelf</h2>${empty('The shelf is empty', S.admin ? 'Scan a barcode or add your first book.' : 'No books yet. Check back soon.', S.admin ? `<button class="primary" data-a="add">${ic('plus')}Add a book</button>` : '')}`;
    return `<h2>Shelf <span>${S.books.length} book${S.books.length === 1 ? '' : 's'}</span></h2>
      <div class="filters" role="group" aria-label="Filter books">${chips}</div>
      ${list.length ? `<div class="shelf">${list.map((b, i) => `<button class="book" style="--i:${i}" data-a="open" data-id="${b.id}" aria-label="${esc(b.title)}${b.is_lent ? ', lent out' : ''}">${b.is_lent ? `<span class="badge lent">${ic('out')}</span>` : b.status === 'read' ? `<span class="badge read">${ic('check')}</span>` : b.status === 'reading' ? `<span class="badge reading">${ic('book')}</span>` : ''}${cover(b)}</button>`).join('')}</div>
      <div class="legend"><span><i style="background:var(--ok)"></i>Read</span><span><i style="background:var(--accent)"></i>Reading</span><span><i style="background:var(--warn)"></i>Lent out</span></div>`
        : empty('Nothing here', 'No books match this filter.')}`;
  }

  function viewSeries() {
    const names = [...new Set(S.books.map((b) => b.series).filter(Boolean))];
    if (!names.length) return `<h2>Series</h2>${empty('No series yet', 'Add a series name and number to a book and it shows up here, with any missing books.')}`;
    return `<h2>Series <span>dashed = not owned yet</span></h2>` + names.map((s, i) => {
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
    if (!list.length) return `<h2>For sale</h2>${tools}${empty('Nothing for sale right now', S.admin ? 'List a book and share the link with friends.' : 'Check back later.')}`;
    const statusPill = { available: '<span class="pill ok">Available</span>', reserved: '<span class="pill warn">Reserved</span>', sold: '<span class="pill grey">Sold</span>' };
    return `<h2>For sale <span>${avail} available</span></h2>${tools}
      <div class="cards">${list.map((s, i) => `<article class="item${s.status === 'sold' ? ' sold' : ''}" style="--i:${i}">${cover(s, 'md')}<div class="grow">
        <span class="t">${esc(s.title)}</span><span class="a">${esc(s.author)}</span>
        <span class="price">${esc(price(s.price))}</span>
        <span style="display:flex;gap:6px;flex-wrap:wrap">${statusPill[s.status]}<span class="pill lav">${esc(cap(s.condition))}</span></span>
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
    if (!S.wish.length) return `<h2>Wishlist <span>only you can see this</span></h2>${tools}${empty('Your wishlist is empty', 'Add books you want, and the search will remind you when you spot one in a shop.')}`;
    return `<h2>Wishlist <span>only you can see this</span></h2>${tools}<div class="cards">${S.wish.map((w, i) => `<article class="item" style="--i:${i}">${cover(w, 'md')}<div class="grow">
      <span class="t">${esc(w.title)}</span><span class="a">${esc(seriesLine(w))}</span>
      ${fillsGap(w) ? '<span class="pill lav">Fills a gap in your series</span>' : ''}
      <div class="actions"><button class="ghost" data-a="got" data-id="${w.id}">${ic('check')}Got it</button><button class="ghost" data-a="wish-del" data-id="${w.id}">Remove</button></div>
    </div></article>`).join('')}</div>`;
  }
  const fillsGap = (w) => w.series && S.books.some((b) => b.series === w.series) && !S.books.some((b) => b.series === w.series && b.series_no === w.series_no);

  function viewFeed() {
    if (!S.feed.length) return `<h2>Activity</h2>${empty('Nothing yet', 'Adding, finishing and lending books shows up here.')}`;
    return `<h2>Activity <span>only you can see this</span></h2><div class="feed">${S.feed.map((e, i) => `<div class="ev" style="--i:${i}">${cover({ title: '', author: '', cover_url: e.cover_url }, 'sm')}<div><p>${esc(e.text)}</p><time>${ago(e.created_at)}</time></div></div>`).join('')}</div>`;
  }

  const empty = (t, d, action = '') => `<div class="empty"><b>${t}</b><span>${d}</span>${action}</div>`;

  function renderResults() {
    const q = norm(S.q), box = $('#results');
    if (!q) { box.innerHTML = ''; return; }
    const tok = q.split(' ');
    const hit = (b) => tok.every((t) => norm(`${b.title} ${b.author} ${b.series || ''} ${b.isbn || ''}`).includes(t));
    const own = S.books.filter(hit).slice(0, 4), wish = S.wish.filter(hit).slice(0, 2), sale = S.sales.filter((s) => s.status !== 'sold' && hit(s)).slice(0, 2);
    let h = own.map((b) => `<button class="verdict own" data-a="open" data-id="${b.id}">${cover(b, 'sm')}<span class="grow"><span class="head">${ic('check')} ${S.admin ? 'You own this' : `${esc(name())} has this`}</span>${esc(b.title)}<small>${esc(seriesLine(b))}${b.is_lent ? ' · lent out' : ''}</small></span></button>`).join('');
    h += wish.map((w) => `<div class="verdict wish">${cover(w, 'sm')}<span class="grow"><span class="head">${ic('wish')} Not owned, on your wishlist</span>${esc(w.title)}<small>${esc(seriesLine(w))}${fillsGap(w) ? ' · fills a gap' : ''}</small></span></div>`).join('');
    h += sale.map((s) => `<button class="verdict sale" data-a="tab" data-tab="sale">${cover(s, 'sm')}<span class="grow"><span class="head">${ic('sale')} For sale · ${esc(price(s.price))}</span>${esc(s.title)}<small>${esc(cap(s.condition))}</small></span></button>`).join('');
    if (!own.length && !wish.length) h = `<div class="verdict no"><span class="muted">${ic('info')}</span><span class="grow"><span class="head">Not in the library</span><small>Nothing matches "${esc(S.q)}". ${S.admin ? 'Safe to buy.' : ''}</small></span>${S.admin ? `<button class="ghost" data-a="add" data-q="${esc(S.q)}">Add it</button>` : ''}</div>` + h;
    box.innerHTML = h;
  }

  // ---------- sheet ----------
  let lastFocus = null;
  const closeBtn = `<button class="close" data-a="close" aria-label="Close">${ic('x')}</button>`;
  function sheet(html) {
    if (!document.body.classList.contains('open')) lastFocus = document.activeElement;
    $('#sheet').innerHTML = `<div class="grab"></div>${html}`;
    document.body.classList.add('open');
    setTimeout(() => ($('#sheet [autofocus]') || $('#sheet .close'))?.focus({ preventScroll: true }), 50);
  }
  function closeSheet() {
    stopScanner();
    document.body.classList.remove('open');
    lastFocus?.focus?.({ preventScroll: true });
  }

  function openBook(id) {
    const b = findBook(id); if (!b) return;
    const l = S.lending[b.id];
    const head = `<div class="sheet-head"><span></span>${closeBtn}</div>
      <div class="detail">${cover(b, 'lg')}<div class="grow"><h3 id="sheetTitle">${esc(b.title)}</h3><p>${esc(b.author)}</p><p>${b.series ? `Book ${b.series_no || '?'}${b.series_total ? ` of ${b.series_total}` : ''} · ${esc(b.series)}` : 'Standalone'}</p></div></div>`;
    if (!S.admin) {
      sheet(`${head}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">${b.is_lent ? '<span class="pill warn">Lent out</span>' : '<span class="pill ok">On the shelf</span>'}<span class="pill lav">${cap(b.status)}</span>${b.rating ? stars(b.rating) : ''}</div>`);
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
    if (F.mode === 'add') log({ books: `Added ${row.title}`, wishlist: `Added ${row.title} to the wishlist`, sales: `Listed ${row.title} for sale` }[F.table], row.cover_url);
    const msg = F.mode === 'edit' ? 'Saved' : { books: `Added ${row.title} to your library`, wishlist: `Added ${row.title} to your wishlist`, sales: `Listed ${row.title} for sale` }[F.table];
    const goTab = F.mode === 'add' ? { books: 'shelf', wishlist: 'wish', sales: 'sale' }[F.table] : S.tab;
    closeSheet(); S.tab = goTab; history.replaceState(null, '', `#${goTab}`);
    await load(); toast(msg);
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
        <p style="margin-top:14px;text-align:center"><button class="link" data-a="account-mode" data-mode="${create ? 'login' : 'create'}">${create ? 'Already have a password? Log in' : 'First time? Create your password'}</button></p>`);
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
    tab: (t) => { S.tab = t.dataset.tab; history.replaceState(null, '', `#${S.tab}`); renderNav(); renderView(); if (window.innerWidth < 960) window.scrollTo({ top: $('#main').offsetTop - 12, behavior: 'smooth' }); },
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
      log(`Added ${w.title}`, w.cover_url);
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
  $('#addBtn').addEventListener('click', () => openForm());
  $('#scanBtn').addEventListener('click', openScanner);
  $('#q').addEventListener('input', (e) => { S.q = e.target.value; renderResults(); });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'olq') { clearTimeout(olTimer); const v = e.target.value; olTimer = setTimeout(() => searchOnline(v), 380); }
    if (e.target.id === 'ft') { $('#ferr').hidden = true; dupCheck(); }
    if (e.target.id === 'prog') $('#progv').textContent = `${e.target.value}%`;
  });
  document.addEventListener('change', async (e) => {
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
