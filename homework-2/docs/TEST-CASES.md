# Test cases — Expert services (Homework 2)

Format follows the WM QA Template ("Verify that …" cases with ID, precondition, steps, expected result).
Areas are the Step 7 table: page opens · main flow · validation · list · roles · states · screen sizes.

**Type:** **P** = positive (the happy path works) · **N** = negative (wrong input, wrong role, missing data, failure is handled). 45 cases: 21 P · 24 N.
**Accounts** (local seed, `db/seed/users.json`): `bookplate` = expert (can manage services) · `reviewer` = plain user.
**Base URL:** http://localhost:3001 (or the hosted demo https://frontend-homework-2-red.vercel.app) · **Data:** `npm run db:reset` gives 50 services (36 cover, 8 internal, 6 correction, 0 typo).
**Automation column:** the Playwright test that covers the case (`tests/*.spec.ts`), or "manual".

## 1. Page opens

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| PO-01 | P | Seed loaded | Open `/` | Browser title "Premium Paid Services \| Bookplate"; H1 "Premium paid service"; 12 cards; pagination shows pages 1–5 | services.spec › page opens |
| PO-02 | P | — | Open `/premium-service/1` | Title ends with "\| Bookplate"; thumbnail, badge, author, price `15,000` KRW, likes, rating, description, Created / Updated as `YYYY-MM-DD h:mm AM/PM` in the viewer's time zone | services.spec › detail page |
| PO-03 | N | — | Open `/premium-service/999999` | HTTP 404 and the "We could not find that page" screen with "Back to the list" | services.spec › unknown service |
| PO-04 | P | — | Open `/login` | Title "Log in \| Bookplate"; ID / Password fields, Save ID, Log in button | login.spec |

## 2. Main flow (create → list → edit → delete)

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| MF-01 | P | Logged in as `bookplate` | Open the filtered list `/?category=typo` → **Add service** (URL carries `?back=category%3Dtypo`) → fill Category=Typo inspection, Title, Author, Price=12345, Description → **Add service** | Toast "Service added."; back on the same filtered list `/?category=typo` (tab still active); the new card is there without a reload, price `12,345` | services.mutation.spec |
| MF-02 | P | MF-01 done | From `/?category=typo` open the card → **Edit** | Edit URL keeps `?back=category%3Dtypo`; form pre-filled with the saved values | services.mutation.spec |
| MF-03 | P | MF-02 | Change Title and Price=20000 → **Save changes** → **Back to the list** | Toast "Service updated."; back on the detail page (still carrying `?back=`), which shows the new title, `20,000` and a later Updated time; **Back to the list** returns to `/?category=typo` with the edited card | services.mutation.spec |
| MF-04 | P | MF-03 | From `/?category=typo` open the card → **Delete** → dialog → **Delete** | Dialog "Delete this service?" names the service; toast "… was deleted."; back on the same filtered list `/?category=typo` without the card; `GET /api/services/:id` → 404 | services.mutation.spec |
| MF-05 | N | MF-04 | Dialog → **Cancel** (or Esc) | Dialog closes, nothing deleted | manual |
| MF-06 | N | Logged in as expert | On the create form click **Add service** twice quickly | Only one record is created (button disabled while saving, label "Saving…") | manual |

