# CLAUDE.md — homework-2 (Bookplate · full feature on a real API)

> Bootstrapped from homework-1 on 2026-10-05. Same stack and conventions; HW2 adds a real API layer (service + hook pattern, no fetch calls inside components), create / details / edit / delete screens, validation that matches the backend, test cases, Playwright and a QA build report. Update this file as those land.

Next.js 16 (App Router, `src/`), React 19, TypeScript strict, **SCSS modules** (no Tailwind), ESLint 9 (`eslint-config-next`), Playwright for responsive QA.

## Commands (use these, do not invent others)

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` → http://localhost:3001 (homework-1 uses 3000) |
| Type-check | `npm run typecheck` |
| Lint | `npm run lint` |
| Both | `npm run check` |
| Responsive screenshots + overflow/tap-target assertions | `npm run qa:responsive` (needs `npx playwright install chromium` once) |
| Login flow checks + `/login` screenshots | `npm run qa:login` |
| Production build | `npm run build` |

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
src/features/<feature>/       stateful screen logic (PremiumServiceList)
src/hooks/  src/lib/  src/data/  src/types/  src/styles/
```

One component per folder: `Name.tsx` + `Name.module.scss`. Named exports, function declarations, `interface XProps` above the component.

**Styling (WM rules)**

- Every colour, font size, weight, spacing and radius comes from `src/styles/_tokens.scss` as a CSS custom property. **No raw hex or magic px in component SCSS** — add a token first if one is missing, and note in the token comment whether it came from a Figma variable or was read off the frame.
- Breakpoints and shared mixins live in `src/styles/_mixins.scss`; import with `@use "../../../styles/mixins" as *;` and use `@include down($bp-md)`. Breakpoints: 1600 / 1366 / 1024 / 991 / 768 / 640 / 480.
- Class names in modules are camelCase, scoped to the component, named by role not appearance (`.titleLink`, `.navCurrent`, not `.bold`, `.mt20`). Modifier classes are adjectives (`.active`, `.navOpen`, `.optionActive`).
- Fonts: Pretendard (body, via jsDelivr CSS link in `layout.tsx`) and Nanum Myeongjo (headings, `next/font/google`). Use `var(--font-sans)` / `var(--font-serif)`.

**Behaviour**

- Reuse before creating: check `src/components/ui` first. Extend a primitive with a prop/variant rather than forking it.
- Every list/data component has **loading, empty, error and filled** states. The list exposes `data-list-status` for QA and `?state=loading|empty|error` pins a state.
- Server Components by default; add `"use client"` only where state/effects/events are required (currently HeaderView, PremiumServiceList, SearchField, SortSelect, CategoryTabs, LoginForm, hook). `Header` is a thin async Server Component that reads the session and renders `HeaderView`..
- Accessibility is non-negotiable: semantic elements, labels on icon buttons, `aria-current`, keyboard support for custom widgets, visible focus, ≥24px targets (asserted by the Playwright suite).
- Data: `src/lib/api/services.ts` is a mock with a 700 ms delay. Keep the signature when wiring a real API.
- Auth is a mock: demo accounts in `src/data/users.mock.ts`, cookie helpers in `src/lib/auth/session.ts`, server actions in `src/features/auth/actions.ts` (a `"use server"` file may export only async functions — constants live in `loginState.ts`). Never put real credentials in the repo.

## Don't

- Don't add Tailwind, a UI kit, a state library or an icon package.
- Don't hardcode copy that exists in `src/data` or the Figma frame; don't invent design values — if Figma is silent, write the assumption in `docs/DESIGN-CHECK.md`.
- Don't commit `.env*` files.
