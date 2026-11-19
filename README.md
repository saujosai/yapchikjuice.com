# Yapchik Juice — comic site

A static site for the comic archive, hosted on Cloudflare Pages at
`yapchikjuice.com`. The home page shows the latest strip; navigation is
XKCD-style (first / previous / random / next / last) with arrow-key support.

## Files

- `index.html` — page shell and the beehiiv embed slot
- `styles.css` — design tokens from the project `DESIGN.md`
- `comics.js` — **the manifest**: the only file you edit to publish a strip
- `app.js` — renders the current strip and builds the navigation
- `comics/` — finished, fully composited strip images
- `assets/mark.png` — the Yapchik Juice mark used as masthead and favicon

## Publish a new strip

1. Take the finished image (mark, sponsor band, signature, and copyright
   already composited onto the art) and copy it into `comics/`.
2. Append an entry to `COMICS` in `comics.js` with the next `number`, a
   unique `slug`, the exact article title, the beehiiv publication date in
   `YYYY-MM-DD`, the image path, and a short `alt` description.
3. Commit and push. Cloudflare rebuilds automatically. The highest number
   becomes the home page.

`number` controls order; `date` is display-only. Keep entries in
chronological order for readability.

## Newsletter signup

Not added yet. There is a placeholder comment in `index.html` marking where
the signup section goes.

## Deploy

Git-backed Cloudflare Pages project connected to this repository:

- Build command: none (static site)
- Build output directory: `/`
- Custom domain: `yapchikjuice.com`

## Not published yet

These finished images exist but are not in the manifest yet (no beehiiv
article date): `Blowtorch Menorah`, `Failed Donut Flavors`, `Shtender Models`,
`Money-shoes` / `EVERYONE`, `spoiled brat not branded`, `Shabbos Transport`
(alternate Frum Tech 2 rendering), and the splash/social images.