## 3. Validation

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| VA-01 | N | Expert on `/premium-service/new` | Submit with all fields empty | Under the fields: "Title must be at least 2 characters.", "Author is required.", "Price is required."; nothing sent to the API | services.spec › validation |
| VA-02 | N | Same | Title of 121 chars, Price `-5` | "Title must be 120 characters or fewer.", "Price cannot be negative."; the error replaces the field's hint (never both) | services.spec › validation |
| VA-03 | N | Same | Price `12.5` | "Price must be a whole number." | services.spec › validation |
| VA-04 | N | Same | Description of 2001 chars | Counter stops at 2000 / 2000 (maxLength) | manual |
| VA-05 | N | Expert session | `POST /api/services` with `{category:"nope", title:"a", author:"", price:-1}` | 422 with `error.fields` for category, title, author, price — same messages as the form | services.spec › server-side validation |
| VA-06 | N | Expert on the form | Submit a valid form while the API returns an error (stop MariaDB) | Red form-level message with the API text; typed values are kept | manual |
| VA-07 | N | Any | `/login` with empty fields | "Please enter your ID." / "Please enter your password." | login.spec |
| VA-08 | N | Any | `/login` with unknown ID / wrong password | "This ID does not exist." / "The ID and password do not match." under the right field | login.spec |
| VA-09 | N | Expert session | `PUT /api/services/1` with the `author` key missing | 422, `error.fields.author = ["Author is required."]` (WM message, not zod's "expected string, received undefined") | services.spec › validation (PUT) |

## 4. List

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| LI-01 | P | Seed | Search "Minji" | Only cards by Minji Park | services.spec › list |
| LI-02 | N | Seed | Tab **Typo inspection** | Empty state "No typo inspection services yet" with **Show all services** | services.spec › list |
| LI-03 | N | Seed | Search "zzz-no-such-service" | "No results for “zzz-no-such-service”" | services.spec › list |
| LI-04 | P | Seed | Sort → **Price: high to low** | First card price ≥ last card price | services.spec › list |
| LI-05 | P | Seed | Pagination → **2** | On page 1 First / Previous have aria-disabled="true" (not colour alone); after the click page 2 is current and the first card differs from page 1 | services.spec › list |
| LI-06 | P | Seed | Tab **Internal design** | 8 cards, pagination hidden | manual |
| LI-07 | N | Seed | `GET /api/services?page=0` | 422 (invalid query) | manual (curl) |
| LI-08 | P | Seed | Tab **Cover design** → page **2** → reload the browser | URL is `/?category=cover&page=2`; after the reload the tab is still active, page 2 is current and the heading reads "Cover design" (filter state lives in the URL) | services.spec › list |
| LI-09 | P | Seed | Tab **Cover design** → page **2** → open a card → **Back to the list** | Detail URL carries `?back=category%3Dcover%26page%3D2`; **Back to the list** returns to `/?category=cover&page=2` with the tab active and page 2 current (same for Cancel, the breadcrumb, and after create / edit / delete, see MF-01–04) | services.spec › list |
| LI-10 | N | Seed | Open `/premium-service/1?back=https%3A%2F%2Fexample.com%2F%3Fcategory%3Dnope%26evil%3D1` | **Back to the list** points to `/`: `?back=` only keeps known list keys with valid values, so it can never leave the list | services.spec › list |

## 5. Roles

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| RO-01 | N | Signed out | Open `/` | No **Add service** button; header shows my-page + log-in icons | services.spec › roles |
| RO-02 | N | Signed out | Open `/premium-service/new` | Redirect to `/login?next=/premium-service/new`; after login returns to the form | services.spec › roles (redirect) / manual (return) |
| RO-03 | N | Signed out | `POST /api/services` | 401 "Please log in to continue." | services.spec › roles |
| RO-04 | N | Logged in as `reviewer` | Open `/`, `/premium-service/new`, `/premium-service/1` | No Add button; 403 page "You do not have permission…"; no Edit / Delete on detail | services.spec › roles |
| RO-05 | N | `reviewer` | `POST /api/services` / `PUT` / `DELETE /api/services/1` | 403 "Only experts and admins can manage services." | services.spec › roles (POST) / manual |
| RO-06 | P | Logged in as `bookplate` | Open `/` and `/premium-service/1` | Add service, Edit and Delete visible | services.spec › roles |
| RO-07 | P | Logged in | Header **Log out** | Session cookie cleared; header switches to signed-out icons; `/api/auth/me` → 401 | login.spec |

## 6. States (loading / empty / error)

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| ST-01 | P | — | `/?state=loading` | 12 skeleton cards with the card's row sizes, region `aria-busy="true"` | services.spec › states |
| ST-02 | P | — | `/?state=empty` | Empty state with **Show all services** | services.spec › states |
| ST-03 | N | — | `/?state=error` | "Something went wrong" with **Try again** | services.spec › states |
| ST-04 | N | MariaDB stopped | Open `/` | Error state with Try again (one automatic retry first); `/api/health` → 503 | manual |
| ST-05 | P | — | Create / edit form while saving | Button disabled, "Saving…" label | manual |

## 7. Screen sizes

| ID | Type | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- | --- |
| SS-01 | P | Seed | `/` at 1920, 1600, 1440, 1366, 1280, 1024, 991, 768, 640, 480, 375 × filled / loading / empty | No sideways scroll; no control under 24 px; 12 cards; the last category tab (“Correction / Alignment”) is fully inside the page (tabs wrap at phone width); the sort box is 48 px; screenshots in `screenshots/` | responsive.spec (33) |
| SS-02 | P | Expert | `/premium-service/new`, `/premium-service/1`, `/premium-service/1/edit` at 1920, 1440, 1366, 768, 375 | No sideways scroll; screenshots in `screenshots/forms/` | responsive-forms.spec (15) |
| SS-03 | P | — | `/login` at 1920, 1440, 1366, 768, 375 (default + error) | No sideways scroll; screenshots in `screenshots/login/` | login.spec (5 of 9) |
| SS-04 | P | — | 375: open the header menu | Nav items stack full width; Esc closes | manual |

**Playwright totals:** read-only project `chromium` = 76 tests (services 19 · login 9 · responsive 33 · responsive-forms 15); project `mutation` = 3 tests (MF-01 → MF-04, run from a filtered list). `npm run test:e2e:all` runs 79.
