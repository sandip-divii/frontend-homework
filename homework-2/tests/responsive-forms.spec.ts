import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { EXPERT, expectNoSidewaysScroll, loginAs } from "./helpers";

/** Responsive check for the HW2 screens (create, detail, edit) at the WM minimum widths. */
const WIDTHS = [1920, 1366, 768, 375] as const;
const OUT_DIR = path.resolve("screenshots", "forms");

const SCREENS = [
  { name: "create", path: "/premium-service/new", heading: "Add a service" },
  { name: "detail", path: "/premium-service/1", heading: /.+/ },
  { name: "edit", path: "/premium-service/1/edit", heading: /^Edit: / },
] as const;

for (const screen of SCREENS) {
  for (const width of WIDTHS) {
    test(`${screen.name} @ ${width}px`, async ({ page }) => {
      await loginAs(page, EXPERT);
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(screen.heading);
      await page.evaluate(() => document.fonts.ready);
      await expectNoSidewaysScroll(page);
      fs.mkdirSync(OUT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(OUT_DIR, `${screen.name}-${width}.png`), fullPage: true, animations: "disabled" });
    });
  }
}
