# Helli's Library — Plan

Personal book catalog website. Main job: **never buy a duplicate.**
Owner edits; friends get a read-only link.

## Decisions so far

| Topic | Decision |
|---|---|
| Hosting | GitHub Pages (free address `<username>.github.io/<repo>`) |
| Data | Supabase (free tier) so phone and laptop share the same list |
| Login | Email magic link, owner only |
| Devices | Works equally on phone and laptop |
| Money | None: no fees, deposits or sales |
| Design | 2–3 mockup directions to choose from (next step) |

## Features

### Core (v1)
1. **Duplicate check**: big search box at the top. It matches title, author, series and ISBN, and tolerates typos and spacing (so "City of glass" matches "Mortal Instruments 3: City of glass"). It answers clearly: "✅ You own this" / "❌ Not in your library".
2. **Add a book by scanning**: point the phone camera at the barcode. Title, author and cover fill in from Open Library (free, no key), with Google Books as a fallback.
3. **Add a book by typing**: type part of a title and pick from suggestions with covers. Manual entry is still possible for obscure books.
4. **Duplicate warning on add**: if you scan or type a book you already own, it warns you before saving.
5. **Edit / delete books.**

### Extras (v1 or v1.1)
6. **Series tracker**: books grouped by series with the number shown. It flags gaps, e.g. "Dark Artifices: own #2, missing #1, #3". Series and number are editable fields, because book databases often get series wrong.
7. **Read status + rating**: Unread / Reading / Read, with 1–5 stars.
8. **Shelf view**: grid of covers, with a toggle to switch to the compact list.
9. **Lending note**: "With Sarah since 3 Oct" and a "Returned" button. No money.
10. **Wishlist**: books you want. **Private** (only you see it). Scanning a wishlist book at the shop shows "On your wishlist".

### Public friends page
Friends **see**: book list and covers, available / lent out, read status and ratings.
Friends **don't see**: who borrowed a book, the wishlist, or edit controls.

## Tech

- Plain HTML/CSS/JS with no build step, so it's easy to host and edit.
- Supabase JS client loaded from a CDN.
- Barcode scanning with `html5-qrcode`, which works on iPhone Safari and Android.
- Security: Supabase Row Level Security. The public can read only the safe columns. Only the owner's account can write. Borrower names and the wishlist sit in owner-only tables.

### Data model (draft)
- `books`: id, title, author, isbn, cover_url, series, series_no, read_status, rating, is_lent, added_at
- `loans` *(private)*: book_id, borrower, lent_on, returned_on
- `wishlist` *(private)*: id, title, author, isbn, cover_url, note

## Build order
1. ✅ Plan (this doc)
2. Design: 2–3 mockup directions, pick one
3. Supabase project + tables + security rules
4. Core: search, add (type), list, edit
5. Barcode scanning
6. Series, read status, shelf view, lending, wishlist
7. Public friends page
8. Push to GitHub, enable Pages, test on phone
9. Re-add the existing 8 books (or import if the old site has an export)

## Open questions
- Your GitHub username, plus permission to create the repo.
- Can the person who has the old site send the code? It's useful but not required; we're rebuilding anyway.
- Do you have a Supabase account, or should we make one with the magic-link email?
