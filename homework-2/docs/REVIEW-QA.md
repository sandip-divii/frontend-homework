# Review prep — questions a reviewer may ask, with answers

Answers point at the real files so you can open them during the call. HW2 paths are under `homework-2/`; HW1 is the same code minus the API.

## A. Process (how it was built)

**Q1. What did you do before writing any code?**
Read the Figma frame with the MCP (metadata, screenshot, variables), ran the WM design checklist on it (12 checks), wrote the designer questions, then a plan (`docs/PLAN.md`): what is on the frame, what to reuse, which files, the four states, the responsive rules. Only then the build, one step at a time, with type-check and lint after each step.

**Q2. The Figma tool ran out of quota. How did you still get exact values?**
The metadata tree gives exact x / y / width / height per layer; the saved screenshot gave colours and shapes. For the login frame I opened Figma Dev Mode in Chrome, set the code panel to CSS and read each element's properties. Everything derived this way is marked "derived" in `_tokens.scss` and listed in `docs/DESIGN-CHECK.md`.

**Q3. How do you know the screen matches the design and works at every width?**
Side-by-side images in `docs/design-compare/` (Figma frame beside our screenshot at 1440 / 768 / 375, built by `scripts/design-compare.mjs`), then `tests/responsive.spec.ts`: 11 widths × 3 states, each asserting no sideways scroll and no control under 24 px, with screenshots committed in `screenshots/`.

**Q4. What did the reviews ask you to change, and why did it matter?**
HW1: class names (WM says lowercase-with-hyphens; mine were camelCase and `CLAUDE.md` even told Claude to do that — WM wins over project rules), fixed pixel sizes in components (moved to tokens), the demo link and the submission steps. HW2: hand-written `useEffect` + `useState` data hooks instead of the TanStack Query pattern the team uses, a type-check that failed on a fresh clone, and docs that had drifted from the repo. Lesson from both: fetch the team's rules first instead of relying on habit, and re-run every check from a clean checkout before submitting.

## B. React concepts

**Q5. What is a component, props and state in your screen? Give an example.**
`ServiceCard` (`src/components/service/ServiceCard/ServiceCard.tsx`) is a component: one function returning JSX. Its prop is `service: ExpertService` — read-only input from the parent list. State: the list's filters live in the URL and are read by `PremiumServiceList` with `useSearchParams`; the search draft is `useState`; server data is TanStack Query state.

**Q6. Why does the list hook derive status instead of storing it?**
`useServicesQuery` (`src/hooks/API/services/useServicesQuery.ts`) maps the query result to `loading | success | empty | error` on every render: `isPending` → loading, `isError` → error, zero items → empty. Nothing is copied into component state, so a new query key can never show a stale "success" for a moment, and there is no `setState` inside an effect (which the React lint rule forbids).

**Q7. What replaced the `useEffect` fetch, and what happens to an in-flight request when the filter changes?**
`useQuery` with `queryKey: serviceKeys.list(query)`. A new filter is a new key, so the hook subscribes to a different cache entry and the old observer is dropped; the query function receives an `AbortSignal` that TanStack Query aborts when no observer is left, so a slow old answer can never overwrite a new one. Same guarantee as the hand-written cleanup, without writing it.

**Q8. Why do list rows need a `key`?**
React matches elements between renders by key. Cards use `service.id`, skeletons use the index because they have no identity. Without stable keys React would re-create DOM nodes and lose state (for example focus) when the list changes.

**Q9. What is a controlled form?**
Every input's `value` comes from state and `onChange` writes back to it (`ServiceForm.tsx`, `LoginForm.tsx`). That is why values survive a failed submit and why validation can read them directly.

**Q10. How does conditional rendering show loading / empty / error / filled?**
`ServiceGrid.tsx` switches on `status`: skeleton cards for loading (with `aria-busy`), `EmptyState` for empty and error (with reset / retry buttons), cards for success. The list wrapper exposes `data-list-status` so tests can wait for a state.

**Q11. What are the rules of hooks, and where could they bite here?**
Call hooks only at the top level of a component or another hook, never inside conditions or loops. `useServicesQuery`, `useCreateService`, `useLogin`, `useToast` are custom hooks; each is called unconditionally at the top of the component that uses it. `ServiceForm` calls both `useCreateService` and `useUpdateService` on every render and only *uses* the one its `mode` needs — that is the rule in practice.

