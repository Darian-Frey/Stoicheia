// Proposition I.3 — given two unequal straight lines, to cut off from the greater a straight line equal to the less.
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 246–247. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 266–267, on 2026-10-31 (by Claude;
// author's own check pending, AV-004). Edits: citations respelt to the
// SPEC grammar ("I. 2" → "I.2"); line-end hyphen rejoined ("un-equal");
// spaces before ";" dropped (D-004). Added citations (D-011): none; Heath
// cites every inference ("But C is also equal to AD" restates the I.2 step).

export default {
  n: 3,
  kind: "problem",
  title: "Given two unequal straight lines, to cut off from the greater a straight line equal to the less.",
  short: "Cutting off a given line",
  given: "Let AB, C be the two given unequal straight lines, and let AB be the greater of them.",
  brief: { given: "straight lines AB, C, AB the greater", required: "from AB, a line equal to C" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 230, y: 300 } },
    { id: "B", kind: "point", free: true, at: { x: 470, y: 300 } },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
    // Heath names this line by one letter; its ends carry no letters.
    { id: "C1", kind: "point", free: true, at: { x: 330, y: 100 }, label: "" },
    { id: "C2", kind: "point", free: true, at: { x: 440, y: 100 }, label: "" },
    { id: "C", kind: "segment", by: "join", of: ["C1", "C2"], label: "C" },

    // AD placed at A equal to C [I.2]: I.2 licenses carrying the length of
    // C to A, so D lies on this (undrawn) circle, up and to the left of A
    // as in Heath's figure.
    { id: "circAC", kind: "circle", by: "circleLen", of: ["A", "C"] },
    { id: "D", kind: "point", by: "onCircle", of: ["circAC"], deg: 140, role: "construction" },
    { id: "AD", kind: "segment", by: "join", of: ["A", "D"], role: "construction" },

    // Circle DEF, centre A, distance AD; E where it cuts AB.
    { id: "circA", kind: "circle", by: "circle", of: ["A", "D"] },
    { id: "E", kind: "point", by: "xLC", of: ["A", "B", "circA"], pick: "near:B" },
    { id: "F", kind: "point", by: "onCircle", of: ["circA"], deg: -55, mark: "label" },
    { id: "AE", kind: "segment", by: "join", of: ["A", "E"] },
  ],

  steps: [
    {
      title: "The given lines",
      short: "Given",
      text: "Let AB, C be the two given unequal straight lines, and let AB be the greater of them.\n" +
        "Thus it is required to cut off from AB the greater a straight line equal to C the less.",
      given: true,
      note: "A, B and the ends of C may be dragged; keep AB the greater.",
      show: ["A", "B", "AB", "C1", "C2", "C"],
    },
    {
      title: "Place AD equal to C",
      short: "Place",
      text: "At the point A let AD be placed equal to the straight line C; [I.2]",
      show: ["D", "AD"],
    },
    {
      title: "Circle with centre A",
      short: "Circle A",
      text: "and with centre A and distance AD let the circle DEF be described. [Post. 3]",
      show: ["circA", "E", "F"],
    },
    {
      title: "Q.E.F.",
      short: "Q.E.F.",
      text: "Now, since the point A is the centre of the circle DEF, AE is equal to AD. [Def. 15]\n" +
        "But C is also equal to AD.\n" +
        "Therefore each of the straight lines AE, C is equal to AD; so that AE is also equal " +
        "to C. [C.N. 1]\n" +
        "Therefore, given the two straight lines AB, C, from AB the greater AE has been cut off " +
        "equal to C the less.\n" +
        "(Being) what it was required to do.",
      show: ["AE"],
    },
  ],

  measure: ["AB", "C", "AE"],
  unit: "C",
  requires: [
    { gt: ["AB", "C"], text: "AB must be greater than C" },
  ],
  claims: [
    { label: "AE = C", eq: ["AE", "C"], from: 3 },
  ],
  arc: "constructions",
};
