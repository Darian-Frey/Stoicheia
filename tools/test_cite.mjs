// test_cite.mjs — unit tests for docs/js/cite.js (F-007, IMP-006, AV-005).
// Run: node tools/test_cite.mjs   (Node ≥ 22.7; built-in node:test only)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isCitation, citationHref, splitCitations, citationEntries, citationsIn, compareCitations, usesOf,
} from "../docs/js/cite.js";
import I1 from "../docs/data/props/01.js";

test("grammar", () => {
  for (const c of ["Def. 15", "Post. 1", "C.N. 1", "I.4", "I.47"]) assert.ok(isCitation(c), c);
  for (const c of ["Def.15", "Post 3", "C. N. 1", "CN.1", "I. 4", "Given", "", "Def. x"]) {
    assert.ok(!isCitation(c), c);
  }
});

test("hrefs", () => {
  assert.equal(citationHref("Def. 15"), "defs.html#def-15");
  assert.equal(citationHref("Post. 3"), "defs.html#post-3");
  assert.equal(citationHref("C.N. 1"), "defs.html#cn-1");
  assert.equal(citationHref("I.4"), "prop.html?p=4");
  assert.equal(citationHref("Given"), null);
});

test("splitCitations keeps text and groups in order, Heath's and added", () => {
  assert.deepEqual(splitCitations("a [Post. 1] b [Def. 15, C.N. 1]"),
    ["a ", { cites: ["Post. 1"], added: false }, " b ", { cites: ["Def. 15", "C.N. 1"], added: false }]);
  assert.deepEqual(splitCitations("no citations"), ["no citations"]);
  assert.deepEqual(splitCitations("[I.4]"), [{ cites: ["I.4"], added: false }]);
  assert.deepEqual(splitCitations("x {Def. 20} y"),
    ["x ", { cites: ["Def. 20"], added: true }, " y"]);
});

test("Heath's editorial brackets are text, not citations; mistyped citations are still caught", () => {
  const t = "hence [For if, when B coincides with E, two straight lines will enclose a space] and equal. [C.N. 4]";
  assert.deepEqual(citationsIn(t), ["C.N. 4"]);
  assert.equal(splitCitations(t)[0], "hence [For if, when B coincides with E, two straight lines will enclose a space] and equal. ");
  assert.deepEqual(citationsIn("bad [Post 3]"), ["Post 3"]);
  assert.ok(!isCitation("Post 3"));
});

test("citationEntries: added unless Heath also gives it in the same text (D-011)", () => {
  assert.deepEqual(citationEntries("a {Def. 15} b [C.N. 3] c {Def. 15}"),
    [{ cite: "Def. 15", added: true }, { cite: "C.N. 3", added: false }]);
  assert.deepEqual(citationEntries("a {Def. 15} b [Def. 15]"), [{ cite: "Def. 15", added: false }]);
});

test("citationsIn: first appearance, no repeats", () => {
  assert.deepEqual(citationsIn("x [Def. 15] y [Def. 15] z [C.N. 1]"), ["Def. 15", "C.N. 1"]);
  assert.deepEqual(citationsIn("nothing"), []);
});

test("canonical order: Def., Post., C.N., I., each by number", () => {
  const list = ["I.4", "C.N. 1", "Post. 3", "Def. 15", "Post. 1", "Def. 2", "I.10", "I.2"];
  assert.deepEqual(list.sort(compareCitations),
    ["Def. 2", "Def. 15", "Post. 1", "Post. 3", "C.N. 1", "I.2", "I.4", "I.10"]);
});

test("I.1: derived uses is Heath's citations plus the added Def. 20", () => {
  assert.deepEqual(usesOf(I1), ["Def. 15", "Def. 20", "Post. 1", "Post. 3", "C.N. 1"]);
  const added = I1.steps.flatMap((s) => citationEntries(s.text)).filter((e) => e.added).map((e) => e.cite);
  assert.deepEqual(added, ["Def. 20"]);
});

test("I.1: every citation is in the grammar and cites no later proposition", () => {
  for (const s of I1.steps) {
    for (const c of citationsIn(s.text)) {
      assert.ok(isCitation(c), `step "${s.title}": "${c}" is not in the grammar`);
      const m = /^I\.(\d+)$/.exec(c);
      if (m) assert.ok(Number(m[1]) < I1.n, `cites later proposition ${c}`);
    }
  }
});

test("I.1: only the opening step is marked given, and it cites nothing", () => {
  const givens = I1.steps.filter((s) => s.given);
  assert.equal(givens.length, 1);
  assert.equal(I1.steps[0].given, true);
  assert.deepEqual(citationsIn(I1.steps[0].text), []);
});
