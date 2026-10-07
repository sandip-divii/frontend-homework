# Review prep — questions a reviewer may ask, with answers

Answers point at the real files so you can open them during the call. HW2 paths are under `homework-2/`; HW1 is the same code minus the API.

## A. Process (how it was built)

**Q1. What did you do before writing any code?**
Read the Figma frame with the MCP (metadata, screenshot, variables), ran the WM design checklist on it (12 checks), wrote the designer questions, then a plan (`docs/PLAN.md`): what is on the frame, what to reuse, which files, the four states, the responsive rules. Only then the build, one step at a time, with type-check and lint after each step.

**Q2. The Figma tool ran out of quota. How did you still get exact values?**
The metadata tree gives exact x / y / width / height per layer; the saved screenshot gave colours and shapes. For the login frame I opened Figma Dev Mode in Chrome, set the code panel to CSS and read each element's properties. Everything derived this way is marked "derived" in `_tokens.scss` and listed in `docs/DESIGN-CHECK.md`.

**Q3. How do you know the screen matches the design and works at every width?**
Side-by-side comparison at 1920 with `docs/figma-reference-1920.png`, then `tests/responsive.spec.ts`: 10 widths × 3 states, each asserting no sideways scroll and no control under 24 px, with screenshots committed in `screenshots/`.

**Q4. What did the review of HW1 ask you to change, and why did it matter?**
Class names (WM says lowercase-with-hyphens; mine were camelCase and `CLAUDE.md` even told Claude to do that — WM wins over project rules), fixed pixel sizes in components (moved to tokens), the demo link and the submission steps. Lesson: fetch the WM rules first instead of relying on habit.

## B. React concepts

**Q5. What is a component, props and state in your screen? Give an example.**
`ServiceCard` (`src/components/service/ServiceCard/ServiceCard.tsx`) is a component: one function returning JSX. Its prop is `service: ExpertService` — read-only input from the parent list. State lives in `PremiumServiceList` (`useState` for category, keyword, sort, page); changing it re-renders the list and its children.

**Q6. Why does `useExpertServices` derive status instead of storing it?**
`src/hooks/useExpertServices.ts` keeps only `{ key, data, error }` in state. The request key is built from the query; if the stored key differs from the current key the hook returns "loading" immediately. That removes a whole class of bugs (stale "success" shown for a new query) and avoids calling `setState` synchronously inside an effect, which the React lint rule forbids.

**Q7. Explain the `useEffect` in that hook: when does it run, and why the cleanup?**
It runs after render whenever `category`, `keyword`, `sort`, `page`, `pageSize`, `key` or `forced` change (the dependency array). It creates an `AbortController`, calls the service with its signal, and the cleanup aborts the request. So when the user types a new search before the old response arrives, the old request is cancelled and can never overwrite the new result.

**Q8. Why do list rows need a `key`?**
React matches elements between renders by key. Cards use `service.id`, skeletons use the index because they have no identity. Without stable keys React would re-create DOM nodes and lose state (for example focus) when the list changes.

**Q9. What is a controlled form?**
Every input's `value` comes from state and `onChange` writes back to it (`ServiceForm.tsx`, `LoginForm.tsx`). That is why values survive a failed submit and why validation can read them directly.

**Q10. How does conditional rendering show loading / empty / error / filled?**
`ServiceGrid.tsx` switches on `status`: skeleton cards for loading (with `aria-busy`), `EmptyState` for empty and error (with reset / retry buttons), cards for success. The list wrapper exposes `data-list-status` so tests can wait for a state.

**Q11. What are the rules of hooks, and where could they bite here?**
Call hooks only at the top level of a component or another hook, never inside conditions or loops. `useLogin`, `useServiceMutations`, `useToast` are custom hooks; each is called unconditionally at the top of the component that uses it.

**Q12. Why is `any` not allowed, and how do you type the API data?**
`any` switches the compiler off. Domain types are in `src/types/service.ts` and `user.ts`; `apiFetch<T>` returns the typed shape; repositories map DB rows (`ServiceRow`) to `ExpertService` explicitly, including `Number(rating)` because MySQL returns DECIMAL as a string.

