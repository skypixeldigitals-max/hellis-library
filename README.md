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

Add the owner's email in the Supabase SQL editor:

```sql
insert into public.admins (email) values ('her@email.com');
```

Then use **Owner login** at the bottom of the site and click the emailed link.
