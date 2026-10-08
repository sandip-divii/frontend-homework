# Homework 2 — A full feature with a real API (Bookplate)

Expert services for the Bookplate publishing platform: **list → create → details → edit → delete** on a real
MariaDB-backed API built in this repo (Next.js route handlers), with roles, WM formats, loading / empty / error
states, test cases, Playwright (read-only + separate mutation suite) and a QA build report.

| | |
| --- | --- |
| **Demo** | https://frontend-homework-2-red.vercel.app — Vercel (functions in Tokyo) + the same API on a free **TiDB Cloud Starter** MySQL-compatible database in Tokyo. Log in as `bookplate` / `Bookplate2026!` to add, edit and delete. Local run: see "Run it". |
| **Repo** | https://github.com/sandip-divii/frontend-homework (public) — this homework lives in [`homework-2/`](https://github.com/sandip-divii/frontend-homework/tree/main/homework-2) |
| **Design** | Figma [list frame](https://www.figma.com/design/7yxIdnZegxBVEiqyV3oQmA/XP-%7C-Bookplate-design?node-id=1600-38779) · [login frame](https://www.figma.com/design/7yxIdnZegxBVEiqyV3oQmA/XP-%7C-Bookplate-design?node-id=3429-36106); create / detail / edit screens reuse the same primitives (no Figma frame exists for them) |
| **Docs** | [QA hand-over](docs/QA-HANDOVER.md) · [Test cases (WM QA format)](docs/TEST-CASES.md) · [QA build report](docs/BUILD-REPORT.md) · [Design check](docs/DESIGN-CHECK.md) · [Plan](docs/PLAN.md) |

## Screens

| Route | Who | What |
| --- | --- | --- |
| `/` | everyone | List: category tabs, search, sort, 12 per page, pagination; experts/admins also see **Add service** |
| `/premium-service/new` | expert, admin | Create form (signed-out → `/login?next=…`, plain user → 403 page) |
| `/premium-service/:id` | everyone | Details: thumbnail, badge, author, price `15,000` KRW, likes, rating, description, Created / Updated (`YYYY-MM-DD h:mm AM`); **Edit / Delete** for managers |
| `/premium-service/:id/edit` | expert, admin | Edit form, pre-filled |
| `/login` | everyone | ID / PW login (Figma), Save ID, show/hide password, returns to `?next=` |

**Roles:** `bookplate` (expert) can manage services; `reviewer` (user) can only browse. The API enforces it (401 / 403) and the UI hides the buttons.

**WM formats:** numbers use the three-digit comma rule with no decimals for KRW (`12,345`); dates use the English WM format `YYYY-MM-DD` with AM/PM after the time; error messages are field-level, one sentence, identical on the form and in the API (`lib/validation`). The WM Error Message List page is still empty ("working on it"), so our list is documented in `docs/TEST-CASES.md`.

## Run it

```bash
# 1. database — local XAMPP MariaDB on 127.0.0.1:3307 (migrate creates the "homework2" database if missing)
#    hosted alternative: any MySQL-compatible URL + DATABASE_SSL=true (the demo uses TiDB Cloud Starter)
cp .env.example .env.local        # DATABASE_URL + a random SESSION_SECRET
npm install
npm run db:migrate                # creates users + expert_services (idempotent)
npm run db:seed                   # 2 demo users + 50 services  (npm run db:reset wipes and reseeds)

# 2. app
npm run dev                       # http://localhost:3001   (homework-1 keeps 3000)
curl http://localhost:3001/api/health   # {"ok":true,"database":"up"}
```

Demo accounts (local seed only): see [`db/seed/users.json`](db/seed/users.json) — `bookplate` / `Bookplate2026!` (expert), `reviewer` / `Review2026!` (user).

| Script | Purpose |
| --- | --- |
| `npm run check` | `tsc --noEmit` + ESLint |
| `npm run build` | production build |
| `npm run test:e2e` | Playwright, read-only project: login, list widths, form widths, services (page opens, list, states, roles, validation) |
| `npm run test:e2e:mutation` | Playwright **mutation** project: create → list → edit → delete on the real API (writes to the DB; never run against a shared server) |
| `npm run test:e2e:all` | both projects (HTML report in `playwright-report/`; the one run against the demo is published at [/playwright-report/](https://frontend-homework-2-red.vercel.app/playwright-report/)) |
| `npm run qa:responsive` / `npm run qa:login` | screenshot subsets |

## Starting point (copied from Homework 1)

## Database & API

**Setup (local XAMPP MariaDB, port 3307):**

```bash
cp .env.example .env.local      # set DATABASE_URL and a random SESSION_SECRET
npm run db:migrate              # creates users + expert_services (idempotent)
npm run db:seed                 # 2 demo users + 50 services (npm run db:reset wipes first)
npm run dev                     # http://localhost:3001
curl http://localhost:3001/api/health   # → {"ok":true,"database":"up"}
```

**Endpoints** (JSON; errors are `{ "error": { "message", "fields?" } }`):

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | – | DB connectivity |
| GET | `/api/services?category&q&sort&page&pageSize` | – | `PagedResult<ExpertService>`; 422 on bad query |
| POST | `/api/services` | session | body = `ServiceInput`; 201 · 422 |
| GET | `/api/services/:id` | – | 404 when missing |
| PUT | `/api/services/:id` | session | 200 · 404 · 422 |
| DELETE | `/api/services/:id` | session | 204 · 404 |
| POST | `/api/auth/login` | – | `{ id, password, saveId? }` → `{ user }` + cookies; 401 with `fields.id` / `fields.password` |
| GET | `/api/auth/me` | session | `{ user }` or 401 |
| POST | `/api/auth/logout` | – | clears the session cookie |

Validation rules live once in `src/lib/validation` (zod) and are used by the API and reusable by forms. Passwords are stored as scrypt hashes; the session is an httpOnly, HMAC-signed cookie (8 h). Demo accounts: `db/seed/users.json`.

**Data flow:** component → hook (`src/hooks`) → service (`src/services`) → route handler (`src/app/api`) → repository (`src/server/repositories`) → MySQL.

## Starting point (copied from Homework 1)

A list screen built from the Figma frame **pc_1920_Expert Services (See More)** of _XP | Bookplate design_, with fake data, reusable components, token-only styling, loading / empty / filled states and a responsive QA pass at ten widths.

| | |
| --- | --- |
| **Demo** | _pending deploy_ — run locally with `npm run dev` (see below) or deploy with `npx vercel` |
| **Repo** | https://github.com/sandip-divii/frontend-homework (public) — this homework lives in [`homework-2/`](https://github.com/sandip-divii/frontend-homework/tree/main/homework-2) |
| **Figma** | https://www.figma.com/design/7yxIdnZegxBVEiqyV3oQmA/XP-%7C-Bookplate-design?node-id=1600-38779 |
| **Reference render** | [`docs/figma-reference-1920.png`](docs/figma-reference-1920.png) |

## Run it

```bash
npm install
npm run dev          # http://localhost:3001 (homework-1 stays on 3000)
```

No `.env.local` is needed for the mock data. If one is introduced later, it stays untracked (`.env*` is git-ignored).

| Script | Purpose |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (eslint-config-next, core-web-vitals + TypeScript) |
| `npm run check` | both of the above |
| `npm run qa:responsive` | Playwright: screenshots at 10 widths × 3 states, sideways-scroll and tap-target assertions (run `npx playwright install chromium` once) |
| `npm run qa:login` | Playwright: login flow checks + screenshots of `/login` |
| `npm run build` | production build |

## States

| State | How to see it |
| --- | --- |
| Loading | first 700 ms of any query, or pin it with [`/?state=loading`](http://localhost:3001/?state=loading) |
| Empty | click the **Typo inspection** tab (no mock items), search for gibberish, or [`/?state=empty`](http://localhost:3001/?state=empty) |
| Error | [`/?state=error`](http://localhost:3001/?state=error) — "Try again" re-runs the query |
| Filled | default: 12 cards per page, 50 mock services across 3 categories, sort + pagination |

## Temporary login

`/login` implements the Figma frame **pc_1920_ID/PW 로그인** (`node-id=3429-36106`) against `POST /api/auth/login`. Two demo accounts are seeded from [`db/seed/users.json`](db/seed/users.json) (ID `bookplate` / password `Bookplate2026!`, ID `reviewer` / password `Review2026!`).

- Unknown ID → "This ID does not exist."; wrong password → "The ID and password do not match." (the two error states drawn in Figma).
- **Save ID** remembers the ID in a cookie and pre-fills it next time; the eye button toggles password visibility.
- Success sets an `httpOnly` session cookie and redirects to the list; the header's logout icon clears it and returns to `/login`. The list itself is not gated so the demo stays open.
- The header's account icons follow the session: signed in shows bell · my page · cart · log out (Figma `gnb_로그인후`); signed out shows my page · log in, both linking to `/login` (no Figma frame for this state, see `docs/DESIGN-CHECK.md`).
- `npm run qa:login` runs the Playwright checks (errors, sign-in, remember-ID, logout, password toggle) and writes `screenshots/login/{1920,1366,768,375}[-error].png`.

## Responsive QA (Step 5)

Screenshots live in [`screenshots/`](screenshots/) — `filled/`, `loading/`, `empty/`, one PNG per width.

| Width | 1920 | 1600 | 1366 | 1280 | 1024 | 991 | 768 | 640 | 480 | 375 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Columns | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 | 1 |
| Header | full nav | full nav | full nav | menu button | menu | menu | menu | menu | menu | menu |
| Search box | beside tabs | beside | beside | beside | own row | own row | own row | own row | own row | own row |

The Playwright suite asserts, at every width and state, that the document does not scroll sideways, no visible button/input is smaller than 24 × 24 px, and the filled state renders 12 cards. See the test output section at the bottom for the last run.

## What was built

```
src/app/                      routes (Server Components) + fonts
src/components/ui/            Icon · Logo · Button · Badge · Skeleton · EmptyState · Pagination
                              SearchField · SortSelect · CategoryTabs · SectionTitle
src/components/layout/        Header · PageHero · Footer
src/components/service/       ServiceCard (+ skeleton) · ServiceGrid (4 states) · ExpertBanner
src/features/premium-service/ PremiumServiceList — composes the above, owns filter/sort/page state
src/features/auth/            LoginForm (uses useLogin → services/auth → /api/auth/*)
src/services/ · src/hooks/    client API functions and the hooks components consume
src/server/                   db pool, env, http helpers, auth (scrypt, HMAC token, session), repositories
src/app/api/                  route handlers: services CRUD, auth, health
db/                           schema.sql, migrate.mjs, seed.mjs, seed/users.json
src/hooks/useExpertServices   derived loading/success/empty/error, abortable, calls /api/services
src/data/categories.ts        tab + sort option labels
src/styles/_tokens.scss       every colour / size / space as a CSS variable (Figma variables + derived)
tests/responsive.spec.ts      Step-5 QA
```

Design rules followed: SCSS modules only, **no hardcoded colours** (every value is a token in `_tokens.scss`, with its Figma variable name in a comment), lowercase-with-hyphens class names (WM), no fixed px sizes in components, one component per folder, Server Components by default.

## Design check & assumptions

The Figma frame was checked before building; results and the ten questions for the designer are in [`docs/DESIGN-CHECK.md`](docs/DESIGN-CHECK.md). The plan written before coding is in [`docs/PLAN.md`](docs/PLAN.md). Headline items:

- Only a 1920 frame exists; the responsive behaviour is our interpretation (documented).
- Several Figma strings are machine-translation artifacts ("whole; total; entire", "One … Ten"); tab labels and page numbers were normalised, header/footer copy kept verbatim.
- The logo and the banner photo could not be exported (Figma MCP quota); they are approximated in code and flagged for the designer.
- Card meta text is 12px instead of Figma's 11px for legibility.

## Project setup for Claude

- [`CLAUDE.md`](CLAUDE.md) — conventions, commands, do/don't.
- [`.claude/skills/fe-responsive-qa/SKILL.md`](.claude/skills/fe-responsive-qa/SKILL.md) — runs and reviews the responsive QA.
- [`.claude/wm/`](.claude/wm/README.md) — drop `wm-contract.md` here (not available on this machine at setup time).
