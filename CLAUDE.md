# CLAUDE.md

## Project

Stoicheia: Euclid's *Elements* Book I (48 propositions) as interactive constructions on a static GitHub Pages site. Plain HTML, ES modules, SVG; no build. Each proposition is a data file driving a shared page shell with a draggable figure, a step-through stepper, and a live numeric readout. Visual direction is "Instrument" (dark cassette-futurism, mono type, amber/teal).

## Current state

- `docs/`, `tools/` — directory skeleton created 2026-10-30 (`.gitkeep` placeholders); no code yet.
- `design/instrument/` — reference mock-up of I.1: `Instrument.dc.html` (exact design values in inline styles) and `instrument-I1.pdf`. Layout reference only; its step text is a paraphrase, not Heath (D-004). `support.js` and `vendor/` are the mock-up's viewer runtime, not part of the site.
- `docs/js/geom.js` — written 2026-10-30, all SPEC §Kernel functions; `tools/test_geom.mjs` passes (19 tests).
- `docs/js/scene.js` — written 2026-10-30; `tools/test_scene.mjs` passes (12 tests).
- `render.js`, `stepper.js`, `readout.js`, `prop.js`, `instrument.css`, `prop.html`, `data/props/01.js` — written 2026-10-30; I.1 renders and drags end to end in headless Chrome (all acceptance checks pass). Author checked visually 2026-10-30; F-003–F-006 and F-015 Complete. F-002 awaits a real touch-device drag test; F-007 partial until Phase 2.
- Documentation — complete first pass 2026-10-29 (README, FEATURES, ROADMAP, ARCHITECTURE, DECISIONS D-001–D-010 (D-008–D-010 added 2026-10-30), SPEC, ATTACK_VECTORS AV-001–AV-008, BUGS, IMPROVEMENTS, CHANGELOG, LICENSE).

## Active task

**Phase 1 — Foundation** (ROADMAP). Build the pipeline end to end on Proposition I.1:

1. `geom.js` with the SPEC table of functions and a Node test script in `tools/test_geom.mjs` (F-001).
2. `scene.js` with dependency recompute and `pick` branch memory (F-002, AV-003).
3. `render.js`, `stepper.js`, `readout.js`, `prop.js` (F-005, F-006, F-003).
4. `instrument.css` from SPEC §Theme tokens (F-015).
5. `data/props/01.js` and `prop.html` rendering I.1 (F-004).
6. Heath's I.1 text with citations, each linked to its final `defs.html` anchor; links resolve once Phase 2 builds `defs.html` (F-007 partial).

Acceptance: I.1 drags correctly at every step, readout passes with residual 0.000, dragging A around B keeps C on the same side of directed AB, dragging A through B moves C to the other side of the screen with no stale frame (D-008), A dragged onto B shows DEGENERATE not an error.

## Invariants

- Declaration order is dependency order in every data file.
- `geom.js` is pure and never throws.
- Proof text is Heath's, transcribed, with citations inserted; never paraphrased.
- Every inference cites `Def. N` / `Post. N` / `C.N. N` / `I.N`.
- All colour and type lives in `instrument.css`; no hex in markup or JS.
- Nothing in `docs/` requires a build step to run.

## Build & test

```bash
python3 -m http.server -d docs 8000      # serve locally
node tools/test_geom.mjs                 # kernel unit tests (Phase 1)
node tools/test_scene.mjs                # scene recompute, branch picks, AV-001/AV-003 drags
node tools/lint_props.mjs                # schema, citations, drag-grid sweep (Phase 2+)
python3 tools/check_xrefs.py             # doc cross-reference check (Phase 5)
```

Tool scripts are `.mjs` and need Node ≥ 22.7: they import `docs/` modules, which are `.js` with no `package.json`, relying on Node's ES-module syntax detection (IMP-002).

Until the tools exist, verification is manual in the browser; say so in the commit message.

## Conventions

- British English in all prose and docs.
- Data file headers carry a comment: proposition number, Heath page checked against, check date.
- Object ids follow Euclid's lettering (`A`, `B`, `C`); derived objects are `circA` (circle centred A), `AB` (segment), `rayAB`, `lineAB`, `angABC`.
- Commits reference IDs: `F-004: prop.html renders I.1 end to end`. Multi-paragraph bodies.
- Status vocabularies are exactly those in the docs; do not invent new ones.
- Log bugs and improvement candidates found in passing to BUGS.md / IMPROVEMENTS.md rather than fixing or applying inline (Maintenance Rule 8). Ask before acting on them.

## Pitfalls

- See ATTACK_VECTORS.md for the canonical list. The ones that bite first: AV-001 (coincident givens), AV-003 (branch flip), AV-004 (retyping Heath from memory — don't; transcribe).
- SVG y is downward; "ccw" in SPEC is screen-space orientation, which is clockwise on paper.
- `xCC` returns points in a canonical order, but the *scene* chooses the branch. Never pick `[0]` blindly.
- Cross-references between docs are maintained by hand until `check_xrefs.py` exists and may be stale.

## Out of scope

Do not, without asking:
- Add a dependency, bundler, or framework (D-001).
- Change the theme tokens or the Instrument layout (D-002).
- Paraphrase or "improve" proof text (D-004).
- Start propositions beyond the current ROADMAP phase.
- Add Book II or any general drawing tool.
- Lift the documentation exemptions in D-005.
