# Attack Vectors

Project-specific failure modes the project must be resilient against.
Grouped by category. Each vector lists detection method and severity.
Severity: Critical (must hold) | Major (regression on release blocks) | Minor (track only).

## Geometric correctness

### AV-001 Degenerate givens
**Severity:** Critical
**Description.** A reader drags two free points onto each other (A = B in I.1), or three onto a line where the proposition needs a triangle. Every downstream intersection becomes empty or `NaN`; a naive page throws, freezes, or draws garbage.
**Detection.** Linter drags every proposition's givens through a grid that includes coincident and collinear positions and asserts no exception and no `NaN` in any object (`tools/lint_props.mjs`). Manual: drag A onto B on every page before release.
**Related decisions.** D-006.
**History.** Identified during Phase 1 planning, 2026-10-29.

### AV-002 Vanished intersection
**Severity:** Major
**Description.** A construction depends on two circles or a line and circle meeting; under drag they may not (e.g. I.22 with sides violating the triangle inequality, which Euclid himself conditions on). The construction must show a DEGENERATE state rather than a stale figure.
**Detection.** Linter asserts that every empty intersection yields readout state `DEGENERATE` and that the figure outlines rather than hides. Not implemented until Phase 1 readout exists.
**Related decisions.** D-006.
**History.** Identified 2026-10-29.

### AV-003 Intersection branch flip
**Severity:** Critical
**Description.** An intersection point switches to the other candidate without the construction justifying it: a screen-relative rule (`"above"`) changes answer as its line passes vertical, near-tangent circles make the orientation test numerically unstable, or code takes `[0]` blindly. The point ends up on the opposite side of a line from the one Heath's proof states; in later propositions the claim can then fail while the proof text still says it holds. Note that C in I.1 moving to the other side of the screen when A is dragged *through* B is not a flip: directed AB has reversed and C stays on its negative-orientation (`"cw"`) side (D-008, BUG-002).
**Detection.** Linter: for every object with an orientation-based `pick` (`"ccw"`/`"cw"`), the orientation sign of the chosen point relative to its defining objects is constant across every non-degenerate sample of the drag grid. For I.1, sign of (A, B, C) is constant. Objects using screen-relative picks must carry a justifying comment. See SPEC.md §Branch selection.
**Related decisions.** D-006, D-008.
**History.** Identified 2026-10-29 while specifying `pick`. Redefined 2026-10-30 by D-008: branches are rule-first, so detection checks orientation invariance rather than screen position.

### AV-007 QED false fail near degeneracy
**Severity:** Major
**Description.** Relative tolerance with `max(1, |a|, |b|)` scaling still produces residuals above τ when quantities are tiny (two points 0.01 units apart) because floating-point error in intersections grows as circles become tangent. The readout shows ✗ for a proposition that in fact holds.
**Detection.** Linter records the worst residual across the drag grid for each claim and fails if any ordinary (non-degenerate) position exceeds τ/10. Threshold tuning recorded in SPEC.md §Tolerance.
**Related decisions.** D-006.
**History.** Identified 2026-10-29.

## Text fidelity

### AV-004 Proof transcription error
**Severity:** Critical
**Description.** Heath's text retyped from memory drifts: a wrong letter (CDB vs CBD), a missing "respectively", a swapped "greater"/"less". Readers trust the text; a wrong letter in a 48-page corpus is nearly invisible and silently miseducates.
**Detection.** Manual: every proposition's proof is checked line by line against a scanned Heath (Internet Archive, 1908 Cambridge edition) before its data file is marked done; the checking date goes in the data file's header comment. No automated detection; a public-domain Heath text corpus for diffing would be a Phase 5 improvement.
**Related decisions.** D-004.
**History.** Identified 2026-10-29. First observed 2026-10-30, in SPEC.md's own schema example (I.1 title paraphrased); caught by checking against the scan (BUG-001).

### AV-005 Wrong or missing citation
**Severity:** Major
**Description.** A proof step cites `Post. 2` where Heath's marginal note says `Post. 1`, or cites nothing. The dependency graph (F-012) is derived from the same citations, so a wrong citation also corrupts the graph.
**Detection.** Linter: every bracketed citation in step text matches the SPEC grammar, every cited `I.N` has N < current proposition, and only the opening step may be `given: true` (with no citations). Footers and `uses` are derived from the text, so they cannot drift from it (IMP-006). `tools/test_cite.mjs` checks these rules for I.1 until the linter exists. Correctness of the citation itself is checked manually alongside AV-004, including every citation Stoicheia adds in braces (D-011), which is a judgement rather than a transcription.
**Related decisions.** D-003, D-004.
**History.** Identified 2026-10-29.

## Presentation

### AV-006 Phone-width breakage
**Severity:** Minor (Major once F-014 is delivered)
**Description.** The Instrument layout is desktop-first; at 390 px the readout and step card can overflow or the transport can wrap under the figure, making the page unusable on a phone.
**Detection.** Manual check at 390 px and 768 px in a browser's device mode before each phase is marked Complete. Not automated.
**Related decisions.** D-001, D-002.
**History.** Identified 2026-10-29.

### AV-008 Theme token leakage
**Severity:** Minor
**Description.** A colour or font hard-coded in a page or SVG attribute instead of `instrument.css` makes a future second theme (candidate feature) incomplete and breaks the ARCHITECTURE invariant.
**Detection.** `grep -nE '#[0-9A-Fa-f]{6}|font-family' docs/*.html docs/js/*.js` returns nothing; run as part of `tools/lint_props.mjs`.
**Related decisions.** D-002.
**History.** Identified 2026-10-29.
