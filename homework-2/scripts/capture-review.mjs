// Captures the build screens that match the Claude Design frames, signed in as the expert, for the
// design review's side-by-side images. Read-only: the validation states are blocked by client
// validation and the delete dialog is opened and never confirmed, so no data is written.
// Usage: node scripts/capture-review.mjs [baseUrl]   (default http://localhost:3001; dev server must be running)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = path.resolve("screenshots", "review");
const users = JSON.parse(fs.readFileSync("db/seed/users.json", "utf8"));
const EXPERT = { id: users[0].loginId, password: users[0].password };

const SHOTS = [
  { name: "list-1440", width: 1440, path: "/", ready: "[data-list-status='success']" },
  { name: "list-375", width: 375, path: "/", ready: "[data-list-status='success']" },
  { name: "form-add-1440", width: 1440, path: "/premium-service/new" },
  {
    name: "form-add-1440-errors",
    width: 1440,
    path: "/premium-service/new",
    act: async (page) => {
      await page.getByLabel("Category").selectOption("typo");
      await page.getByLabel("Title").fill("C");
      await page.getByLabel("Price").fill("12.5");
      await page.getByLabel("Thumbnail").selectOption({ index: 1 });
      await page.getByRole("button", { name: "Add service" }).click();
      await page.locator("#service-price-error").waitFor();
    },
  },
  { name: "form-edit-375", width: 375, path: "/premium-service/1/edit" },
  {
    name: "form-edit-375-errors",
    width: 375,
    path: "/premium-service/1/edit",
    act: async (page) => {
      await page.getByLabel("Title").fill("");
      await page.getByLabel("Price").fill("-5");
      await page.getByRole("button", { name: "Save changes" }).click();
      await page.locator("#service-price-error").waitFor();
    },
  },
  { name: "detail-1440", width: 1440, path: "/premium-service/1" },
  {
    name: "detail-1440-delete",
    width: 1440,
    height: 1380,
    path: "/premium-service/1",
    act: async (page) => {
      await page.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  { name: "detail-375", width: 375, path: "/premium-service/1" },
  {
    name: "detail-375-delete",
    width: 375,
    height: 1600,
    path: "/premium-service/1",
    act: async (page) => {
      await page.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: BASE });
const login = await context.request.post("/api/auth/login", { data: EXPERT });
if (!login.ok()) throw new Error(`login failed: ${login.status()}`);

for (const shot of SHOTS) {
  const page = await context.newPage();
  await page.setViewportSize({ width: shot.width, height: shot.height ?? 1000 });
  await page.goto(shot.path);
  if (shot.ready) await page.locator(shot.ready).waitFor({ timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  if (shot.act) await shot.act(page);
  // Dialog shots: the dialog is fixed to the window, so capture a viewport as tall as the design frame instead of the whole page.
  const fullPage = !shot.name.endsWith("-delete");
  await page.screenshot({ path: path.join(OUT, `${shot.name}.png`), fullPage, animations: "disabled" });
  console.log("wrote", `${shot.name}.png`);
  await page.close();
}
await browser.close();
