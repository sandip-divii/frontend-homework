---
name: fe-responsive-qa
description: Run the Step-5 responsive QA for this project — screenshots at 1920/1600/1366/1280/1024/991/768/640/480/375 for the filled, loading and empty list states, with sideways-scroll and tap-target assertions. Use when asked to "check responsive", "take screenshots at all widths", "run responsive QA", or before handing a screen to the designer.
---

# fe-responsive-qa

## Run

```bash
npm run qa:responsive
```

- Starts `npm run dev` automatically if port 3000 is free (otherwise reuses the running server).
- Writes `screenshots/<state>/<width>.png` for `filled`, `loading`, `empty`.
- Fails a width when the document scrolls sideways, when any visible `button`/`input` is under 24 × 24 px, or when the filled state does not render 12 cards.

## Review the output

1. Open `screenshots/filled/1920.png` next to `docs/figma-reference-1920.png` and compare section by section (header, hero, tabs + search, section title, sort, cards, pagination, banner, footer).
2. Walk the other widths looking for: overlaps, cut-off text, oversized images, tables that don't scroll, controls that are too small, and paddings that no longer match the rhythm.
3. For every defect, fix the SCSS module of the owning component (never a global override), re-run, and only then report.

## Report format

```
Width | filled | loading | empty | Notes
1920  | ✅     | ✅      | ✅    |
…
```

List any assertion failures verbatim from the Playwright output.
