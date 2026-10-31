# Architecture

Descriptive only: this is how Stoicheia is structured. Rationale lives in DECISIONS.md.

## System overview

```
 data/props/NN.js ──► scene.js ──► render.js ──► <svg>
 (givens, steps,       │  (object graph,  (draw objects,
  claims)              │   recompute)      drag handles)
                       │
                       ├──► readout.js ──► readout panel
                       │    (measure, evaluate claims)
                       │
                       └──► stepper.js ──► transport + step card
                            (visible-step index)

 geom.js is the pure-function kernel everything above calls.
 prop.js reads ?p=NN, loads the data file, wires the modules.
 instrument.css carries all visual tokens.
```

Data flows one way: the proposition data file is the single source of truth for a proposition; nothing writes back to it. Pointer events mutate only free-point coordinates in the scene, which triggers recompute → render → readout.

## Module responsibilities

**`geom.js`** — Pure geometry. Points as `{x, y}`, no classes. Functions for distance, midpoint, direction, perpendicular foot, angle at a vertex, and the three intersection families (line–line, line–circle, circle–circle). Every function is total: degenerate input returns an empty result or `NaN`-free sentinel rather than throwing. No DOM, no state.

**`scene.js`** — The object graph for one proposition. Each object has an id, a kind, a constructor function referencing earlier objects, and a cached value. Free points are the only objects with no inputs. `recompute()` walks objects in declaration order (which is dependency order by construction) and reevaluates each. Holds the intersection-branch memory that keeps dragged constructions stable (SPEC.md §Branch selection).

**`render.js`** — Scene → SVG. One `<g>` per scene object, keyed by id, updated in place rather than rebuilt. Draws drag handles on free points and binds pointer events back to the scene. Knows the visible-step index and hides objects introduced after it.

**`stepper.js`** — Owns the current step index. Renders the step card (title, text, citation) and the transport (◀ ▶ pips). Emits step-change events the renderer and readout subscribe to.

**`readout.js`** — Computes measurements declared in the data file, evaluates claims with the SPEC tolerance, and renders the readout panel. Claims become active at the step that establishes them; earlier steps show measurements only.

**`index.js`** — The index page. Reads `data/arcs.js`, lays out 48 cards by arc, and for each built proposition imports its data file and draws a non-interactive miniature of the finished figure with the same `scene.js` and `render.js` as the proposition page. Unbuilt propositions are dimmed placeholders, not links.

**`cite.js`** — Citation grammar, link targets, and derivation of a step's footer and a proposition's dependencies from the bracketed citations in Heath's text. Pure; shared by the stepper, the graph page and the linter.

**`prop.js`** — Page bootstrap. Parses `?p=NN`, imports `data/props/NN.js`, builds the scene, mounts the three UI modules, sets prev/next links and the document title.

**`data/props/NN.js`** — One ES module per proposition exporting a single object (schema in SPEC.md §Proposition data). Contains the statement, givens with default positions, construction steps with the objects each introduces and Heath's text for each step (the step texts together are the proof, with citations inline), and the claims. Its dependencies are derived from the citations in the step texts (`js/cite.js`), not declared.

**`data/arcs.js`, `data/foundations.js`** — Static tables for the index and the definitions page. `foundations.js` holds Heath's Definitions 1–23, Postulates 1–5 and Common Notions 1–5, transcribed from the scan.

**`defs.js`** — The definitions page. Renders `foundations.js` with one anchor per entry (the targets of every citation link), highlights the anchored entry, and lists under each entry the built propositions that cite it, derived from their step text by `cite.js`.

**`tools/`** — Author-side only, never served. Cross-reference checker for the docs; data linter that loads every proposition, drags each given through a grid of positions, and asserts the claims hold.

## Key invariants

1. **Declaration order is dependency order.** A proposition's object list never references a later object. The linter enforces this.
2. **The kernel never throws.** Degenerate geometry yields empty intersections or a flagged result; the UI decides how to show it.
3. **Proof text is Heath's.** Wording changes only to add citations and modern punctuation; nothing is paraphrased.
4. **Every inference cites.** No step in a proof may rely on something that is not a Definition, Postulate, Common Notion, or earlier proposition, and the citation must be present in the data.
5. **All colour and type lives in `instrument.css`.** Page markup and SVG use class names and CSS custom properties only.
6. **No build step.** Anything served from `docs/` is committed as-is and runs in a browser unmodified.

## Cross-cutting concerns

- **Rendering loop.** No animation frame loop; recompute and render are driven by pointer events and step changes only. Idle pages do no work.
- **Error handling.** Degenerate configurations (coincident givens, non-intersecting circles) are surfaced as a readout state ("DEGENERATE") and an outlined figure, never as console errors or a frozen page.
- **Caching.** Every page carries an import map, generated by `tools/stamp.mjs`, that maps each module under `docs/js/` and `docs/data/` to a URL with `?v=VERSION`; the stylesheet is versioned the same way and the entry module is imported through the map. A new stamp makes browsers fetch all modules afresh together, so cached old code never runs against new data (BUG-005). The pages still run unmodified without the tool; it only rewrites committed HTML.
- **State.** The only mutable state is free-point positions and the current step index; both live in memory and reset on reload. URL carries only `?p=NN`.
- **Accessibility.** Transport controls are real `<button>`s; the figure carries an `aria-label` summarising the finished construction; keyboard navigation per F-009.
- **Testing.** Unit tests (`test_geom`, `test_scene`, `test_cite`) and the proposition linter run from `tools/` in Node. `tools/check_pages.mjs` serves `docs/` and drives the installed Chrome headlessly over the DevTools protocol to check the index and every built proposition in a real browser (stepping, footers, claims, mouse and touch drags, phone width, routing, console errors). It uses Node built-ins only; nothing is installed. See CLAUDE.md §Build & test.
