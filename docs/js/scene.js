// scene.js — the object graph for one proposition (F-002).
//
// Holds the objects declared in a data file (SPEC.md §Scene object
// schema), recomputes them in declaration order, which is dependency
// order, and chooses intersection branches by the declared `pick` rule
// (SPEC.md §Branch selection, D-008).
//
// Values by kind:
//   point                     {x, y}
//   segment | ray | line      {A, B}          (two points; B fixes direction)
//   circle                    {O, r}
//   angleMark                 {A, V, B}
//   polygon                   {P: [points]}
// A value of null means the object does not exist in the current
// configuration (an empty intersection, or a null input). Recompute never
// throws; malformed data throws once, from createScene, with a message
// naming the object.

import { dist, dir, mid, foot, xLL, xLC, xCC, signedArea } from "./geom.js";

// SPEC §Branch selection: candidates closer than DELTA · max(1, r) are
// treated as tangent, and rule scores within TAU are treated as tied; in
// either case the candidate nearest the previous choice is kept.
export const DELTA = 1e-3;
export const TAU = 1e-6;

const LINEAR = new Set(["segment", "ray", "line"]);

// Constructor table: `by` → produced kind, and how to compute the value
// from the flattened inputs (points expand to [P], linear objects to
// [A, B], circles to [O, r]).
const CONSTRUCTORS = {
  circle: { kind: "circle", arity: 2, make: ([O, T]) => ({ O, r: dist(O, T) }) },
  // Centre O, radius the length of a segment PQ: carrying a distance, which
  // Post. 3 does not allow and I.2 then justifies. Cite I.2 when used.
  circleLen: { kind: "circle", arity: 3, make: ([O, P, Q]) => ({ O, r: dist(P, Q) }) },
  join:   { kind: "segment", arity: 2, make: ([A, B]) => ({ A, B }) },
  ray:    { kind: "ray", arity: 2, make: ([A, B]) => ({ A, B }) },
  line:   { kind: "line", arity: 2, make: ([A, B]) => ({ A, B }) },
  angle:  { kind: "angleMark", arity: 3, make: ([A, V, B]) => ({ A, V, B }) },
  // Image of C under the motion (no reflection) taking A to D and the ray
  // AB along the ray DE: the vertex F of a triangle DEF placed as ABC is,
  // given DE = AB (I.4's hypothesis).
  transfer: {
    kind: "point", arity: 5,
    make: ([A, B, C, D, E]) => {
      const u = dir(A, B), w = dir(D, E);
      if ((u.x === 0 && u.y === 0) || (w.x === 0 && w.y === 0)) return null;
      const cos = u.x * w.x + u.y * w.y, sin = u.x * w.y - u.y * w.x;
      const vx = C.x - A.x, vy = C.y - A.y;
      return { x: D.x + vx * cos - vy * sin, y: D.y + vx * sin + vy * cos };
    },
  },
  // Polygon: three or more points, in order; `of` may list points only.
  polygon: { kind: "polygon", arity: "points", make: (P) => ({ P }) },
  mid:    { kind: "point", arity: 2, make: ([A, B]) => mid(A, B) },
  // Point `len` units beyond Q on the line P → Q: the far end of a line
  // produced (Post. 2) where Euclid fixes no length.
  extend: {
    kind: "point", arity: 2, param: "len",
    make: ([P, Q], len) => {
      const u = dir(P, Q);
      return u.x === 0 && u.y === 0 ? null : { x: Q.x + len * u.x, y: Q.y + len * u.y };
    },
  },
  // Point on a circle at screen direction `deg` (0 = right, 90 = up),
  // for naming points that Heath places on a circle without construction.
  onCircle: {
    kind: "point", arity: 2, param: "deg",
    make: ([O, r], deg) => {
      if (!(r > 0)) return null;
      const t = (deg * Math.PI) / 180;
      return { x: O.x + r * Math.cos(t), y: O.y - r * Math.sin(t) };
    },
  },
  foot:   { kind: "point", arity: 3, make: ([P, A, B]) => foot(P, A, B) },
  xLL:    { kind: "point", arity: 4, cands: ([A, B, C, D]) => xLL(A, B, C, D) },
  xLC:    { kind: "point", arity: 4, cands: ([A, B, O, r]) => xLC(A, B, O, r) },
  xCC:    { kind: "point", arity: 4, cands: ([O1, r1, O2, r2]) => xCC(O1, r1, O2, r2) },
};

const PICK_SIMPLE = new Set(["ccw", "cw", "above", "below", "left", "right"]);

function flatten(value, kind) {
  if (kind === "point") return [value];
  if (LINEAR.has(kind)) return [value.A, value.B];
  if (kind === "circle") return [value.O, value.r];
  return [value];
}

