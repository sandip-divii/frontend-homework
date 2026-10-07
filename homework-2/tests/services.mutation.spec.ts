import { expect, test } from "@playwright/test";
import { EXPERT, loginAs } from "./helpers";

/**
 * MUTATION TEST — creates, edits and deletes a real row in the connected database.
 * Runs only with `npm run test:e2e:mutation` (Playwright project "mutation"). Never point it at a shared server.
 * The row it creates carries a unique title and is deleted at the end (and in afterEach on failure).
 */

const stamp = Date.now().toString(36);
const TITLE = `QA mutation ${stamp}`;
const TITLE_EDITED = `QA mutation ${stamp} (edited)`;

let createdId: number | null = null;

test.describe.serial("create → list → edit → delete", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, EXPERT);
  });

  test.afterAll(async ({ request }) => {
    // Safety net: remove the row if a step failed before the delete step.
    if (createdId) {
      await request.post("/api/auth/login", { data: { id: EXPERT.id, password: EXPERT.password } });
      await request.delete(`/api/services/${createdId}`);
    }
  });

  test("create through the form, then it shows in the list", async ({ page }) => {
    await page.goto("/premium-service/new");
    await page.getByLabel("Category").selectOption("typo");
    await page.getByLabel("Title").fill(TITLE);
    await page.getByLabel("Author").fill("QA Bot");
    await page.getByLabel("Price").fill("12345");
    await page.getByLabel("Description").fill("Created by the mutation test.");
    await page.getByRole("button", { name: "Add service" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Service added." })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);

    await page.getByLabel("Search services").fill(TITLE);
    await page.getByRole("button", { name: "Search" }).click();
    const card = page.locator("article").filter({ hasText: TITLE });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("12,345"); // WM three-digit comma rule

    const href = await card.getByRole("link", { name: TITLE }).getAttribute("href");
    createdId = Number(href?.split("/").pop());
    expect(createdId).toBeGreaterThan(0);
  });

  test("edit pre-fills the form and the change shows on the detail page", async ({ page }) => {
    await page.goto(`/premium-service/${createdId}/edit`);
    await expect(page.getByLabel("Title")).toHaveValue(TITLE);
    await expect(page.getByLabel("Price")).toHaveValue("12345");
    await page.getByLabel("Title").fill(TITLE_EDITED);
    await page.getByLabel("Price").fill("20000");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Service updated." })).toBeVisible();
    await page.goto(`/premium-service/${createdId}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITLE_EDITED);
    await expect(page.locator("article")).toContainText("20,000");
  });

  test("delete asks for confirmation, then the service is gone", async ({ page }) => {
    await page.goto(`/premium-service/${createdId}`);
    await page.getByRole("button", { name: "Delete" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Delete this service?");
    await dialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("status").filter({ hasText: "was deleted." })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);

    const res = await page.request.get(`/api/services/${createdId}`);
    expect(res.status()).toBe(404);
    createdId = null;
  });
});
