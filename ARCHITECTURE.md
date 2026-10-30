# Architecture

Descriptive only: this is how Stoicheia is structured. Rationale lives in DECISIONS.md.

## System overview

```
 data/props/NN.js ──► scene.js ──► render.js ──► <svg>
 (givens, steps,       │  (object graph,  (draw objects,
  claims, uses)        │   recompute)      drag handles)
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

**`prop.js`** — Page bootstrap. Parses `?p=NN`, imports `data/props/NN.js`, builds the scene, mounts the three UI modules, sets prev/next links and the document title.

**`data/props/NN.js`** — One ES module per proposition exporting a single object (schema in SPEC.md §Proposition data). Contains the statement, givens with default positions, construction steps with the objects each introduces and Heath's text for each step (the step texts together are the proof, with citations inline), the claims, and the `uses` list.

**`data/arcs.js`, `data/foundations.js`** — Static tables for the index and the definitions page.

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
- **State.** The only mutable state is free-point positions and the current step index; both live in memory and reset on reload. URL carries only `?p=NN`.
- **Accessibility.** Transport controls are real `<button>`s; the figure carries an `aria-label` summarising the finished construction; keyboard navigation per F-009.
- **Testing.** Kernel unit tests and the proposition linter run from `tools/` in Node; there is no browser test harness. See CLAUDE.md §Build & test.
