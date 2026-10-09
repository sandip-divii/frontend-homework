import { expect, test } from "@playwright/test";
import { EXPERT, VIEWER, fieldError, loginAs } from "./helpers";

/**
 * Expert services — read-only checks (no data is created or changed here).
 * Create / edit / delete live in services.mutation.spec.ts and run only with `npm run test:e2e:mutation`.
 */

test.describe("page opens", () => {
  test("title and 12 rows on the first page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Premium Paid Services | Bookplate");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Premium paid service");
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    await expect(page.locator("article")).toHaveCount(12);
  });

  test("detail page shows the record with WM number and date formats", async ({ page }) => {
    await page.goto("/premium-service/1");
    await expect(page).toHaveTitle(/\| Bookplate$/);
    const article = page.locator("article[data-service-id='1']");
    await expect(article).toBeVisible();
    await expect(article.getByText(/^\d{1,3}(,\d{3})*$/).first()).toBeVisible(); // 15,000
    await expect(article.getByText(/^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2} (AM|PM)$/).first()).toBeVisible();
  });

  test("unknown service shows the not-found page", async ({ page }) => {
    const res = await page.goto("/premium-service/999999");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("We could not find that page")).toBeVisible();
  });
});

test.describe("list behaviour", () => {
  test("search by author filters the list", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Search services").fill("Minji");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    const authors = await page.locator("article").allInnerTexts();
    expect(authors.length).toBeGreaterThan(0);
    for (const text of authors) expect(text).toContain("Minji Park");
  });

  test("category with no services shows the empty state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Typo inspection" }).click();
    await expect(page.locator("[data-list-status='empty']")).toBeVisible();
    await expect(page.getByText("No typo inspection services yet")).toBeVisible();
    await page.getByRole("button", { name: "Show all services" }).click();
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
  });

  test("search with no match shows the empty state with the keyword", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Search services").fill("zzz-no-such-service");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByText("No results for “zzz-no-such-service”")).toBeVisible();
  });

  test("sort by price (high to low) reorders the list", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Sort by:/ }).click();
    await page.getByRole("option", { name: "Price: high to low" }).click();
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    const prices = await page.locator("article").evaluateAll((cards) =>
      cards.map((c) => Number((c.textContent?.match(/\d{1,3}(,\d{3})+/)?.[0] ?? "0").replace(/,/g, ""))),
    );
    expect(prices[0]).toBeGreaterThanOrEqual(prices[prices.length - 1]);
  });

  test("filters live in the URL and survive a reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Cover design" }).click();
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    await page.getByRole("button", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/\?category=cover&page=2$/);
    await page.reload();
    await expect(page.getByRole("button", { name: "Cover design" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Cover design", level: 2 })).toBeVisible();
  });

  test("detail and back keep the list filters; a forged ?back= cannot leave the list", async ({ page }) => {
    await page.goto("/?category=cover&page=2");
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    await page.locator("article h3 a").first().click();
    await expect(page).toHaveURL(/\/premium-service\/\d+\?back=category%3Dcover%26page%3D2$/);
    await page.getByRole("link", { name: "Back to the list" }).click();
    await expect(page).toHaveURL(/\/\?category=cover&page=2$/);
    await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("button", { name: "Cover design" })).toHaveAttribute("aria-pressed", "true");

    // Only known list keys with valid values survive; anything else falls back to the plain list.
    await page.goto(`/premium-service/1?back=${encodeURIComponent("https://example.com/?category=nope&evil=1")}`);
    await expect(page.getByRole("link", { name: "Back to the list" })).toHaveAttribute("href", "/");
  });

  test("pagination moves to the next page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    // Titles repeat in the seed data, so compare the first card's link (contains the id), not its text.
    const firstHref = await page.locator("article h3 a").first().getAttribute("href");
    await page.getByRole("button", { name: "Page 2" }).click();
    await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("[data-list-status='success']")).toBeVisible();
    await expect(page.locator("article h3 a").first()).not.toHaveAttribute("href", firstHref ?? "");
  });
});