## C. Next.js concepts

**Q13. Which file renders `/premium-service/42/edit`, and how does it read the id?**
`src/app/premium-service/[id]/edit/page.tsx`. `[id]` is a dynamic segment; in Next 16 `params` is a Promise, so the page does `const { id } = await params`, then `parseId` rejects anything that is not a positive integer.

**Q14. Server vs client components: which are client here and why?**
Server by default (pages, `Header`, `Footer`, detail page). `"use client"` only where state, effects or events are needed: `HeaderView` (menu state, logout click), `PremiumServiceList`, `SearchField`, `SortSelect`, `CategoryTabs`, `LoginForm`, `ServiceForm`, `ServiceActions`, the hooks, `ToastProvider`.

**Q15. `Header` is async and `HeaderView` is a client component. Why split them?**
`Header` (server) reads the session cookie and the user from the DB, which the browser must never do, then passes only `userName` to `HeaderView`, which needs `useState` for the mobile menu. Server work stays on the server; interactivity stays in the client.

**Q16. How does navigation work after saving a form?**
`useRouter().push("/")` moves to the list; `router.refresh()` re-renders Server Components so the header and any server-fetched data reflect the new state. The list itself re-fetches on mount, so the new row appears without a manual reload.

**Q17. Why does `/premium-service/new` redirect to `/login?next=...` and how is `next` kept safe?**
The page checks the session on the server and calls `redirect()`. `LoginPage` only accepts a `next` that starts with `/` and not `//`, so the app cannot be used to bounce users to another site.

**Q18. Environment variables: where are they and what is visible in the browser?**
`.env.local` holds `DATABASE_URL`, `DATABASE_SSL`, `SESSION_SECRET`; `src/server/env.ts` reads them on the server with a clear error if missing. Nothing is prefixed `NEXT_PUBLIC_`, so nothing reaches the browser. The hosted demo uses Vercel env vars with the same names.

**Q19. What does `npm run build` catch that `npm run dev` does not?**
Type errors across all routes, invalid exports from route files, and broken imports in pages that dev mode only compiles when visited. The wrong SCSS import path in two feature folders showed up as a 500 in dev; build would also have failed.

## D. Data flow, API and database

**Q20. Walk through what happens when I type a search and press Enter.**
`SearchField` submits → `PremiumServiceList` sets `keyword` and resets page → `useExpertServices` sees a new key, returns "loading", and its effect calls `listServices()` in `src/services/expertServices.ts` → `apiFetch("/api/services?…")` → route handler `GET` in `src/app/api/services/route.ts` validates the query with zod → `listServices()` in `src/server/repositories/expertServices.ts` builds a parameterised SQL with `LIKE ?` → rows mapped to `ExpertService` → JSON back → hook stores `{ key, data }` → grid renders.

**Q21. Why the service + hook pattern instead of `fetch` in the component?**
One place to change URLs and error handling (`services/`), components stay declarative, hooks can be reused by other screens, and tests can target the service contract. It mirrors controller → service → repository on the backend.

**Q22. How do you prevent SQL injection?**
Only `?` placeholders through `mysql2` (`query` / `execute` in `src/server/db.ts`); user input never goes into the SQL string. Sort order comes from a fixed map (`SORT_SQL`) keyed by the validated enum, never from the request text.

**Q23. Why does the API return `{ error: { message, fields } }`?**
One envelope for every failure so the client can handle it in one place (`ApiError` in `services/http.ts`): `fields` maps to form inputs (422), `message` goes to the form-level alert or a toast. Status codes: 400 bad id, 401 not signed in, 403 wrong role, 404 missing, 422 invalid, 503 database down.

**Q24. How do you keep frontend validation equal to the backend?**
Same zod schema (`src/lib/validation/service.ts`) runs in the form before sending and in the route handler on arrival. The backend stays authoritative; the form just gives instant feedback. The price rule is written step by step so an empty field says "required" instead of being coerced to 0 (a bug the Playwright test caught).