function validate(defs) {
  const seen = new Map();
  for (const d of defs) {
    const where = `scene object "${d?.id}"`;
    if (!d || typeof d.id !== "string" || d.id === "") throw new Error(`${where}: missing id`);
    if (seen.has(d.id)) throw new Error(`${where}: duplicate id`);
    if (d.free) {
      if (d.kind !== "point") throw new Error(`${where}: only points can be free`);
      if (!Number.isFinite(d.at?.x) || !Number.isFinite(d.at?.y)) {
        throw new Error(`${where}: free point needs a finite "at"`);
      }
      if (d.snapOn !== undefined && seen.get(d.snapOn)?.kind !== "circle") {
        throw new Error(`${where}: "snapOn" must name a circle declared earlier`);
      }
      if (d.on !== undefined && !["circle", "segment"].includes(seen.get(d.on)?.kind)) {
        throw new Error(`${where}: "on" must name a circle or segment declared earlier`);
      }
      seen.set(d.id, d);
      continue;
    }
    const c = CONSTRUCTORS[d.by];
    if (!c) throw new Error(`${where}: unknown constructor "${d.by}"`);
    if (d.kind !== c.kind) throw new Error(`${where}: "${d.by}" makes a ${c.kind}, not a ${d.kind}`);
    if (!Array.isArray(d.of)) throw new Error(`${where}: "of" must be an array`);
    if (c.arity === "points") {
      for (const ref of d.of) {
        const src = seen.get(ref);
        if (!src) throw new Error(`${where}: "${ref}" is not declared earlier (ARCHITECTURE invariant 1)`);
        if (src.kind !== "point") throw new Error(`${where}: "${d.by}" takes points only; "${ref}" is a ${src.kind}`);
      }
      if (d.of.length < 3) throw new Error(`${where}: "${d.by}" needs at least 3 points`);
      if (d.pick !== undefined) throw new Error(`${where}: "pick" only applies to intersections`);
      seen.set(d.id, d);
      continue;
    }
    let arity = 0;
    for (const ref of d.of) {
      const src = seen.get(ref);
      if (!src) throw new Error(`${where}: "${ref}" is not declared earlier (ARCHITECTURE invariant 1)`);
      arity += src.kind === "point" ? 1 : (LINEAR.has(src.kind) || src.kind === "circle") ? 2 : 1;
    }
    if (arity !== c.arity) throw new Error(`${where}: "${d.by}" needs ${c.arity} inputs after expansion, got ${arity}`);
    if (c.param && !Number.isFinite(d[c.param])) {
      throw new Error(`${where}: "${d.by}" needs a finite "${c.param}"`);
    }
    if (c.cands) validatePick(d, where, seen);
    else if (d.pick !== undefined) throw new Error(`${where}: "pick" only applies to intersections`);
    if (d.mark !== undefined && (d.mark !== "label" || d.kind !== "point")) {
      throw new Error(`${where}: "mark" must be "label" and only on points`);
    }
    seen.set(d.id, d);
  }
}

function validatePick(d, where, seen) {
  const pick = d.pick;
  if (typeof pick !== "string") throw new Error(`${where}: intersection needs a "pick" rule`);
  const m = /^(near|far):(.+)$/.exec(pick);
  if (m) {
    const ref = seen.get(m[2]);
    if (!ref) throw new Error(`${where}: pick "${pick}" refers to an undeclared object`);
    if (ref.kind !== "point") throw new Error(`${where}: pick "${pick}" must refer to a point`);
    return;
  }
  if (!PICK_SIMPLE.has(pick)) throw new Error(`${where}: unknown pick rule "${pick}"`);
  // On a line–line or line–circle intersection both candidates lie on the
  // defining line, so their orientation relative to it is zero.
  if ((pick === "ccw" || pick === "cw") && d.by !== "xCC") {
    throw new Error(`${where}: pick "${pick}" is only defined for xCC; use near:/far: or a screen rule`);
  }
}

// Score each candidate under the rule; the scene keeps the higher score.
function scorer(pick, inputs, valueOf) {
  switch (pick) {
    case "ccw": return (P) => signedArea(inputs[0], inputs[2], P);
    case "cw": return (P) => -signedArea(inputs[0], inputs[2], P);
    case "above": return (P) => -P.y;
    case "below": return (P) => P.y;
    case "left": return (P) => -P.x;
    case "right": return (P) => P.x;
  }
  const [, how, ref] = /^(near|far):(.+)$/.exec(pick);
  const R = valueOf(ref);
  if (!R) return null;
  return how === "near" ? (P) => -dist(P, R) : (P) => dist(P, R);
}

/**
 * Build a scene from a data file's `objects` list.
 * Throws on malformed data; never throws afterwards.
 */