test.describe("states", () => {
  test("loading, empty and error states render", async ({ page }) => {
    await page.goto("/?state=loading");
    await expect(page.locator("[data-list-status='loading']")).toHaveAttribute("aria-busy", "true");
    await page.goto("/?state=empty");
    await expect(page.locator("[data-list-status='empty']")).toBeVisible();
    await page.goto("/?state=error");
    await expect(page.getByText("Something went wrong")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});

test.describe("roles", () => {
  test("signed out: no Add button, create page redirects to login, API returns 401", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Add service" })).toHaveCount(0);
    await page.goto("/premium-service/new");
    await expect(page).toHaveURL(/\/login\?next=%2Fpremium-service%2Fnew$/);
    const res = await page.request.post("/api/services", { data: { category: "cover", title: "x", author: "y", price: 1 } });
    expect(res.status()).toBe(401);
  });

  test("plain user: no Add button, 403 page and 403 from the API", async ({ page }) => {
    await loginAs(page, VIEWER);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Add service" })).toHaveCount(0);
    await page.goto("/premium-service/new");
    await expect(page.getByText("You do not have permission to open this page")).toBeVisible();
    await page.goto("/premium-service/1");
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
    const res = await page.request.post("/api/services", { data: { category: "cover", title: "Role test", author: "QA", price: 1000 } });
    expect(res.status()).toBe(403);
    expect((await res.json()).error.message).toBe("Only experts and admins can manage services.");
  });

  test("expert: Add button and Edit / Delete are visible, and they carry the list filters", async ({ page }) => {
    await loginAs(page, EXPERT);
    await page.goto("/?category=internal");
    await expect(page.getByRole("link", { name: "Add service" })).toHaveAttribute("href", "/premium-service/new?back=category%3Dinternal");
    await page.goto("/premium-service/1?back=category%3Dinternal");
    await expect(page.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/premium-service/1/edit?back=category%3Dinternal");
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });
});

test.describe("validation (create form, expert)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, EXPERT);
    await page.goto("/premium-service/new");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Add a service");
  });

  test("empty required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Add service" }).click();
    await expect(fieldError(page, "service-title")).toHaveText("Title must be at least 2 characters.");
    await expect(fieldError(page, "service-author")).toHaveText("Author is required.");
    await expect(fieldError(page, "service-price")).toHaveText("Price is required.");
  });

  test("too long title and negative price", async ({ page }) => {
    await page.getByLabel("Title").fill("x".repeat(121));
    await page.getByLabel("Author").fill("QA");
    await page.getByLabel("Price").fill("-5");
    await page.getByRole("button", { name: "Add service" }).click();
    await expect(fieldError(page, "service-title")).toHaveText("Title must be 120 characters or fewer.");
    await expect(fieldError(page, "service-price")).toHaveText("Price cannot be negative.");
  });

  test("wrong format (price is not a whole number)", async ({ page }) => {
    await page.getByLabel("Title").fill("Format test");
    await page.getByLabel("Author").fill("QA");
    await page.getByLabel("Price").fill("12.5");
    await page.getByRole("button", { name: "Add service" }).click();
    await expect(fieldError(page, "service-price")).toHaveText("Price must be a whole number.");
  });

  test("server-side validation returns 422 with field messages", async ({ page }) => {
    const res = await page.request.post("/api/services", { data: { category: "nope", title: "a", author: "", price: -1 } });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error.fields.category[0]).toBe("Choose a category.");
    expect(body.error.fields.title[0]).toBe("Title must be at least 2 characters.");
    expect(body.error.fields.author[0]).toBe("Author is required.");
    expect(body.error.fields.price[0]).toBe("Price cannot be negative.");
  });

  test("a missing field on PUT gets a WM message, not zod's raw text", async ({ page }) => {
    const res = await page.request.put("/api/services/1", { data: { category: "cover", title: "Cover design", price: 15000 } });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error.fields.author).toEqual(["Author is required."]);
  });
});
