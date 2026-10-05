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
