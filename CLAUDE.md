# CLAUDE.md

## Project

Stoicheia: Euclid's *Elements* Book I (48 propositions) as interactive constructions on a static GitHub Pages site. Plain HTML, ES modules, SVG; no build. Each proposition is a data file driving a shared page shell with a draggable figure, a step-through stepper, and a live numeric readout. Visual direction is "Instrument" (dark cassette-futurism, mono type, amber/teal).

## Current state

- `design/instrument/` — reference mock-up of I.1: `Instrument.dc.html` (exact design values in inline styles) and `instrument-I1.pdf`. Layout reference only; its step text is a paraphrase, not Heath (D-004). `support.js` and `vendor/` are the mock-up's viewer runtime, not part of the site.
- `docs/js/geom.js` — written 2026-10-30, all SPEC §Kernel functions; `tools/test_geom.mjs` passes (19 tests).
- `docs/js/scene.js` — written 2026-10-30; `tools/test_scene.mjs` passes (18 tests).
- `index.html`, `js/index.js`, `data/arcs.js` — written 2026-10-31; 48 cards by arc, I.1 live with a miniature, 47 placeholders. Add each new proposition to `built` in `arcs.js`.
- `defs.html`, `js/defs.js`, `data/foundations.js` — written 2026-10-31; Heath's Defs 1–23, Posts 1–5, C.N. 1–5 from pp. 153–155, checked against scan leaves 173–175 (author's check pending). Every citation in built propositions resolves (`check_pages.mjs`).
- `render.js`, `stepper.js`, `readout.js`, `prop.js`, `instrument.css`, `prop.html`, `data/props/01.js` — written 2026-10-30; I.1 renders and drags end to end in headless Chrome (all acceptance checks pass). Author checked visually and on a phone 2026-10-30; F-002–F-006 and F-015 Complete.
- Documentation — complete first pass 2026-10-29 (README, FEATURES, ROADMAP, ARCHITECTURE, DECISIONS D-001–D-011 (D-008–D-010 added 2026-10-30, D-011 2026-10-31), SPEC, ATTACK_VECTORS AV-001–AV-008, BUGS, IMPROVEMENTS, CHANGELOG, LICENSE).

## Active task

**Phase 1 — Foundation: Complete (2026-10-30).** I.1 is live at https://darian-frey.github.io/Stoicheia/prop.html?p=1 and passed its acceptance checks, including the author's visual check and a phone touch test (BUG-004 fixed). F-001–F-006 and F-015 Complete; F-007 completed in Phase 2 with `defs.html`.

**Phase 2 — Constructions and congruence (I.2–I.8)** (ROADMAP). Started 2026-10-31 with the index (F-010): `index.html`, `js/index.js`, `data/arcs.js`. `defs.html` (F-011) done 2026-10-31. I.2 built 2026-10-31 (`02.js`, p. 244, leaf 264; `extend` and `onCircle` constructors added). I.3 built 2026-10-31 (`03.js`, pp. 246–247, leaves 266–267; `circleLen`, segment and hidden point `label`, readout `requires`). Next: I.4–I.8, prev/next (F-013). Each data file's Heath text is transcribed from the scan (Internet Archive `thirteenbookseu02heibgoog`) and checked line by line before it is marked done (AV-004).

## Invariants

- Declaration order is dependency order in every data file.
- `geom.js` is pure and never throws.
- Proof text is Heath's, transcribed, with citations inserted; never paraphrased.
- Every inference cites `Def. N` / `Post. N` / `C.N. N` / `I.N`, inline in Heath's text; footers and dependencies are derived from it, never declared. Heath's citations are `[…]` and never altered; where he leaves one implicit, add it as `{…}` and list it in the data file's header (D-011).
- All colour and type lives in `instrument.css`; no hex in markup or JS.
- Nothing in `docs/` requires a build step to run.

## Build & test

```bash
python3 -m http.server -d docs 8000      # serve locally
node tools/test_geom.mjs                 # kernel unit tests (Phase 1)
node tools/test_scene.mjs                # scene recompute, branch picks, AV-001/AV-003 drags
node tools/test_cite.mjs                 # citation grammar, derived footers and uses
node tools/check_pages.mjs               # headless Chrome: index + every built prop (needs Chrome; CHROME=path to override)
node tools/stamp.mjs                     # re-version every module URL in the pages' import maps (BUG-005)
node tools/stamp.mjs --check             # verify the import maps are complete and consistent
node tools/lint_props.mjs                # schema, citations, drag-grid sweep (Phase 2+)
python3 tools/check_xrefs.py             # doc cross-reference check (Phase 5)
```

Tool scripts are `.mjs` and need Node ≥ 22.7: they import `docs/` modules, which are `.js` with no `package.json`, relying on Node's ES-module syntax detection (IMP-002).

Before every commit that changes anything under `docs/`, run `node tools/stamp.mjs` so returning visitors fetch the new code rather than mixing cached old modules with new ones (BUG-005); never edit the `<!-- stamp -->` blocks by hand. Run `check_pages.mjs` after any change under `docs/` and before marking a feature or phase Complete; `--shots DIR` saves screenshots for a visual check. It checks every proposition in `arcs.js` `built` generically; add proposition-specific drag checks to its `SPECIFIC` table. Visual fidelity to the mock-up is still the author's call.

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
