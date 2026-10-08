import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Responsive QA (Homework 1, Step 5).
 * For every list state × width: assert no sideways scroll, no tiny controls,
 * then save a full-page screenshot to /screenshots/<state>/<width>.png.
 */
const WIDTHS = [1920, 1600, 1440, 1366, 1280, 1024, 991, 768, 640, 480, 375] as const; // WM matrix + 1440 (QA)

const STATES = [
  { name: "filled", path: "/", status: "success" },
  { name: "loading", path: "/?state=loading", status: "loading" },
  { name: "empty", path: "/?state=empty", status: "empty" },
] as const;

const OUT_DIR = path.resolve("screenshots");
const MIN_TARGET = 24; // WCAG 2.5.8 minimum target size

async function waitForList(page: Page, status: string) {
  await page.locator(`[data-list-status="${status}"]`).waitFor({ timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
}

for (const state of STATES) {
  test.describe(`${state.name} state`, () => {
    for (const width of WIDTHS) {
      test(`${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(state.path);
        await waitForList(page, state.status);

        const size = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(size.scroll, `page scrolls sideways at ${width}px`).toBeLessThanOrEqual(size.client);

        const tiny = await page.evaluate((min) => {
          const controls = Array.from(document.querySelectorAll<HTMLElement>("button, input, [role='option']"));
          return controls
            .filter((el) => {
              const rect = el.getBoundingClientRect();
              const visible = rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== "hidden";
              return visible && (rect.width < min || rect.height < min);
            })
            .map((el) => `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 32)}"`);
        }, MIN_TARGET);
        expect(tiny, `controls smaller than ${MIN_TARGET}px at ${width}px`).toEqual([]);

        if (state.status === "success") {
          await expect(page.locator("article")).toHaveCount(12);
        }

        fs.mkdirSync(path.join(OUT_DIR, state.name), { recursive: true });
        await page.screenshot({
          path: path.join(OUT_DIR, state.name, `${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
      });
    }
  });
}
