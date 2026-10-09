# QA build report — Expert services (Homework 2)

Format: WM | Report (clear, specific, verified) with the 10 parts from training Step 8, Part C.
Written as a hand-over to QA: everything needed to test is on this page or linked from it.

## 1. Build

| | |
| --- | --- |
| Repository | https://github.com/sandip-divii/frontend-homework (public) |
| Branch | `main` |
| Folder | `homework-2/` |
| Commit (deployed build) | `20141c7` — second resubmission: list filters kept across detail / create / edit / delete (QA review of 2026-10-09). History: `eae15ca` TanStack Query + code-review fixes (2026-10-08), `04d331e` first submission (2026-10-07). Commits after `20141c7` only add this report and the published HTML report; the app code is identical. |
| Date | 2026-10-09 |
| Demo | https://frontend-homework-2-red.vercel.app — Vercel (Tokyo functions) + TiDB Cloud Starter (free, MySQL-compatible, Tokyo). Same code and seed as local; `DATABASE_SSL=true` enables TLS. |

## 2. TL tasks covered

- TL | AI Frontend Training — Homework 2 (Steps 3–8): https://app.notion.com/p/3e9326b2d5fb80c0872def7b6a848d3c
- Submission page: https://app.notion.com/p/3f0326b2d5fb815ca71dc64c50a11044 — code review (Vaishali, 2026-10-08) and QA review (Archana, 2026-10-09) feedback addressed in this build, see part 4.

## 3. What changed, in plain words

The "Premium Paid Services" list from Homework 1 runs on a real database and a real API, and an expert can manage services end to end:

1. **Real data.** The list reads from MariaDB through `GET /api/services` (search, category filter, sort, 12 per page). No mock data is left.
2. **Add a service.** Experts and admins see an **Add service** button on the list. The form has Category, Title, Author, Price, Thumbnail and Description, checks the rules before sending and shows the API's messages if the server rejects anything.
3. **Service details.** Each card opens a detail page with the picture, author, price (`15,000` KRW), likes, rating, description and the Created / Updated times in WM format, shown in the viewer's own time zone. Managers get **Edit** and **Delete** here.
4. **Edit.** Same form, pre-filled. Saving shows a toast and returns to the detail page with the change already visible.
5. **Delete.** Asks for confirmation in a dialog, then removes the service and returns to the list.
6. **Login and roles.** `/login` talks to `POST /api/auth/login`; the header switches icons with the session. Only expert / admin can create, edit or delete — the API answers 401 (not signed in) or 403 (wrong role), and the UI hides the buttons and shows a "not allowed" page.
7. **Not found.** A wrong service id shows a proper 404 page.
8. **Since the first submission (resubmission, 2026-10-08):** the client data layer uses **TanStack Query** (`src/hooks/API/services`, `src/hooks/API/auth`): the list and the details are cached by key and every create / edit / delete invalidates them, so lists refresh without being remounted. The list's search, category, sort and page now live in the **URL** (`/?category=cover&page=2`), so they survive a reload and the back button, and a filtered list can be shared.
9. **Since the QA review (second resubmission, 2026-10-09):** the filters also survive the round trip through the other screens. Cards and **Add service** carry the list in `?back=`; **Back to the list**, **Cancel**, the breadcrumb and the redirect after create / edit / delete all return to that exact list (e.g. `/?category=cover&page=2`). The first resubmission only kept them on reload and the browser back button, although the docs said otherwise.

## 4. Fixed issues

