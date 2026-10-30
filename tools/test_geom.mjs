// test_geom.mjs — unit tests for docs/js/geom.js (F-001).
// Run: node tools/test_geom.mjs   (Node ≥ 22.7; built-in node:test only)
//
// Expected values are hand-computed; numeric comparisons use 1e-9.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dist, mid, dir, perp, foot, angle, xLL, xLC, xCC, signedArea,
} from "../docs/js/geom.js";

const TOL = 1e-9;
const S3 = Math.sqrt(3);

function near(actual, expected, msg = "") {
  assert.ok(
    Math.abs(actual - expected) <= TOL,
    `${msg} expected ${expected}, got ${actual}`,
  );
}

function nearPt(P, Q, msg = "") {
  near(P.x, Q.x, `${msg} x:`);
  near(P.y, Q.y, `${msg} y:`);
}

function nearPts(list, expected, msg = "") {
  assert.equal(list.length, expected.length, `${msg} length`);
  list.forEach((P, i) => nearPt(P, expected[i], `${msg}[${i}]`));
}

const p = (x, y) => ({ x, y });

test("dist", () => {
  near(dist(p(0, 0), p(3, 4)), 5);
  near(dist(p(-1, -1), p(2, 3)), 5);
  assert.equal(dist(p(7, 7), p(7, 7)), 0);
});

test("mid", () => {
  nearPt(mid(p(0, 0), p(4, 6)), p(2, 3));
  nearPt(mid(p(-2, 5), p(2, -5)), p(0, 0));
});

test("dir", () => {
  nearPt(dir(p(0, 0), p(3, 4)), p(0.6, 0.8));
  nearPt(dir(p(1, 1), p(1, -9)), p(0, -1));
  assert.deepEqual(dir(p(2, 2), p(2, 2)), p(0, 0));
});

test("perp is a unit normal on the positive-orientation side", () => {
  const P = p(0, 0), Q = p(3, 4);
  const n = perp(P, Q);
  nearPt(n, p(-0.8, 0.6));
  assert.ok(signedArea(P, Q, { x: P.x + n.x, y: P.y + n.y }) > 0);
  assert.deepEqual(perp(p(1, 1), p(1, 1)), p(0, 0));
});

test("foot", () => {
  nearPt(foot(p(3, 4), p(0, 0), p(10, 0)), p(3, 0));
  nearPt(foot(p(0, 2), p(0, 0), p(5, 5)), p(1, 1));
  // Foot may lie outside the segment: AB is treated as a line.
  nearPt(foot(p(-4, 3), p(0, 0), p(1, 0)), p(-4, 0));
  // A = B: returns P.
  nearPt(foot(p(3, 4), p(1, 1), p(1, 1)), p(3, 4));
});

test("angle", () => {
  near(angle(p(1, 0), p(0, 0), p(0, 1)), Math.PI / 2);
  near(angle(p(1, 0), p(0, 0), p(-1, 0)), Math.PI);
  near(angle(p(1, 0), p(0, 0), p(5, 0)), 0);
  near(angle(p(1, 0), p(0, 0), p(0.5, S3 / 2)), Math.PI / 3);
  // Symmetric and in [0, π] regardless of orientation.
  near(angle(p(0, 1), p(0, 0), p(1, 0)), Math.PI / 2);
  near(angle(p(1, 0), p(0, 0), p(-1, -1)), (3 * Math.PI) / 4);
  assert.ok(Number.isNaN(angle(p(0, 0), p(0, 0), p(1, 0))));
  assert.ok(Number.isNaN(angle(p(1, 0), p(0, 0), p(0, 0))));
});

test("xLL", () => {
  nearPts(xLL(p(0, 0), p(2, 0), p(1, -1), p(1, 1)), [p(1, 0)]);
  // Lines, not segments: intersection beyond both segments.
  nearPts(xLL(p(0, 0), p(1, 1), p(10, 0), p(9, 1)), [p(5, 5)]);
  assert.deepEqual(xLL(p(0, 0), p(1, 0), p(0, 1), p(1, 1)), []); // parallel
  assert.deepEqual(xLL(p(0, 0), p(1, 0), p(2, 0), p(3, 0)), []); // coincident
  assert.deepEqual(xLL(p(0, 0), p(0, 0), p(1, -1), p(1, 1)), []); // AB degenerate
  assert.deepEqual(xLL(p(0, 0), p(1, 0), p(1, 1), p(1, 1)), []); // CD degenerate
});

test("xLC: two points ordered A-side first", () => {
  const O = p(0, 0);
  nearPts(xLC(p(-10, 0), p(10, 0), O, 5), [p(-5, 0), p(5, 0)]);
  nearPts(xLC(p(10, 0), p(-10, 0), O, 5), [p(5, 0), p(-5, 0)]);
  // Chord off-centre: line y = 3, r = 5 → x = ±4.
  nearPts(xLC(p(-1, 3), p(1, 3), O, 5), [p(-4, 3), p(4, 3)]);
});

test("xLC: tangent, miss, degenerate", () => {
  const O = p(0, 0);
  nearPts(xLC(p(-1, 5), p(1, 5), O, 5), [p(0, 5)]);
  assert.deepEqual(xLC(p(-1, 6), p(1, 6), O, 5), []);
  assert.deepEqual(xLC(p(1, 1), p(1, 1), O, 5), []); // A = B
  assert.deepEqual(xLC(p(-1, 0), p(1, 0), O, -1), []); // r < 0
  nearPts(xLC(p(-1, 0), p(1, 0), O, 0), [p(0, 0)]); // r = 0 on the line
  assert.deepEqual(xLC(p(-1, 1), p(1, 1), O, 0), []); // r = 0 off the line
});

