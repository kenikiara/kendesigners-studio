// Serve out/ and crawl it as Googlebot: follow internal links, verify status
// codes and on-page SEO (title, description, canonical, single H1, image alt),
// detect broken links, and cross-check the sitemap.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("out");
const PORT = 4599;
const ORIGIN = `http://localhost:${PORT}`;

const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

async function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const candidates = [];
  if (p.endsWith("/")) candidates.push(path.join(ROOT, p, "index.html"));
  else if (!path.extname(p)) {
    candidates.push(path.join(ROOT, p + ".html"));
    candidates.push(path.join(ROOT, p, "index.html"));
  } else candidates.push(path.join(ROOT, p));
  for (const c of candidates) {
    try { if ((await stat(c)).isFile()) return c; } catch {}
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const file = await resolveFile(req.url);
  if (!file) {
    const f404 = path.join(ROOT, "404.html");
    try {
      const b = await readFile(f404);
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end(b);
    } catch {
      res.writeHead(404); return res.end("Not found");
    }
  }
  const body = await readFile(file);
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(body);
});

await new Promise((r) => server.listen(PORT, r));

const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const get = (u) => fetch(u, { headers: { "User-Agent": UA }, redirect: "manual" });

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
};

const seen = new Set();
const queue = ["/"];
const pages = [];
const issues = [];
const assetStatus = new Map();

async function checkAsset(url) {
  if (assetStatus.has(url)) return assetStatus.get(url);
  let st = 0;
  try { st = (await get(url)).status; } catch { st = -1; }
  assetStatus.set(url, st);
  return st;
}

while (queue.length) {
  const pathname = queue.shift();
  if (seen.has(pathname)) continue;
  seen.add(pathname);

  const url = ORIGIN + pathname;
  let resp;
  try { resp = await get(url); } catch (e) { issues.push(`FETCH FAIL ${pathname}: ${e.message}`); continue; }
  if (resp.status !== 200) { issues.push(`STATUS ${resp.status} ${pathname}`); continue; }

  const html = await resp.text();
  const page = { pathname, problems: [] };

  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "";
  if (!title.trim()) page.problems.push("missing <title>");
  else if (title.length > 65) page.problems.push(`title ${title.length} chars (long)`);

  const descTag = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
  const desc = descTag ? attr(descTag[0], "content") : null;
  if (!desc || !desc.trim()) page.problems.push("missing meta description");
  else if (desc.length > 165) page.problems.push(`description ${desc.length} chars (long)`);

  const canonTag = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  const canon = canonTag ? attr(canonTag[0], "href") : null;
  if (!canon) page.problems.push("missing canonical");

  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s === 0) page.problems.push("no <h1>");
  if (h1s > 1) page.problems.push(`${h1s} <h1> tags`);

  if (!/<html[^>]*lang=/i.test(html)) page.problems.push("no lang attribute");

  const hasOg = /<meta[^>]*property=["']og:title["']/i.test(html);
  if (!hasOg) page.problems.push("no og:title");

  const jsonLd = (html.match(/application\/ld\+json/gi) || []).length;
  page.jsonLd = jsonLd;

  // Images: alt presence + resolve
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  for (const img of imgTags) {
    const alt = attr(img, "alt");
    const src = attr(img, "src");
    if (alt === null || alt.trim() === "") page.problems.push(`img missing alt: ${src}`);
    if (src && src.startsWith("/")) {
      const st = await checkAsset(ORIGIN + src);
      if (st !== 200) page.problems.push(`img ${st}: ${src}`);
    }
  }

  // Internal links
  const hrefs = [...html.matchAll(/<a[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const href of hrefs) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (/^https?:\/\//i.test(href)) continue; // external
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (path.extname(clean) && !clean.endsWith("/")) {
      const st = await checkAsset(ORIGIN + clean);
      if (st !== 200) page.problems.push(`link ${st}: ${clean}`);
      continue;
    }
    if (!seen.has(clean) && !queue.includes(clean)) queue.push(clean);
  }

  pages.push(page);
  if (page.problems.length) issues.push(`${pathname}\n    - ${page.problems.join("\n    - ")}`);
}

// Sitemap + robots cross-check
const sm = await get(ORIGIN + "/sitemap.xml");
const smText = sm.status === 200 ? await sm.text() : "";
const smUrls = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("https://kendesigners.com", ""));
const rb = await get(ORIGIN + "/robots.txt");
const rbText = rb.status === 200 ? await rb.text() : "";

const crawledPaths = new Set(pages.map((p) => p.pathname));
const notInSitemap = [...crawledPaths].filter((p) => !smUrls.includes(p));
const sitemapDead = [];
for (const u of smUrls) {
  const st = (await get(ORIGIN + u)).status;
  if (st !== 200) sitemapDead.push(`${u} -> ${st}`);
}

console.log("=".repeat(60));
console.log("GOOGLEBOT CRAWL REPORT");
console.log("=".repeat(60));
console.log(`Pages crawled (reachable from /): ${pages.length}`);
console.log(`Unique assets/links checked: ${assetStatus.size}`);
console.log(`robots.txt: ${rb.status === 200 ? "OK" : "MISSING"}${/Sitemap:/i.test(rbText) ? ", references sitemap" : ", NO sitemap ref"}`);
console.log(`sitemap.xml: ${sm.status === 200 ? "OK" : "MISSING"}, ${smUrls.length} URLs`);
console.log(`Pages with JSON-LD structured data: ${pages.filter((p) => p.jsonLd > 0).length}/${pages.length}`);
console.log("-".repeat(60));
if (sitemapDead.length) { console.log("SITEMAP URLS NOT RETURNING 200:"); sitemapDead.forEach((d) => console.log("  " + d)); }
else console.log("All sitemap URLs return 200: YES");
if (notInSitemap.length) console.log(`Reachable pages NOT in sitemap: ${notInSitemap.join(", ")}`);
else console.log("Every reachable page is in the sitemap: YES");
console.log("-".repeat(60));
if (issues.length === 0) {
  console.log("NO SEO ISSUES FOUND. Every page has title, description, canonical, single H1, lang, og:title, and all images have alt + resolve.");
} else {
  console.log(`ISSUES (${issues.length}):`);
  issues.forEach((i) => console.log("  " + i));
}
console.log("=".repeat(60));
console.log("Crawled pages:");
pages.map((p) => p.pathname).sort().forEach((p) => console.log("  " + p));

server.close();