| Issue | Fix |
| --- | --- |
| QA review: search / filter / page lost after create, edit or delete (the first resubmission said they survived; they only survived a reload) | Cards and **Add service** carry the list query in `?back=` (validated by `cleanBack`, so a forged value can only produce `/`); every way back uses it. Tests: LI-09 / LI-10 in `services.spec.ts`, and the mutation suite now runs create → edit → delete from `/?category=typo` and asserts it returns there each time |
| QA review: page, build report and QA pack named three different commits and test counts | One deployed commit (`20141c7`) and one result set (part 9) on this report, the hand-over, the submission page and the QA pack page |
| QA review: P / N only in the area summary; 41 cases, not 42 | Every case is marked P or N; 45 cases (21 P, 24 N) after adding LI-09 / LI-10 |
| QA review: report location, widths across documents, shared demo data | Report committed under `public/playwright-report/`; every document lists 1920 / 1440 / 1366 / 768 / 375 for create, detail, edit and login (as `responsive-forms.spec.ts` / `login.spec.ts` test); hosted-demo rules in part 6 and in the hand-over |
| Review: data hooks were hand-written `useEffect` + `useState` in a flat `src/hooks/`, and the list only refreshed because `router.push("/")` remounted it (losing search / filter / page) | TanStack Query hooks in `src/hooks/API/<domain>/` (list hook keyed by every param, details hook, mutations that invalidate list + detail); filters moved to the URL |
| Review: `npx tsc --noEmit` failed on a fresh clone (`Cannot find name 'LayoutProps'`, generated type not in git) | `layout.tsx` types its props by hand; `npm run typecheck` runs `next typegen` first. Verified on a fresh `git clone` + `npm ci` |
| Review: page and docs out of step (old hash and test counts; report folder said "committed" but was gitignored; 41 cases not 42; no P / N marking) | Hash and counts updated everywhere; `public/playwright-report/` un-ignored and committed; 43 cases, each marked P or N |
| Review (small): `LoginForm` checked fields by hand | Uses the shared `loginSchema` |
| Review (small): Created / Updated were formatted on the server (Vercel clock) although the comment said local time | `LocalDateTime` client component (`useSyncExternalStore`): UTC in the HTML, viewer's zone after hydration, no mismatch |
| Review (small): skeleton sizes passed as px through inline `style` | Classes with `--skel-*` tokens; `Skeleton` no longer takes sizes |
| Review (small): `PUT` without `author` returned zod's "Invalid input: expected string, received undefined" | Every text field has WM messages for missing / wrong type ("Author is required."); covered by test VA-09 |
| Review (small): `CLAUDE.md` did not say WM wins | Stated in the naming rule; `wm-contract.md` location referenced |
| HW1 review: class names were camelCase | All SCSS-module classes are lowercase-with-hyphens; rule in `CLAUDE.md` |
| HW1 review: fixed pixel sizes in components | Sizes moved to tokens in `src/styles/_tokens.scss` |
| Empty price was accepted as `0` (found by the Playwright validation test) | Price is validated step by step: required → number → whole number → ≥ 0 → ≤ 100,000,000 |
| New feature SCSS files imported the mixins with the wrong relative path (500 on every page in dev) | Paths corrected (`features/*` are two levels deep) |

## 5. Test accounts / roles

Demo seed only (`db/seed/users.json`, loaded by `npm run db:seed`; the hosted demo uses the same seed).

| ID | Password | Role | Can |
| --- | --- | --- | --- |
| `bookplate` | `Bookplate2026!` | expert | browse, add, edit, delete |
| `reviewer` | `Review2026!` | user | browse, log in / out — gets 403 on manager screens and API calls |
| (signed out) | — | — | browse, redirected to `/login?next=…` from manager screens |

## 6. Data QA must prepare first

1. XAMPP MariaDB running on `127.0.0.1:3307` with an empty database named `homework2` (phpMyAdmin → New → `homework2`).
2. In `homework-2/`: copy `.env.example` to `.env.local` (set `DATABASE_URL`, any long random `SESSION_SECRET`).
3. `npm install` → `npm run db:migrate` → `npm run db:seed` (2 users, 50 services: 36 cover, 8 internal, 6 correction, 0 typo — the empty category is intentional).
4. `npm run dev` → http://localhost:3001 ; `GET /api/health` must answer `{"ok":true,"database":"up"}`.
   Or skip all of this and use the hosted demo: https://frontend-homework-2-red.vercel.app (same seed, same accounts).
   **Hosted demo rules:** QA may create, edit and delete there (by hand or with the mutation suite, which deletes its own row). Nothing on the demo is real data, but please **do not edit or delete the seed rows (ids 1–50)**: the read-only tests rely on them (id 1 for the detail / edit checks, 50 rows for pages 1–5, "Minji Park" for search, an empty Typo inspection category for the empty state). Create your own rows and edit / delete those; Sandip restores the seed on request with `node --env-file=.env.tidb db/seed.mjs --reset`. The database is shared, so testers see each other's rows.
5. To start over at any time: `npm run db:reset`.

## 7. What to test, numbered

Full cases with IDs, P / N type, preconditions, steps and expected results: [`docs/TEST-CASES.md`](TEST-CASES.md). QA hand-over sheet: [`docs/QA-HANDOVER.md`](QA-HANDOVER.md). Short list:

1. Open `/` — title, 12 cards, pagination 1–5.
2. Search "Minji", tab **Typo inspection** (empty state), search gibberish (no-results state), sort **Price: high to low**, page 2 — the URL follows (`?category=…&q=…&sort=…&page=…`); open a card → **Back to the list** returns to the same filtered page; reload keeps the filters.
3. Signed out: no **Add service**; `/premium-service/new` → login page; after login you return to the form.
4. Log in as `reviewer`: still no Add; `/premium-service/new` → "You do not have permission"; detail has no Edit / Delete.
5. Log in as `bookplate`, open `/?category=typo`: **Add service** → submit empty (field errors) → title of 121 chars / price `-5` / price `12.5` (one error each) → valid form → toast, back on `/?category=typo` (same filter) with the new card.
6. Open the new service → **Edit** (pre-filled) → change title and price → **Save changes** → back on the detail page with the change and a later `Updated` → **Back to the list** → `/?category=typo`.
7. **Delete** → **Cancel** keeps it; **Delete** → confirm → toast, back on `/?category=typo` (row gone without a reload), direct URL gives the 404 page.
8. `?state=loading`, `?state=empty`, `?state=error` on `/`; stop MariaDB → error state + **Try again**.
9. Widths 1920 / 1440 / 1366 / 768 / 375 on list, create, detail, edit, login — no sideways scroll, menu button below 1366.
10. Header **Log out** → signed-out icons; `/api/auth/me` → 401.

