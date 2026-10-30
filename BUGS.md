# Bugs

Catalogue of bugs discovered during development. Per Maintenance Rule 8,
bugs are logged here when found, not silently fixed. The author decides
whether to fix immediately, defer, or leave alone.

Status vocabulary: open | fixed | wontfix | deferred.
Severity vocabulary: low | medium | high.

## Open

_None._

## Fixed

### BUG-002: I.1's C is specified on the wrong side of AB
**Status:** fixed
**Found:** 2026-10-30 (writing `tools/test_geom.mjs` for F-001)
**Location:** SPEC.md §Scene object schema (example `pick: "ccw"` for C) and §Branch selection (I.1 paragraph); DECISIONS.md D-008 (Decision); ATTACK_VECTORS.md AV-003 (Description)
**Severity:** medium
**Description.** The docs place I.1's C at `pick: "ccw"`, "the positive-orientation side of directed AB". With screen y downward, that is the intersection *below* AB on screen: at the mock-up position A(220, 290), B(380, 290), the `"ccw"` point is (300, 428.6). The mock-up and Heath's figure put C above AB, at (300, 151.4), which is the `"cw"` point. CLAUDE.md's pitfall ("ccw in SPEC is screen-space orientation, which is clockwise on paper") describes exactly this trap. Built as specified, I.1 would open with the triangle hanging below AB.
**Reproduction.** `node tools/test_geom.mjs`, test "xCC: I.1 at the mock-up position": `xCC(A,160,B,160)[0]` (positive orientation) has y > 290.
**Notes.** Proposed fix: `pick: "cw"` for C in the SPEC example and wherever I.1 is described; "negative-orientation side" in D-008 and AV-003. D-008's substance (rule-first, not continuity) is unaffected; only the named side changes. Related: D-008, AV-003.

<!--
### BUG-001: {short title}
**Status:** open
**Found:** YYYY-MM-DD ({session/commit context})
**Location:** {docs/js/file.js:line, or "cross-cutting"}
**Severity:** {low | medium | high}
**Description.** {What's wrong and why it matters.}
**Reproduction.** {Minimum steps: which proposition, which drag.}
**Notes.** {Related AV-/D-/IMP- entries.}
--> Fixed 2026-10-30: SPEC example and §Branch selection now say `pick: "cw"` / negative-orientation side; D-008 Decision and AV-003 Description corrected with a pointer here.

### BUG-001: SPEC example title is a paraphrase, not Heath
**Status:** fixed
**Found:** 2026-10-30 (checking the I.1 transcription against the Heath scan)
**Location:** SPEC.md §Proposition data (example `title`)
**Severity:** low
**Description.** The schema example gave I.1's title as "To construct an equilateral triangle on a given finite straight line." Heath's wording is "On a given finite straight line to construct an equilateral triangle." The example is the template `01.js` would be copied from, so the paraphrase would have reached the site. First observed instance of AV-004, and it occurred in the spec itself.
**Reproduction.** Compare SPEC.md's example with Heath (1908) Vol. I p. 241, Internet Archive `thirteenbookseu02heibgoog` leaf 261.
**Notes.** Fixed 2026-10-30: example title replaced with Heath's wording; `given` checked and already correct. Related: AV-004, D-004, IMP-001.

## Won't Fix

## Deferred
