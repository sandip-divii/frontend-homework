import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import users from "../db/seed/users.json";

/** Temporary login (Figma: pc_1920_ID/PW 로그인). */
const OUT_DIR = path.resolve("screenshots", "login");
const WIDTHS = [1920, 1366, 768, 375] as const;
const USER = { id: users[0].loginId, password: users[0].password };

/** The field error line (Next's route announcer also has role="alert"). */
const fieldError = (page: Page) => page.locator("form p[role='alert']");

async function submit(page: Page, id: string, password: string) {
  await page.getByLabel("ID", { exact: true }).fill(id);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test.describe("login", () => {
  test("unknown ID shows the ID error", async ({ page }) => {
    await page.goto("/login");
    await submit(page, "nobody", "whatever");
    await expect(fieldError(page)).toHaveText("This ID does not exist.");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("wrong password shows the password error", async ({ page }) => {
    await page.goto("/login");
    await submit(page, USER.id, "wrong-password");
    await expect(fieldError(page)).toHaveText("The ID and password do not match.");
  });

  test("valid credentials sign in, remember the ID and log out again", async ({ page, context }) => {
    await page.goto("/login");
    await page.getByText("Save ID").click();
    await expect(page.getByLabel("Save ID")).toBeChecked();
    await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible(); // logged-out header
    await submit(page, USER.id, USER.password);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible(); // logged-in header
    await expect(page.getByRole("button", { name: "Notifications" })).toBeVisible();

    const names = (await context.cookies()).map((c) => c.name);
    expect(names).toContain("bp_session");
    expect(names).toContain("bp_saved_id");

    await page.goto("/login");
    await expect(page.getByLabel("ID", { exact: true })).toHaveValue(USER.id);

    await page.goto("/");
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await context.cookies()).map((c) => c.name)).not.toContain("bp_session");
    await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();
  });

  test("show/hide password toggles the input type", async ({ page }) => {
    await page.goto("/login");
    const pw = page.getByLabel("Password", { exact: true });
    await expect(pw).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(pw).toHaveAttribute("type", "text");
  });

  for (const width of WIDTHS) {
    test(`${width}px — no sideways scroll, screenshots`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/login");
      await page.evaluate(() => document.fonts.ready);

      const size = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(size.scroll).toBeLessThanOrEqual(size.client);

      fs.mkdirSync(OUT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(OUT_DIR, `${width}.png`), fullPage: true, animations: "disabled" });

      await submit(page, "nobody", "whatever");
      await expect(fieldError(page)).toBeVisible();
      await page.screenshot({ path: path.join(OUT_DIR, `${width}-error.png`), fullPage: true, animations: "disabled" });
    });
  }
});
