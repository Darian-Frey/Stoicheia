# Spec

Authoritative technical reference for Stoicheia. FEATURES.md says what; this says how.

## Coordinates

- The figure is an SVG with `viewBox="0 0 600 470"`. Internal units are SVG user units; y increases downward (SVG convention). The kernel does not care; the data files place givens in this space.
- Dragging a free point to within 8 units of another free point snaps it exactly onto that point, so coincident givens (AV-001) are reachable by hand rather than only by floating-point accident.
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

- `"ccw"` / `"cw"` — the point with positive / negative orientation relative to the two defining centres, O1 → O2. `xCC` only: both `xLC` candidates lie on the defining line, so their orientation relative to it is zero and the rule cannot choose (BUG-003). The scene rejects `ccw`/`cw` on anything but `xCC` at load.
- `"near:<id>"` / `"far:<id>"` — the point closer to / farther from another object, which must be a point. The usual rule for `xLC`.
- `"above"` / `"below"` / `"left"` / `"right"` — screen-relative, for propositions where Euclid's figure fixes the side.

The declared rule decides on every recompute; the figure is a function of the givens' positions, not of drag history (D-008). The scene also stores the last chosen point, used only as a numerical safeguard: when the configuration is within δ of tangency (the two candidates are less than `δ · max(1, r)` apart, `δ = 1e-3`, r the largest radius involved), or when the rule scores the two candidates within τ of each other, it keeps the candidate nearest the previous value.

In I.1, `pick: "cw"` keeps C on the negative-orientation side of directed AB, which with A left of B is above AB on screen, as in Heath's figure (y is downward, so screen "cw" is counter-clockwise on paper; BUG-002). Dragging A around B keeps C on that side; dragging A through B reverses AB, so C moves to the other side of the screen. That is correct behaviour, not a flip. Screen-relative rules (`"above"` etc.) reintroduce real flips when the defining line passes vertical or horizontal; justify each use in the data file. (AV-003.)

## Scene object schema

```js
{ id: "C", kind: "point", by: "xCC", of: ["circA", "circB"], pick: "cw" }
{ id: "circA", kind: "circle", by: "circle", of: ["A", "B"] }   // centre A, through B
{ id: "AC", kind: "segment", by: "join", of: ["A", "C"] }
{ id: "A", kind: "point", free: true, at: {x:220, y:290} }
{ id: "D", kind: "point", by: "xLC", of: ["A", "B", "circA"], pick: "far:B", mark: "label" }
```

`kind` ∈ `point | segment | ray | line | circle | angleMark | polygon`. `by` names a constructor the scene layer maps to kernel calls. `of` references only earlier ids (ARCHITECTURE invariant 1).

Constructors. `of` is flattened before the call: a point contributes one input, a segment, ray or line contributes its two defining points, a circle contributes centre and radius. The flattened count must match the arity.

| `by` | makes `kind` | arity | flattened inputs | needs `pick` |
|---|---|---|---|---|
| `circle` | circle | 2 | centre, a point on the circle | — |
| `circleLen` | circle | 3 | centre, then a segment whose length is the radius | — |
| `join` | segment | 2 | endpoints | — |
| `ray` | ray | 2 | origin, a point it passes through | — |
| `line` | line | 2 | two points on it | — |
| `angle` | angleMark | 3 | A, vertex V, B | — |
| `mid` | point | 2 | endpoints | — |
| `foot` | point | 3 | P, then two points of the line | — |
| `extend` | point | 2 | P, Q; needs `len` | — |
| `onCircle` | point | 2 | circle centre, radius; needs `deg` | — |
| `xLL` | point | 4 | two points of each line | yes |
| `xLC` | point | 4 | two points of the line, circle centre, radius | yes |
| `xCC` | point | 4 | centre and radius of each circle | yes |
| `polygon` | polygon | ≥ 3 | vertices in order (points only, not flattened) | — |
| `transfer` | point | 5 | A, B, C, D, E | — |

`circleLen` carries a distance: Post. 3 only allows a circle through a given point, and I.2 is what licenses placing a given length elsewhere. As a construction step use it only in propositions that cite I.2 (I.3 onward). It may also express a hypothesis on the givens (I.4: DE = AB), which constructs nothing. Keep it a helper (in no `show` list).

`transfer` is the image of C under the motion, without reflection, that takes A to D and the ray AB along the ray DE. With DE = AB it is the third vertex F of a triangle DEF placed as ABC is: DF = AC and ∠EDF = ∠BAC, the same way round. It sets up I.4's hypothesis; it is not a construction Euclid performs.

