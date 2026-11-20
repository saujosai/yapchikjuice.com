// Generates the prerendered static pages from comics.js.
// Run from anywhere: `node tools/build.js` (inside site/).
// Output: index.html, c/<n>/index.html, sitemap.xml, robots.txt, 404.html.

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const BASE = "https://yapchikjuice.com";

// The base URL is the brand's front door, not a single strip's page. Its SEO
// copy mirrors the subscribe form rather than the latest strip.
const HOME_TITLE = "Yapchik Juice | A Frum Comic Strip";
const HOME_DESCRIPTION =
  "A frum comic strip with wacky humor, ridiculous inventions, and a touch of satire. Get fresh Yapchik Juice in your inbox.";
const HOME_IMAGE = "assets/og-home.png";
const ABOUT_TITLE = "About Yapchik Juice | Yapchik Juice";
const ABOUT_DESCRIPTION =
  "Where the name came from: a deli, a missing glass of herring juice, and a frum comic strip with wacky humor and a touch of satire.";

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "comics.js"), "utf8"), sandbox);
const comics = sandbox.window.COMICS.slice().sort((a, b) => a.number - b.number);

if (!comics.length) throw new Error("comics.js has no strips");

const template = fs.readFileSync(path.join(root, "tools", "template.html"), "utf8");
// One masthead source for every page; only the current-page marker differs.
const mastheadSource = fs.readFileSync(path.join(root, "tools", "masthead.html"), "utf8").trimEnd();
function masthead(onAbout = false) {
  return mastheadSource.split("{{ABOUT_CURRENT}}").join(onAbout ? ' aria-current="page"' : "");
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

function disabled(condition) {
  return condition ? ' aria-disabled="true" tabindex="-1"' : "";
}

function renderStrip(comic, index, stripOnly = false) {
  const number = comic.number;
  const prev = comics[index - 1];
  const next = comics[index + 1];
  const fallbackRandom = number !== 1 ? 1 : 2;
  const pagePath = stripPath(comic);
  const canonical = BASE + pagePath;
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

// The About page is hand-written copy, but it goes through the build so its
// head, analytics, and structured data match every other page.
const aboutTemplate = fs.readFileSync(path.join(root, "tools", "about.html"), "utf8");
const aboutUrl = BASE + "/about/";
const aboutStructuredData = {
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
      "@id": aboutUrl + "#webpage",
      url: aboutUrl,
      name: "About Yapchik Juice",
      description: ABOUT_DESCRIPTION,
      isPartOf: { "@id": BASE + "/#website" }
    }
  ]
};
const aboutValues = {
  MASTHEAD: masthead(true),
  TITLE: esc(ABOUT_TITLE),
  DESCRIPTION: esc(ABOUT_DESCRIPTION),
  CANONICAL: esc(aboutUrl),
  OG_TITLE: esc("About Yapchik Juice"),
  JSON_LD: json(aboutStructuredData),
  ANALYTICS: analytics
};
let aboutHtml = aboutTemplate;
for (const [key, value] of Object.entries(aboutValues)) {
  aboutHtml = aboutHtml.split(`{{${key}}}`).join(String(value));
}
const aboutDir = path.join(root, "about");
fs.mkdirSync(aboutDir, { recursive: true });
fs.writeFileSync(path.join(aboutDir, "index.html"), aboutHtml);

// Sitemap and robots.
const sitemapUrls = comics.map((comic) => `
  <url>
    <loc>${esc(stripUrl(comic))}</loc>
    <lastmod>${comic.date}</lastmod>
  </url>`).join("") + `
  <url>
    <loc>${esc(aboutUrl)}</loc>
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

console.log(`Generated ${comics.length} strip pages, the About page, sitemap, robots, and 404.`);