**Q25. How does login work and where is the session stored?**
`POST /api/auth/login` loads the user by ID, checks the scrypt hash (`src/server/auth/password.ts`), then sets an httpOnly cookie containing an HMAC-signed payload `{ uid, exp }` (`token.ts`). Pages and routes verify the signature and expiry, then load the user. No session table; logout deletes the cookie. Limitation: no server-side revocation, noted in the build report.

**Q26. How are roles enforced, and where is the single source of truth?**
`src/lib/auth/roles.ts` → `canManageServices(user)`. The API returns 401 without a session and 403 for a plain user; pages render `Forbidden`; the list hides the Add button and the detail page hides Edit / Delete. Tests cover all three roles (`tests/services.spec.ts › roles`).

**Q27. What is `dateStrings: true` and `timezone: "Z"` for in the pool?**
MySQL returns DATETIME as plain strings in UTC; `toIso()` turns them into ISO 8601 for the API, and `formatDateTime()` renders them in the WM format (`YYYY-MM-DD h:mm AM`). Avoids silent timezone shifts between the DB, Node and the browser.

**Q28. Why can the same code run on XAMPP MariaDB and on TiDB Cloud?**
Both speak the MySQL protocol and the schema uses standard types. The only difference is TLS: `DATABASE_SSL=true` adds `ssl` to the pool and to the migrate / seed scripts (`db/connection.mjs`). TiDB does not enforce foreign keys, which is fine because the one FK is only declarative.

## E. Styling and WM rules

**Q29. Where do colours and sizes come from, and why no hex in components?**
`src/styles/_tokens.scss` holds every colour, size, spacing and shadow as a CSS variable; each token says which Figma variable it came from or that it was read off the frame. Components only use `var(--…)`, so a theme or dark mode change is a token change, not a hunt through files.

**Q30. What is the WM class-naming rule and how do CSS modules handle it?**
Lowercase-with-hyphens (`main-container`). CSS modules export the names as keys, so TSX reads `styles["meta-item"]`; single-word classes can still use dot access.

**Q31. How is responsiveness done without Figma breakpoints?**
`_mixins.scss` defines `$bp-*` and `@include down()`. Rules: 3 → 2 → 1 columns at 1024 / 640, header collapses to a menu below 1366 (five links do not fit beside the icons), search drops to its own row ≤ 1024, type scale steps down ≤ 768 / 480. All documented in `docs/PLAN.md` §5 and flagged as our interpretation.

**Q32. What accessibility is in place?**
Semantic landmarks and a skip link, labelled icon buttons, `aria-current` on nav and pagination, `aria-pressed` tabs, a keyboard-operable custom listbox for sort, a native `<dialog>` for confirmation (focus trap and Esc for free), `role="alert"` field errors, `aria-busy` + `aria-live` on the list region, visible focus rings, ≥ 24 px targets asserted by tests.

## F. Testing and hand-over

**Q33. What do the Playwright suites cover, and why is mutation separate?**
`services.spec.ts`: page opens, list behaviour, states, roles, validation (read-only). `services.mutation.spec.ts`: create → list → edit → delete on the real DB; it is a separate Playwright project so it never runs by accident on a shared server, and it deletes its own row. Plus responsive and login suites. 66 + 3 pass locally and against the hosted demo.

**Q34. What did the tests find?**
Two real defects: an empty price accepted as 0, and the HW1 header nav overlapping the icons at 1920 (the Figma frame has the same overflow). Both fixed and documented.

**Q35. What is in the QA build report and why those 10 parts?**
Build identity, TL task, plain-words changes, fixed issues, test accounts, data QA must prepare, numbered test steps, known issues, check results, sizes and browsers — so QA can test without asking anything. `docs/BUILD-REPORT.md`.

**Q36. What would you do next if this went to production?**
Server-side sessions with revocation, a real "my page" and image upload, TanStack Query for caching and invalidation, Safari / Firefox runs, and a WM-approved error-message list once WM publishes it.
