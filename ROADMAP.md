# Roadmap

Phases follow the natural arcs of Book I. Phases are append-only; mark Complete with an ISO date.

## Phase 1 — Foundation
**Goal:** Prove the whole pipeline on Proposition I.1: kernel, drag, stepper, readout, theme.
**Status:** Not started
**Features delivered:** F-001, F-002, F-003, F-004, F-005, F-006, F-015; F-007 partial (Heath text and citations rendered; links target `defs.html` anchors that resolve in Phase 2)
**Deliverables:**
- [x] `docs/js/geom.js` with unit tests in `tools/test_geom.mjs` (Node)
- [ ] `docs/js/scene.js` dependency recompute with stable intersection branches
- [ ] `docs/js/render.js`, `stepper.js`, `readout.js`
- [ ] `docs/css/instrument.css` tokens
- [ ] `docs/data/props/01.js`
- [ ] `docs/prop.html` rendering I.1 end to end
**Acceptance:** I.1 drags correctly at every step; readout passes; page matches the Instrument mock-up.

## Phase 2 — Constructions and congruence (I.2–I.8)
**Goal:** The first two arcs, plus the index so the site is navigable.
**Status:** Not started
**Features delivered:** F-010, F-011, F-013; F-007 complete; F-008 partial
**Deliverables:**
- [ ] Data files 02–08
- [ ] `docs/index.html` with arc grouping and miniatures
- [ ] `docs/defs.html`
- [ ] Prev/next navigation
**Acceptance:** Props 1–8 pass; index links to each; defs anchors resolve from proof citations.

## Phase 3 — Perpendiculars, angles, inequalities (I.9–I.26)
**Goal:** The long middle of the book; this phase shakes out kernel gaps (angle bisection, triangle inequalities, SAA/ASA congruence).
**Status:** Not started
**Features delivered:** F-008 partial, F-009
**Deliverables:**
- [ ] Data files 09–26
- [ ] Angle-claim support in readout (equal, greater-than)
- [ ] Keyboard navigation
**Acceptance:** Props 1–26 pass; inequality claims render as comparisons, not equalities.

## Phase 4 — Parallels and area (I.27–I.45)
**Goal:** Parallel postulate propositions and the parallelogram/area block.
**Status:** Not started
**Features delivered:** F-008 partial, F-014
**Deliverables:**
- [ ] Data files 27–45
- [ ] Parallel and area claims in readout
- [ ] Phone-width layout
**Acceptance:** Props 1–45 pass; area claims use signed-area comparison per SPEC.md.

## Phase 5 — Pythagoras and finish (I.46–I.48)
**Goal:** Complete Book I; ship the dependency graph.
**Status:** Not started
**Features delivered:** F-008 complete, F-012
**Deliverables:**
- [ ] Data files 46–48
- [ ] `docs/graph.html` generated from `uses` fields
- [ ] `tools/check_xrefs.py` and `tools/lint_props.mjs`
- [ ] README status → Complete per the lifecycle checklist
**Acceptance:** All 48 pass; graph page shows I.47 depending on I.4, I.41, I.46 (and transitively the rest); every Must feature Complete or Withdrawn.
