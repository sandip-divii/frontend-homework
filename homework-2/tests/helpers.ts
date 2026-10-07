import { expect, type Page } from "@playwright/test";
import users from "../db/seed/users.json";

/** Seeded demo accounts (db/seed/users.json). "bookplate" is an expert, "reviewer" a plain user. */
export const EXPERT = { id: users[0].loginId, password: users[0].password, name: users[0].name };
export const VIEWER = { id: users[1].loginId, password: users[1].password, name: users[1].name };

/** Logs in through the API; the page's request context shares cookies with the browser context. */
export async function loginAs(page: Page, account: { id: string; password: string }) {
  const res = await page.request.post("/api/auth/login", { data: { id: account.id, password: account.password } });
  expect(res.ok(), `login as ${account.id}`).toBeTruthy();
}

/** The field error line (Next's route announcer also has role="alert"). */
export const fieldError = (page: Page, id: string) => page.locator(`#${id}-error`);

export async function expectNoSidewaysScroll(page: Page) {
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(size.scroll, "page scrolls sideways").toBeLessThanOrEqual(size.client);
}
