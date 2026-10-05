# Helli's Library

A personal book catalog for checking that you don't already own a book before you buy it. Friends can browse the shelf and the books for sale; only the owner can edit.

**Live site:** https://skypixeldigitals-max.github.io/hellis-library/

## How it works

- `index.html`, `app.css`, `app.js`: the whole site, plain HTML/CSS/JS with no build step, hosted on GitHub Pages.
- `config.js`: Supabase project URL and the public anon key. The key is safe to publish; database rules decide what it can do.
- Data lives in Supabase (project `hellis-library`):
  - Public tables: `books`, `sales`, `settings`. Anyone can read them; only the owner can change them.
  - Private tables (owner only): `wishlist`, `lending` (who borrowed what), `activity`.
  - `admins` holds the email addresses allowed to edit.
- Book details and covers come from [Open Library](https://openlibrary.org), with Google Books as a fallback for barcode lookups.
- `design/`: the original clickable design prototypes.

## Owner access

Only emails listed in `public.admins` can create an account. A database trigger on `auth.users` blocks everyone else and confirms owners immediately, so no email link is needed. To add an owner, run in the Supabase SQL editor:

```sql
insert into public.admins (email) values ('her@email.com');
```

Then on the site: **Owner login → First time? Create your password**. After that, log in with email and password.

Passwords: change your own under **Settings → Change my password**. If one owner forgets theirs, the other owner can set a new one under **Settings → Reset another owner's password** (edge function `reset-owner-password`).

## Sarasavi and "Your next reads"

- **Search box:** when a search has 3+ letters, a button opens Sarasavi's own live search for it (`/serach-result?keyword=…`), with their real prices and stock. Wishlist books have the same button.
- **Your next reads** (slideshow at the top of the shelf): built by the `build-next-reads` edge function from Open Library: unowned books in series she owns, then popular books by her six most-shelved authors, plus her wishlist (owners only). Stored in `public.next_reads`; rebuilt daily at 03:00 UTC by the `build-next-reads-daily` cron job and after books are added (at most once every 10 minutes). Each slide links to Sarasavi's search for that title and author.
- We tried matching Sarasavi's public sitemap, but most of its links are outdated and 404, so the site doesn't link to Sarasavi product pages directly.

## Covers

Covers picked from Open Library or Google Books are copied into the `covers` storage bucket by the `cache-covers` edge function, so they load fast and don't depend on outside sites. The original link is kept in `cover_src`. The site calls the function automatically after saves; it takes no input and only processes covers already saved in the database.
