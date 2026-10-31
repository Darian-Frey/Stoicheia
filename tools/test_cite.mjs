// test_cite.mjs — unit tests for docs/js/cite.js (F-007, IMP-006, AV-005).
// Run: node tools/test_cite.mjs   (Node ≥ 22.7; built-in node:test only)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isCitation, citationHref, splitCitations, citationsIn, compareCitations, usesOf,
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

test("splitCitations keeps text and groups in order", () => {
  assert.deepEqual(splitCitations("a [Post. 1] b [Def. 15, C.N. 1]"),
    ["a ", ["Post. 1"], " b ", ["Def. 15", "C.N. 1"]]);
  assert.deepEqual(splitCitations("no citations"), ["no citations"]);
  assert.deepEqual(splitCitations("[I.4]"), [["I.4"]]);
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

test("I.1: derived uses equals the list it used to declare", () => {
  assert.deepEqual(usesOf(I1), ["Def. 15", "Post. 1", "Post. 3", "C.N. 1"]);
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
