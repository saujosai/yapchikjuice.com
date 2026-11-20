// Generates the prerendered static pages from comics.js.
// Run from anywhere: `node tools/build.js` (inside site/).
// Output: index.html, c/<n>/index.html, sitemap.xml, robots.txt, 404.html.

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const BASE = "https://yapchikjuice.com";

// Cloudflare caches styles.css for four hours; a content hash in the URL makes
// every CSS change bust that cache immediately for returning visitors.
const cssHash = crypto
  .createHash("sha1")
  .update(fs.readFileSync(path.join(root, "styles.css")))
  .digest("hex")
  .slice(0, 8);

// The base URL is the brand's front door, not a single strip's page. Its SEO
// copy mirrors the subscribe form rather than the latest strip.
const HOME_TITLE = "Yapchik Juice | A Frum Comic Strip";
const HOME_DESCRIPTION =
  "A frum comic strip with wacky humor, ridiculous inventions, and a touch of satire. Get fresh Yapchik Juice in your inbox.";
const HOME_IMAGE = "assets/og-home.png";
const ABOUT_TITLE = "About Yapchik Juice | Yapchik Juice";
const ABOUT_DESCRIPTION =
  "Where the name came from: a deli, a missing glass of herring juice, and a frum comic strip with wacky humor and a touch of satire.";
const CONTACT_TITLE = "Contact Yapchik Juice | Yapchik Juice";
const CONTACT_DESCRIPTION =
  "Send feedback, comic ideas, or your takes on Jewish humor and frum comics to shaul@yapchikjuice.com.";

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "comics.js"), "utf8"), sandbox);
const comics = sandbox.window.COMICS.slice().sort((a, b) => a.number - b.number);

if (!comics.length) throw new Error("comics.js has no strips");

// The page-change wash is painted with each strip's own colors. Regenerate the
// sampled palettes on every build so a new strip gets a matching wash without
// anyone editing CSS; a committed palettes.json is the offline fallback.
const paletteFile = path.join(root, "tools", "palettes.json");
try {
  execFileSync("python3", [path.join(root, "tools", "palette.py")], {
    cwd: root,
    stdio: "ignore"
  });
} catch (e) {
  // Keep the last generated palettes if Python/Pillow isn't available here.
}
const palettes = fs.existsSync(paletteFile)
  ? JSON.parse(fs.readFileSync(paletteFile, "utf8"))
  : {};

const FALLBACK_WASH = ["#C8863A", "#4A6B4A", "#5B8FB8"];
function washColors(comic) {
  const colors = palettes[comic.image] || FALLBACK_WASH;
  return colors.slice(0, 3).map((c, i) => `--wash-${i + 1}: ${c};`).join(" ");
}

const template = fs.readFileSync(path.join(root, "tools", "template.html"), "utf8");
// One masthead source for every page; only the current-page marker differs.
const mastheadSource = fs.readFileSync(path.join(root, "tools", "masthead.html"), "utf8").trimEnd();
function masthead(current = "") {
  return mastheadSource
    .split("{{ABOUT_CURRENT}}").join(current === "about" ? ' aria-current="page"' : "")
    .split("{{CONTACT_CURRENT}}").join(current === "contact" ? ' aria-current="page"' : "");
}

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

