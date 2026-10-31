// Proposition I.7 — on the same base and side there cannot be two triangles with the sides from each end equal.
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 258–259. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 278–279, on 2026-10-31 (by Claude;
// author's own check pending, AV-004). Edits: "I. 5" respelt "I.5";
// "Q. E. D." closed up; spaces before ";" and ":" dropped; margin line
// numbers omitted (D-004).
// Added citations (D-011), in braces: {Post. 1} for joining CD; {C.N. 5}
// for "ADC is greater than DCB" and for "CDB is much greater than DCB"
// (the whole angle greater than its part); {I.5} for the second use,
// "since CB is equal to DB, the angle CDB is also equal to the angle DCB".
//
// Showing the reductio (as I.6; author's choices, 2026-10-31): A, B, C, D
// are free and the figure opens in the supposed case, D near C but not on
// it, NOT AS GIVEN. Two dotted circles, Stoicheia's aid and not Euclid's,
// show where D would have to lie (AD = AC, BD = BC); on C's side of AB they
// meet only at C. Dragged near C, D snaps onto it: the equalities hold, but
// D is no longer another point.

export default {
  n: 7,
  kind: "theorem",
  title: "Given two straight lines constructed on a straight line (from its extremities) and meeting in " +
    "a point, there cannot be constructed on the same straight line (from its extremities), and on the " +
    "same side of it, two other straight lines meeting in another point and equal to the former two " +
    "respectively, namely each to that which has the same extremity with it.",
  short: "Uniqueness of a triangle",
  given: "For, if possible, given two straight lines AC, CB constructed on the straight line AB and " +
    "meeting at the point C, let two other straight lines AD, DB be constructed …",
  brief: { given: "AC, CB on AB; AD = AC, DB = CB, same side", required: "D cannot be another point" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 150, y: 370 } },
    { id: "B", kind: "point", free: true, at: { x: 450, y: 370 } },
    { id: "C", kind: "point", free: true, at: { x: 300, y: 140 } },
    { id: "D", kind: "point", free: true, at: { x: 385, y: 165 } },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
    { id: "AC", kind: "segment", by: "join", of: ["A", "C"] },
    { id: "BC", kind: "segment", by: "join", of: ["B", "C"] },
    { id: "AD", kind: "segment", by: "join", of: ["A", "D"] },
    { id: "BD", kind: "segment", by: "join", of: ["B", "D"] },

    // Not Euclid's: where D would have to lie for AD = AC and BD = BC.
    { id: "circAC", kind: "circle", by: "circle", of: ["A", "C"], role: "aid" },
    { id: "circBC", kind: "circle", by: "circle", of: ["B", "C"], role: "aid" },

    { id: "CD", kind: "segment", by: "join", of: ["C", "D"], role: "construction" },
    { id: "angACD", kind: "angleMark", by: "angle", of: ["A", "C", "D"], radius: 30 },
    { id: "angADC", kind: "angleMark", by: "angle", of: ["A", "D", "C"], radius: 30 },
    { id: "angDCB", kind: "angleMark", by: "angle", of: ["D", "C", "B"], radius: 18 },
    { id: "angCDB", kind: "angleMark", by: "angle", of: ["C", "D", "B"], radius: 18 },
  ],

  steps: [
    {
      title: "Suppose a second point D",
      short: "Suppose",
      text: "For, if possible, given two straight lines AC, CB constructed on the straight line AB and " +
        "meeting at the point C, let two other straight lines AD, DB be constructed on the same straight " +
        "line AB, on the same side of it, meeting in another point D and equal to the former two " +
        "respectively, namely each to that which has the same extremity with it, so that CA is equal to " +
        "DA which has the same extremity A with it, and CB to DB which has the same extremity B with it;",
      given: true,
      note: "The dotted circles are not Euclid's: they show where D would have to lie for AD = AC and " +
        "BD = BC. On C's side of AB they meet only at C. The figure opens with D off them (NOT AS GIVEN); " +
        "drag D onto C and it snaps there.",
      show: ["A", "B", "C", "D", "AB", "AC", "BC", "AD", "BD", "circAC", "circBC"],
    },
    {
      title: "Join CD",
      short: "Join",
      text: "and let CD be joined. {Post. 1}",
      show: ["CD"],
    },
    {
      title: "Angle CDB much greater than DCB",
      short: "Greater",
      text: "Then, since AC is equal to AD, the angle ACD is also equal to the angle ADC; [I.5]\n" +
        "therefore the angle ADC is greater than the angle DCB; {C.N. 5}\n" +
        "therefore the angle CDB is much greater than the angle DCB. {C.N. 5}",
      show: ["angACD", "angADC", "angDCB", "angCDB"],
    },
    {
      title: "Yet equal to it",
      short: "Equal",
      text: "Again, since CB is equal to DB, the angle CDB is also equal to the angle DCB. {I.5}\n" +
        "But it was also proved much greater than it: which is impossible.",
      show: [],
    },
    {
      title: "Q.E.D.",
      short: "Q.E.D.",
      text: "Therefore etc. Q.E.D.",
      show: [],
    },
  ],

  measure: ["AC", "AD", "BC", "BD", "angACD", "angADC", "angCDB", "angDCB"],
  unit: "AB",
  requires: [
    { eq: ["AD", "AC"], text: "AD must equal AC (drag D onto C)" },
    { eq: ["BD", "BC"], text: "BD must equal BC (drag D onto C)" },
    { sameSide: ["A", "B", "C", "D"], text: "D must be on the same side of AB as C" },
  ],
  claims: [
    { label: "D falls on C", coincide: ["C", "D"], from: 4 },
  ],
  arc: "congruence",
};