**Q12. Why is `any` not allowed, and how do you type the API data?**
`any` switches the compiler off. Domain types are in `src/types/service.ts` and `user.ts`; `apiFetch<T>` returns the typed shape; `useQuery` infers `data` from the service's return type; repositories map DB rows (`ServiceRow`) to `ExpertService` explicitly, including `Number(rating)` because MySQL returns DECIMAL as a string.

## C. TanStack Query

**Q13. Why TanStack Query instead of the hand-written hooks?**
Three things came for free: a cache keyed by the exact query (going back to a page you saw is instant and still refetches when stale), invalidation after a mutation (any mounted list or detail refetches; nothing is remounted, so the filters survive), and request lifecycle (abort, retry, pending / error flags) without custom code. It is also the pattern Divii frontends use, so the next developer knows where to look: `src/hooks/API/<domain>/`.

**Q14. Walk through the keys.**
`src/hooks/API/services/keys.ts`: `["services"]` → `["services","list"]` → `["services","list", {category, keyword, sort, page, pageSize}]` for each list page; `["services","detail"]` → `["services","detail", id]` for each row. Mutations invalidate by prefix: `serviceKeys.lists()` hits every list page at once, `serviceKeys.detail(id)` only the row that changed.

**Q15. What exactly happens after Save on the edit form?**
`useUpdateService().mutateAsync({ id, input })` → `PUT /api/services/:id` → on success the hook writes the response into the detail cache (`setQueryData`), then invalidates every list entry and that detail entry. The form shows a toast and pushes to the detail page. The detail page's Server Component renders the fresh row, and `useServiceQuery` seeds the cache with it (`initialData`), so there is no flash of old data.

**Q16. Why does the detail page still fetch on the server if the client has a details hook?**
The server needs the row anyway for the 404 and the `<title>`, and server HTML means the page is readable before any JavaScript runs. Passing that row as `initialData` means the details hook renders immediately, keeps the entry fresh for a minute (`staleTime`), and still refetches after a mutation invalidates it. Server for the first paint, client cache for everything after.

**Q17. Where is the QueryClient created and why in `useState`?**
`src/providers/QueryProvider.tsx`, mounted in the root layout. `useState(makeQueryClient)` creates one client per app instance: in the browser it lives for the session; on the server a new one is made per request, so one user's data can never leak into another's render.

**Q18. What are `staleTime` and `retry` set to, and why?**
`staleTime: 30 s` (list) / `60 s` (detail): coming back within that window shows the cache without a request; mutations invalidate regardless. `retry: 1`: one automatic retry after a second, so a dropped connection recovers but a dead database shows the error state quickly. `refetchOnWindowFocus: false` keeps QA screenshots predictable.

## D. Next.js concepts

**Q19. Which file renders `/premium-service/42/edit`, and how does it read the id?**
`src/app/premium-service/[id]/edit/page.tsx`. `[id]` is a dynamic segment; in Next 16 `params` is a Promise, so the page does `const { id } = await params`, then `parseId` rejects anything that is not a positive integer.

**Q20. Server vs client components: which are client here and why?**
Server by default (pages, `Header`, `Footer`, the detail page shell). `"use client"` only where state, effects or events are needed: `HeaderView` (menu state, logout mutation), `PremiumServiceList`, `ServiceDetail`, `ServiceForm`, `ServiceActions`, `SearchField`, `SortSelect`, `CategoryTabs`, `LoginForm`, `LocalDateTime`, the hooks, `QueryProvider`, `ToastProvider`.

**Q21. `Header` is async and `HeaderView` is a client component. Why split them?**
`Header` (server) reads the session cookie and the user from the DB, which the browser must never do, then passes only `userName` to `HeaderView`, which needs `useState` for the mobile menu. Server work stays on the server; interactivity stays in the client.

**Q22. Why do the list filters live in the URL, and how is that done without a server round trip?**
A filtered list is a place the user can share, reload and come back to; before, `router.push("/")` after a save threw the filters away. `PremiumServiceList` reads them with `useSearchParams` (`listParams.ts` validates every value) and writes them with the native `window.history.replaceState`, which Next.js ≥ 14.1 syncs into `useSearchParams` without re-rendering the Server Components. `?state=` for QA is kept untouched.