`extend` is the point `len` units beyond Q on the line P → Q: the far end of a line produced (Post. 2) where Euclid fixes no length, usually a naming point (I.2's E, F); `null` when P = Q. `onCircle` is the point on the circle in screen direction `deg` (0 right, 90 up), for naming points Heath places on a circle without constructing them (I.2's H, K); `null` when the radius is 0.

So `of: ["A", "B", "circA"]` gives `xLC` its four inputs (A, B, centre, radius), and `of: ["circA", "circB"]` gives `xCC` its four.

Values, as returned by the scene: point `{x, y}`; segment, ray, line `{A, B}` (B fixes direction); circle `{O, r}`; angleMark `{A, V, B}`; polygon `{P: [points]}`. A value is `null` when the object does not exist in the current configuration (an empty intersection, or any `null` input); everything built on it is then `null` too, and the scene reports itself degenerate. Malformed data (unknown constructor, wrong kind or arity, forward reference, missing or invalid `pick`) is rejected when the scene is created, naming the object; recompute itself never throws.

`radius` (optional, angleMark only): the arc's radius in SVG units, default 24; a smaller arc keeps adjacent angles at one vertex apart (I.5's angles under the base).

`label` (optional): on a point, the letter drawn instead of its id, with `""` drawing none (the unlettered ends of I.3's line C); on a segment, a letter drawn beside its midpoint, for a line Heath names by one letter.

A free point may carry `on: <circle or segment id>`, declared earlier, and stays on it. On a circle the scene keeps its direction from the centre (taken from `at` when the scene is built, changed only by dragging the point), so it moves with the centre, and imposes the radius; a drag sets only the direction (I.4's E, I.5's C). On a segment it keeps its fraction of the way along, clamped to the ends; a drag sets the fraction (I.5's F, "taken at random on BD").

`when: {gt: [a, b]}` or `when: {eq: [a, b, …]}` (optional, any object): the object is drawn, and measured in the readout, only while the condition holds. I.6 draws D, DC and its two triangles only while AB is the greater, the case the proof supposes.

`snapOn: <circle id>` (free points only, optional): when the point is dragged within 8 units of that circle it lands exactly on it; it stays free. I.6 opens in the supposed case and lets C snap onto the circle about A through B, where its hypothesis (equal base angles) holds.

`role` (optional) sets the figure colour: `"given"` (`--ink`), `"construction"` (`--teal`, dashed for curves and lines), `"result"` (`--amber`), `"aid"` (`--ink-3`, finely dotted: Stoicheia's own aid, not Euclid's, always explained in a step note, as I.7's circles where D would have to lie) or, for a polygon, `"ghost"` (amber dashed outline with a faint fill, drawn over the lines: a figure applied to another, as in I.4's superposition). Default: free points and joins of two free points are given; circles, rays and lines are construction; everything else is result. Objects listed in no step's `show` are construction helpers and are never drawn.

`mark: "label"` (points only, optional) draws the letter alone: no dot, no drag handle. It is for *naming points*, letters Heath uses to name a figure (the D in "the circle BCD") that Euclid does not construct. Place them where Heath's figure does; in I.1, D and E are the far intersections of line AB with circles A and B. A naming point whose intersection is empty is hidden, like any other derived object.

## Proposition data (`data/props/NN.js`)

```js
export default {
  n: 1,
  kind: "problem",            // "problem" (Q.E.F.) | "theorem" (Q.E.D.)
  title: "On a given finite straight line to construct an equilateral triangle.",
  short: "Equilateral triangle",
  given: "Let AB be the given finite straight line.",
  brief: { given: "finite straight line AB", required: "equilateral triangle on AB" },  // header summary; not Heath's text; shown as REQUIRED (problems) or TO PROVE (theorems)
  objects: [ /* scene object schema, dependency order */ ],
  steps: [
    { title: "The given line", short: "Given", text: "…", given: true, note: "…", show: ["A","B","AB"] },
    { title: "Circle with centre A", short: "Circle A", text: "… described; [Post. 3]", show: ["circA", "D"] },
    …
    { title: "Q.E.F.", text: "… [Def. 15] … [C.N. 1] …", show: [] }
  ],
  measure: [ "AB", "AC", "BC" ],                 // lengths shown in readout
  unit: "AB",                                    // optional; display unit, defaults to measure[0]
  requires: [ { gt: ["AB", "C"], text: "AB must be greater than C" } ],  // optional hypotheses (I.3)
  claims: [
    { label: "EQUILATERAL", eq: ["AB","AC","BC"], from: 3 }   // active from step index 3
  ],
  arc: "constructions"
};
```

Each step's `text` is Heath's wording for that stage of the construction or proof, transcribed, with citations inserted inline in brackets (`[Post. 3]`) and nothing else changed (D-004). Read in order, the step texts are the complete proof; there is no separate proof field or panel (D-010). A step may carry `hide: [ids]`: objects shown earlier are hidden from that step on. Used for highlights that belong to one step only (I.5 shades each pair of triangles I.4 is applied to, then clears it).

`text` may contain `\n` to separate paragraphs, following Heath's own breaks. The card's footer is derived from the citations inline in `text` (first appearance, no repeats); a step marked `given: true` states the hypothesis, relies on nothing, and shows "Given" instead. There is no `cite` field (IMP-006). `short` is the step's name in the transport bar (GIVEN · CIRCLE A · …). `brief` is a one-line header summary (GIVEN / REQUIRED) and, like `note`, is the site's wording, not Heath's. Commentary that is not Heath's (e.g. "A and B may be dragged") does not go in `text`; if wanted it goes in an optional `note` field, rendered visibly apart from the proof text.

`notes: [{when, text}]` (optional) are Stoicheia's own explanatory lines, shown muted under the claims (or under NOT AS GIVEN) while their condition holds; I.6 notes when AC is the greater.

`requires` lists hypotheses the givens must satisfy, each with the text to show: `gt: [a, b]` (a greater than b, as I.3's AB the greater), `eq: [a, b, …]` (all equal, as I.6's equal base angles), over quantities of one kind, or `sameSide: [A, B, P, Q]` (P and Q strictly on the same side of line AB, as I.7's D with C). While one fails the readout shows `NOT AS GIVEN · <text>` instead of evaluating claims, since the proposition does not apply, and the figure's frame is outlined dashed amber as for DEGENERATE; DEGENERATE takes precedence.

Measured quantities follow the kind of the object named: a segment gives its length, an `angleMark` its angle (radians internally, degrees to one decimal in the readout, cell name `∠ABC`), a polygon its area (cell name `△ABC`). Lengths and areas display in units of the reference segment (`unit`, default the first measured segment) and its square.

Claim forms: `eq: [ids]` — all equal; the ids name objects of one kind (segments, angleMarks or polygons), so the same form states equal lengths, equal angles (I.4's ∠ABC = ∠DEF) and equal areas ("the triangle will be equal to the triangle"); residual is the worst pair. `coincide: [P, Q]` — the two points are one (I.7: D falls on C); residual is their distance relative to the reference length. Planned: `gt: [a, b]`, `parallel: [seg, seg]`, `on: [point, line]`, `perp: [seg, seg]`, `sum: {parts:[…], whole:…}`. The readout shows one line per claim.

Citations are written only inline in step text, comma-separated when several apply. Square brackets hold a citation only when their content looks like one (begins `Def`, `Post`, `C.N` or `I.` with a number); Heath's own editorial brackets round passages he judges interpolated (I.4) stay plain text, and a mistyped citation still looks like one, so the grammar check still catches it. Heath's own are in square brackets, `[Def. 15, C.N. 1]`; citations Stoicheia adds where Heath leaves an inference implicit are in braces, `{Def. 15}`, and render muted with a tooltip, in the text and the footer, plus a note under the footer (D-011). A citation given by Heath anywhere in a step's text counts as his in that step's footer. Each must be exactly `Def. N`, `Post. N`, `C.N. N` or `I.N`; the linter rejects anything else. A proposition's dependencies (`uses`) are not declared: `usesOf(data)` in `js/cite.js` derives them as every citation in its steps, in canonical order (Def., Post., C.N., then propositions, each by number). The dependency graph (F-012) and the linter use the same function, so the text, the footers and the graph cannot disagree.

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

`arcs.js` exports `arcs` (the table above as `{id, label, from, to}`), `props` (48 entries `{n, kind, short}`, where `kind` is `problem` or `theorem` and `short` is the site's card label, not Heath's text) and `built` (the proposition numbers whose data files are complete and checked against the scan). A proposition is added to `built` only when its data file is done; the index never links to an unbuilt page.

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
- `defs.html#def-15`, `#post-3`, `#cn-1` — foundations anchors, one per Definition (1–23), Postulate (1–5) and Common Notion (1–5). The anchored entry is highlighted. Each entry lists the built propositions that cite it ("Cited in I.1"), derived with `usesOf`.

`data/foundations.js` exports `definitions`, `postulates` and `commonNotions` (each `{n, text}`, in order), `postulatesIntro`, and `source`. Text is Heath's, transcribed from the scan (AV-004); terms Heath sets in bold are marked `**…**` and rendered bold. A common notion may carry `heiberg`, the bracketed number Heath prints beside it.
- `graph.html` — dependency graph.

Header nav (per the mock-up): Index → `index.html`, Defs → `defs.html`, Posts → `defs.html#post-1`, Graph → `graph.html` (inert until Phase 5).