## 8. Known issues and what is not covered

- **Hosted demo runs on a free TiDB Cloud Starter instance** that scales to zero: the first request after idle can take 1–3 s. The demo database is shared by everyone who opens the link; `node --env-file=.env.tidb db/seed.mjs --reset` (Sandip) restores the seed.
- **No "my page", cart or notifications** — header icons for those are placeholders from the Figma frame.
- **Likes, rating and review count** are seed data only; there is no UI to like or review.
- **Thumbnail** is a choice of three placeholder covers (no file upload yet).
- **Session** is an HMAC-signed cookie with an 8-hour expiry and no server-side revocation list; fine for a training build, not for production.
- **Cache freshness:** list entries are reused for 30 s and detail entries for 60 s (`staleTime`); your own changes invalidate them immediately, another tester's changes appear after that window or on a reload.
- **WM Error Message List** is still empty in WM, so our messages follow the WM style (short, field-level) but are not yet an approved list.
- **Tokens** are role-named (`--color-txt-1`) without night values; WM asks for colour + code with a night value — noted for the next project.
- Tests run in Chromium only.

## 9. Results of lint, type-check, build and tests

Real output, captured on 2026-10-09 at commit `20141c7` (the deployed build):

```text
$ npm run check
> next typegen && tsc --noEmit
✓ Types generated successfully
> eslint
exit code: 0

$ npm run build
✓ Compiled successfully in 1571ms
Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/me
├ ƒ /api/health
├ ƒ /api/services
├ ƒ /api/services/[id]
├ ƒ /login
├ ƒ /premium-service/[id]
├ ƒ /premium-service/[id]/edit
└ ƒ /premium-service/new
ƒ  (Dynamic)  server-rendered on demand
exit code: 0

$ npm run test:e2e              # chromium project (read-only), local
Running 76 tests using 1 worker
76 passed (1.8m)      # services 19 · login 9 · responsive 33 · responsive-forms 15

$ npm run test:e2e:mutation     # local
Running 3 tests using 1 worker
  ok 1 [mutation] › testsservices.mutation.spec.ts:36:7 › … › create from the filtered list, then it shows in that same list (3.2s)
  ok 2 [mutation] › testsservices.mutation.spec.ts:62:7 › … › edit pre-fills the form, the change shows on the detail page, and Back returns to the filtered list (5.4s)
  ok 3 [mutation] › testsservices.mutation.spec.ts:84:7 › … › delete asks for confirmation, then returns to the filtered list without the service (3.2s)
3 passed (13.0s)

# fresh clone check (the reviewer's step) at 20141c7: git clone → npm ci → npx tsc --noEmit
exit code: 0
```

**Both projects against the hosted demo** (`PLAYWRIGHT_BASE_URL=https://frontend-homework-2-red.vercel.app`, 2026-10-09, after deploying `20141c7`; this run produced the published HTML report):

```text
$ PLAYWRIGHT_BASE_URL=https://frontend-homework-2-red.vercel.app npx playwright test   # both projects, HTML report
Running 79 tests using 1 worker
  ok  1 … ok 76 [chromium] (login 9 · responsive 33 · responsive-forms 15 · services 19)
  ok 77 [mutation] › tests/services.mutation.spec.ts:36:7 › create → list → edit → delete (from a filtered list) › create from the filtered list, then it shows in that same list (4.4s)
  ok 78 [mutation] › tests/services.mutation.spec.ts:62:7 › create → list → edit → delete (from a filtered list) › edit pre-fills the form, the change shows on the detail page, and Back returns to the filtered list (4.6s)
  ok 79 [mutation] › tests/services.mutation.spec.ts:84:7 › create → list → edit → delete (from a filtered list) › delete asks for confirmation, then returns to the filtered list without the service (4.4s)

  79 passed (2.4m)
```

## 10. Screen sizes and browsers checked

| What | Widths | How |
| --- | --- | --- |
| List (filled / loading / empty) | 1920 · 1600 · 1440 · 1366 · 1280 · 1024 · 991 · 768 · 640 · 480 · 375 | `tests/responsive.spec.ts` (33 tests, screenshots in `screenshots/`) |
| Create · Detail · Edit | 1920 · 1440 · 1366 · 768 · 375 | `tests/responsive-forms.spec.ts` (15 tests, `screenshots/forms/`) |
| Login (default / error) | 1920 · 1440 · 1366 · 768 · 375 | `tests/login.spec.ts` (`screenshots/login/`) |
| Design vs build | 1440 · 768 · 375 (list, login) | `docs/design-compare/*.png` |
| HTML report (deployed demo, 2026-10-09, build `20141c7`) | 79 / 79 | https://frontend-homework-2-red.vercel.app/playwright-report/ (committed under `public/playwright-report/`) |
| Browsers | Chromium (Playwright) · Chrome on Windows 11 manual | Safari / Firefox not checked |
