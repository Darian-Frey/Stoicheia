// Proposition I.1 — equilateral triangle on a given finite straight line.
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 241–242. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 261–262, on 2026-10-30 (by Claude;
// author's own check pending, AV-004). Edits: citations respelt to the
// SPEC grammar ("C. N. 1" → "C.N. 1"); space before ";" dropped (D-004).

export default {
  n: 1,
  kind: "problem",
  title: "On a given finite straight line to construct an equilateral triangle.",
  short: "Equilateral triangle",
  given: "Let AB be the given finite straight line.",
  brief: { given: "finite straight line AB", required: "equilateral triangle on AB" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 220, y: 290 } },
    { id: "B", kind: "point", free: true, at: { x: 380, y: 290 } },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
    { id: "circA", kind: "circle", by: "circle", of: ["A", "B"] },
    { id: "D", kind: "point", by: "xLC", of: ["A", "B", "circA"], pick: "far:B", mark: "label" },
    { id: "circB", kind: "circle", by: "circle", of: ["B", "A"] },
    { id: "E", kind: "point", by: "xLC", of: ["A", "B", "circB"], pick: "far:A", mark: "label" },
    // Above AB on screen when A is left of B, as in Heath's figure (D-008).
    { id: "C", kind: "point", by: "xCC", of: ["circA", "circB"], pick: "cw" },
    { id: "AC", kind: "segment", by: "join", of: ["A", "C"] },
    { id: "BC", kind: "segment", by: "join", of: ["B", "C"] },
    { id: "ABC", kind: "polygon", by: "polygon", of: ["A", "B", "C"] },
  ],

  steps: [
    {
      title: "The given line",
      short: "Given",
      text: "Let AB be the given finite straight line.\n" +
        "Thus it is required to construct an equilateral triangle on the straight line AB.",
      given: true,
      note: "A and B may be dragged; the construction follows.",
      show: ["A", "B", "AB"],
    },
    {
      title: "Circle with centre A",
      short: "Circle A",
      text: "With centre A and distance AB let the circle BCD be described; [Post. 3]",
      show: ["circA", "D"],
    },
    {
      title: "Circle with centre B",
      short: "Circle B",
      text: "again, with centre B and distance BA let the circle ACE be described; [Post. 3]",
      show: ["circB", "E"],
    },
    {
      title: "Join CA and CB",
      short: "Join",
      text: "and from the point C, in which the circles cut one another, to the points A, B " +
        "let the straight lines CA, CB be joined. [Post. 1]",
      show: ["C", "AC", "BC", "ABC"],
    },
    {
      title: "Q.E.F.",
      short: "Q.E.F.",
      text: "Now, since the point A is the centre of the circle CDB, AC is equal to AB. [Def. 15]\n" +
        "Again, since the point B is the centre of the circle CAE, BC is equal to BA. [Def. 15]\n" +
        "But CA was also proved equal to AB; therefore each of the straight lines CA, CB is equal to AB.\n" +
        "And things which are equal to the same thing are also equal to one another; [C.N. 1] " +
        "therefore CA is also equal to CB.\n" +
        "Therefore the three straight lines CA, AB, BC are equal to one another.\n" +
        "Therefore the triangle ABC is equilateral; and it has been constructed on the given " +
        "finite straight line AB.\n" +
        "(Being) what it was required to do.",
      show: [],
    },
  ],

  measure: ["AB", "AC", "BC"],
  unit: "AB",
  claims: [
    { label: "EQUILATERAL", eq: ["AB", "AC", "BC"], from: 4 },
  ],
  arc: "constructions",
};
