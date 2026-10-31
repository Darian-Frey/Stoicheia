# Improvements

Catalogue of code-quality improvements, refactors, and architectural
changes proposed during development. Per Maintenance Rule 8, improvements
are logged here when noticed, not silently applied. The author decides
whether to apply, defer, or decline.

This is the dual of BUGS.md: bugs are broken; improvements work but
could be better.

Status vocabulary: suggested | applied | declined | deferred.
Effort vocabulary: trivial | small | medium | large.

## Suggested

### IMP-001: Public-domain Heath corpus for automated proof-text diffing
**Status:** suggested
**Found:** 2026-10-29 (documentation pass, while writing AV-004)
**Location:** cross-cutting (`docs/data/props/*.js`, `tools/`)
**Effort:** medium
**Description.** AV-004 (transcription error) currently has manual detection only. A plain-text Heath Book I corpus in `tools/heath/` would let a linter diff each data file's proof text against the source, catching letter swaps and dropped words mechanically.
**Proposal.** Obtain OCR text of the 1908 Cambridge edition (Internet Archive), clean Book I into one file per proposition, and add a `--diff-heath` mode to `lint_props.mjs` that strips our inserted citations and compares.
**Trade-offs.** OCR cleaning is tedious and itself error-prone, so the corpus needs its own one-off manual check; until then it could give false confidence. Adds a 48-file corpus to the repo that is not served.
**Notes.** Natural Phase 5 task; would move AV-004 from manual to automated detection.

### IMP-006: Derive `cite` and `uses` from inline citations
**Status:** suggested
**Found:** 2026-10-30 (while settling IMP-005)
**Location:** SPEC.md §Proposition data, ATTACK_VECTORS.md (AV-005), `tools/lint_props.mjs`
**Effort:** small
**Description.** Since D-010, each step's `text` carries its citations inline (`[Post. 3]`). The `cite` field repeats them and `uses` repeats their union, so every data file holds each citation up to three times and the linter must check they agree.
**Proposal.** Drop `cite` (footer built from the inline citations, plus a per-step `given: true` flag for the `Given` label) and derive `uses` as the union across steps. AV-005's linter check reduces to grammar and `I.N` ordering.
**Trade-offs.** Removes a class of sync errors; costs at-a-glance readability of a step's citations in the data file, and `uses` is no longer a literal the graph page can read without parsing text.
**Notes.** Best decided while writing `01.js`, when the duplication is concrete.

