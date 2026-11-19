// Generates the prerendered static pages from comics.js.
// Run from anywhere: `node tools/build.js` (inside site/).
// Output: index.html, c/<n>/index.html, sitemap.xml, robots.txt, 404.html.

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const BASE = "https://yapchikjuice.com";

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "comics.js"), "utf8"), sandbox);
const comics = sandbox.window.COMICS.slice().sort((a, b) => a.number - b.number);

if (!comics.length) throw new Error("comics.js has no strips");

const template = fs.readFileSync(path.join(root, "tools", "template.html"), "utf8");
const analyticsFile = path.join(root, "tools", "analytics.html");
const analytics = fs.existsSync(analyticsFile)
  ? fs.readFileSync(analyticsFile, "utf8").trim()
  : "";

const lastIndex = comics.length - 1;
const latest = comics[lastIndex];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function stripPath(comic) {
  return comic.number === latest.number ? "/" : `/c/${comic.number}/`;
}

function stripUrl(comic) {
  return BASE + stripPath(comic);
}

function formatDate(iso) {
  const parts = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(parts[1]) - 1]} ${Number(parts[2])}, ${parts[0]}`;
}

function disabled(condition) {
  return condition ? ' aria-disabled="true" tabindex="-1"' : "";
}

function renderStrip(comic, index) {
  const number = comic.number;
  const prev = comics[index - 1];
  const next = comics[index + 1];
  const fallbackRandom = number !== 1 ? 1 : 2;
  const pagePath = stripPath(comic);
  const canonical = BASE + pagePath;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": BASE + "/#website",
        name: "Yapchik Juice",
        url: BASE + "/",
        inLanguage: "en",
        author: { "@type": "Person", name: "Shaul Saitowitz" }
      },
      {
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        url: canonical,
        name: comic.title,
        isPartOf: { "@id": BASE + "/#website" }
      },
      {
        "@type": "ComicStory",
        "@id": canonical + "#comic",
        headline: comic.title,
        description: comic.alt,
        image: BASE + "/" + comic.image,
        thumbnailUrl: BASE + "/" + comic.image,
        datePublished: comic.date,
        inLanguage: "en",
        author: { "@type": "Person", name: "Shaul Saitowitz" },
        publisher: { "@type": "Organization", name: "Yapchik Juice" },
        mainEntityOfPage: { "@id": canonical + "#webpage" },
        url: canonical
      }
    ]
  };

  const values = {
    TITLE: esc(`${comic.title} | Yapchik Juice`),
    DESCRIPTION: esc(comic.alt),
    CANONICAL: esc(canonical),
    OG_TYPE: "article",
    OG_TITLE: esc(comic.title),
    OG_IMAGE: esc(BASE + "/" + comic.image),
    ARTICLE_META: `<meta property="article:published_time" content="${comic.date}">\n  <meta property="article:author" content="Shaul Saitowitz">`,
    JSON_LD: json(structuredData),
    ANALYTICS: analytics,
    NUMBER: number,
    LAST_NUMBER: latest.number,
    STRIP_TITLE: esc(comic.title),
    STRIP_NUMBER: esc(`Strip ${number} of ${comics.length} · ${formatDate(comic.date)}`),
    STRIP_IMAGE_SRC: esc("/" + comic.image),
    STRIP_IMAGE_ALT: esc(comic.alt),
    IMAGE_WIDTH: comic.width,
    IMAGE_HEIGHT: comic.height,
    NAV_FIRST_HREF: "/c/1/",
    NAV_FIRST_DISABLED: disabled(index === 0),
    NAV_PREV_HREF: prev ? stripPath(prev) : "#",
    NAV_PREV_DISABLED: disabled(!prev),
    NAV_RANDOM_HREF: `/c/${fallbackRandom}/`,
    NAV_NEXT_HREF: next ? stripPath(next) : "#",
    NAV_NEXT_DISABLED: disabled(!next),
    NAV_LAST_HREF: stripPath(latest),
    NAV_LAST_DISABLED: disabled(index === lastIndex)
  };

  let html = template;
  for (const [key, value] of Object.entries(values)) {
    html = html.split(`{{${key}}}`).join(String(value));
  }

  // Every strip gets a permanent /c/<n>/ page. The latest is also the home page.
  const stripDir = path.join(root, "c", String(number));
  fs.mkdirSync(stripDir, { recursive: true });
  fs.writeFileSync(path.join(stripDir, "index.html"), html);
  if (pagePath === "/") fs.writeFileSync(path.join(root, "index.html"), html);
}

comics.forEach(renderStrip);

// Sitemap and robots.
const sitemapUrls = comics.map((comic) => `
  <url>
    <loc>${esc(stripUrl(comic))}</loc>
    <lastmod>${comic.date}</lastmod>
  </url>`).join("");

fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls}
</urlset>
`);

fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`);

fs.writeFileSync(path.join(root, "404.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found | Yapchik Juice</title>
  <meta name="robots" content="noindex">
  <link rel="icon" type="image/png" href="/assets/mark.png">
  <link rel="stylesheet" href="/styles.css">
  ${analytics}
</head>
<body>
  <main class="page">
    <h1 class="strip__title">That strip isn't here.</h1>
    <p><a href="/">Read the latest strip</a></p>
  </main>
</body>
</html>
`);

console.log(`Generated ${comics.length} strip pages, sitemap, robots, and 404.`);