**Q22b. And how do the filters survive going to a detail page, editing or deleting?**
The list puts its own query into `?back=` on every card link and on **Add service** (`withBack`). The detail, create and edit pages read it on the server, clean it with `cleanBack` (re-parsed into the known keys, so a forged value can only ever produce `/`), and pass it down; **Back to the list**, **Cancel**, the breadcrumb and the redirects after create / edit / delete all go to `listHref(back)`. The first resubmission only kept filters on reload and the browser back button; QA caught that, and the mutation suite now runs the whole create → edit → delete from `/?category=typo` and asserts it lands back there each time.

**Q23. Why does `/premium-service/new` redirect to `/login?next=...` and how is `next` kept safe?**
The page checks the session on the server and calls `redirect()`. `LoginPage` only accepts a `next` that starts with `/` and not `//`, so the app cannot be used to bounce users to another site.

**Q24. Created / Updated are shown in the viewer's time zone. How, without a hydration error?**
`LocalDateTime` (client) uses `useSyncExternalStore` with a server snapshot (UTC string) and a client snapshot (local string). React renders the UTC text on the server, hydrates with the same text, then re-renders with the local one — no mismatch warning, no `suppressHydrationWarning`.

**Q25. Environment variables: where are they and what is visible in the browser?**
`.env.local` holds `DATABASE_URL`, `DATABASE_SSL`, `SESSION_SECRET`; `src/server/env.ts` reads them on the server with a clear error if missing. Nothing is prefixed `NEXT_PUBLIC_`, so nothing reaches the browser. The hosted demo uses Vercel env vars with the same names.

**Q26. Why did `tsc` fail on a fresh clone, and what fixed it?**
`layout.tsx` used the global `LayoutProps<"/">`, which `next typegen` / `next build` generates into `next-env.d.ts` — gitignored, so a fresh clone did not have it. Now the props are typed by hand and `npm run typecheck` runs `next typegen` first anyway. Verified on a fresh `git clone` + `npm ci`.

## E. Data flow, API and database

**Q27. Walk through what happens when I type a search and press Enter.**
`SearchField` submits → `PremiumServiceList` writes `?q=…&page=1` into the URL → `useSearchParams` changes → `useServicesQuery` gets a new key → `listServices()` in `src/services/expertServices.ts` → `apiFetch("/api/services?…")` → route handler `GET` in `src/app/api/services/route.ts` validates the query with zod → `listServices()` in `src/server/repositories/expertServices.ts` builds a parameterised SQL with `LIKE ?` → rows mapped to `ExpertService` → JSON back → the cache entry fills → grid renders.

**Q28. Why the service + hook pattern instead of `fetch` in the component?**
One place to change URLs and error handling (`services/`), components stay declarative, hooks can be reused by other screens, and tests can target the service contract. It mirrors controller → service → repository on the backend.

**Q29. How do you prevent SQL injection?**
Only `?` placeholders through `mysql2` (`query` / `execute` in `src/server/db.ts`); user input never goes into the SQL string. Sort order comes from a fixed map (`SORT_SQL`) keyed by the validated enum, never from the request text.

**Q30. Why does the API return `{ error: { message, fields } }`?**
One envelope for every failure so the client can handle it in one place (`ApiError` in `services/http.ts`): `fields` maps to form inputs (422), `message` goes to the form-level alert or a toast. Status codes: 400 bad id, 401 not signed in, 403 wrong role, 404 missing, 422 invalid, 503 database down.

