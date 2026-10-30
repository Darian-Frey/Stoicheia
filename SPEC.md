# Spec

Authoritative technical reference for Stoicheia. FEATURES.md says what; this says how.

## Coordinates

- The figure is an SVG with `viewBox="0 0 600 470"`. Internal units are SVG user units; y increases downward (SVG convention). The kernel does not care; the data files place givens in this space.
- Angles are measured in radians internally and shown in degrees to one decimal in the readout.
- Lengths are *displayed* in units of the proposition's reference length: the data file's `unit` (a segment id), defaulting to the first entry of `measure`. In I.1, |AB| always reads 1.000. Claims are evaluated in SVG units; the residual is relative, so it is unaffected by the display scale. If the reference length is 0 the readout shows DEGENERATE.
- "Orientation" of three points P, Q, R is the sign of the cross product `(Q−P) × (R−P)`; positive is counter-clockwise *in screen space* (clockwise on paper). Used for branch selection and signed area.

## Kernel (`geom.js`)

All functions are pure, take points `{x, y}` and numbers, return points, arrays of points or numbers, and never throw. The kernel defines no shape objects: lines are point pairs, circles are centre and radius. Shapes are the scene layer's concern (§Scene object schema; IMP-004).

| Function | Returns | Degenerate behaviour |
|---|---|---|
| `dist(P, Q)` | number | 0 when P = Q |
| `mid(P, Q)` | point | — |
| `dir(P, Q)` | unit vector | `{x:0,y:0}` when P = Q |
| `perp(P, Q)` | unit normal to PQ | zero vector when P = Q |
| `foot(P, A, B)` | foot of perpendicular from P to line AB | P when A = B |
| `angle(A, V, B)` | angle ∠AVB in [0, π] | `NaN` when A = V or B = V |
| `xLL(A, B, C, D)` | `[]` or `[P]` | `[]` when parallel or either segment degenerate |
| `xLC(A, B, O, r)` | `[]`, `[P]`, or `[P, Q]` | `[]` when AB degenerate |
| `xCC(O1, r1, O2, r2)` | `[]`, `[P]`, or `[P, Q]` | `[]` when concentric or non-intersecting |
| `signedArea(P, Q, R)` | number | 0 when collinear |

Two-point results are returned in a canonical order: for `xLC` by parameter along AB (A-side first); for `xCC` the point with positive orientation relative to O1 → O2 first. The scene layer, not the kernel, decides which to keep (see Branch selection).

## Tolerance

A claim comparing quantities a and b holds when
`|a − b| ≤ τ · max(1, |a|, |b|)` with `τ = 1e-6`.
Lengths are in SVG units; angles in radians. Area claims use the same rule on signed areas. The readout prints the residual `|a − b| / max(1, |a|, |b|)` to three decimals. (See D-006, AV-007.)

## Branch selection

Every object constructed from a two-point intersection declares `pick` in its data entry:

- `"ccw"` / `"cw"` — the point with positive / negative orientation relative to the two defining centres (for `xCC`) or the two line points (for `xLC`).
- `"near:<id>"` / `"far:<id>"` — the point closer to / farther from another object.
- `"above"` / `"below"` / `"left"` / `"right"` — screen-relative, for propositions where Euclid's figure fixes the side.

The declared rule decides on every recompute; the figure is a function of the givens' positions, not of drag history (D-008). The scene also stores the last chosen point, used only as a numerical safeguard: when the configuration is within δ of tangency (the two candidates are less than `δ · max(1, r)` apart, `δ = 1e-3`, r the largest radius involved), or when the rule scores the two candidates within τ of each other, it keeps the candidate nearest the previous value.

In I.1, `pick: "ccw"` keeps C on the positive-orientation side of directed AB. Dragging A around B keeps C on that side; dragging A through B reverses AB, so C moves to the other side of the screen. That is correct behaviour, not a flip. Screen-relative rules (`"above"` etc.) reintroduce real flips when the defining line passes vertical or horizontal; justify each use in the data file. (AV-003.)

## Scene object schema

```js
{ id: "C", kind: "point", by: "xCC", of: ["circA", "circB"], pick: "ccw" }
{ id: "circA", kind: "circle", by: "circle", of: ["A", "B"] }   // centre A, through B
{ id: "AC", kind: "segment", by: "join", of: ["A", "C"] }
{ id: "A", kind: "point", free: true, at: {x:220, y:290} }
{ id: "D", kind: "point", by: "xLC", of: ["A", "B", "circA"], pick: "far:B", mark: "label" }
```

`kind` ∈ `point | segment | ray | line | circle | angleMark`. `by` names a constructor the scene layer maps to kernel calls. `of` references only earlier ids (ARCHITECTURE invariant 1).

`mark: "label"` (points only, optional) draws the letter alone: no dot, no drag handle. It is for *naming points*, letters Heath uses to name a figure (the D in "the circle BCD") that Euclid does not construct. Place them where Heath's figure does; in I.1, D and E are the far intersections of line AB with circles A and B. A naming point whose intersection is empty is hidden, like any other derived object.

