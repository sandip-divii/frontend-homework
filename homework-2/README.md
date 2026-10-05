# Homework 2 — A full feature with a real API (Bookplate)

> **Status: bootstrapped from homework-1 on 2026-10-05.** Everything below still describes the homework-1 starting point (list screen, primitives, mock data, login). Replace this README as HW2 takes shape (Steps 3–8: real API, list / create / details / edit / delete, test cases, Playwright, QA build report).

## Starting point (copied from Homework 1)

A list screen built from the Figma frame **pc_1920_Expert Services (See More)** of _XP | Bookplate design_, with fake data, reusable components, token-only styling, loading / empty / filled states and a responsive QA pass at ten widths.

| | |
| --- | --- |
| **Demo** | _pending deploy_ — run locally with `npm run dev` (see below) or deploy with `npx vercel` |
| **Repo** | https://github.com/sandip-divii/frontend-homework (private) — this homework lives in [`homework-2/`](https://github.com/sandip-divii/frontend-homework/tree/main/homework-2) |
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

`/login` implements the Figma frame **pc_1920_ID/PW 로그인** (`node-id=3429-36106`) as a mock sign-in: no backend, a cookie session, and two demo accounts defined in [`src/data/users.mock.ts`](src/data/users.mock.ts) (ID `bookplate` / password `Bookplate2026!`, ID `reviewer` / password `Review2026!`).

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
src/features/auth/            LoginForm + server actions (login / logout), TextField · Checkbox primitives in ui/
src/lib/auth/session.ts       cookie session helpers (mock)
src/hooks/useExpertServices   derived loading/success/empty/error, abortable
src/lib/api/services.ts       mock API (700 ms delay) with filter / sort / paginate
src/data/                     categories, sort options, 50 fake services
src/styles/_tokens.scss       every colour / size / space as a CSS variable (Figma variables + derived)
tests/responsive.spec.ts      Step-5 QA
```

Design rules followed: SCSS modules only, **no hardcoded colours** (every value is a token in `_tokens.scss`, with its Figma variable name in a comment), role-based camelCase class names, one component per folder, Server Components by default.

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