**Q31. How do you keep frontend validation equal to the backend?**
Same zod schema (`src/lib/validation/service.ts`, `auth.ts`) runs in the form before sending and in the route handler on arrival. The backend stays authoritative; the form just gives instant feedback. Every "missing field" case has a WM-style message (a PUT without `author` answers "Author is required.", not zod's raw text), and the price rule is written step by step so an empty field says "required" instead of being coerced to 0 (a bug the Playwright test caught).

**Q32. How does login work and where is the session stored?**
`POST /api/auth/login` loads the user by ID, checks the scrypt hash (`src/server/auth/password.ts`), then sets an httpOnly cookie containing an HMAC-signed payload `{ uid, exp }` (`token.ts`). Pages and routes verify the signature and expiry, then load the user. No session table; logout deletes the cookie. Limitation: no server-side revocation, noted in the build report.

**Q33. How are roles enforced, and where is the single source of truth?**
`src/lib/auth/roles.ts` → `canManageServices(user)`. The API returns 401 without a session and 403 for a plain user; pages render `Forbidden`; the list hides the Add button and the detail page hides Edit / Delete. Tests cover all three roles (`tests/services.spec.ts › roles`).

**Q34. What is `dateStrings: true` and `timezone: "Z"` for in the pool?**
MySQL returns DATETIME as plain strings in UTC; `toIso()` turns them into ISO 8601 for the API, and `LocalDateTime` renders them in the WM format in the viewer's zone. Avoids silent timezone shifts between the DB, Node and the browser.

**Q35. Why can the same code run on XAMPP MariaDB and on TiDB Cloud?**
Both speak the MySQL protocol and the schema uses standard types. The only difference is TLS: `DATABASE_SSL=true` adds `ssl` to the pool and to the migrate / seed scripts (`db/connection.mjs`). TiDB does not enforce foreign keys, which is fine because the one FK is only declarative.

## F. Styling and WM rules

**Q36. Where do colours and sizes come from, and why no hex in components?**
`src/styles/_tokens.scss` holds every colour, size, spacing and shadow as a CSS variable; each token says which Figma variable it came from or that it was read off the frame. Components only use `var(--…)` — even the skeleton bars get their width / height from `--skel-*` tokens through a class, not an inline style — so a theme or dark mode change is a token change, not a hunt through files.

**Q37. What is the WM class-naming rule and how do CSS modules handle it?**
Lowercase-with-hyphens (`main-container`). CSS modules export the names as keys, so TSX reads `styles["meta-item"]`; single-word classes can still use dot access. `CLAUDE.md` says so and says that WM wins if the two ever disagree.

**Q38. How is responsiveness done without Figma breakpoints?**
`_mixins.scss` defines `$bp-*` and `@include down()`. Rules: 3 → 2 → 1 columns at 1024 / 640, header collapses to a menu below 1366 (five links do not fit beside the icons), search drops to its own row ≤ 1024, type scale steps down ≤ 768 / 480. All documented in `docs/PLAN.md` §5 and flagged as our interpretation.

**Q39. What accessibility is in place?**
Semantic landmarks and a skip link, labelled icon buttons, `aria-current` on nav and pagination, `aria-pressed` tabs, a keyboard-operable custom listbox for sort, a native `<dialog>` for confirmation (focus trap and Esc for free), `role="alert"` field errors, `aria-busy` + `aria-live` on the list region, `<time dateTime>` for dates, visible focus rings, ≥ 24 px targets asserted by tests.

## G. Testing and hand-over

**Q40. What do the Playwright suites cover, and why is mutation separate?**
`services.spec.ts`: page opens, list behaviour (incl. URL filters and the `?back=` round trip), states, roles, validation (read-only, 19 tests). `services.mutation.spec.ts`: create → list → edit → delete on the real DB; it is a separate Playwright project so it never runs by accident on a shared server, and it deletes its own row. Plus responsive (33 + 15) and login (9) suites: 76 read-only + 3 mutation pass locally and against the hosted demo.

**Q41. What did the tests find?**
Three real defects: an empty price accepted as 0, the HW1 header nav overlapping the icons at 1920 (the Figma frame has the same overflow), and, while writing the PUT test, zod's raw "expected string, received undefined" leaking out of the API. All fixed and documented.

**Q42. What is in the QA build report and why those 10 parts?**
Build identity, TL task, plain-words changes, fixed issues, test accounts, data QA must prepare, numbered test steps, known issues, check results, sizes and browsers — so QA can test without asking anything. `docs/BUILD-REPORT.md`.

**Q43. What would you do next if this went to production?**
Server-side sessions with revocation, a real "my page" and image upload, optimistic updates for likes once that UI exists, dark-mode token values named colour + code as WM asks, Safari / Firefox runs, and a WM-approved error-message list once WM publishes it.
