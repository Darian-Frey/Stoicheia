# Features

## Target users

The author, studying Euclidean geometry as a bridge to mechanics, and any reader who wants Book I of the *Elements* as something that moves rather than a flat page of text. Secondary: people who teach or tutor geometry and want a construction to drag in front of a learner.

## Out of scope

- Books II–XIII. Book I is the whole project until it is complete (see candidate features).
- A general dynamic-geometry tool. The kernel exists to run Euclid's constructions, not to let a user draw their own.
- Symbolic or formal proof verification. The QED check is numeric (see D-006).
- Accounts, progress tracking, comments, or any backend.
- Translations other than Heath (see D-004).

## Features

### Kernel

#### F-001 Geometry kernel
**Priority:** Must
**Acceptance:**
- `geom.js` works on points `{x, y}` and scalars only; lines are passed as point pairs and circles as centre and radius. Object shapes (segment, circle, …) belong to the scene layer (SPEC.md §Scene object schema).
- Intersection functions exist for line–line, line–circle, circle–circle; each returns zero, one, or two points and never throws.
- Distance, midpoint, perpendicular foot, angle at a vertex are available and unit-tested against hand-computed values to 1e-9.
**Status:** Complete (2026-10-30)
**Notes:** Contracts in SPEC.md §Kernel.

#### F-002 Draggable givens with dependency recompute
**Priority:** Must
**Acceptance:**
- Given (free) points are draggable with mouse and touch.
- Every dependent object recomputes on each pointer move, in dependency order, with no stale frames.
- Intersection branch choice is stable under drag (the chosen point does not flip to the other intersection without crossing a degeneracy). See AV-003.
**Status:** Complete (2026-10-30)

#### F-003 Numeric QED check
**Priority:** Must
**Acceptance:**
- Each proposition declares one or more claims (equal lengths, equal angles, parallel, point-on-line, etc.).
- The readout evaluates every claim on each recompute and shows pass/fail with the residual.
- Tolerance is relative, per SPEC.md §Tolerance; false fails do not occur at ordinary drag positions.
**Status:** Complete (2026-10-30)

### Proposition pages

#### F-004 Proposition I.1 page
**Priority:** Must
**Acceptance:**
- `prop.html?p=1` renders the statement, the construction, the proof, the readout and the stepper in the Instrument theme.
- Dragging A or B moves C and both circles correctly.
- Readout shows |AB|, |AC|, |BC| and "EQUILATERAL" passes.
**Status:** Complete (2026-10-30)
**Notes:** This is the end-to-end pipeline proof. Everything after it is repetition.

#### F-005 Step-through construction
**Priority:** Must
**Acceptance:**
- Steps revealed one at a time with ◀ ▶ buttons and clickable pips.
- Each step shows its title, text, and the postulate/definition/common notion it relies on.
- The final step is the Q.E.F. / Q.E.D., carrying Heath's concluding text.
- Heath's proof is read through the step cards; there is no separate proof panel (D-010).
- Dragging works at every step, not only the last.
**Status:** Complete (2026-10-30)

#### F-006 Readout panel
**Priority:** Must
**Acceptance:**
- Lengths, angles and claim results update live during drag.
- Values are formatted to three decimals with tabular numerals.
**Status:** Complete (2026-10-30)

#### F-007 Proof text with citations
**Priority:** Must
**Acceptance:**
- Proof text follows Heath; every inference cites its justification in `[Post. N]`, `[Def. N]`, `[C.N. N]` or `[I.N]` form.
- Citations are links to `defs.html#…` or `prop.html?p=N`.
**Status:** Not started

#### F-008 All 48 propositions
**Priority:** Must
**Acceptance:**
- Every proposition I.1–I.48 has a data file, renders, drags, and passes its QED check.
- Problems end Q.E.F.; theorems end Q.E.D.
**Status:** Not started
**Notes:** Delivered arc by arc across ROADMAP phases 1–5.

#### F-009 Keyboard navigation
**Priority:** Should
**Acceptance:**
- ← → step the construction; `[` `]` move to previous/next proposition; Esc returns to index.
- Focus order is sensible and visible.
**Status:** Not started

### Site

#### F-010 Index grid
**Priority:** Must
**Acceptance:**
- 48 cards grouped by arc (SPEC.md §Arcs) in the Instrument theme.
- Each card shows number, short title, problem/theorem badge, and a miniature of the finished figure.
**Status:** Complete (2026-10-31)

#### F-011 Foundations page
**Priority:** Must
**Acceptance:**
- Definitions 1–23, Postulates 1–5, Common Notions 1–5, each with a stable anchor.
**Status:** Not started

#### F-012 Dependency graph
**Priority:** Should
**Acceptance:**
- A page showing which propositions each proposition cites, as a navigable graph.
- Generated from the citations in the proposition data (`usesOf` in `js/cite.js`), not hand-drawn.
**Status:** Not started

#### F-013 Previous/next navigation
**Priority:** Must
**Acceptance:**
- Every proposition page links to its neighbours and to the index.
**Status:** Not started

#### F-014 Phone-width layout
**Priority:** Should
**Acceptance:**
- At 390 px wide, the figure sits above the panels, the stepper remains usable, no horizontal scroll.
**Status:** Not started

### Theme

#### F-015 Instrument theme
**Priority:** Must
**Acceptance:**
- All colours, type and spacing are CSS custom properties in `instrument.css` (SPEC.md §Theme tokens).
- No inline colours in page markup.
**Status:** Complete (2026-10-30)
**Notes:** Mock-up chosen 2026-10-29 (D-002).

## Candidate features (uncommitted)

- Greek text toggle alongside Heath.
- "Export figure as SVG" at the current drag position.
- A second theme (Codex / papyrus) selectable from the header.
- Book II once Book I is Complete — would become its own ROADMAP phase set.
- Per-proposition "the gap" notes (e.g. I.1's unproven circle intersection) as an optional panel.
