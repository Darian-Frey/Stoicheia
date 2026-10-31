// Proposition I.6 — if two angles of a triangle are equal, the sides subtending them are equal (converse of I.5).
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 255–256. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 275–276, on 2026-10-31 (by Claude;
// author's own check pending, AV-004). Edits: "Q. E. D." closed up; spaces
// before ";" and ":" dropped (D-004).
// Added citations (D-011), in braces; Heath cites nothing in I.6:
// {I.3} for cutting off DB equal to AC; {Post. 1} for joining DC; {I.4}
// for "the base DC is equal to the base AB, and the triangle DBC … ACB";
// {C.N. 5} for "the less to the greater: which is absurd".
//
// Showing a reductio (author's choice, 2026-10-31): A, B, C are free and
// the figure opens in the supposed case, AB greater than AC, where the
// hypothesis fails (NOT AS GIVEN) and DBC visibly lies inside ACB. C snaps
// onto the circle about A through B, where the base angles are equal; there
// D falls on A, the hypothesis holds, and AB = AC. D and the triangles
// are drawn only while AB is the greater; otherwise a readout note says
// the argument runs with B and C exchanged.

export default {
  n: 6,
  kind: "theorem",
  title: "If in a triangle two angles be equal to one another, the sides which subtend the equal angles " +
    "will also be equal to one another.",
  short: "Converse of I.5",
  given: "Let ABC be a triangle having the angle ABC equal to the angle ACB;",
  brief: { given: "triangle ABC, ∠ABC = ∠ACB", required: "AB = AC" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 330, y: 90 } },
    { id: "B", kind: "point", free: true, at: { x: 150, y: 330 } },
    // On this (undrawn) circle about A through B the base angles are equal.
    { id: "circAB", kind: "circle", by: "circle", of: ["A", "B"] },
    { id: "C", kind: "point", free: true, snapOn: "circAB", at: { x: 400, y: 330 } },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
    { id: "AC", kind: "segment", by: "join", of: ["A", "C"] },
    { id: "BC", kind: "segment", by: "join", of: ["B", "C"] },
    { id: "angABC", kind: "angleMark", by: "angle", of: ["A", "B", "C"], role: "given" },
    { id: "angACB", kind: "angleMark", by: "angle", of: ["A", "C", "B"], role: "given" },

    // DB cut off from AB equal to AC [I.3]: D on BA at distance AC from B.
    { id: "circBD", kind: "circle", by: "circleLen", of: ["B", "AC"] },
    // Drawn only while AB is the greater, the case the proof supposes; when
    // AC is the greater the same argument runs with B and C exchanged.
    { id: "D", kind: "point", by: "xLC", of: ["B", "A", "circBD"], pick: "near:A", role: "construction",
      when: { gt: ["AB", "AC"] } },
    { id: "DC", kind: "segment", by: "join", of: ["D", "C"], role: "construction", when: { gt: ["AB", "AC"] } },

    // "The triangle DBC … equal to the triangle ACB, the less to the greater".
    { id: "triDBC", kind: "polygon", by: "polygon", of: ["D", "B", "C"], when: { gt: ["AB", "AC"] } },
    { id: "triACB", kind: "polygon", by: "polygon", of: ["A", "C", "B"], role: "ghost", when: { gt: ["AB", "AC"] } },
  ],

  steps: [
    {
      title: "The given triangle",
      short: "Given",
      text: "Let ABC be a triangle having the angle ABC equal to the angle ACB;",
      given: true,
      note: "The figure opens in the case the proof supposes, AB greater than AC, so the angles are " +
        "not equal (NOT AS GIVEN). Drag C towards where the base angles would be equal: it snaps there.",
      show: ["A", "B", "C", "AB", "AC", "BC", "angABC", "angACB"],
    },
    {
      title: "What is to be proved",
      short: "To prove",
      text: "I say that the side AB is also equal to the side AC.",
      show: [],
    },
    {
      title: "Suppose AB greater",
      short: "Suppose",
      text: "For, if AB is unequal to AC, one of them is greater.\n" +
        "Let AB be greater; and from AB the greater let DB be cut off equal to AC the less; {I.3}",
      show: ["D"],
    },
    {
      title: "Join DC",
      short: "Join",
      text: "let DC be joined. {Post. 1}",
      show: ["DC"],
    },
    {
      title: "The less equal to the greater",
      short: "Absurd",
      text: "Then, since DB is equal to AC, and BC is common, the two sides DB, BC are equal to the two " +
        "sides AC, CB respectively; and the angle DBC is equal to the angle ACB; therefore the base " +
        "DC is equal to the base AB, and the triangle DBC will be equal to the triangle ACB, {I.4} the " +
        "less to the greater: which is absurd. {C.N. 5}",
      note: "DBC is shaded, ACB dashed: whenever AB is greater, DBC lies inside ACB, and the base " +
        "angles are unequal.",
      show: ["triDBC", "triACB"],
    },
    {
      title: "Q.E.D.",
      short: "Q.E.D.",
      text: "Therefore AB is not unequal to AC; it is therefore equal to it.\n" +
        "Therefore etc. Q.E.D.",
      show: [],
    },
  ],

  measure: ["AB", "AC", "angABC", "angACB", "triDBC", "triACB"],
  unit: "BC",
  requires: [
    { eq: ["angABC", "angACB"], text: "∠ABC must equal ∠ACB (drag C until it snaps)" },
  ],
  claims: [
    { label: "AB = AC", eq: ["AB", "AC"], from: 5 },
  ],
  notes: [
    { when: { gt: ["AC", "AB"] }, text: "AC is the greater here: the proof runs the same way with B and C exchanged." },
  ],
  arc: "congruence",
};
