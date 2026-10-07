# Test cases — Expert services (Homework 2)

Format follows the WM QA Template ("Verify that …" cases with ID, precondition, steps, expected result).
Areas are the Step 7 table: page opens · main flow · validation · list · roles · states · screen sizes.

**Accounts** (local seed, `db/seed/users.json`): `bookplate` = expert (can manage services) · `reviewer` = plain user.
**Base URL:** http://localhost:3001 (or the hosted demo https://frontend-homework-2-red.vercel.app) · **Data:** `npm run db:reset` gives 50 services (36 cover, 8 internal, 6 correction, 0 typo).
**Automation column:** the Playwright test that covers the case (`tests/*.spec.ts`), or "manual".

## 1. Page opens

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| PO-01 | Seed loaded | Open `/` | Browser title "Premium Paid Services \| Bookplate"; H1 "Premium paid service"; 12 cards; pagination shows pages 1–5 | services.spec › page opens |
| PO-02 | — | Open `/premium-service/1` | Title ends with "\| Bookplate"; thumbnail, badge, author, price `15,000` KRW, likes, rating, description, Created / Updated as `YYYY-MM-DD h:mm AM/PM` | services.spec › detail page |
| PO-03 | — | Open `/premium-service/999999` | HTTP 404 and the "We could not find that page" screen with "Back to the list" | services.spec › unknown service |
| PO-04 | — | Open `/login` | Title "Log in \| Bookplate"; ID / Password fields, Save ID, Log in button | login.spec |

## 2. Main flow (create → list → edit → delete)

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| MF-01 | Logged in as `bookplate` | `/` → **Add service** → fill Category=Typo inspection, Title, Author, Price=12345, Description → **Add service** | Toast "Service added."; redirected to `/`; searching the title shows one card with price `12,345` | services.mutation.spec |
| MF-02 | MF-01 done | Open the card → **Edit** | Form pre-filled with the saved values | services.mutation.spec |
| MF-03 | MF-02 | Change Title and Price=20000 → **Save changes** | Toast "Service updated."; detail page shows the new title and `20,000` | services.mutation.spec |
| MF-04 | MF-03 | Detail → **Delete** → dialog → **Delete** | Dialog "Delete this service?" names the service; toast "… was deleted."; redirected to `/`; `GET /api/services/:id` → 404 | services.mutation.spec |
| MF-05 | MF-04 | Dialog → **Cancel** (or Esc) | Dialog closes, nothing deleted | manual |
| MF-06 | Logged in as expert | On the create form click **Add service** twice quickly | Only one record is created (button disabled while saving, label "Saving…") | manual |

## 3. Validation

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| VA-01 | Expert on `/premium-service/new` | Submit with all fields empty | Under the fields: "Title must be at least 2 characters.", "Author is required.", price error; nothing sent to the API | services.spec › validation |
| VA-02 | Same | Title of 121 chars, Price `-5` | "Title must be 120 characters or fewer.", "Price cannot be negative." | services.spec › validation |
| VA-03 | Same | Price `12.5` | "Price must be a whole number." | services.spec › validation |
| VA-04 | Same | Description of 2001 chars | Counter stops at 2000 / 2000 (maxLength) | manual |
| VA-05 | Expert session | `POST /api/services` with `{category:"nope", title:"a", author:"", price:-1}` | 422 with `error.fields` for category, title, author, price — same messages as the form | services.spec › server-side validation |
| VA-06 | Expert on the form | Submit a valid form while the API returns an error (stop MariaDB) | Red form-level message with the API text; typed values are kept | manual |
| VA-07 | Any | `/login` with empty fields | "Please enter your ID." / "Please enter your password." | login.spec |
| VA-08 | Any | `/login` with unknown ID / wrong password | "This ID does not exist." / "The ID and password do not match." under the right field | login.spec |

## 4. List

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| LI-01 | Seed | Search "Minji" | Only cards by Minji Park | services.spec › list |
| LI-02 | Seed | Tab **Typo inspection** | Empty state "No typo inspection services yet" with **Show all services** | services.spec › list |
| LI-03 | Seed | Search "zzz-no-such-service" | "No results for “zzz-no-such-service”" | services.spec › list |
| LI-04 | Seed | Sort → **Price: high to low** | First card price ≥ last card price | services.spec › list |
| LI-05 | Seed | Pagination → **2** | Page 2 is current; first card differs from page 1 | services.spec › list |
| LI-06 | Seed | Tab **Internal design** | 8 cards, pagination hidden | manual |
| LI-07 | Seed | `GET /api/services?page=0` | 422 (invalid query) | manual (curl) |

## 5. Roles

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| RO-01 | Signed out | Open `/` | No **Add service** button; header shows my-page + log-in icons | services.spec › roles |
| RO-02 | Signed out | Open `/premium-service/new` | Redirect to `/login?next=/premium-service/new`; after login returns to the form | services.spec › roles (redirect) / manual (return) |
| RO-03 | Signed out | `POST /api/services` | 401 "Please log in to continue." | services.spec › roles |
| RO-04 | Logged in as `reviewer` | Open `/`, `/premium-service/new`, `/premium-service/1` | No Add button; 403 page "You do not have permission…"; no Edit / Delete on detail | services.spec › roles |
| RO-05 | `reviewer` | `POST /api/services` / `PUT` / `DELETE /api/services/1` | 403 "Only experts and admins can manage services." | services.spec › roles (POST) / manual |
| RO-06 | Logged in as `bookplate` | Open `/` and `/premium-service/1` | Add service, Edit and Delete visible | services.spec › roles |
| RO-07 | Logged in | Header **Log out** | Session cookie cleared; header switches to signed-out icons; `/api/auth/me` → 401 | login.spec |

## 6. States (loading / empty / error)

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| ST-01 | — | `/?state=loading` | 12 skeleton cards, region `aria-busy="true"` | services.spec › states |
| ST-02 | — | `/?state=empty` | Empty state with **Show all services** | services.spec › states |
| ST-03 | — | `/?state=error` | "Something went wrong" with **Try again** | services.spec › states |
| ST-04 | MariaDB stopped | Open `/` | Error state with Try again; `/api/health` → 503 | manual |
| ST-05 | — | Create / edit form while saving | Button disabled, "Saving…" label | manual |

## 7. Screen sizes

| ID | Precondition | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| SS-01 | Seed | `/` at 1920, 1600, 1366, 1280, 1024, 991, 768, 640, 480, 375 × filled / loading / empty | No sideways scroll; no control under 24 px; 12 cards; screenshots in `screenshots/` | responsive.spec (30) |
| SS-02 | Expert | `/premium-service/new`, `/premium-service/1`, `/premium-service/1/edit` at 1920, 1366, 768, 375 | No sideways scroll; screenshots in `screenshots/forms/` | responsive-forms.spec (12) |
| SS-03 | — | `/login` at 1920, 1366, 768, 375 (default + error) | No sideways scroll; screenshots in `screenshots/login/` | login.spec (4) |
| SS-04 | — | 375: open the header menu | Nav items stack full width; Esc closes | manual |
