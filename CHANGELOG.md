# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com). References F-, D-, AV-, BUG- and IMP- IDs.

## [Unreleased]
### Added
- Project documentation set: README, FEATURES (F-001–F-015), ROADMAP (Phases 1–5), ARCHITECTURE, DECISIONS (D-001–D-007), SPEC, ATTACK_VECTORS (AV-001–AV-008), BUGS, IMPROVEMENTS, CLAUDE.md, LICENSE.
- Design direction chosen: Instrument (D-002), from three mock-ups of Proposition I.1.
- D-008: intersection branches chosen by rule, not drag continuity; SPEC §Branch selection, AV-003 and the Phase 1 acceptance in CLAUDE.md updated to match.
- D-009: fonts vendored into `docs/fonts/` rather than loaded from Google Fonts.
- D-010: Heath's proof is read through the step cards; optional per-step `note` field for commentary.
- SPEC: readout displays lengths in units of a reference segment (`unit`, default `measure[0]`); theme tokens `--amber-hi`, `--grid-line`, `--rule-inner`; header nav targets.
- SPEC: `mark: "label"` naming points (letter only, `--ink-3`, 16 px) so every letter in Heath's text appears in the figure; I.1 gains D and E (D-010 consequences).
- Vendored fonts in `docs/fonts/`: IBM Plex Mono 400/500/600 (IBM's Latin1 subsets) and Barlow Condensed 500/600, with OFL licences and `SOURCES.txt` (D-009).
- Directory skeleton (`docs/`, `tools/`) and Instrument reference mock-up in `design/instrument/`.
- IMP-002–IMP-006 logged.
- `docs/js/geom.js`: kernel per SPEC §Kernel (F-001); `tools/test_geom.mjs`, 19 tests on `node:test`.
- `docs/js/scene.js`: object graph, declaration-order recompute, `pick` rules with δ/τ branch memory, load-time data validation (F-002 partial; drag input arrives with `render.js`). `tools/test_scene.mjs`, 12 tests including AV-001 and AV-003 drag sweeps.
- SPEC §Scene object schema: constructor table (`circle`, `join`, `ray`, `line`, `angle`, `mid`, `foot`, `xLL`, `xLC`, `xCC`), input flattening, value shapes and `null` semantics.
- Proposition page pipeline: `render.js` (SVG figure, pointer dragging with 8-unit snap), `stepper.js` (step card, citation links, transport), `readout.js` (lengths in reference units, `eq` claims, DEGENERATE state), `prop.js` (bootstrap), `instrument.css` (theme from the mock-up, vendored fonts), `prop.html`, and `data/props/01.js` (Heath's I.1, checked against the scan).
- `polygon` constructor in `scene.js`; SPEC gains `polygon`, `role`, step `short`, `brief`, paragraph breaks in step text, and drag snapping.
- README links to the live I.1 page on GitHub Pages.
- Index page (F-010): `index.html`, `js/index.js`, `data/arcs.js`; 48 cards grouped by arc, built propositions link to their page with a miniature drawn by the shared scene and renderer, unbuilt ones are dimmed placeholders. `render.js` gains a non-interactive mode for miniatures.
- `tools/check_pages.mjs`: headless-Chrome checks of the index and every built proposition, Node built-ins only (IMP-007 applied).
- Definitions page (F-011): `defs.html`, `js/defs.js`, `data/foundations.js` with Heath's Definitions 1–23, Postulates 1–5 and Common Notions 1–5 (pp. 153–155, checked against the scan); anchored, highlighted entries and "Cited in" links derived from the propositions. Citation links on proposition pages now resolve (F-007).
- `check_pages.mjs`: foundations checks (33 anchored entries, bold terms, every citation resolves, "Cited in", citation click lands highlighted, 390 px).
- Proposition I.2 (`data/props/02.js`): Heath p. 244, checked against the scan; built and on the index. `scene.js` gains `extend` (a line produced past a point, Post. 2) and `onCircle` (naming points on a circle); `check_pages.mjs` gains I.2-specific degenerate checks.
- D-011: citations Heath leaves implicit are added in braces, `{Def. 15}`, rendered muted with a tooltip and a note; I.1 gains {Def. 20}, I.2 gains {Def. 15} ×2 and {Def. 20}. `cite.js` gains `citationEntries`; tests and `check_pages.mjs` cover both kinds.
### Changed
- F-007 and F-011 Complete after the author's review of the definitions page.
- D-005: `TESTING.md` exemption revisited after the browser check was added, and kept; new revisit trigger recorded.
- Citations are written once, inline in Heath's text: step footers and `uses` are derived by new `js/cite.js`; `given: true` replaces `cite: "Given"`; `tools/test_cite.mjs` added (IMP-006 applied).
- F-010 Complete after the author's review of the index.
- README live link now points at the site root.
- CLAUDE.md current state corrected (stale skeleton line, test count).
- Phase 1 Complete. F-002 Complete after the author's phone test; BUG-004 confirmed fixed on device.
- F-003, F-004, F-005, F-006, F-015 Complete after the author's visual check of I.1. F-002 pending a touch-device test.
- F-001 Complete: kernel and tests meet the acceptance criteria.
- F-001 acceptance reworded: kernel is point-and-scalar only (IMP-004 applied).
- Tool scripts standardised on `.mjs` (`tools/test_geom.mjs`, `tools/lint_props.mjs`); Node ≥ 22.7 noted in CLAUDE.md (IMP-002 applied).
- F-007 split across phases: partial in Phase 1 (text and citations), complete in Phase 2 (links resolve) (IMP-003 applied).
- `uses` spelt with the citation grammar; `Given` admitted as a standalone `cite` label (IMP-005 applied).
### Removed
- `cite` and `uses` fields from the proposition schema (IMP-006).
- `proof` field from the proposition schema (D-010).
### Fixed
- Browsers could run cached old modules against new data after an update: every page now carries an import map of versioned module URLs written by new `tools/stamp.mjs`, checked by `stamp.mjs --check` and `check_pages.mjs` (BUG-005).
- Touch-dragging a point no longer scrolls the page: `touch-action: none` moved to the figure's `<svg>`, with a non-passive `touchmove` fallback (BUG-004).
- `ccw`/`cw` restricted to `xCC` in SPEC §Branch selection; they cannot choose between line–circle candidates (BUG-003).
- I.1's C is `pick: "cw"` (above AB on screen), not `"ccw"`: SPEC, D-008 and AV-003 corrected (BUG-002, found by `test_geom.mjs`).
- SPEC example `title` for I.1 replaced with Heath's wording (BUG-001; AV-004).
