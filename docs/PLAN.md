# Build plan — Premium Paid Services list (Homework 1)

_Step 2.2 of the training: plan first, no code. Written before implementation; kept as the record of decisions._

## 1. Design read

Frame: `pc_1920_Expert Services (See More)` (1920 × 4410). Sections, top to bottom:

| Figma layer | What it is | Measurements (1920) |
| --- | --- | --- |
| `gnb_로그인후` | Header: BI 180×60, 5 text links 18px (active = SemiBold + underline), 4 icons (bell, my, cart, logout) | height 120, container 1280 |
| `tit_big` | Breadcrumb 14px + page title 48px Nanum Myeongjo on `#F2EFEA` | height 262, padding 80 |
| `btn tap` + `box` | Category tabs 16px with `|` dividers; search box 805×60, 1px `line1` | gap 80 |
| `step1` | Section title 32px Nanum Myeongjo + 1px rule with a 148px accent | gap 40 above/below |
| `Frame 1415` | Sort dropdown "Recommended order", 100×40, 14px | right-aligned |
| card frames ×12 | 413×520 card: image 413×240 with brown badge (`p3`), author 13px `txt3`, title 18px, price 13px `txt2`, like 11 + rating 4.5 (43) | 3 cols, gap 20 / 40 |
| `Frame 1484` | Pagination, 14px, first/prev/next/last arrows | centered |
| `con3` | Expert registration banner, 1920×756, beige with photo right; serif headline in `p3`; two 60–70px buttons | — |
| `pc_1920_gnb_푸터` | Footer: BI, 2 social icons, 5 info lines 12px, copyright | height 500 |

Tokens exposed by Figma: `txt1 #222`, `txt2 #555`, `txt3 #777`, `line1 #CCC`, `p3 #856654`, `point/01 #FFAE49`, `point/02 #F53E3E`, `pc/bigtitle_1` (Nanum Myeongjo 48/1/-3%), `pc/1depth_tit` (32), `pc/2depth_sub` (Pretendard 18/1.8).

## 2. Reuse audit

Fresh repository — nothing to reuse yet. Therefore the plan creates the primitives in `src/components/ui` so that **the list screen itself only composes them**:

`Icon`, `Logo`, `Button` (primary / outline / ghost), `Badge`, `Skeleton`, `EmptyState`, `Pagination`, `SearchField`, `SortSelect`, `CategoryTabs`, `SectionTitle`.

Each is generic (typed options, controlled value) so Homework 2+ can reuse them.

## 3. Files

```
src/app/layout.tsx, page.tsx                       fonts, metadata, route (Server Component)
src/app/premium-service/[id]/page.tsx              placeholder so card links resolve
src/styles/_tokens.scss, _mixins.scss, globals.scss
src/types/service.ts                               ExpertService, ServiceQuery, PagedResult
src/data/categories.ts, services.mock.ts           tabs/sort options, 50 fake services
src/lib/api/services.ts                            mock fetch (700 ms, AbortSignal aware)
src/hooks/useExpertServices.ts                     loading / success / empty / error
src/features/premium-service/PremiumServiceList.tsx  the screen (client)
src/components/layout/{Header,PageHero,Footer}
src/components/service/{ServiceCard,ServiceGrid,ExpertBanner}
src/components/ui/*                                primitives above
tests/responsive.spec.ts + playwright.config.ts    Step 5 QA
```

## 4. States

- **Loading** — 12 `ServiceCardSkeleton`s with the exact card geometry; region `aria-busy`.
- **Empty** — reachable naturally (the "Typo inspection" tab has no mock items; a search with no match), plus `?state=empty`.
- **Error** — `?state=error`, with a "Try again" button that re-runs the query.
- **Filled** — 12 cards per page, pagination.

## 5. Responsive strategy (only a 1920 frame exists)

| Width | Behaviour |
| --- | --- |
| ≥1366 | Figma layout; 1280 container, 3 columns |
| 1280 / 1024 | container shrinks with 20px gutters; search box flexes (320–480px) |
| ≤1024 | 2 columns; search drops to its own full-width row |
| ≤1365 | header collapses to a menu button + dropdown nav (five text links do not fit beside the icons at 1280) |
| ≤768 | type scale steps down (48→40→32 title), paddings tighten, banner buttons stack |
| ≤640 | 1 column |
| ≤480 | logout icon hidden, smallest type scale |

## 6. Open questions → `docs/DESIGN-CHECK.md`
