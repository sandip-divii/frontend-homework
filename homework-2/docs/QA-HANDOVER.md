# QA handover — Homework 2 (Expert services)

Written for the QA review of the deployed demo. Everything QA needs is on this page or one click away.

## 1. Deployed URL

| | |
| --- | --- |
| **Demo (latest build)** | https://frontend-homework-2-red.vercel.app |
| Stack behind it | Next.js 16 on Vercel (functions in Tokyo) + the app's own API on a free TiDB Cloud Starter MySQL-compatible database (Tokyo). Same code and seed as local. |
| Build | branch `main`, deployed commit `20141c7` (second resubmission after the QA review, 2026-10-09; later commits only add docs and the HTML report) — https://github.com/sandip-divii/frontend-homework/tree/main/homework-2 |
| Health check | https://frontend-homework-2-red.vercel.app/api/health → `{"ok":true,"database":"up"}` |
| Note | The free database scales to zero: the first request after an idle period can take 1–3 s. The demo data is shared by everyone who opens the link. |

**Test credentials (demo seed only, not real accounts)**

| ID | Password | Role | Can |
| --- | --- | --- | --- |
| `bookplate` | `Bookplate2026!` | expert | browse, **Add service**, **Edit**, **Delete** |
| `reviewer` | `Review2026!` | user | browse only; 403 page on manager screens; API answers 403 |
| (signed out) | — | — | browse; `/premium-service/new` redirects to `/login?next=…` |

Reset the demo data at any time (Sandip): `node --env-file=.env.tidb db/seed.mjs --reset` → 50 services (36 cover, 8 internal, 6 correction, 0 typo), 2 users.

**Mutation tests on the demo:** yes, QA may create / edit / delete there, by hand or with `PLAYWRIGHT_BASE_URL=https://frontend-homework-2-red.vercel.app npm run test:e2e:mutation` (3 tests; it deletes the row it creates). Nothing on the demo is real data, but please **do not edit or delete the seed rows (ids 1–50)**: the read-only tests rely on them (id 1 for the detail / edit checks, 50 rows for pages 1–5, "Minji Park" for search, an empty Typo inspection category for the empty state). Create your own rows and edit / delete those; the seed can be restored with the command above.

## 2. QA test cases

[`docs/TEST-CASES.md`](TEST-CASES.md) — WM QA Template format (ID · type P / N · precondition · steps · expected result · automation), 45 cases: 21 positive, 24 negative:

| Area | IDs | Positive | Negative |
| --- | --- | --- | --- |
| List (page opens, rows, detail, 404) | PO-01–04 | title, 12 rows, detail record, login page | unknown id → 404 page |
| Create → List → Edit → Delete | MF-01–06 | full main flow with toasts, started from the filtered list `/?category=typo`; create, edit and delete each return to that same filtered list | cancel in the dialog keeps the record; double-click cannot create twice |
| Validation | VA-01–09 | — | empty required, too long, wrong format, negative, server 422, DB down, login errors, missing field on PUT |
| Search / Filter / Sort / Pagination | LI-01–10 | author search, sort, page 2, category tab, filters kept across a reload (LI-08) and across detail → Back to the list (LI-09) | no results, empty category, invalid `page=0` → 422, forged `?back=` falls back to `/` (LI-10) |
| Roles | RO-01–07 | expert sees and uses Add / Edit / Delete; log out | signed out → redirect / 401; user → 403 page and 403 API |
| States | ST-01–05 | loading skeleton, empty, saving state | error (`?state=`), DB stopped |
| Screen sizes | SS-01–04 | 1920 · 1600 · 1440 · 1366 · 1280 · 1024 · 991 · 768 · 640 · 480 · 375, no sideways scroll, no control under 24 px, menu at 375 | — |

## 3. Playwright tests and report

**Files** (`homework-2/tests/`)

| File | Project | Tests | What it covers |
| --- | --- | --- | --- |
| `services.spec.ts` | chromium (read-only) | 19 | page opens, list behaviour (search, filter, sort, paging, no results, URL filters, `?back=` round trip and guard), states, roles for 3 user types, validation (client + server 422, PUT message) |
| `responsive.spec.ts` | chromium | 33 | list at 11 widths × filled / loading / empty, sideways-scroll and tap-target assertions, screenshots |
| `responsive-forms.spec.ts` | chromium | 15 | create / detail / edit at 1920 / 1440 / 1366 / 768 / 375, screenshots |
| `login.spec.ts` | chromium | 9 | login errors, sign-in, remember-ID, logout, password toggle, 5 widths |
| `services.mutation.spec.ts` | **mutation** (separate, opt-in) | 3 | from `/?category=typo`: create → back on that list with the new card → edit → detail shows the change → Back to the list → delete → back on that list without it → 404; cleans up its own row |

