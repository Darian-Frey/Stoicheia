// test_scene.mjs — unit tests for docs/js/scene.js (F-002, AV-001, AV-003).
// Run: node tools/test_scene.mjs   (Node ≥ 22.7; built-in node:test only)

import { test } from "node:test";
import assert from "node:assert/strict";
import { createScene } from "../docs/js/scene.js";
import { dist, signedArea } from "../docs/js/geom.js";

const TOL = 1e-9;
const S3 = Math.sqrt(3);
const p = (x, y) => ({ x, y });

function nearPt(P, Q, msg = "") {
  assert.ok(P, `${msg} expected a point, got null`);
  assert.ok(Math.abs(P.x - Q.x) <= TOL && Math.abs(P.y - Q.y) <= TOL,
    `${msg} expected (${Q.x}, ${Q.y}), got (${P.x}, ${P.y})`);
}

// Proposition I.1 as it will appear in data/props/01.js.
const I1 = () => [
  { id: "A", kind: "point", free: true, at: { x: 220, y: 290 } },
  { id: "B", kind: "point", free: true, at: { x: 380, y: 290 } },
  { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
  { id: "circA", kind: "circle", by: "circle", of: ["A", "B"] },
  { id: "D", kind: "point", by: "xLC", of: ["A", "B", "circA"], pick: "far:B", mark: "label" },
  { id: "circB", kind: "circle", by: "circle", of: ["B", "A"] },
  { id: "E", kind: "point", by: "xLC", of: ["A", "B", "circB"], pick: "far:A", mark: "label" },
  { id: "C", kind: "point", by: "xCC", of: ["circA", "circB"], pick: "cw" },
  { id: "CA", kind: "segment", by: "join", of: ["C", "A"] },
  { id: "CB", kind: "segment", by: "join", of: ["C", "B"] },
];

test("I.1 at the mock-up position", () => {
  const s = createScene(I1());
  nearPt(s.value("C"), p(300, 290 - 80 * S3), "C");
  nearPt(s.value("D"), p(60, 290), "D");
  nearPt(s.value("E"), p(540, 290), "E");
  assert.equal(s.value("circA").r, 160);
  assert.equal(s.isDegenerate(), false);
  const C = s.value("C");
  assert.ok(Math.abs(dist(C, s.value("A")) - 160) <= TOL);
  assert.ok(Math.abs(dist(C, s.value("B")) - 160) <= TOL);
});

test("dependants follow a drag", () => {
  const s = createScene(I1());
  assert.equal(s.move("B", p(420, 290)), true);
  nearPt(s.value("C"), p(320, 290 - 100 * S3), "C");
  nearPt(s.value("D"), p(20, 290), "D");
  nearPt(s.value("E"), p(620, 290), "E");
  nearPt(s.value("CB").B, p(420, 290), "CB.B");
});

test("AV-003: dragging A around B keeps C on the cw side, continuously", () => {
  const s = createScene(I1());
  const B = s.value("B");
  let prev = s.value("C");
  for (let i = 1; i <= 720; i++) {
    const t = Math.PI + (i * 2 * Math.PI) / 720; // start at A's position, full turn
    s.move("A", p(B.x + 160 * Math.cos(t), B.y + 160 * Math.sin(t)));
    const C = s.value("C");
    assert.ok(signedArea(s.value("A"), B, C) < 0, `step ${i}: C left the cw side`);
    // A moves ~1.4 units per step; C rotates with it about B.
    assert.ok(dist(prev, C) < 3, `step ${i}: C jumped ${dist(prev, C)}`);
    prev = C;
  }
});

test("AV-003: dragging A through B moves C across the screen, still cw", () => {
  const s = createScene(I1());
  for (let x = 220; x <= 540; x += 7) {
    if (x === 380) continue;
    s.move("A", p(x, 290));
    const A = s.value("A"), B = s.value("B"), C = s.value("C");
    assert.ok(C, `x=${x}: C missing`);
    assert.ok(signedArea(A, B, C) < 0, `x=${x}: C left the cw side`);
    if (x < 380) assert.ok(C.y < 290, `x=${x}: C should be above AB`);
    else assert.ok(C.y > 290, `x=${x}: C should be below AB`);
  }
});

test("AV-001: A dragged onto B is degenerate, not an error, and recovers", () => {
  const s = createScene(I1());
  assert.equal(s.move("A", p(380, 290)), true);
  assert.equal(s.isDegenerate(), true);
  for (const id of ["C", "D", "E", "CA", "CB"]) assert.equal(s.value(id), null, id);
  assert.equal(s.value("circA").r, 0);
  s.move("A", p(220, 290));
  assert.equal(s.isDegenerate(), false);
  nearPt(s.value("C"), p(300, 290 - 80 * S3), "C after recovery");
});

test("AV-001: grid sweep never yields NaN", () => {
  const s = createScene(I1());
  const xs = [0, 100, 299.5, 300, 300.0001, 380, 600];
  for (const ax of xs) for (const ay of [0, 290, 290.0001, 470]) {
    s.move("A", p(ax, ay));
    for (const id of s.ids) {
      const v = s.value(id);
      if (v === null) continue;
      for (const n of JSON.stringify(v).match(/-?[\d.e+-]+|null/g) ?? []) {
        assert.notEqual(n, "null", `${id} contains a non-finite number at A=(${ax},${ay})`);
      }
    }
  }
});

test("move rejects non-free ids and bad positions", () => {
  const s = createScene(I1());
  const C = s.value("C");
  assert.equal(s.move("C", p(0, 0)), false);
  assert.equal(s.move("nope", p(0, 0)), false);
  assert.equal(s.move("A", p(NaN, 0)), false);
  assert.equal(s.move("A", undefined), false);
  assert.deepEqual(s.value("C"), C);
});

test("reset restores declared positions", () => {
  const s = createScene(I1());
  s.move("A", p(10, 10));
  s.reset();
  nearPt(s.value("A"), p(220, 290));
  nearPt(s.value("C"), p(300, 290 - 80 * S3));
});

test("pick near:/far: and screen rules", () => {
  const base = [
    { id: "O1", kind: "point", free: true, at: { x: 0, y: 0 } },
    { id: "T1", kind: "point", free: true, at: { x: 2, y: 0 } },
    { id: "O2", kind: "point", free: true, at: { x: 2, y: 0 } },
    { id: "T2", kind: "point", free: true, at: { x: 0, y: 0 } },
    { id: "X", kind: "point", free: true, at: { x: 1, y: 5 } },
    { id: "c1", kind: "circle", by: "circle", of: ["O1", "T1"] },
    { id: "c2", kind: "circle", by: "circle", of: ["O2", "T2"] },
  ];
  const pt = (pick) => createScene([...base,
    { id: "P", kind: "point", by: "xCC", of: ["c1", "c2"], pick }]).value("P");
  nearPt(pt("near:X"), p(1, S3));
  nearPt(pt("far:X"), p(1, -S3));
  nearPt(pt("above"), p(1, -S3)); // screen y is downward
  nearPt(pt("below"), p(1, S3));
  nearPt(pt("ccw"), p(1, S3));
  nearPt(pt("cw"), p(1, -S3));
});

test("tied rule scores keep the previous choice", () => {
  const s = createScene([
    { id: "O1", kind: "point", free: true, at: { x: 0, y: 0 } },
    { id: "O2", kind: "point", free: true, at: { x: 2, y: 0 } },
    { id: "X", kind: "point", free: true, at: { x: 1, y: 0.5 } },
    { id: "c1", kind: "circle", by: "circle", of: ["O1", "O2"] },
    { id: "c2", kind: "circle", by: "circle", of: ["O2", "O1"] },
    { id: "P", kind: "point", by: "xCC", of: ["c1", "c2"], pick: "near:X" },
  ]);
  assert.ok(s.value("P").y > 0);
  s.move("X", p(1, 0)); // equidistant from both candidates
  assert.ok(s.value("P").y > 0, "tie should keep the previous candidate");
  s.move("X", p(1, -0.5));
  assert.ok(s.value("P").y < 0, "a clear rule result should win again");
  s.move("X", p(1, 0));
  assert.ok(s.value("P").y < 0, "tie should keep the new previous candidate");
});

test("near-tangent candidates keep the previous choice", () => {
  const s = createScene([
    { id: "O1", kind: "point", free: true, at: { x: 0, y: 0 } },
    { id: "T1", kind: "point", free: true, at: { x: 1, y: 0 } },
    { id: "O2", kind: "point", free: true, at: { x: 1.9, y: 0 } },
    { id: "T2", kind: "point", free: true, at: { x: 0.9, y: 0 } },
    { id: "X", kind: "point", free: true, at: { x: 0.95, y: 1 } },
    { id: "c1", kind: "circle", by: "circle", of: ["O1", "T1"] },
    { id: "c2", kind: "circle", by: "circle", of: ["O2", "T2"] },
    { id: "P", kind: "point", by: "xCC", of: ["c1", "c2"], pick: "near:X" },
  ]);
  assert.ok(s.value("P").y > 0);
  // Near tangency (candidates ~1e-4 apart), with X moved to favour the
  // other candidate: within δ the previous choice wins.
  s.move("O2", p(2 - 1e-8, 0));
  s.move("T2", p(1 - 1e-8, 0));
  s.move("X", p(1, -1));
  assert.ok(s.value("P").y > 0, "within δ of tangency, keep the previous side");
});

test("polygon joins points in order and follows them", () => {
  const s = createScene([...I1(), { id: "ABC", kind: "polygon", by: "polygon", of: ["A", "B", "C"] }]);
  const { P } = s.value("ABC");
  assert.equal(P.length, 3);
  nearPt(P[2], p(300, 290 - 80 * S3), "C vertex");
  s.move("A", p(380, 290));
  assert.equal(s.value("ABC"), null, "a polygon on a missing vertex is null");
});

test("extend: a fixed length beyond Q on P → Q, null when P = Q", () => {
  const s = createScene([
    { id: "P", kind: "point", free: true, at: { x: 0, y: 0 } },
    { id: "Q", kind: "point", free: true, at: { x: 3, y: 4 } },
    { id: "E", kind: "point", by: "extend", of: ["P", "Q"], len: 10 },
  ]);
  nearPt(s.value("E"), p(9, 12), "E");
  s.move("Q", p(0, 0));
  assert.equal(s.value("E"), null);
});

test("onCircle: screen direction in degrees, 90 is up", () => {
  const s = createScene([
    { id: "O", kind: "point", free: true, at: { x: 100, y: 100 } },
    { id: "T", kind: "point", free: true, at: { x: 150, y: 100 } },
    { id: "c", kind: "circle", by: "circle", of: ["O", "T"] },
    { id: "R", kind: "point", by: "onCircle", of: ["c"], deg: 0 },
    { id: "U", kind: "point", by: "onCircle", of: ["c"], deg: 90 },
    { id: "L", kind: "point", by: "onCircle", of: ["c"], deg: 180 },
  ]);
  nearPt(s.value("R"), p(150, 100), "R");
  nearPt(s.value("U"), p(100, 50), "U");
  nearPt(s.value("L"), p(50, 100), "L");
  s.move("T", p(100, 100));
  assert.equal(s.value("U"), null, "a circle of radius 0 has no such point");
});

test("I.2: AL equals BC as the givens move", () => {
  const len = (v) => dist(v.A, v.B);
  return import("../docs/data/props/02.js").then(({ default: d }) => {
    const s = createScene(d.objects);
    for (const [id, P] of [["A", p(120, 300)], ["C", p(420, 100)], ["B", p(330, 330)], ["A", p(500, 400)]]) {
      s.move(id, P);
      assert.ok(Math.abs(len(s.value("AL")) - len(s.value("BC"))) < 1e-9, `after moving ${id}`);
    }
    s.move("A", s.value("B"));
    assert.equal(s.isDegenerate(), true, "A on B: no triangle DAB");
  });
});

test("createScene rejects malformed data", () => {
  const A = { id: "A", kind: "point", free: true, at: { x: 0, y: 0 } };
  const B = { id: "B", kind: "point", free: true, at: { x: 1, y: 0 } };
  const bad = [
    [[A, { id: "AB", kind: "segment", by: "join", of: ["A", "B"] }, B], /not declared earlier/],
    [[A, B, { id: "AB", kind: "segment", by: "glue", of: ["A", "B"] }], /unknown constructor/],
    [[A, B, { id: "AB", kind: "circle", by: "join", of: ["A", "B"] }], /makes a segment/],
    [[A, B, { id: "AB", kind: "segment", by: "join", of: ["A"] }], /needs 2 inputs/],
    [[A, A], /duplicate id/],
    [[A, B, { id: "c", kind: "circle", by: "circle", of: ["A", "B"] },
      { id: "P", kind: "point", by: "xLC", of: ["A", "B", "c"] }], /needs a "pick"/],
    [[A, B, { id: "c", kind: "circle", by: "circle", of: ["A", "B"] },
      { id: "P", kind: "point", by: "xLC", of: ["A", "B", "c"], pick: "ccw" }], /only defined for xCC/],
    [[A, B, { id: "c", kind: "circle", by: "circle", of: ["A", "B"] },
      { id: "P", kind: "point", by: "xLC", of: ["A", "B", "c"], pick: "near:Z" }], /undeclared/],
    [[A, B, { id: "M", kind: "point", by: "mid", of: ["A", "B"], pick: "cw" }], /only applies to intersections/],
    [[{ id: "A", kind: "point", free: true }], /finite "at"/],
    [[A, B, { id: "P", kind: "polygon", by: "polygon", of: ["A", "B"] }], /at least 3/],
    [[A, B, { id: "E", kind: "point", by: "extend", of: ["A", "B"] }], /finite "len"/],
    [[A, B, { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
      { id: "P", kind: "polygon", by: "polygon", of: ["A", "B", "AB"] }], /points only/],
  ];
  for (const [defs, re] of bad) assert.throws(() => createScene(defs), re);
});