const hebrewFormatter = new Intl.DateTimeFormat("en-US", {
  calendar: "hebrew",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

function formatHebrewDate(iso) {
  // Read at UTC noon: a Hebrew day starts at sunset, so midnight can shift the
  // date back a day. Noon keeps the civil publish date on the intended Hebrew day.
  return hebrewFormatter.format(new Date(`${iso}T12:00:00Z`));
}

function disabled(condition) {
  return condition ? ' aria-disabled="true" tabindex="-1"' : "";
}

function renderStrip(comic, index, stripOnly = false) {
  const number = comic.number;
  const prev = comics[index - 1];
  const next = comics[index + 1];
  const fallbackRandom = number !== 1 ? 1 : 2;
  const pagePath = stripPath(comic);
  // The newest strip is also rendered at /, but its permanent /c/<n>/ page
  // must still declare itself (not the home page) as its canonical URL.
  const canonical = BASE + (stripOnly ? `/c/${number}/` : pagePath);
  const isHome = pagePath === "/" && !stripOnly;
  const description = isHome ? HOME_DESCRIPTION : comic.lead;
  const ogImage = BASE + "/" + (isHome ? HOME_IMAGE : comic.thumb);

  const graph = [
    {
      "@type": "WebSite",
      "@id": BASE + "/#website",
      name: "Yapchik Juice",
      url: BASE + "/",
      description: HOME_DESCRIPTION,
      inLanguage: "en",
      author: { "@type": "Person", name: "Shaul Saitowitz" }
    },
    {
      "@type": "WebPage",
      "@id": canonical + "#webpage",
      url: canonical,
      name: isHome ? "Yapchik Juice" : comic.title,
      description,
      isPartOf: { "@id": BASE + "/#website" }
    }
  ];

  // The home page describes the strip as a whole; only permanent strip URLs
  // carry comic-specific structured data.
  if (!isHome) {
    graph.push({
      "@type": "ComicStory",
      "@id": canonical + "#comic",
      headline: comic.title,
      description,
      image: ogImage,
      thumbnailUrl: ogImage,
      datePublished: comic.date,
      inLanguage: "en",
      author: { "@type": "Person", name: "Shaul Saitowitz" },
      publisher: { "@type": "Organization", name: "Yapchik Juice" },
      mainEntityOfPage: { "@id": canonical + "#webpage" },
      url: canonical
    });
  }

  const structuredData = { "@context": "https://schema.org", "@graph": graph };

  const values = {
    CSS_VERSION: cssHash,
    WASH_COLORS: washColors(comic),
    MASTHEAD: masthead(),
    TITLE: esc(isHome ? HOME_TITLE : `${comic.title} | Yapchik Juice`),
    DESCRIPTION: esc(description),
    CANONICAL: esc(canonical),
    OG_TYPE: isHome ? "website" : "article",
    OG_TITLE: esc(isHome ? "Yapchik Juice" : comic.title),
    OG_IMAGE: esc(ogImage),
    ARTICLE_META: isHome
      ? ""
      : `<meta property="article:published_time" content="${comic.date}">\n  <meta property="article:author" content="Shaul Saitowitz">`,
    JSON_LD: json(structuredData),
    ANALYTICS: analytics,
    NUMBER: number,
    LAST_NUMBER: latest.number,
    STRIP_TITLE: esc(comic.title),
    STRIP_NUMBER: esc(`Strip ${number} of ${comics.length} · ${formatDate(comic.date)} · ${formatHebrewDate(comic.date)}`),
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

  // Every strip gets a permanent /c/<n>/ page. The latest is also the home
  // page, but its permanent URL keeps its own comic-specific SEO copy.
  const stripDir = path.join(root, "c", String(number));
  fs.mkdirSync(stripDir, { recursive: true });
  fs.writeFileSync(path.join(stripDir, "index.html"), html);
  if (pagePath === "/" && !stripOnly) fs.writeFileSync(path.join(root, "index.html"), html);
}

comics.forEach((comic, index) => {
  renderStrip(comic, index);
  if (stripPath(comic) === "/") renderStrip(comic, index, true);
});

// Text pages (About, Contact) are hand-written copy, but go through the build
// so their head, analytics, and structured data match every other page.
function renderTextPage({ templateName, outDir, url, pageName, title, description, current }) {
  const template = fs.readFileSync(path.join(root, "tools", templateName), "utf8");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": BASE + "/#website",
        name: "Yapchik Juice",
        url: BASE + "/",
        description: HOME_DESCRIPTION,
        inLanguage: "en",
        author: { "@type": "Person", name: "Shaul Saitowitz" }
      },
      {
        "@type": "WebPage",
        "@id": url + "#webpage",
        url,
        name: pageName,
        description,
        isPartOf: { "@id": BASE + "/#website" }
      }
    ]
  };
  const values = {
    CSS_VERSION: cssHash,
    MASTHEAD: masthead(current),
    TITLE: esc(title),
    DESCRIPTION: esc(description),
    CANONICAL: esc(url),
    OG_TITLE: esc(pageName),
    JSON_LD: json(structuredData),
    ANALYTICS: analytics
  };
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    html = html.split(`{{${key}}}`).join(String(value));
  }
  const dir = path.join(root, outDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

renderTextPage({
  templateName: "about.html",
  outDir: "about",
  url: BASE + "/about/",
  pageName: "About Yapchik Juice",
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  current: "about"
});

const contactUrl = BASE + "/contact/";
renderTextPage({
  templateName: "contact.html",
  outDir: "contact",
  url: contactUrl,
  pageName: "Contact Yapchik Juice",
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  current: "contact"
});

// Sitemap and robots.
const sitemapUrls = comics.map((comic) => `
  <url>
    <loc>${esc(stripUrl(comic))}</loc>
    <lastmod>${comic.date}</lastmod>
  </url>`).join("") + `
  <url>
    <loc>${esc(BASE + "/about/")}</loc>
  </url>
  <url>
    <loc>${esc(contactUrl)}</loc>
  </url>`;

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
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="stylesheet" href="/styles.css?v=${cssHash}">
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

console.log(`Generated ${comics.length} strip pages, the About and Contact pages, sitemap, robots, and 404.`);
