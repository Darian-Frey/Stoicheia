# Bugs

Catalogue of bugs discovered during development. Per Maintenance Rule 8,
bugs are logged here when found, not silently fixed. The author decides
whether to fix immediately, defer, or leave alone.

Status vocabulary: open | fixed | wontfix | deferred.
Severity vocabulary: low | medium | high.

## Open

_None yet._

<!--
### BUG-001: {short title}
**Status:** open
**Found:** YYYY-MM-DD ({session/commit context})
**Location:** {docs/js/file.js:line, or "cross-cutting"}
**Severity:** {low | medium | high}
**Description.** {What's wrong and why it matters.}
**Reproduction.** {Minimum steps: which proposition, which drag.}
**Notes.** {Related AV-/D-/IMP- entries.}
-->

## Fixed

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
