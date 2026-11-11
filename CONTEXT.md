# Helli's Library: project context

Written 2026-11-11 after the laptop wipe and recovery. Read this first when resuming work.

## What it is

A personal book catalog for Helli. Main job: **never buy a duplicate**. Owners (Helli and one other person) edit; friends get a read-only link. Live at https://skypixeldigitals-max.github.io/hellis-library/ (GitHub Pages, repo `skypixeldigitals-max/hellis-library`, branch `main`, clean and in sync with origin at recovery time).

## How it fits together

| Layer | What |
|---|---|
| Frontend | Plain HTML/CSS/JS, no build step: `index.html`, `app.css` (~48 KB), `app.js` (~97 KB, one IIFE). Supabase JS 2.45.4 from jsDelivr. `?v=YYYYMMDDHHMM` query strings on the CSS/JS/config links are bumped by hand on each change so phones fetch fresh code (currently `202611081938`). |
| Config | `config.js` holds the Supabase URL and public anon key (safe to publish; RLS decides access). |
| Backend | Supabase project `hellis-library`, ref `qafobqzwtqixgowwptcg`. |
| Tables (public read, owner write) | `books`, `sales`, `settings` (single row `id=1`: display_name, currency LKR, whatsapp), `next_reads`. |
| Tables (owner only) | `wishlist`, `lending`, `activity`, `wishes` (wish jar). `admins` holds owner emails. `job_runs` is used by build-next-reads for rate limiting. |
| Auth | Email + password. A trigger on `auth.users` blocks emails not in `public.admins` and auto-confirms owners. RPC `is_admin()`. |
| Storage | Public `covers` bucket (WebP, 400px copies of covers). |
| Cron | `build-next-reads-daily` at 03:00 UTC (not verified after recovery). |
| External APIs | Open Library (search, covers), Google Books (barcode fallback), wsrv.nl image CDN (`fast()` in app.js), `html5-qrcode` for scanning. Sarasavi (Sri Lankan bookshop) is linked via its live search URL only. |

Edge functions (recovered source in `..\..\helli-library\supabase\functions`, not in this repo):

- `cache-covers`: copies cover URLs on books/wishlist/sales into the `covers` bucket, keeps original in `cover_src`. No input; batch of 24 per table. Called by the site after saves.
- `build-next-reads`: builds "Your next reads" from Open Library (unowned books in owned series, then top-6 authors, plus wishlist marked private). Rate-limited to once per 10 min via `job_runs`. Rewrites `next_reads` (delete all, insert up to 24).
- `reset-owner-password`: one owner resets another's password. Checks caller is in `admins`, target too, min 8 chars.
- `sync-sarasavi`: retired, returns 410 (Sarasavi sitemap links 404).

Frontend features in `app.js`: duplicate-check search with typo tolerance, barcode scan and typed add, duplicate warning on add, series tracker with gap flags, read status/rating/progress, shelf grid vs list with sort (Series/Author/Title/Recent), lending, private wishlist, For-sale list with WhatsApp "ask to borrow", activity feed with undo toasts, cover picker/photo upload, quote of the day, history-aware sheets with swipe-to-close and focus trap, "Your next reads" slideshow, Sarasavi search button.

Personal extras (only shown to Helli, detected by a SHA-256 of her email in `app.js`; added 2026-10-15 to 2026-11-08): little notes signed "– tea towel" (Mentalist-themed, button "aww rat"), a wish jar for the owners, a birthday countdown banner to 4 January (Sri Lanka time) with confetti cake and a rat that follows the cursor, can be petted and wanders. Preserve these.

`design/` holds the original clickable mockups (`mockups.html` artifact format, `index.html` built from it by `build-design.sh`). The recovered `..\..\helli-library\design-options-mockup` is an older copy (title "Helli's Library Designs", 11 covers vs this repo's 19, differing `index.html`); the repo version supersedes it.

## History in brief

2026-10-05: plan and mockups, then real site built (Cozy Lavender design, Supabase, for-sale list), email+password login, phone layout, cute details, cover picker. 2026-10-06: speed/responsive audit, own cover storage, password reset, Sarasavi search, next-reads slideshow. 2026-10-15: tea towel notes. 2026-11-08: wish jar, birthday banner and rat.

## Open items

From PLAN.md: it is the original v1 plan and is largely complete and stale. Unresolved in it: the "open questions" (GitHub username, old site code, Supabase account) are answered by the existing setup; step 9 (re-add the original 8 books) is moot (about 45 books now). The PLAN's `loans` table became `lending`, and magic-link login became email+password. Consider updating or archiving PLAN.md.

From AUDIT.md: all findings and follow-ups are marked fixed. No open items. Not yet audited since: the later additions (notes, jar, birthday banner, rat) for mobile, contrast and reduced-motion behaviour.

Found while recovering (not in either doc):

1. (Done locally, uncommitted) `supabase/functions/` and a reconstructed `supabase/schema.sql` were added to the repo on 2026-11-11; see `supabase/README.md`. The schema is reference only, not a tested restore. `admins` rows are not exported.
2. Verify live Supabase state matches expectations after the wipe: functions deployed, cron job present, `covers` bucket intact, owner logins work.
3. README doesn't mention the wish jar, notes or birthday features.
4. `sync-sarasavi` is retired dead code and could be deleted.
5. Dependence on third parties: wsrv.nl (fallback to original exists), Open Library rate limits.
6. The anon key in `config.js` expires 2036 (exp 2106787510 is about 2036); fine.
7. The cache-busting version in `index.html` is manual.

## Live Supabase check (2026-11-11, read-only)

Project `hellis-library` is ACTIVE_HEALTHY (ap-south-1, Postgres 17). All four edge functions are ACTIVE (cache-covers v2, reset-owner-password v1, sync-sarasavi v5, build-next-reads v4). Cron `build-next-reads-daily` (0 3 * * *) is active and last ran 2026-11-11 03:00 UTC. RLS is on for all 10 public tables. Rows: books 74, sales 3, activity 87, next_reads 44, wishes 5, settings 1, admins 2, lending 0, wishlist 0. 2 confirmed auth users. `covers` bucket is public with 90 objects, and no book has an uncached cover. Trigger `owner_signup_only` on auth.users and functions `handle_owner_signup` and `is_admin` exist. Nothing was lost in the wipe. (Not checked: deployed function source vs the recovered copy, and the login flow itself.)

## Constraints

No money features. Friends must never see borrower names, wishlist, wishes or edit controls. Don't push, commit, or change Supabase data without the user's go-ahead.
