# Design check — pc_1920_Expert Services (See More)

Checklist run before building (Step 2.1). ✅ ok · ⚠️ built with an assumption · ❓ question sent to the designer.

## Checklist

| # | Check | Result | Note |
| --- | --- | --- | --- |
| 1 | Frame is final / not a WIP | ⚠️ | Frame name says "(See More)". Treated as the category list page. |
| 2 | All breakpoints provided | ❓ | Only 1920. No 1366 / 768 / 375 frames. Responsive rules in `docs/PLAN.md` §5 are ours. |
| 3 | Colours bound to variables | ⚠️ | 7 variables published. Beige background `#F2EFEA`, card border, placeholder `#B5B5B5`, thumbnail backdrop are raw values in the frame → added as "derived" tokens. |
| 4 | Typography bound to styles | ✅ | `pc/bigtitle_1`, `pc/1depth_tit`, `pc/2depth_sub` used. Card body sizes (13/18/11) are unstyled. |
| 5 | Spacing on an 4/8 grid | ✅ | 20 / 40 / 80 / 100 rhythm throughout. |
| 6 | Copy is final | ❓ | Several strings are machine-translation artifacts (see Q1). |
| 7 | Assets exportable | ⚠️ | BI (logo) and the `con3` photo are raster layers; Figma MCP quota ran out before export. Logo approximated in code, photo replaced by a gradient. |
| 8 | Interaction states shown (hover / focus / active) | ❓ | Only the active tab and nav underline are shown. Hover/focus states designed by us (border darkens, underline). |
| 9 | Loading / empty / error states shown | ❓ | None in Figma. Built with skeletons and an `EmptyState` using the frame's palette. |
| 10 | Layout fits the artboard | ❓ | Search box (805px) overflows the 1920 canvas; nav text overlaps the icon group; sort label (125px) overflows its 100px box; second banner button clips its label. Fixed in code with flexible widths. |
| 11 | Accessibility: contrast, target size | ⚠️ | `txt3 #777` on white = 4.5:1 (AA for text ≥14px). Card meta text is 11px in Figma → rendered at 12px. |
| 12 | Content model is clear | ✅ | Card = author, title, price, likes, rating (count). Sort + category + keyword + page. |

## Questions for the designer

1. **Copy** — Tabs read "whole; total; entire", "Vertical bar", "or base on 'pipe'"; pagination reads "One … Ten"; nav reads "Introducing North Plate Publishing.". Are English strings final? We used *All / Typo inspection / Cover design / Internal design / Correction / Alignment* and numeric pages; header and footer copy kept verbatim.
2. **Tab vs. heading** — "All" is the active tab but the section heading says "Cover Design" and the active nav item is the first one, not "Premium service". We bind the heading to the selected tab ("All services" for All) and mark "Premium service" as current. OK?
3. **Price** — "15,000" has no currency. KRW assumed; should ₩ or "원" be shown?
4. **Badge** — badge text varies in casing ("Cover design", "cover design", "Book cover design"). We show the category label. Should it be the sub-category instead?
5. **Overflow** — search box, nav and sort dropdown overflow at 1920 (see #10). Please confirm the intended widths; we made them flexible.
6. **Breakpoints** — can we get 1366 / 768 / 375 frames, or is our responsive interpretation acceptable?
7. **Missing states** — hover, focus, loading, empty, error, disabled pagination arrows.
8. **Assets** — please export the BI as SVG and the `con3` photo as WebP (≥1920 wide).
9. **Card meta size** — 11px like/rating text is below our 12px minimum; may we use 12px?
10. **Footer** — footer text is Siwonschool company information. Is that the correct entity for Bookplate?

## Deviations made on purpose

| Where | Figma | Built | Why |
| --- | --- | --- | --- |
| Tabs / pagination labels | MT artifacts | Real labels / numbers | Q1 |
| Section heading | "Cover Design" with All tab | Follows the selected tab | Q2 |
| Current nav item | first item | "Premium service" | Q2 |
| Search box | 805px fixed | 320–480px flexible, full-width ≤1024 | Q5 |
| Header nav | 18px, overlaps icons | 16px; collapses to a menu button below 1366 | Q5 |
| Card meta | 11px | 12px | Q9 / legibility |
| Banner photo | raster | gradient + highlight | asset not exportable |
| Logo | raster BI | wordmark + SVG swoosh | asset not exportable |

---

# Design check — pc_1920_ID/PW 로그인 (login)

Read through Figma Dev Mode in Chrome (the MCP quota was exhausted). Specs captured: section 1920×782 on `#F2EFEA` with 100px vertical padding; 600px column, gap 40; title `pc/1depth_tit` (Nanum Myeongjo 32/800, −0.96px, centred); white card padding 40, inner gap 20; labels Pretendard 18/500 `txt1`, 20px above the box; box 60px, padding 22/20, 1px `line1`, placeholder 16/400 `line1`; error 12/500 `point/02`, 10px below the box; checkbox 30×30 with label `pc/3depth_sub` 16/500 `txt3`; button 600×80 `txt1` with 22/600 white label; header `gnb_로그인후`; footer.

| # | Check | Result | Note |
| --- | --- | --- | --- |
| 1 | Breakpoints | ❓ | 1920 only. Column caps at 600px and shrinks with 20px gutters; card padding 24 and 48px controls ≤768. |
| 2 | Copy | ⚠️ | Frame is Korean; the rest of the English site uses English, so copy was translated 1:1 (`ID / PW Login`, `Enter your ID`, `Save ID`, `Log in`, the two error messages). Confirm wording. |
| 3 | States | ⚠️ | Figma shows both field errors at once (a state sheet). Live form shows one error at a time, plus "required" messages Figma does not have. No focus / disabled / loading states drawn — added (border darkens on focus, button disabled while submitting). |
| 4 | Placeholder colour | ⚠️ | `line1 #CCC` here vs `#B5B5B5` on the list search box — two placeholder greys in one system. |
| 5 | Checkbox row | ❓ | Auto-layout is `space-between` but has one child. Is a "Find ID / password" link intended on the right? |
| 6 | Header | ❓ | Login page uses the logged-in header (`gnb_로그인후`). Is there a logged-out header variant? |
| 7 | Assets | ⚠️ | `eye_2` (31×25) and `check_box` (30×30) icons could not be exported; drawn as inline SVG. |
