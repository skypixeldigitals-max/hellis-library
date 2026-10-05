# Design & usability audit — 6 Oct 2026

Tested on the live data (32 books) at 320×640 (small phone), 375–390 (phone), 844×390 (phone landscape), 768×1024 (tablet) and 1440×900 (desktop).

## Fixed in this round

| # | Area | Finding | Fix |
|---|------|---------|-----|
| 1 | Speed | Each Open Library cover took ~3.2 s (two redirects into an archive.org zip). | Covers go through the wsrv.nl image CDN as 240px WebP (~0.2–0.4 s, 30% smaller), falling back to the original if the CDN fails. All shelf covers now load within about 1 s. |
| 2 | Responsive | At 320px the Scan button pushed past the right edge (the search's grid column couldn't shrink). | Search column can shrink; below 360px Scan becomes icon-only. |
| 3 | Responsive | Phone landscape (844×390): header, sticky search, stats and bottom tabs filled the screen; the shelf was barely visible. | Sidebar layout now starts at 768px wide; short screens hide secondary text. Shelf starts ~125px from the top. |
| 4 | Responsive | Tablets (768px) got a stretched phone layout. | Sidebar layout with a 280px sidebar; 4 covers per row. |
| 5 | Touch | Filter chips were 36px tall, the login link 32px (below the 44px minimum). | All chips, links and secondary buttons are now at least 44px. |
| 6 | Contrast | The "Sold" pill was 4.15:1 (needs 4.5:1), and sold cards faded text to 60% opacity. | Darker pill text; sold cards grey out the cover and strike through the title instead of fading the text. Every other text/background pair measured 4.8–5.5:1. |
| 7 | Navigation | The phone's Back button left the site instead of closing an open book or form. | Opening a sheet adds a history entry; Back closes it. |
| 8 | Accessibility | Keyboard focus could leave an open sheet. | Tab and Shift+Tab stay inside the sheet. |
| 9 | Copy | Visitors saw "Check before you buy.", which only makes sense for the owner. | Visitors see "Browse Helli's books, or buy one from the For sale shelf." |
| 10 | Feature | Friends could see a book was on the shelf but had no way to ask for it. | "Ask to borrow on WhatsApp" button on available books (shows once a WhatsApp number is set). |
| 11 | Search | Only the first 4 matches showed, with no hint that there were more. | Up to 6 matches plus a count ("9 matches, showing 6"). |
| 12 | Shelf | With 30+ books, covers alone don't identify every book on desktop. | Hovering a cover shows its title. |
| 13 | Phone keyboard | The keyboard's action key said "Go"/"Return". | It now says "Search". |

## Already good

- No sideways scrolling at any tested width.
- Text is 15–17px and inputs are 17px (no iOS zoom-on-focus).
- Visible focus rings, labelled icon buttons, `aria-pressed` on toggles, live region for search results.
- All animations stop when the device has "reduce motion" turned on.
- A loading skeleton shows while books load, and every section has a designed empty state.
- Only owners can write. Verified that saves without a login are refused by the database.

## Follow-ups (all done, 6 Oct 2026)

| Finding | Fix |
|---------|-----|
| With 45 books, a flat shelf is long on phones. | **Sort** by Series, Author, Title A–Z (ignores "The/A/An") or Recently added. The choice is remembered on each device. |
| Covers depended on Open Library and a free CDN. | The `cache-covers` edge function copies every cover into the project's own `covers` bucket (WebP, 400px) and keeps the original link in `cover_src`. All 44 existing covers were copied; new ones are copied automatically after each save. |
| No way to recover a forgotten password. | **Change my password** in Settings. **Reset another owner's password** (the `reset-owner-password` edge function, owners only, owner targets only) lets either owner reset the other's. A "Forgot password?" link on the login screen explains the steps. |
| Sheets could only be closed with ✕, Back, or tapping outside. | On phones, drag a sheet down from the top to close it. |
