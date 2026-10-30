# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com). References F-, D-, AV-, BUG- and IMP- IDs.

## [Unreleased]
### Added
- Project documentation set: README, FEATURES (F-001–F-015), ROADMAP (Phases 1–5), ARCHITECTURE, DECISIONS (D-001–D-007), SPEC, ATTACK_VECTORS (AV-001–AV-008), BUGS, IMPROVEMENTS, CLAUDE.md, LICENSE.
- Design direction chosen: Instrument (D-002), from three mock-ups of Proposition I.1.
- D-008: intersection branches chosen by rule, not drag continuity; SPEC §Branch selection, AV-003 and the Phase 1 acceptance in CLAUDE.md updated to match.
- IMP-002, IMP-003, IMP-004 logged from the first documentation read-through.
- Directory skeleton (`docs/`, `tools/`) and Instrument reference mock-up in `design/instrument/`.
- D-009: fonts vendored into `docs/fonts/` rather than loaded from Google Fonts.
- SPEC: readout displays lengths in units of a reference segment (`unit`, default `measure[0]`); theme tokens `--amber-hi`, `--grid-line`, `--rule-inner`; header nav targets.
### Changed
- F-001 acceptance reworded: kernel is point-and-scalar only (IMP-004 applied).
- Tool scripts standardised on `.mjs` (`tools/test_geom.mjs`, `tools/lint_props.mjs`); Node ≥ 22.7 noted in CLAUDE.md (IMP-002 applied).
- F-007 split across phases: partial in Phase 1 (text and citations), complete in Phase 2 (links resolve) (IMP-003 applied).
- D-010: Heath's proof is read through the step cards; `proof` field removed from the schema, optional per-step `note` added for commentary.
- IMP-005 logged: `uses` spelling differs from the citation grammar.