export function createScene(defs) {
  validate(defs);
  const order = defs.map((d) => d.id);
  const byId = new Map(defs.map((d) => [d.id, d]));
  const values = new Map();
  const memory = new Map(); // id → last chosen point, for ambiguous picks
  const free = new Map(defs.filter((d) => d.free).map((d) => [d.id, { x: d.at.x, y: d.at.y }]));
  // A free point with `on` stays on that circle or segment. On a circle the
  // scene keeps its direction from the centre (so it moves with the centre)
  // and imposes the radius; on a segment it keeps its fraction of the way
  // along (I.5's F, "taken at random on BD"). aim: id → direction or
  // fraction, fixed from `at` on the first recompute and kept until dragged,
  // so moving the circle or segment carries the point with it.
  const aim = new Map();

  function fraction(s, P) {
    const dx = s.B.x - s.A.x, dy = s.B.y - s.A.y;
    const dd = dx * dx + dy * dy;
    if (dd === 0) return 0;
    return Math.min(1, Math.max(0, ((P.x - s.A.x) * dx + (P.y - s.A.y) * dy) / dd));
  }

  const valueOf = (id) => values.get(id) ?? null;

  function choose(d, cands, inputs) {
    if (cands.length === 0) return null;
    if (cands.length === 1) return cands[0];
    const [P, Q] = cands;
    const prev = memory.get(d.id);
    const nearestPrev = () => (dist(P, prev) <= dist(Q, prev) ? P : Q);

    const radii = d.by === "xLC" ? [inputs[3]] : d.by === "xCC" ? [inputs[1], inputs[3]] : [];
    const scale = Math.max(1, ...radii);
    if (prev && dist(P, Q) < DELTA * scale) return nearestPrev();

    const score = scorer(d.pick, inputs, valueOf);
    if (!score) return null; // near:/far: reference does not exist
    const sP = score(P), sQ = score(Q);
    if (Math.abs(sP - sQ) <= TAU * Math.max(1, Math.abs(sP), Math.abs(sQ))) {
      return prev ? nearestPrev() : P;
    }
    return sP > sQ ? P : Q;
  }

  function compute(d) {
    if (d.free && d.on !== undefined && byId.get(d.on).kind === "segment") {
      const s = valueOf(d.on);
      if (!s) return null;
      if (!aim.has(d.id)) aim.set(d.id, fraction(s, d.at));
      const t = aim.get(d.id);
      return { x: s.A.x + t * (s.B.x - s.A.x), y: s.A.y + t * (s.B.y - s.A.y) };
    }
    if (d.free && d.on !== undefined) {
      const c = valueOf(d.on);
      if (!c || !(c.r > 0)) return null;
      if (!aim.has(d.id)) aim.set(d.id, { x: d.at.x - c.O.x, y: d.at.y - c.O.y });
      const a = aim.get(d.id);
      const len = Math.hypot(a.x, a.y);
      if (len === 0) return null;
      return { x: c.O.x + (c.r * a.x) / len, y: c.O.y + (c.r * a.y) / len };
    }
    if (d.free) return free.get(d.id);
    const parts = [];
    for (const ref of d.of) {
      const v = valueOf(ref);
      if (v === null) return null;
      parts.push(...flatten(v, byId.get(ref).kind));
    }
    const c = CONSTRUCTORS[d.by];
    if (c.make) {
      const v = c.make(parts, c.param ? d[c.param] : undefined);
      if (v === null) return null;
      if (d.kind === "point" && !(Number.isFinite(v.x) && Number.isFinite(v.y))) return null;
      return v;
    }
    const chosen = choose(d, c.cands(parts), parts);
    if (chosen) memory.set(d.id, chosen);
    return chosen;
  }

  function recompute() {
    for (const id of order) values.set(id, compute(byId.get(id)));
  }

  recompute();

  return {
    /** Object ids in declaration (dependency) order. */
    ids: order.slice(),
    /** The data-file definition of an object. */
    def: (id) => byId.get(id),
    /** Current value of an object, or null if it does not exist. */
    value: valueOf,
    /** True if the object is a draggable given. */
    isFree: (id) => free.has(id),
    /**
     * Move a free point and recompute. Returns false (and changes nothing)
     * for an unknown or non-free id or a non-finite position.
     */
    move(id, P) {
      if (!free.has(id) || !Number.isFinite(P?.x) || !Number.isFinite(P?.y)) return false;
      free.set(id, { x: P.x, y: P.y });
      const d = byId.get(id);
      if (d.on !== undefined && byId.get(d.on).kind === "segment") {
        const s = valueOf(d.on);
        if (s) aim.set(id, fraction(s, P));
      } else if (d.on !== undefined) {
        const c = valueOf(d.on);
        if (c && (P.x !== c.O.x || P.y !== c.O.y)) aim.set(id, { x: P.x - c.O.x, y: P.y - c.O.y });
      }
      recompute();
      return true;
    },
    /** Restore every free point to its declared position. */
    reset() {
      for (const d of defs) if (d.free) free.set(d.id, { x: d.at.x, y: d.at.y });
      memory.clear();
      aim.clear();
      recompute();
    },
    /** True if any object fails to exist in the current configuration. */
    isDegenerate: () => order.some((id) => values.get(id) === null),
  };
}