## Proposition data (`data/props/NN.js`)

```js
export default {
  n: 1,
  kind: "problem",            // "problem" (Q.E.F.) | "theorem" (Q.E.D.)
  title: "On a given finite straight line to construct an equilateral triangle.",
  short: "Equilateral triangle",
  given: "Let AB be the given finite straight line.",
  objects: [ /* scene object schema, dependency order */ ],
  steps: [
    { title: "The given line", text: "…", cite: "Given", show: ["A","B","AB"] },
    { title: "Circle with centre A", text: "…", cite: "Post. 3", show: ["circA"] },
    …
    { title: "Q.E.F.", text: "…", cite: "Def. 15, C.N. 1", show: [] }
  ],
  measure: [ "AB", "AC", "BC" ],                 // lengths shown in readout
  unit: "AB",                                    // optional; display unit, defaults to measure[0]
  claims: [
    { label: "EQUILATERAL", eq: ["AB","AC","BC"], from: 3 }   // active from step index 3
  ],
  uses: ["Def. 15", "Post. 1", "Post. 3", "C.N. 1"],  // foundations and props ("I.4"), spelt as citations
  arc: "constructions"
};
```

Each step's `text` is Heath's wording for that stage of the construction or proof, transcribed, with citations inserted inline in brackets (`[Post. 3]`) and nothing else changed (D-004). Read in order, the step texts are the complete proof; there is no separate proof field or panel (D-010). `cite` is the card's footer line and lists exactly the citations that appear inline in `text`. Commentary that is not Heath's (e.g. "A and B may be dragged") does not go in `text`; if wanted it goes in an optional `note` field, rendered visibly apart from the proof text.

Claim forms: `eq` (all equal), `gt: [a, b]`, `parallel: [seg, seg]`, `on: [point, line]`, `perp: [seg, seg]`, `areaEq: [poly, poly]`, `angleEq: [[A,V,B],[C,W,D]]`, `sum: {parts:[…], whole:…}`.

Citation strings use exactly: `Def. N`, `Post. N`, `C.N. N`, `I.N`, both inline in step text and in `cite` and `uses`. The linter rejects anything else, with one exception: `cite: "Given"` marks a step that states the hypothesis and relies on nothing. `Given` must stand alone (never in a list), renders as plain unlinked text, and is excluded from the `uses` check.

## Arcs (`data/arcs.js`)

| Arc id | Props | Label |
|---|---|---|
| constructions | 1–3 | Constructions |
| congruence | 4–8 | Triangle congruence |
| perpendiculars | 9–15 | Perpendiculars and angles |
| inequalities | 16–26 | Inequalities |
| parallels | 27–32 | Parallels |
| area | 33–45 | Parallelograms and area |
| pythagoras | 46–48 | Pythagoras |

## Theme tokens (`instrument.css`)

```css
:root {
  --ground: #15171A;  --panel: #1E2125;  --well: #0E1013;
  --rule: #2C3036;    --rule-2: #3A3F46;
  --ink: #F2EBDD;     --ink-2: #D9D4C7;  --ink-3: #8E8A7F;
  --amber: #E8B86D;   --amber-hi: #FFD28A;  --teal: #5FA8A3;
  --grid-line: #1C2026;  --rule-inner: #1C1F23;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --font-display: "Barlow Condensed", "Arial Narrow", sans-serif;
  --radius: 6px;      --grid: 20px;
}
```

`--amber-hi` is link hover; `--grid-line` is the figure's 20 px grid; `--rule-inner` is the figure frame's 1 px inset shadow. Values from `design/instrument/Instrument.dc.html`.

Fonts are vendored as woff2 in `docs/fonts/` with their SIL OFL licence and declared by `@font-face` in `instrument.css`: IBM Plex Mono 400/500/600 (`ibm-plex-mono-NNN.woff2`), Barlow Condensed 500/600 (`barlow-condensed-NNN.woff2`). Latin-1 coverage only; symbols such as ◀ ▶ ✓ fall back to system fonts. Provenance in `docs/fonts/SOURCES.txt`. No third-party font requests (D-009).

Figure styling: givens and given lines in `--ink`; construction circles `--teal` dashed `6 5` at 1.5 px; result segments `--amber` at 2.5 px; points r = 6; labels 20 px mono; naming points (`mark: "label"`) letter only, `--ink-3`, 16 px mono. Minimum touch target 44 px on transport controls.

## URLs

- `index.html` — index.
- `prop.html?p=NN` — proposition NN (1–48). Out-of-range or missing → index.
- `defs.html#def-15`, `#post-3`, `#cn-1` — foundations anchors.
- `graph.html` — dependency graph.

Header nav (per the mock-up): Index → `index.html`, Defs → `defs.html`, Posts → `defs.html#post-1`, Graph → `graph.html` (inert until Phase 5).
