// geom.js — Stoicheia geometry kernel (SPEC.md §Kernel, F-001).
//
// Pure functions over points {x, y} and numbers. No DOM, no state, no
// shape objects: lines are point pairs, circles are centre and radius
// (IMP-004). Every function is total and never throws; degenerate input
// gives the degenerate result listed in SPEC, and input outside the
// contract (missing or non-finite coordinates) gives NaN, a NaN point,
// or [] rather than an exception.
//
// Orientation: (Q−P) × (R−P) > 0 is counter-clockwise in screen space
// (y down), i.e. clockwise on paper.

// Relative tolerance for tangency and parallelism. Applied to squared
// quantities, so a circle is treated as tangent to a line when the chord
// half-length is below about 1e-6 of the radius. Distinct from the claim
// tolerance τ (SPEC §Tolerance) and the branch-memory δ (§Branch selection).
const EPS = 1e-12;

const NAN_POINT = Object.freeze({ x: NaN, y: NaN });

function isPt(P) {
  return P != null && Number.isFinite(P.x) && Number.isFinite(P.y);
}

function isNum(r) {
  return Number.isFinite(r);
}

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

/** Distance |PQ|. 0 when P = Q. */
export function dist(P, Q) {
  if (!isPt(P) || !isPt(Q)) return NaN;
  return Math.hypot(Q.x - P.x, Q.y - P.y);
}

/** Midpoint of PQ. */
export function mid(P, Q) {
  if (!isPt(P) || !isPt(Q)) return NAN_POINT;
  return { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
}

/** Unit vector from P towards Q. {x:0, y:0} when P = Q. */
export function dir(P, Q) {
  if (!isPt(P) || !isPt(Q)) return NAN_POINT;
  const dx = Q.x - P.x, dy = Q.y - P.y;
  const d = Math.hypot(dx, dy);
  if (d === 0) return { x: 0, y: 0 };
  return { x: dx / d, y: dy / d };
}

/**
 * Unit normal to PQ, pointing to the positive-orientation side:
 * signedArea(P, Q, P + perp(P, Q)) > 0. Zero vector when P = Q.
 */
export function perp(P, Q) {
  const u = dir(P, Q);
  // 0 - y rather than -y, so P = Q gives +0, not -0; NaN still propagates.
  return { x: 0 - u.y, y: u.x };
}

/** Foot of the perpendicular from P to the line AB. P when A = B. */
export function foot(P, A, B) {
  if (!isPt(P) || !isPt(A) || !isPt(B)) return NAN_POINT;
  const dx = B.x - A.x, dy = B.y - A.y;
  const dd = dx * dx + dy * dy;
  if (dd === 0) return { x: P.x, y: P.y };
  const t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / dd;
  return { x: A.x + t * dx, y: A.y + t * dy };
}

/** Angle ∠AVB in [0, π]. NaN when A = V or B = V. */
export function angle(A, V, B) {
  if (!isPt(A) || !isPt(V) || !isPt(B)) return NaN;
  const ax = A.x - V.x, ay = A.y - V.y;
  const bx = B.x - V.x, by = B.y - V.y;
  if ((ax === 0 && ay === 0) || (bx === 0 && by === 0)) return NaN;
  // atan2 of |cross| and dot is accurate near 0 and π, unlike acos.
  return Math.atan2(Math.abs(cross(ax, ay, bx, by)), ax * bx + ay * by);
}

/**
 * Intersection of the lines AB and CD (infinite lines, not segments).
 * [] when parallel (including coincident) or either pair degenerate.
 */
export function xLL(A, B, C, D) {
  if (!isPt(A) || !isPt(B) || !isPt(C) || !isPt(D)) return [];
  const ux = B.x - A.x, uy = B.y - A.y;
  const vx = D.x - C.x, vy = D.y - C.y;
  const uu = ux * ux + uy * uy, vv = vx * vx + vy * vy;
  if (uu === 0 || vv === 0) return [];
  const den = cross(ux, uy, vx, vy);
  if (den * den <= EPS * uu * vv) return [];
  const t = cross(C.x - A.x, C.y - A.y, vx, vy) / den;
  return [{ x: A.x + t * ux, y: A.y + t * uy }];
}

/**
 * Intersection of the line AB with the circle centre O, radius r.
 * Two points are ordered by parameter along AB, A-side first.
 * [] when A = B, r < 0, or the line misses the circle; [P] when tangent.
 */
export function xLC(A, B, O, r) {
  if (!isPt(A) || !isPt(B) || !isPt(O) || !isNum(r) || r < 0) return [];
  const dx = B.x - A.x, dy = B.y - A.y;
  const d = Math.hypot(dx, dy);
  if (d === 0) return [];
  const ux = dx / d, uy = dy / d;
  const F = foot(O, A, B);
  const ox = O.x - F.x, oy = O.y - F.y;
  const h2 = r * r - (ox * ox + oy * oy);
  const tol = EPS * Math.max(1, r * r);
  if (h2 < -tol) return [];
  if (h2 <= tol) return [F];
  const h = Math.sqrt(h2);
  return [
    { x: F.x - h * ux, y: F.y - h * uy },
    { x: F.x + h * ux, y: F.y + h * uy },
  ];
}

/**
 * Intersection of circles (O1, r1) and (O2, r2).
 * Two points are ordered with the positive-orientation point relative to
 * O1 → O2 first. [] when concentric (including equal centres with any
 * radii), a radius is negative, or the circles do not meet; [P] when
 * tangent.
 */
export function xCC(O1, r1, O2, r2) {
  if (!isPt(O1) || !isPt(O2) || !isNum(r1) || !isNum(r2) || r1 < 0 || r2 < 0) return [];
  const dx = O2.x - O1.x, dy = O2.y - O1.y;
  const d = Math.hypot(dx, dy);
  if (d === 0) return [];
  const ux = dx / d, uy = dy / d;
  // Distance from O1 along O1O2 to the common chord.
  const a = (d * d + r1 * r1 - r2 * r2) / (2 * d);
  const h2 = r1 * r1 - a * a;
  const tol = EPS * Math.max(1, r1 * r1, r2 * r2);
  if (h2 < -tol) return [];
  const M = { x: O1.x + a * ux, y: O1.y + a * uy };
  if (h2 <= tol) return [M];
  const h = Math.sqrt(h2);
  // (-uy, ux) is the positive-orientation normal to O1O2 (see perp).
  return [
    { x: M.x - h * uy, y: M.y + h * ux },
    { x: M.x + h * uy, y: M.y - h * ux },
  ];
}

/**
 * Signed area of triangle PQR: half of (Q−P) × (R−P). Positive when
 * P, Q, R are counter-clockwise in screen space. 0 when collinear.
 */
export function signedArea(P, Q, R) {
  if (!isPt(P) || !isPt(Q) || !isPt(R)) return NaN;
  return cross(Q.x - P.x, Q.y - P.y, R.x - P.x, R.y - P.y) / 2;
}
