// Side-by-side images for the design review: Figma export on the left, our screenshot on the right.
// Usage: node scripts/design-compare.mjs   (after `npm run qa:responsive` / `npm run qa:login` refreshed screenshots/)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs", "design-compare");
const COLUMN_W = 720; // both columns are scaled to this width so the layouts line up

const PAIRS = [
  { screen: "list", design: "docs/figma-reference-1920.png", build: (w) => `screenshots/filled/${w}.png` },
  { screen: "login", design: "docs/figma-reference-login-1920.png", build: (w) => `screenshots/login/${w}.png` },
];
const WIDTHS = [1440, 768, 375];

const page = (designUrl, buildUrl, title, buildWidth) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #e9e6e0; font: 14px/1.4 Arial, sans-serif; color: #1b1b1b; }
  h1 { margin: 0; padding: 12px 16px; font-size: 16px; background: #1b1b1b; color: #fff; }
  .row { display: flex; gap: 16px; padding: 16px; align-items: flex-start; }
  figure { margin: 0; width: ${COLUMN_W}px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
  figcaption { padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #ddd; }
  img { display: block; width: 100%; height: auto; }
  .build img { width: ${Math.min(buildWidth, COLUMN_W)}px; margin: 0 auto; }
</style></head><body>
  <h1>${title}</h1>
  <div class="row">
    <figure><figcaption>Design — Figma frame (1920, scaled)</figcaption><img src="${designUrl}"></figure>
    <figure class="build"><figcaption>Build — ${buildWidth}px viewport</figcaption><img src="${buildUrl}"></figure>
  </div>
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: COLUMN_W * 2 + 48, height: 900 } });

for (const pair of PAIRS) {
  for (const width of WIDTHS) {
    const build = path.join(ROOT, pair.build(width));
    const design = path.join(ROOT, pair.design);
    if (!fs.existsSync(build) || !fs.existsSync(design)) {
      console.warn(`skip ${pair.screen} ${width}: missing ${fs.existsSync(build) ? design : build}`);
      continue;
    }
    // Data URIs: a page set with setContent() has no file:// access, so the PNGs are inlined.
    const dataUrl = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
    const html = page(dataUrl(design), dataUrl(build), `${pair.screen} — design vs build @ ${width}px`, width);
    await tab.setContent(html, { waitUntil: "load" });
    const out = path.join(OUT, `${pair.screen}-${width}.png`);
    await tab.screenshot({ path: out, fullPage: true });
    console.log("wrote", path.relative(ROOT, out));
  }
}
await browser.close();