test("xLC: I.1 naming points D and E", () => {
  const A = p(220, 290), B = p(380, 290), r = 160;
  // D: line AB meets circle A on the far side from B.
  nearPts(xLC(A, B, A, r), [p(60, 290), p(380, 290)]);
  // E: line AB meets circle B; far from A is the second (B-side) point.
  nearPts(xLC(A, B, B, r), [p(220, 290), p(540, 290)]);
});

test("xCC: two points, positive orientation first", () => {
  const O1 = p(0, 0), O2 = p(2, 0);
  const pts = xCC(O1, 2, O2, 2);
  nearPts(pts, [p(1, S3), p(1, -S3)]);
  assert.ok(signedArea(O1, O2, pts[0]) > 0);
  assert.ok(signedArea(O1, O2, pts[1]) < 0);
  // Reversing the centres reverses the order.
  nearPts(xCC(O2, 2, O1, 2), [p(1, -S3), p(1, S3)]);
});

test("xCC: unequal radii (3-4-5)", () => {
  // Circles centre (0,0) r 3 and centre (5,0) r 4 meet at (9/5, ±12/5).
  nearPts(xCC(p(0, 0), 3, p(5, 0), 4), [p(1.8, 2.4), p(1.8, -2.4)]);
});

test("xCC: I.1 at the mock-up position", () => {
  // A(220,290), B(380,290), both radii 160: C at (300, 290 ∓ 80√3).
  const A = p(220, 290), B = p(380, 290);
  const [ccw, cw] = xCC(A, 160, B, 160);
  nearPt(ccw, p(300, 290 + 80 * S3), "ccw");
  nearPt(cw, p(300, 290 - 80 * S3), "cw");
  // Screen y is downward: the positive-orientation ("ccw") point is BELOW
  // AB on screen; the mock-up's C (y ≈ 151.4) is the "cw" point.
  assert.ok(ccw.y > 290);
  assert.ok(cw.y < 290);
  near(dist(A, cw), 160);
  near(dist(B, cw), 160);
});

test("xCC: tangent, separate, contained, concentric", () => {
  nearPts(xCC(p(0, 0), 1, p(2, 0), 1), [p(1, 0)]); // external tangency
  nearPts(xCC(p(0, 0), 3, p(1, 0), 2), [p(3, 0)]); // internal tangency
  assert.deepEqual(xCC(p(0, 0), 1, p(5, 0), 1), []); // separate
  assert.deepEqual(xCC(p(0, 0), 5, p(1, 0), 1), []); // one inside the other
  assert.deepEqual(xCC(p(0, 0), 1, p(0, 0), 1), []); // concentric, equal
  assert.deepEqual(xCC(p(0, 0), 1, p(0, 0), 2), []); // concentric, unequal
  assert.deepEqual(xCC(p(0, 0), -1, p(1, 0), 1), []); // negative radius
});

test("xCC: I.1 with A dragged onto B is empty (AV-001)", () => {
  const A = p(300, 290);
  assert.deepEqual(xCC(A, 0, A, 0), []);
});

test("xCC: near-tangent results stay on both circles", () => {
  const O1 = p(0, 0), O2 = p(2 - 1e-7, 0);
  const pts = xCC(O1, 1, O2, 1);
  assert.ok(pts.length >= 1);
  for (const P of pts) {
    assert.ok(Math.abs(dist(O1, P) - 1) < 1e-6);
    assert.ok(Math.abs(dist(O2, P) - 1) < 1e-6);
  }
});

test("signedArea", () => {
  near(signedArea(p(0, 0), p(1, 0), p(0, 1)), 0.5);
  near(signedArea(p(0, 0), p(0, 1), p(1, 0)), -0.5);
  near(signedArea(p(0, 0), p(4, 0), p(4, 3)), 6);
  assert.equal(signedArea(p(0, 0), p(1, 1), p(3, 3)), 0);
});

test("never throws on input outside the contract", () => {
  const bad = [undefined, null, {}, p(NaN, 0), p(0, Infinity), p("1", 2)];
  const good = p(1, 2);
  for (const b of bad) {
    assert.ok(Number.isNaN(dist(b, good)));
    assert.ok(Number.isNaN(mid(good, b).x));
    assert.ok(Number.isNaN(dir(b, good).x));
    assert.ok(Number.isNaN(perp(b, good).x));
    assert.ok(Number.isNaN(foot(b, good, p(3, 4)).x));
    assert.ok(Number.isNaN(angle(b, good, p(3, 4))));
    assert.deepEqual(xLL(b, good, p(0, 0), p(1, 1)), []);
    assert.deepEqual(xLC(good, b, p(0, 0), 5), []);
    assert.deepEqual(xCC(b, 1, good, 1), []);
    assert.ok(Number.isNaN(signedArea(good, b, p(3, 4))));
  }
  for (const r of [NaN, Infinity, undefined, "5"]) {
    assert.deepEqual(xLC(p(0, 0), p(1, 0), p(0, 0), r), []);
    assert.deepEqual(xCC(p(0, 0), r, p(1, 0), 1), []);
  }
});

test("intersection results never contain NaN", () => {
  // Sweep a grid including coincident and collinear configurations.
  const vals = [-1, 0, 0.5, 1, 2];
  for (const ax of vals) for (const bx of vals) for (const by of vals) {
    const A = p(ax, 0), B = p(bx, by);
    const r = dist(A, B);
    for (const P of [
      ...xCC(A, r, B, r),
      ...xLC(A, B, A, r),
      ...xLL(A, B, p(0, 1), p(1, 0)),
    ]) {
      assert.ok(Number.isFinite(P.x) && Number.isFinite(P.y));
    }
  }
});
