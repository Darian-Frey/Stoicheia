// Proposition I.5 — in isosceles triangles the angles at the base are equal (pons asinorum).
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 251–252. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 271–272, on 2026-10-31 (by Claude;
// author's own check pending, AV-004). Edits: citations respelt ("I. 3",
// "I. 4" → "I.3", "I.4"); "Q. E. D." closed up to "Q.E.D."; spaces before
// ";" dropped; margin line numbers omitted (D-004). From I.5 on Heath
// writes Q.E.D. for "(Being) what it was required to prove" (his note, l. 48).
// Added citations (D-011), in braces: {C.N. 3} for "the remainder BF is
// equal to the remainder CG"; {I.4} for the second congruence (BFC, CGB),
// which Heath leaves uncited after citing the first; {C.N. 3} for "the
// remaining angle ABC is equal to the remaining angle ACB".
//
// Setting-out: C is held on a circle about A through B, so AB = AC as the
// givens move; F is held on BD at its fraction of the way along.

export default {
  n: 5,
  kind: "theorem",
  title: "In isosceles triangles the angles at the base are equal to one another, and, if the equal " +
    "straight lines be produced further, the angles under the base will be equal to one another.",
  short: "Isosceles base angles",
  given: "Let ABC be an isosceles triangle having the side AB equal to the side AC;",
  brief: { given: "triangle ABC, AB = AC", required: "∠ABC = ∠ACB, ∠CBD = ∠BCE" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 300, y: 70 } },
    { id: "B", kind: "point", free: true, at: { x: 228, y: 220 } },
    // AB = AC: C keeps to this (undrawn) circle about A through B.
    { id: "circAB", kind: "circle", by: "circle", of: ["A", "B"] },
    { id: "C", kind: "point", free: true, on: "circAB", at: { x: 372, y: 220 } },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
    { id: "AC", kind: "segment", by: "join", of: ["A", "C"] },
    { id: "BC", kind: "segment", by: "join", of: ["B", "C"] },

    // BD, CE produced (Post. 2) to a fixed length.
    { id: "D", kind: "point", by: "extend", of: ["A", "B"], len: 140, mark: "label" },
    { id: "E", kind: "point", by: "extend", of: ["A", "C"], len: 140, mark: "label" },
    { id: "BD", kind: "segment", by: "join", of: ["B", "D"], role: "construction" },
    { id: "CE", kind: "segment", by: "join", of: ["C", "E"], role: "construction" },

    // F at random on BD; AG cut off from AE equal to AF [I.3]: G is where
    // the (undrawn) circle about A through F meets AE.
    { id: "F", kind: "point", free: true, on: "BD", at: { x: 195, y: 290 }, role: "construction" },
    { id: "circAF", kind: "circle", by: "circle", of: ["A", "F"] },
    { id: "G", kind: "point", by: "xLC", of: ["A", "C", "circAF"], pick: "near:C", role: "construction" },
    { id: "FC", kind: "segment", by: "join", of: ["F", "C"], role: "construction" },
    { id: "GB", kind: "segment", by: "join", of: ["G", "B"], role: "construction" },

    // The two pairs of triangles I.4 is applied to, one shaded, one dashed.
    { id: "triAFC", kind: "polygon", by: "polygon", of: ["A", "F", "C"] },
    { id: "triAGB", kind: "polygon", by: "polygon", of: ["A", "G", "B"], role: "ghost" },
    { id: "triBFC", kind: "polygon", by: "polygon", of: ["B", "F", "C"] },
    { id: "triCGB", kind: "polygon", by: "polygon", of: ["C", "G", "B"], role: "ghost" },

    { id: "angABC", kind: "angleMark", by: "angle", of: ["A", "B", "C"] },
    { id: "angACB", kind: "angleMark", by: "angle", of: ["A", "C", "B"] },
    // Under the base: a smaller arc, so it reads apart from the base angle.
    { id: "angCBD", kind: "angleMark", by: "angle", of: ["C", "B", "D"], radius: 15 },
    { id: "angBCE", kind: "angleMark", by: "angle", of: ["B", "C", "E"], radius: 15 },
  ],

  steps: [
    {
      title: "The isosceles triangle",
      short: "Given",
      text: "Let ABC be an isosceles triangle having the side AB equal to the side AC;",
      given: true,
      note: "A and B may be dragged, and C, which keeps AC equal to AB.",
      show: ["A", "B", "C", "AB", "AC", "BC"],
    },
    {
      title: "Produce AB and AC",
      short: "Produce",
      text: "and let the straight lines BD, CE be produced further in a straight line with AB, AC. [Post. 2]",
      show: ["BD", "D", "CE", "E"],
    },
    {
      title: "What is to be proved",
      short: "To prove",
      text: "I say that the angle ABC is equal to the angle ACB, and the angle CBD to the angle BCE.",
      show: ["angABC", "angACB", "angCBD", "angBCE"],
    },
    {
      title: "F at random; AG equal to AF",
      short: "F, G",
      text: "Let a point F be taken at random on BD;\n" +
        "from AE the greater let AG be cut off equal to AF the less; [I.3]",
      note: "F may be dragged along BD.",
      show: ["F", "G"],
    },
    {
      title: "Join FC and GB",
      short: "Join",
      text: "and let the straight lines FC, GB be joined. [Post. 1]",
      show: ["FC", "GB"],
    },
    {
      title: "Triangles AFC, AGB",
      short: "I.4 (1)",
      text: "Then, since AF is equal to AG and AB to AC, the two sides FA, AC are equal to the two sides " +
        "GA, AB, respectively; and they contain a common angle, the angle FAG.\n" +
        "Therefore the base FC is equal to the base GB, and the triangle AFC is equal to the triangle " +
        "AGB, and the remaining angles will be equal to the remaining angles respectively, namely " +
        "those which the equal sides subtend, that is, the angle ACF to the angle ABG, and the angle " +
        "AFC to the angle AGB. [I.4]",
      note: "AFC is shaded, AGB dashed.",
      show: ["triAFC", "triAGB"],
    },
    {
      title: "Triangles BFC, CGB",
      short: "I.4 (2)",
      text: "And, since the whole AF is equal to the whole AG, and in these AB is equal to AC, the " +
        "remainder BF is equal to the remainder CG. {C.N. 3}\n" +
        "But FC was also proved equal to GB; therefore the two sides BF, FC are equal to the two sides " +
        "CG, GB respectively; and the angle BFC is equal to the angle CGB, while the base BC is common " +
        "to them; therefore the triangle BFC is also equal to the triangle CGB, and the remaining " +
        "angles will be equal to the remaining angles respectively, namely those which the equal sides " +
        "subtend; {I.4} therefore the angle FBC is equal to the angle GCB, and the angle BCF to the " +
        "angle CBG.",
      note: "BFC is shaded, CGB dashed.",
      hide: ["triAFC", "triAGB"],
      show: ["triBFC", "triCGB"],
    },
    {
      title: "Q.E.D.",
      short: "Q.E.D.",
      text: "Accordingly, since the whole angle ABG was proved equal to the angle ACF, and in these the " +
        "angle CBG is equal to the angle BCF, the remaining angle ABC is equal to the remaining angle " +
        "ACB; {C.N. 3} and they are at the base of the triangle ABC.\n" +
        "But the angle FBC was also proved equal to the angle GCB; and they are under the base.\n" +
        "Therefore etc. Q.E.D.",
      hide: ["triBFC", "triCGB"],
      show: [],
    },
  ],

  measure: ["angABC", "angACB", "angCBD", "angBCE", "FC", "GB"],
  unit: "AB",
  claims: [
    { label: "FC = GB", eq: ["FC", "GB"], from: 5 },
    { label: "∠ABC = ∠ACB", eq: ["angABC", "angACB"], from: 7 },
    { label: "∠CBD = ∠BCE", eq: ["angCBD", "angBCE"], from: 7 },
  ],
  arc: "congruence",
};