**Commands:** `npm run test:e2e` (read-only, 76) · `npm run test:e2e:mutation` (3) · `npm run test:e2e:all` (79) · add `PLAYWRIGHT_BASE_URL=https://frontend-homework-2-red.vercel.app` to run against the deployed demo.

**Execution evidence (deployed demo, 2026-10-09, build `20141c7`)**

```text
$ PLAYWRIGHT_BASE_URL=https://frontend-homework-2-red.vercel.app npx playwright test   # both projects, HTML report
Running 79 tests using 1 worker
  ok  1 … ok 76 [chromium] (login 9 · responsive 33 · responsive-forms 15 · services 19)
  ok 77 [mutation] › tests/services.mutation.spec.ts:36:7 › create → list → edit → delete (from a filtered list) › create from the filtered list, then it shows in that same list (4.4s)
  ok 78 [mutation] › tests/services.mutation.spec.ts:62:7 › create → list → edit → delete (from a filtered list) › edit pre-fills the form, the change shows on the detail page, and Back returns to the filtered list (4.6s)
  ok 79 [mutation] › tests/services.mutation.spec.ts:84:7 › create → list → edit → delete (from a filtered list) › delete asks for confirmation, then returns to the filtered list without the service (4.4s)

  79 passed (2.4m)
```

**HTML report:** https://frontend-homework-2-red.vercel.app/playwright-report/ — generated by the run above and committed in the repo under `public/playwright-report/` (un-ignored in `homework-2/.gitignore`), so the same file is in git and on the demo. A zip of the same report is attached to the Notion QA page.

## 4. Build details, tested features, results, known issues

**Build details** — see part 1. Checks on commit `20141c7`: `next typegen && tsc --noEmit` 0 errors (also on a fresh `git clone` + `npm ci`) · `eslint` 0 warnings · `next build` OK (12 routes) · Playwright 76 + 3 locally and 79 / 79 against the deployed demo.

**Tested features**

| Feature | Where | Result |
| --- | --- | --- |
| List with search, category filter, sort, 12-per-page pagination (state in the URL, kept when you open a card, add, edit or delete and come back); loading / empty / error states | `/` | Pass |
| Create service (form validation, API 422 mapping, toast, back to the same filtered list — refreshed through the query cache) | `/premium-service/new` | Pass |
| Service details (all fields, WM number and date formats in the viewer's time zone, 404 for unknown id) | `/premium-service/:id` | Pass |
| Edit service (pre-filled, same validation, toast, back to the detail page with the change) | `/premium-service/:id/edit` | Pass |
| Delete service (confirm dialog, toast, back to the same filtered list without the row, 404 afterwards) | detail page | Pass |
| Login / logout, Save ID, show/hide password, return to `?next=` | `/login`, header | Pass |
| Roles: expert vs user vs signed out, UI and API (401 / 403) | all manager screens, API | Pass |
| Responsive 1920 → 375 incl. 1440 / 768 / 375 | all screens | Pass |

**Known issues / not covered**

1. Hosted database is free-tier and scales to zero: first request after idle is slow (1–3 s). Not a bug, but visible.
2. Demo data is shared; concurrent testers see each other's rows. Reset command above.
3. Lists are cached for 30 s and details for 60 s in the browser (TanStack Query `staleTime`); your own changes show immediately, another tester's changes after that window or on a reload.
4. "My page", cart and notification icons are placeholders from the Figma frame (no screens behind them).
5. Likes, rating and review count are seed values only; there is no like / review UI.
6. Thumbnail is a choice of three placeholder covers; no file upload.
7. Session is a signed 8-hour cookie without server-side revocation (training scope).
8. Error-message wording follows the WM style but the WM Error Message List itself is still empty, so it is not an approved list.
9. Tested in Chromium (Playwright) and Chrome on Windows 11; Safari / Firefox not run.

## 5. Responsive and usability check

| Width | List | Create | Detail | Edit | Login | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | Pass | Pass | Pass | Pass | Pass | `screenshots/filled/1440.png`, `screenshots/forms/*-1440.png`, `screenshots/login/1440*.png`, `docs/design-compare/*-1440.png` |
| 768 | Pass | Pass | Pass | Pass | Pass | `screenshots/*/768*.png`, `docs/design-compare/*-768.png` |
| 375 | Pass | Pass | Pass | Pass | Pass | `screenshots/*/375*.png`, `docs/design-compare/*-375.png` |
| other WM widths (1920, 1600, 1366, 1280, 1024, 991, 640, 480) | Pass | — | — | — | — | `screenshots/filled|loading|empty/<width>.png` |

Checks per width: no sideways scroll (asserted), no overlapping or cut-off layout (screenshots), no control under 24 px (asserted), header collapses to a menu below 1366, forms stack buttons under 480. Loading, empty and error states verified with `?state=loading|empty|error` and the empty "Typo inspection" category; validation and error states verified in `services.spec.ts › validation` and `login.spec.ts`.
