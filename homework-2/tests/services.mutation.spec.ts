import { expect, test } from "@playwright/test";
import { EXPERT, loginAs } from "./helpers";

/**
 * MUTATION TEST — creates, edits and deletes a real row in the connected database.
 * Runs only with `npm run test:e2e:mutation` (Playwright project "mutation"). Never point it at a shared server
 * without telling the other testers; the row it creates carries a unique title and is deleted at the end
 * (and in afterAll on failure).
 *
 * The whole round trip starts from a FILTERED list (category Typo inspection, which the seed leaves empty)
 * and checks that create, edit and delete each come back to that same filtered list.
 */

const stamp = Date.now().toString(36);
const TITLE = `QA mutation ${stamp}`;
const TITLE_EDITED = `QA mutation ${stamp} (edited)`;
const LIST = "/?category=typo";
const LIST_URL = /\/\?category=typo$/;
const BACK = "back=category%3Dtypo";

let createdId: number | null = null;

test.describe.serial("create → list → edit → delete (from a filtered list)", () => {
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

  test("create from the filtered list, then it shows in that same list", async ({ page }) => {
    await page.goto(LIST);
    await page.getByRole("link", { name: "Add service" }).click();
    await expect(page).toHaveURL(new RegExp(`/premium-service/new\\?${BACK}$`));

    await page.getByLabel("Category").selectOption("typo");
    await page.getByLabel("Title").fill(TITLE);
    await page.getByLabel("Author").fill("QA Bot");
    await page.getByLabel("Price").fill("12345");
    await page.getByLabel("Description").fill("Created by the mutation test.");
    await page.getByRole("button", { name: "Add service" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Service added." })).toBeVisible();
    await expect(page).toHaveURL(LIST_URL); // back on the filtered list, not the plain one
    await expect(page.getByRole("button", { name: "Typo inspection" })).toHaveAttribute("aria-pressed", "true");

    const card = page.locator("article").filter({ hasText: TITLE });
    await expect(card).toHaveCount(1); // the list was invalidated, so the new row is there without a reload
    await expect(card).toContainText("12,345"); // WM three-digit comma rule

    const href = await card.getByRole("link", { name: TITLE }).getAttribute("href");
    expect(href).toContain(BACK);
    createdId = Number(href?.match(/\/premium-service\/(\d+)/)?.[1]);
    expect(createdId).toBeGreaterThan(0);
  });

  test("edit pre-fills the form, the change shows on the detail page, and Back returns to the filtered list", async ({ page }) => {
    await page.goto(LIST);
    await page.locator("article").filter({ hasText: TITLE }).getByRole("link", { name: TITLE }).click();
    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(new RegExp(`/premium-service/${createdId}/edit\\?${BACK}$`));

    await expect(page.getByLabel("Title")).toHaveValue(TITLE);
    await expect(page.getByLabel("Price")).toHaveValue("12345");
    await page.getByLabel("Title").fill(TITLE_EDITED);
    await page.getByLabel("Price").fill("20000");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Service updated." })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/premium-service/${createdId}\\?${BACK}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITLE_EDITED);
    await expect(page.locator("article")).toContainText("20,000");

    await page.getByRole("link", { name: "Back to the list" }).click();
    await expect(page).toHaveURL(LIST_URL);
    await expect(page.locator("article").filter({ hasText: TITLE_EDITED })).toContainText("20,000");
  });

  test("delete asks for confirmation, then returns to the filtered list without the service", async ({ page }) => {
    await page.goto(LIST);
    await page.locator("article").filter({ hasText: TITLE_EDITED }).getByRole("link", { name: TITLE_EDITED }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Delete this service?");
    await dialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("status").filter({ hasText: "was deleted." })).toBeVisible();
    await expect(page).toHaveURL(LIST_URL);
    await expect(page.locator("[data-list-status]")).not.toHaveAttribute("data-list-status", "loading");
    await expect(page.locator("article").filter({ hasText: TITLE_EDITED })).toHaveCount(0);

    const res = await page.request.get(`/api/services/${createdId}`);
    expect(res.status()).toBe(404);
    createdId = null;
  });
});
