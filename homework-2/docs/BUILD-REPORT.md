# QA build report — Expert services (Homework 2)

Format: WM | Report (clear, specific, verified) with the 10 parts from training Step 8, Part C.
Written as a hand-over to QA: everything needed to test is on this page or linked from it.

## 1. Build

| | |
| --- | --- |
| Repository | https://github.com/sandip-divii/frontend-homework (public) |
| Branch | `main` |
| Folder | `homework-2/` |
| Commit | `04d331e` — Homework 2: create / edit / delete screens, roles, WM formats, tests, docs |
| Date | 2026-10-07 |
| Run | locally (see part 6); no hosted demo because the API needs the local MariaDB |

## 2. TL tasks covered

- TL | AI Frontend Training — Homework 2 (Steps 3–8): https://app.notion.com/p/3e9326b2d5fb80c0872def7b6a848d3c
- Submission page: https://app.notion.com/p/3f0326b2d5fb815ca71dc64c50a11044

## 3. What changed, in plain words

The "Premium Paid Services" list from Homework 1 now runs on a real database and a real API, and an expert can manage services end to end:

1. **Real data.** The list reads from MariaDB through `GET /api/services` (search, category filter, sort, 12 per page). No mock data is left.
2. **Add a service.** Experts and admins see an **Add service** button on the list. The form has Category, Title, Author, Price, Thumbnail and Description, checks the rules before sending and shows the API's messages if the server rejects anything.
3. **Service details.** Each card opens a detail page with the picture, author, price (`15,000` KRW), likes, rating, description and the Created / Updated times in WM format. Managers get **Edit** and **Delete** here.
4. **Edit.** Same form, pre-filled. Saving shows a toast and returns to the list.
5. **Delete.** Asks for confirmation in a dialog, then removes the service and returns to the list.
6. **Login and roles.** `/login` talks to `POST /api/auth/login`; the header switches icons with the session. Only expert / admin can create, edit or delete — the API answers 401 (not signed in) or 403 (wrong role), and the UI hides the buttons and shows a "not allowed" page.
7. **Not found.** A wrong service id shows a proper 404 page.

## 4. Fixed issues

| Issue | Fix |
| --- | --- |
| HW1 review: class names were camelCase | All SCSS-module classes are lowercase-with-hyphens; rule in `CLAUDE.md` |
| HW1 review: fixed pixel sizes in components | Sizes moved to tokens in `src/styles/_tokens.scss` |
| Empty price was accepted as `0` (found by the Playwright validation test) | Price is validated step by step: required → number → whole number → ≥ 0 → ≤ 100,000,000 |
| New feature SCSS files imported the mixins with the wrong relative path (500 on every page in dev) | Paths corrected (`features/*` are two levels deep) |

## 5. Test accounts / roles

Local seed only (`db/seed/users.json`, loaded by `npm run db:seed`). Passwords are in that file, not here.

| ID | Role | Can |
| --- | --- | --- |
| `bookplate` | expert | browse, add, edit, delete |
| `reviewer` | user | browse, log in / out — gets 403 on manager screens and API calls |
| (signed out) | — | browse, redirected to `/login?next=…` from manager screens |

## 6. Data QA must prepare first

1. XAMPP MariaDB running on `127.0.0.1:3307` with an empty database named `homework2` (phpMyAdmin → New → `homework2`).
2. In `homework-2/`: copy `.env.example` to `.env.local` (set `DATABASE_URL`, any long random `SESSION_SECRET`).
3. `npm install` → `npm run db:migrate` → `npm run db:seed` (2 users, 50 services: 36 cover, 8 internal, 6 correction, 0 typo — the empty category is intentional).
4. `npm run dev` → http://localhost:3001 ; `GET /api/health` must answer `{"ok":true,"database":"up"}`.
5. To start over at any time: `npm run db:reset`.

## 7. What to test, numbered

Full cases with IDs, preconditions, steps and expected results: [`docs/TEST-CASES.md`](TEST-CASES.md). Short list:

1. Open `/` — title, 12 cards, pagination 1–5.
2. Search "Minji", tab **Typo inspection** (empty state), search gibberish (no-results state), sort **Price: high to low**, page 2.
3. Signed out: no **Add service**; `/premium-service/new` → login page; after login you return to the form.
4. Log in as `reviewer`: still no Add; `/premium-service/new` → "You do not have permission"; detail has no Edit / Delete.
5. Log in as `bookplate`: **Add service** → submit empty (5 field errors) → title of 121 chars / price `-5` / price `12.5` (one error each) → valid form → toast, back on the list, searchable.
6. Open the new service → **Edit** (pre-filled) → change title and price → **Save changes** → detail shows the change and `Updated` moved.
7. **Delete** → **Cancel** keeps it; **Delete** → confirm → toast, back on the list, direct URL gives the 404 page.
8. `?state=loading`, `?state=empty`, `?state=error` on `/`; stop MariaDB → error state + **Try again**.
9. Widths 1920 / 1366 / 768 / 375 on list, create, detail, edit, login — no sideways scroll, menu button below 1366.
10. Header **Log out** → signed-out icons; `/api/auth/me` → 401.

## 8. Known issues and what is not covered

- **No hosted demo.** The API needs the local MariaDB; demo is live on the review call or by following part 6. A hosted MySQL (Aiven / TiDB free tier) plus Vercel would take ~30 min once an account exists.
- **No "my page", cart or notifications** — header icons for those are placeholders from the Figma frame.
- **Likes, rating and review count** are seed data only; there is no UI to like or review.
- **Thumbnail** is a choice of three placeholder covers (no file upload yet).
- **Session** is an HMAC-signed cookie with an 8-hour expiry and no server-side revocation list; fine for a training build, not for production.
- **WM Error Message List** is still empty in WM, so our messages follow the WM style (short, field-level) but are not yet an approved list.
- The list refreshes by remounting after a mutation redirect; there is no client cache (TanStack Query is not used in this repo).
- Tests run in Chromium only.

## 9. Results of lint, type-check, build and tests

Real output, captured on 2026-10-07:

```text
$ npx tsc --noEmit
exit code: 0

$ npm run lint
exit code: 0

$ npm run build
✓ Compiled successfully in 1437ms
  Running TypeScript ...
  Finished TypeScript in 2.1s ...
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

$ npm run test:e2e
Running 66 tests using 1 worker
66 passed (1.4m)

$ npm run test:e2e:mutation
Running 3 tests using 1 worker
ok 1 [mutation] › tests\services.mutation.spec.ts:29:7 › create → list → edit → delete › create through the 
ok 2 [mutation] › tests\services.mutation.spec.ts:52:7 › create → list → edit → delete › edit pre-fills the 
ok 3 [mutation] › tests\services.mutation.spec.ts:66:7 › create → list → edit → delete › delete asks for con
3 passed (7.5s)
```

## 10. Screen sizes and browsers checked

| What | Widths | How |
| --- | --- | --- |
| List (filled / loading / empty) | 1920 · 1600 · 1366 · 1280 · 1024 · 991 · 768 · 640 · 480 · 375 | `tests/responsive.spec.ts` (30 tests, screenshots in `screenshots/`) |
| Create · Detail · Edit | 1920 · 1366 · 768 · 375 | `tests/responsive-forms.spec.ts` (12 tests, `screenshots/forms/`) |
| Login (default / error) | 1920 · 1366 · 768 · 375 | `tests/login.spec.ts` (`screenshots/login/`) |
| Browsers | Chromium 1.x (Playwright) · Chrome 1xx manual on Windows 11 | Safari / Firefox not checked |
