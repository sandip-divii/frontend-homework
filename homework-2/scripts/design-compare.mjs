// Side-by-side images for the design review: design on the left, our build on the right.
//  1. Figma frames (pre-existing Bookplate design, list + login) vs the build at 1440 / 768 / 375 → docs/design-compare/<screen>-<width>.png
//  2. Claude Design frames drawn for HW2 (docs/design/frames/*.png) vs the same screen captured from the build
//     (screenshots/review/*.png, `node scripts/capture-review.mjs`) → docs/design-compare/frame-<name>.png
// Usage: node scripts/design-compare.mjs   (after the screenshots above are fresh)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs", "design-compare");
const COLUMN_W = 720; // 1440-wide images are scaled to this width so the two columns line up

const FIGMA_PAIRS = [
  { screen: "list", design: "docs/figma-reference-1920.png", build: (w) => `screenshots/filled/${w}.png` },
  { screen: "login", design: "docs/figma-reference-login-1920.png", build: (w) => `screenshots/login/${w}.png` },
];
const FIGMA_WIDTHS = [1440, 768, 375];

// Claude Design frames (name = file name in docs/design/frames and screenshots/review), with the viewport width.
const FRAMES = [
  ["list-1440", 1440, "List · 1440"],
  ["list-375", 375, "List · 375"],
  ["form-add-1440", 1440, "Add service · 1440"],
  ["form-add-1440-errors", 1440, "Add service · 1440 · validation"],
  ["form-edit-375", 375, "Edit service · 375"],
  ["form-edit-375-errors", 375, "Edit service · 375 · validation"],
  ["detail-1440", 1440, "Service detail · 1440"],
  ["detail-1440-delete", 1440, "Service detail · 1440 · delete dialog"],
  ["detail-375", 375, "Service detail · 375"],
  ["detail-375-delete", 375, "Service detail · 375 · delete dialog"],
];

const sheet = ({ designUrl, buildUrl, title, designCaption, buildCaption, designW, buildW }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #e9e6e0; font: 14px/1.4 Arial, sans-serif; color: #1b1b1b; }
  h1 { margin: 0; padding: 12px 16px; font-size: 16px; background: #1b1b1b; color: #fff; }
  .row { display: flex; gap: 16px; padding: 16px; align-items: flex-start; }
  figure { margin: 0; width: ${COLUMN_W}px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
  figcaption { padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #ddd; }
  img { display: block; height: auto; margin: 0 auto; }
  .design img { width: ${designW}px; }
  .build img { width: ${buildW}px; }
</style></head><body>
  <h1>${title}</h1>
  <div class="row">
    <figure class="design"><figcaption>${designCaption}</figcaption><img src="${designUrl}"></figure>
    <figure class="build"><figcaption>${buildCaption}</figcaption><img src="${buildUrl}"></figure>
  </div>
</body></html>`;

// Data URIs: a page set with setContent() has no file:// access, so the PNGs are inlined.
const dataUrl = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: COLUMN_W * 2 + 48, height: 900 } });

async function write(name, opts) {
  await tab.setContent(sheet(opts), { waitUntil: "load" });
  const out = path.join(OUT, `${name}.png`);
  await tab.screenshot({ path: out, fullPage: true });
  console.log("wrote", path.relative(ROOT, out));
}

for (const pair of FIGMA_PAIRS) {
  for (const width of FIGMA_WIDTHS) {
    const build = path.join(ROOT, pair.build(width));
    const design = path.join(ROOT, pair.design);
    if (!fs.existsSync(build) || !fs.existsSync(design)) {
      console.warn(`skip ${pair.screen} ${width}: missing ${fs.existsSync(build) ? design : build}`);
      continue;
    }
    await write(`${pair.screen}-${width}`, {
      designUrl: dataUrl(design),
      buildUrl: dataUrl(build),
      title: `${pair.screen} — Figma design vs build @ ${width}px`,
      designCaption: "Design — Figma frame (1920, scaled)",
      buildCaption: `Build — ${width}px viewport`,
      designW: COLUMN_W,
      buildW: Math.min(width, COLUMN_W),
    });
  }
}

for (const [name, width, label] of FRAMES) {
  const design = path.join(ROOT, "docs", "design", "frames", `${name}.png`);
  const build = path.join(ROOT, "screenshots", "review", `${name}.png`);
  if (!fs.existsSync(build) || !fs.existsSync(design)) {
    console.warn(`skip ${name}: missing ${fs.existsSync(build) ? design : build}`);
    continue;
  }
  const w = Math.min(width, COLUMN_W);
  await write(`frame-${name}`, {
    designUrl: dataUrl(design),
    buildUrl: dataUrl(build),
    title: `${label} — Claude Design frame vs build`,
    designCaption: `Design — Claude Design frame (${width}px${width > COLUMN_W ? ", scaled" : ""})`,
    buildCaption: `Build — ${width}px viewport, signed in as expert`,
    designW: w,
    buildW: w,
  });
}
await browser.close();
