# CLAUDE.md — homework-2 (Bookplate · full feature on a real API)

> HW2: expert services CRUD on a real MariaDB-backed API (route handlers in this repo). Screens: `/` list, `/premium-service/new`, `/premium-service/[id]`, `/premium-service/[id]/edit`, `/login`. Roles: expert / admin manage, user browses. Docs: `docs/TEST-CASES.md`, `docs/BUILD-REPORT.md`.

Next.js 16 (App Router, `src/`), React 19, TypeScript strict, **SCSS modules** (no Tailwind), ESLint 9 (`eslint-config-next`), Playwright for responsive QA.

## Commands (use these, do not invent others)

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` → http://localhost:3001 (homework-1 uses 3000) |
| Type-check | `npm run typecheck` |
| Lint | `npm run lint` |
| Both | `npm run check` |
| Playwright, read-only project (login, widths, services) | `npm run test:e2e` (needs `npx playwright install chromium` once) |
| Playwright, mutation project (create → edit → delete on the DB) | `npm run test:e2e:mutation` — never against a shared server |
| Screenshot subsets | `npm run qa:responsive` · `npm run qa:login` |
| Production build | `npm run build` |
| Create tables (idempotent) | `npm run db:migrate` |
| Seed demo users + 50 services | `npm run db:seed` (`npm run db:reset` wipes and reseeds) |

## Source of truth

- Figma: `XP | Bookplate design` → frame **pc_1920_Expert Services (See More)** (`node-id=1600-38779`). Reference render: `docs/figma-reference-1920.png`.
- Design check + open questions for the designer: `docs/DESIGN-CHECK.md`. Build plan: `docs/PLAN.md`.
- Only the 1920 frame exists. Responsive behaviour below 1920 is our interpretation; keep it documented in `docs/DESIGN-CHECK.md`.

## Conventions

**Folders**

```
src/app/                      routes only (page.tsx, layout.tsx, route-level .module.scss)
src/components/ui/<Name>/     reusable primitives  (Button, Icon, Badge, Pagination, SortSelect, …)
src/components/layout/<Name>/ page chrome          (Header, PageHero, Footer)
src/components/service/<Name>/ domain components   (ServiceCard, ServiceGrid, ExpertBanner)
src/features/<feature>/       stateful screen logic (PremiumServiceList, LoginForm, ServiceForm, ServiceActions)
src/hooks/                    data hooks (useExpertServices, useLogin) — the only place components get data from
src/services/                 client-side API functions (fetch wrappers) used by hooks
src/lib/validation/           zod schemas shared by API routes and forms
src/server/                   server-only: db pool, env, http helpers, auth (password, token, session), repositories
src/app/api/**/route.ts       route handlers (the "real API")
db/                           schema.sql, migrate.mjs, seed.mjs, seed/users.json
src/lib/  src/types/  src/styles/
```

One component per folder: `Name.tsx` + `Name.module.scss`. Named exports, function declarations, `interface XProps` above the component.

**Styling (WM rules)**

- Every colour, font size, weight, spacing and radius comes from `src/styles/_tokens.scss` as a CSS custom property. **No raw hex or magic px in component SCSS** — add a token first if one is missing, and note in the token comment whether it came from a Figma variable or was read off the frame.
- Breakpoints and shared mixins live in `src/styles/_mixins.scss`; import with `@use "../../../styles/mixins" as *;` and use `@include down($bp-md)`. Breakpoints: 1600 / 1366 / 1024 / 991 / 768 / 640 / 480.
- Class names are **lowercase-with-hyphens** (WM rule: `main-container`, never `mainContainer` or `main_container`), scoped to the component, named by role not appearance (`.title-link`, `.nav-current`, not `.bold`, `.mt20`). Modifier classes are adjectives (`.active`, `.nav-open`, `.option-active`). In TSX read them with bracket access: `styles["title-link"]`.
- No fixed pixel sizes inside component SCSS (only `1px` borders and `2px` focus outlines). Widths, heights and shadows are tokens in `_tokens.scss` (`--size-icon-btn`, `--card-body-min-h`, `--shadow-menu`, …); breakpoints are the `$bp-*` variables in `_mixins.scss`.
- Fonts: Pretendard (body, via jsDelivr CSS link in `layout.tsx`) and Nanum Myeongjo (headings, `next/font/google`). Use `var(--font-sans)` / `var(--font-serif)`.

**Behaviour**

- Reuse before creating: check `src/components/ui` first. Extend a primitive with a prop/variant rather than forking it.
- Every list/data component has **loading, empty, error and filled** states. The list exposes `data-list-status` for QA and `?state=loading|empty|error` pins a state.
- Server Components by default; add `"use client"` only where state/effects/events are required (currently HeaderView, PremiumServiceList, SearchField, SortSelect, CategoryTabs, LoginForm, hooks). `Header` is a thin async Server Component that reads the session and renders `HeaderView`.
- Accessibility is non-negotiable: semantic elements, labels on icon buttons, `aria-current`, keyboard support for custom widgets, visible focus, ≥24px targets (asserted by the Playwright suite).
- **Data flow (service + hook pattern):** component → hook (`src/hooks`) → service (`src/services`, `apiFetch`) → route handler (`src/app/api`) → repository (`src/server/repositories`) → MySQL. Components never call `fetch` or the database directly. Server Components may call repositories directly (they are the backend).
- **Database:** MariaDB/MySQL via `mysql2` pool (`src/server/db.ts`), `DATABASE_URL` in `.env.local` (see `.env.example`). Schema lives in `db/schema.sql`; change it there, keep it idempotent, re-run `npm run db:migrate`. Use `?` placeholders only — never string-concatenate values into SQL.
- **API contract:** success returns the resource (or `PagedResult`), errors return `{ error: { message, fields? } }` with 400 / 401 / 404 / 422 / 503. Validation uses the zod schemas in `src/lib/validation` on the server (authoritative) and may reuse them in forms. Mutations require a session (401 otherwise).
- **Auth:** `POST /api/auth/login` verifies scrypt hashes from `users` and sets an httpOnly HMAC-signed cookie (`bp_session`, 8 h); `GET /api/auth/me`, `POST /api/auth/logout`. Demo accounts are seeded from `db/seed/users.json` (dev only). Never commit real credentials or `.env.local`.
- **Roles:** `lib/auth/roles.ts` (`canManageServices`) is the single source for both the API (401 / 403) and the UI (buttons hidden, `Forbidden` page). Pages that need a session redirect to `/login?next=<path>`; `next` must be a same-origin path.
- **Forms:** validate with the shared zod schema first (instant feedback), then send; map 422 `error.fields` back onto the fields and show other API messages in the form-level alert while keeping the user's input. Disable submit while pending. Success = toast (`useToast`) + `router.push` + `router.refresh()`. Destructive actions go through `ConfirmDialog`.
- **WM formats:** `lib/format.ts` — `formatPrice` (three-digit commas, no decimals), `formatDate` (`YYYY-MM-DD`), `formatDateTime` (`YYYY-MM-DD h:mm AM`). Never format inline.
- **Tests:** read-only specs run by default; anything that writes data is `*.mutation.spec.ts` (Playwright project "mutation") and cleans up after itself.

## Don't

- Don't add Tailwind, a UI kit, a state library or an icon package.
- Don't hardcode copy that exists in `src/data` or the Figma frame; don't invent design values — if Figma is silent, write the assumption in `docs/DESIGN-CHECK.md`.
- Don't commit `.env*` files.
