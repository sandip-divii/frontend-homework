# Homework 2 — A full feature with a real API (Bookplate)

Expert services for the Bookplate publishing platform: **list → create → details → edit → delete** on a real
MariaDB-backed API built in this repo (Next.js route handlers), **TanStack Query** on the client, roles, WM formats,
loading / empty / error states, test cases, Playwright (read-only + separate mutation suite) and a QA build report.

| | |
| --- | --- |
| **Demo** | https://frontend-homework-2-red.vercel.app — Vercel (functions in Tokyo) + the same API on a free **TiDB Cloud Starter** MySQL-compatible database in Tokyo. Log in as `bookplate` / `Bookplate2026!` to add, edit and delete. Local run: see "Run it". |
| **Repo** | https://github.com/sandip-divii/frontend-homework (public) — this homework lives in [`homework-2/`](https://github.com/sandip-divii/frontend-homework/tree/main/homework-2) |
| **Design** | Figma [list frame](https://www.figma.com/design/7yxIdnZegxBVEiqyV3oQmA/XP-%7C-Bookplate-design?node-id=1600-38779) · [login frame](https://www.figma.com/design/7yxIdnZegxBVEiqyV3oQmA/XP-%7C-Bookplate-design?node-id=3429-36106) — exports in [`docs/figma-reference-1920.png`](docs/figma-reference-1920.png) and [`docs/figma-reference-login-1920.png`](docs/figma-reference-login-1920.png); create / detail / edit screens reuse the same primitives (no Figma frame exists for them). Own frames for the screens without a Figma design (list 1440 / 375, add / edit with validation, detail with the delete dialog): [Claude Design canvas](https://claude.ai/artifact/LwFG2D17YvLRRXYxn3Ti6D), PNG exports in [`docs/design/frames/`](docs/design/frames/). Design-vs-build images: [`docs/design-compare/`](docs/design-compare/) (`frame-*.png` = own frames) |
| **Docs** | [QA hand-over](docs/QA-HANDOVER.md) · [Test cases (WM QA format)](docs/TEST-CASES.md) · [QA build report](docs/BUILD-REPORT.md) · [Review prep Q&A](docs/REVIEW-QA.md) · [Design check](docs/DESIGN-CHECK.md) · [Plan](docs/PLAN.md) |

## Screens

| Route | Who | What |
| --- | --- | --- |
| `/` | everyone | List: category tabs, search, sort, 12 per page, pagination — the filter state lives in the URL (`?category=cover&q=minji&sort=newest&page=2`) and travels to the detail / create / edit screens in `?back=`, so Back to the list, Cancel and every redirect after a save or delete return to the same filtered page; experts/admins also see **Add service** |
| `/premium-service/new` | expert, admin | Create form (signed-out → `/login?next=…`, plain user → 403 page); success → toast → list |
| `/premium-service/:id` | everyone | Details: thumbnail, badge, author, price `15,000` KRW, likes, rating, description, Created / Updated (`YYYY-MM-DD h:mm AM`, viewer's time zone); **Edit / Delete** for managers |
| `/premium-service/:id/edit` | expert, admin | Edit form, pre-filled; success → toast → detail page |
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
| `npm run check` | `next typegen` + `tsc --noEmit` + ESLint — passes on a fresh clone, no build needed |
| `npm run build` | production build |
| `npm run test:e2e` | Playwright, read-only project (76 tests): login, list widths, form widths, services (page opens, list, states, roles, validation) |
| `npm run test:e2e:mutation` | Playwright **mutation** project (3 tests): create → list → edit → delete on the real API (writes to the DB; never run against a shared server) |
| `npm run test:e2e:all` | both projects, 79 tests (HTML report in `playwright-report/`; the run against the demo is committed under `public/playwright-report/` and served at [/playwright-report/](https://frontend-homework-2-red.vercel.app/playwright-report/)) |
| `npm run qa:responsive` / `npm run qa:login` | screenshot subsets |
| `node scripts/capture-review.mjs [url]` | captures the build screens that match the Claude Design frames (signed in as the expert, read-only) into `screenshots/review/` |
| `node scripts/design-compare.mjs` | rebuilds `docs/design-compare/*.png`: Figma frames beside the build at 1440 / 768 / 375, and each Claude Design frame beside its build screen (`frame-*.png`) |

Add `PLAYWRIGHT_BASE_URL=https://frontend-homework-2-red.vercel.app` in front of any Playwright script to run it against the deployed demo.

## Architecture

**Data flow (service + hook pattern):** component → TanStack Query hook (`src/hooks/API/<domain>`) → service (`src/services`, `apiFetch`) → route handler (`src/app/api`) → repository (`src/server/repositories`) → MySQL. Components never call `fetch`; Server Components may call a repository directly and hand the row to a client component as `initialData`.

```
src/app/                      routes (Server Components) + fonts; api/** = route handlers (services CRUD, auth, health)
src/providers/QueryProvider   one QueryClient for the app (staleTime 30 s, retry 1)
src/hooks/API/services/       keys.ts · useServicesQuery (list, key = every filter) · useServiceQuery (details, seeded
                              with the server row) · useServiceMutations (create / update / delete → invalidate list + detail)
src/hooks/API/auth/           useLogin · useLogout (mutations; router.refresh() so the server-rendered header follows)
src/services/                 listServices · getService · createService · updateService · deleteService · login · logout · me
src/features/premium-service/ PremiumServiceList (URL filter state via listParams.ts) · forcedState (?state= for QA)
src/features/service-form/    ServiceForm — create + edit, zod schema shared with the API, 422 mapped onto fields
src/features/service-detail/  ServiceDetail (details hook + LocalDateTime) · ServiceActions (Edit / Delete + ConfirmDialog)
src/features/auth/            LoginForm (loginSchema for instant feedback → useLogin)
src/components/ui/            Button · Badge · Icon · Logo · Skeleton · EmptyState · Pagination · SearchField · SortSelect
                              CategoryTabs · SectionTitle · TextField · TextAreaField · SelectField · Toast · ConfirmDialog · LocalDateTime
src/components/layout/        Header (server) + HeaderView (client) · PageHero · PageSection · Footer · Forbidden
src/components/service/       ServiceCard (+ skeleton) · ServiceGrid (4 states) · ExpertBanner
src/lib/validation/           service.ts (serviceInputSchema, listQuerySchema) · auth.ts (loginSchema, LOGIN_MESSAGES)
src/lib/                      format.ts (WM number / date formats) · auth/roles.ts (canManageServices)
src/server/                   db pool, env, http helpers, auth (scrypt, HMAC token, session), repositories
db/                           schema.sql, migrate.mjs, seed.mjs, seed/users.json
src/styles/_tokens.scss       every colour / size / space as a CSS variable (Figma variables + derived)
tests/                        services.spec · services.mutation.spec · responsive.spec · responsive-forms.spec · login.spec · helpers
```

**API** (JSON; errors are `{ "error": { "message", "fields?" } }`):

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | – | DB connectivity |
| GET | `/api/services?category&q&sort&page&pageSize` | – | `PagedResult<ExpertService>`; 422 on bad query |
| POST | `/api/services` | expert / admin | body = `ServiceInput`; 201 · 401 · 403 · 422 |
| GET | `/api/services/:id` | – | 404 when missing |
| PUT | `/api/services/:id` | expert / admin | 200 · 401 · 403 · 404 · 422 |
| DELETE | `/api/services/:id` | expert / admin | 204 · 401 · 403 · 404 |
| POST | `/api/auth/login` | – | `{ id, password, saveId? }` → `{ user }` + cookies; 401 with `fields.id` / `fields.password` |
| GET | `/api/auth/me` | session | `{ user }` or 401 |
| POST | `/api/auth/logout` | – | clears the session cookie |

Validation rules live once in `src/lib/validation` (zod) and run in the API (authoritative) and in the forms (instant feedback). Passwords are stored as scrypt hashes; the session is an httpOnly, HMAC-signed cookie (8 h).

Design rules followed: SCSS modules only, **no hardcoded colours or sizes** (every value is a token in `_tokens.scss`, with its Figma variable name in a comment), lowercase-with-hyphens class names (WM), no inline px, one component per folder, Server Components by default.

## States

| State | How to see it |
| --- | --- |
| Loading | skeleton cards while a query runs, or pin it with [`/?state=loading`](http://localhost:3001/?state=loading) |
| Empty | click the **Typo inspection** tab (no items), search for gibberish, or [`/?state=empty`](http://localhost:3001/?state=empty) |
| Error | [`/?state=error`](http://localhost:3001/?state=error) or stop MariaDB — "Try again" refetches the query |
| Filled | default: 12 cards per page, 50 seeded services, sort + pagination |

## Login

`/login` implements the Figma frame **pc_1920_ID/PW 로그인** (`node-id=3429-36106`) against `POST /api/auth/login`.

- Unknown ID → "This ID does not exist."; wrong password → "The ID and password do not match." (the two error states drawn in Figma); empty fields are caught by the shared `loginSchema` before anything is sent.
- **Save ID** remembers the ID in a cookie and pre-fills it next time; the eye button toggles password visibility.
- Success sets an `httpOnly` session cookie and redirects to `?next=` (same-origin paths only) or the list; the header's logout icon clears it and returns to `/login`.
- The header's account icons follow the session: signed in shows bell · my page · cart · log out (Figma `gnb_로그인후`); signed out shows my page · log in (no Figma frame for this state, see `docs/DESIGN-CHECK.md`).

## Responsive QA

Screenshots live in [`screenshots/`](screenshots/) — `filled/`, `loading/`, `empty/` (11 widths), `forms/` and `login/` (1920 · 1440 · 1366 · 768 · 375).

| Width | 1920 | 1600 | 1440 | 1366 | 1280 | 1024 | 991 | 768 | 640 | 480 | 375 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Columns | 3 | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 | 1 |
| Header | full nav | full nav | full nav | full nav | menu | menu | menu | menu | menu | menu | menu |
| Search box | beside tabs | beside | beside | beside | beside | own row | own row | own row | own row | own row | own row |

The Playwright suite asserts, at every width and state, that the document does not scroll sideways, no visible button/input is smaller than 24 × 24 px, and the filled state renders 12 cards.

## Design check & assumptions

The Figma frame was checked before building; results and the questions for the designer are in [`docs/DESIGN-CHECK.md`](docs/DESIGN-CHECK.md). The plan written before coding is in [`docs/PLAN.md`](docs/PLAN.md). Headline items:

- Only a 1920 frame exists for the list and the login; the responsive behaviour and the create / detail / edit screens are our interpretation (documented).
- Several Figma strings are machine-translation artifacts ("whole; total; entire", "One … Ten"); tab labels and page numbers were normalised, header/footer copy kept verbatim.
- The logo and the banner photo could not be exported (Figma MCP quota at the time); they are approximated in code and flagged for the designer.
- Card meta text is 12px instead of Figma's 11px for legibility.

## Project setup for Claude

- [`CLAUDE.md`](CLAUDE.md) — conventions, commands, do/don't (WM rules win over this file).
- [`.claude/skills/fe-responsive-qa/SKILL.md`](.claude/skills/fe-responsive-qa/SKILL.md) — runs and reviews the responsive QA.
- [`.claude/wm/`](.claude/wm/README.md) — drop `wm-contract.md` here (not available on this machine at setup time).