### IMP-007: Keep the headless-browser page checks in `tools/`
**Status:** suggested
**Found:** 2026-10-31 (building the index; the Phase 1 browser check scripts had been lost with the session scratchpad)
**Location:** `tools/` (new `check_pages.mjs`), CLAUDE.md §Build & test
**Effort:** small
**Description.** Page behaviour (stepping, mouse drag past and onto B, DEGENERATE and recovery, touch drag without page scroll, no horizontal scroll at 390 px, the index's 48 cards and I.1 link) has been verified with throwaway scripts that drive the system's Chrome through the DevTools protocol. They lived in a session scratchpad and were lost between sessions, so each check has to be rewritten before it can be rerun. BUG-004 shows the touch check is worth keeping.
**Proposal.** Commit one `tools/check_pages.mjs` (Node built-ins only: `child_process`, `fetch`, `WebSocket`) that starts a local server and headless Chrome, runs the I.1 and index checks, and exits non-zero on failure. Add it to CLAUDE.md §Build & test, and run it before any phase is marked Complete.
**Trade-offs.** Needs Chrome installed; not a dependency in the D-001 sense (nothing is installed or vendored, and `docs/` is untouched), but it is the first tool that relies on a program outside Node and Python. Pixel-exact visual checks stay manual.
**Notes.** Related: F-002, BUG-004, AV-001, AV-003, AV-006.

## Applied

### IMP-005: `uses` spelling differs from the citation grammar
**Status:** applied
**Found:** 2026-10-30 (while removing the `proof` field from SPEC §Proposition data)
**Location:** SPEC.md §Proposition data, ATTACK_VECTORS.md (AV-005)
**Effort:** trivial
**Description.** Citations must be spelt exactly `Def. N`, `Post. N`, `C.N. N`, `I.N`, but the schema example's `uses` list is `["Def.15", "Post.1", "Post.3", "CN.1"]`. AV-005's linter check ("the set of citations equals `uses`") cannot pass with two spellings. Separately, step 0's `cite: "Given"` is outside the grammar the linter enforces.
**Proposal.** Spell `uses` entries with the citation grammar (`"Def. 15"`, `"C.N. 1"`), and allow `cite` to be empty (or the literal `Given`, explicitly whitelisted) for steps that rely on nothing.
**Trade-offs.** None of substance; must be settled before `01.js` is written.
**Notes.** Found in passing; not applied (Maintenance Rule 8).
**Resolution.** 2026-10-30: `uses` entries spelt with the citation grammar; `Given` admitted as a standalone `cite` label, rendered unlinked and excluded from the `uses` check. SPEC §Proposition data and AV-005 updated.

### IMP-003: F-007 scheduled in Phase 1 but depends on Phase 2 pages
**Status:** applied
**Found:** 2026-10-30 (first read-through of the documentation set)
**Location:** ROADMAP.md (Phase 1), FEATURES.md (F-007), CLAUDE.md (Active task)
**Effort:** trivial
**Description.** ROADMAP lists F-007 (proof text with citations) as delivered by Phase 1, but F-007's acceptance requires citations to link to `defs.html#…`, which is a Phase 2 deliverable (F-011). CLAUDE.md's Phase 1 task list omits F-007 entirely, so the two documents disagree on Phase 1's scope.
**Proposal.** Either (a) mark F-007 as "partial" in Phase 1 (Heath text and citations rendered, links inert or pointing at not-yet-existing anchors) and complete it in Phase 2; or (b) move F-007 to Phase 2 outright. Then align CLAUDE.md's Active task with whichever is chosen.
**Trade-offs.** (a) keeps I.1 a full end-to-end proof of the pipeline including citation rendering; (b) is cleaner but leaves the proof panel untested until Phase 2.
**Notes.** ROADMAP is append-only for phases, but a phase not yet started can have its feature list corrected.
**Resolution.** 2026-10-30: option (a). ROADMAP Phase 1 lists F-007 partial, Phase 2 lists F-007 complete (its existing acceptance already requires defs anchors to resolve from proof citations); CLAUDE.md Active task gains step 6.

### IMP-002: Inconsistent tool filenames across docs
**Status:** applied
**Found:** 2026-10-30 (first read-through of the documentation set)
**Location:** ROADMAP.md (Phase 1, Phase 5), ATTACK_VECTORS.md (AV-001, AV-008), CLAUDE.md, IMPROVEMENTS.md (IMP-001)
**Effort:** trivial
**Description.** The proposition linter is `tools/lint_props.mjs` in CLAUDE.md and IMP-001 but `tools/lint_props.js` in ROADMAP Phase 5, AV-001 and AV-008. The kernel tests are `tools/test_geom.mjs` in CLAUDE.md but "`tools/test_geom.html` (or Node script)" in ROADMAP Phase 1.
**Proposal.** Standardise on `.mjs` for both (Node runs ES modules without a `package.json`), and update ROADMAP and ATTACK_VECTORS to match.
**Trade-offs.** None of substance.
**Notes.** The kind of drift `check_xrefs.py` (Phase 5) would not catch, since it is a filename rather than an ID.
**Resolution.** 2026-10-30: standardised on `.mjs`. ROADMAP Phase 1 and Phase 5, AV-001 and AV-008 updated; CLAUDE.md §Build & test notes the Node ≥ 22.7 requirement.

### IMP-004: F-001 promises object types the SPEC kernel does not define
**Status:** applied
**Found:** 2026-10-30 (first read-through of the documentation set)
**Location:** FEATURES.md (F-001), SPEC.md §Kernel
**Effort:** small
**Description.** F-001's acceptance says `geom.js` "exports points, segments, rays, lines, circles, and angle values as plain objects", but the SPEC §Kernel table defines only points `{x, y}` and functions over them; circles are passed as `(O, r)` and lines as point pairs. There is no defined shape for a segment, ray, line or circle object, so the acceptance criterion cannot be checked against the spec.
**Proposal.** Either add the shapes to SPEC §Kernel (e.g. `{kind:"circle", O, r}`, `{kind:"segment", A, B}`) and say whether kernel functions accept them, or reword F-001 to say the kernel works on points and scalars and the scene layer owns the object shapes (matching the SPEC §Scene object schema).
**Trade-offs.** Defining shapes in the kernel is tidier for the renderer; keeping the kernel point-only keeps it smaller and pushes shapes to `scene.js`, where they already live in the schema.
**Notes.** Should be settled before `geom.js` is written (Phase 1, step 1).
**Resolution.** 2026-10-30: kernel stays point-and-scalar only. F-001 acceptance reworded; SPEC §Kernel states the rule.

## Declined

## Deferred
