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
### Changed
- F-001 Complete: kernel and tests meet the acceptance criteria.
- F-001 acceptance reworded: kernel is point-and-scalar only (IMP-004 applied).
- Tool scripts standardised on `.mjs` (`tools/test_geom.mjs`, `tools/lint_props.mjs`); Node ≥ 22.7 noted in CLAUDE.md (IMP-002 applied).
- F-007 split across phases: partial in Phase 1 (text and citations), complete in Phase 2 (links resolve) (IMP-003 applied).
- `uses` spelt with the citation grammar; `Given` admitted as a standalone `cite` label (IMP-005 applied).
### Removed
- `proof` field from the proposition schema (D-010).
### Fixed
- I.1's C is `pick: "cw"` (above AB on screen), not `"ccw"`: SPEC, D-008 and AV-003 corrected (BUG-002, found by `test_geom.mjs`).
- SPEC example `title` for I.1 replaced with Heath's wording (BUG-001; AV-004).
