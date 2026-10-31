// Proposition I.4 — side-angle-side: two triangles with two sides and the included angle equal are equal in all respects.
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 247–248. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 267–268, on 2026-10-31 (by Claude;
// author's own check pending, AV-004). Edits: spaces before ";" and ":"
// dropped; margin line numbers omitted (D-004). Heath's square brackets
// round "For if, when B coincides … with EF" mark a passage he judges
// interpolated; they are his and kept as text.
// Added citations (D-011), in braces: {C.N. 4} twice in the conclusion
// ("will be equal to it", "will be equal to them"), where coincidence
// gives equality as Heath cites for the base.
//
// Setting-out: DEF is made to satisfy the hypothesis as the givens move.
// E is free but held on a circle about D of radius AB (DE = AB); F is
// placed so that DF = AC and the angle EDF equals BAC, the same way round.
// The readout then measures the conclusions, not the hypothesis.

export default {
  n: 4,
  kind: "theorem",
  title: "If two triangles have the two sides equal to two sides respectively, and have the angles " +
    "contained by the equal straight lines equal, they will also have the base equal to the base, " +
    "the triangle will be equal to the triangle, and the remaining angles will be equal to the " +
    "remaining angles respectively, namely those which the equal sides subtend.",
  short: "SAS congruence",
  given: "Let ABC, DEF be two triangles having the two sides AB, AC equal to the two sides DE, DF " +
    "respectively, namely AB to DE and AC to DF, and the angle BAC equal to the angle EDF.",
  brief: { given: "AB = DE, AC = DF, ∠BAC = ∠EDF", required: "BC = EF, △ABC = △DEF, remaining angles equal" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 150, y: 140 } },
    { id: "B", kind: "point", free: true, at: { x: 75, y: 330 } },
    { id: "C", kind: "point", free: true, at: { x: 255, y: 330 } },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"] },
    { id: "AC", kind: "segment", by: "join", of: ["A", "C"] },
    { id: "BC", kind: "segment", by: "join", of: ["B", "C"] },
    { id: "angBAC", kind: "angleMark", by: "angle", of: ["B", "A", "C"], role: "given" },

    { id: "D", kind: "point", free: true, at: { x: 430, y: 140 } },
    // DE = AB: E keeps to this (undrawn) circle as it is dragged.
    { id: "circDE", kind: "circle", by: "circleLen", of: ["D", "AB"] },
    { id: "E", kind: "point", free: true, on: "circDE", at: { x: 355, y: 330 } },
    // DF = AC and ∠EDF = ∠BAC, the same way round as ABC.
    { id: "F", kind: "point", by: "transfer", of: ["A", "B", "C", "D", "E"], role: "given" },
    { id: "DE", kind: "segment", by: "join", of: ["D", "E"] },
    { id: "DF", kind: "segment", by: "join", of: ["D", "F"], role: "given" },
    { id: "EF", kind: "segment", by: "join", of: ["E", "F"], role: "given" },
    { id: "angEDF", kind: "angleMark", by: "angle", of: ["E", "D", "F"], role: "given" },

    // ABC applied to DEF: A on D, AB along DE (shown dashed over DEF).
    { id: "applied", kind: "polygon", by: "polygon", of: ["D", "E", "F"], role: "ghost" },

    { id: "triABC", kind: "polygon", by: "polygon", of: ["A", "B", "C"] },
    { id: "triDEF", kind: "polygon", by: "polygon", of: ["D", "E", "F"] },
    { id: "angABC", kind: "angleMark", by: "angle", of: ["A", "B", "C"] },
    { id: "angDEF", kind: "angleMark", by: "angle", of: ["D", "E", "F"] },
    { id: "angACB", kind: "angleMark", by: "angle", of: ["A", "C", "B"] },
    { id: "angDFE", kind: "angleMark", by: "angle", of: ["D", "F", "E"] },
  ],

  steps: [
    {
      title: "The given triangles",
      short: "Given",
      text: "Let ABC, DEF be two triangles having the two sides AB, AC equal to the two sides DE, DF " +
        "respectively, namely AB to DE and AC to DF, and the angle BAC equal to the angle EDF.",
      given: true,
      note: "A, B, C and D may be dragged; E turns DEF about D. DEF always keeps AB = DE, AC = DF " +
        "and the angle at D equal to the angle at A.",
      show: ["A", "B", "C", "AB", "AC", "BC", "angBAC", "D", "E", "F", "DE", "DF", "EF", "angEDF"],
    },
    {
      title: "What is to be proved",
      short: "To prove",
      text: "I say that the base BC is also equal to the base EF, the triangle ABC will be equal to the " +
        "triangle DEF, and the remaining angles will be equal to the remaining angles respectively, " +
        "namely those which the equal sides subtend, that is, the angle ABC to the angle DEF, and the " +
        "angle ACB to the angle DFE.",
      show: [],
    },
    {
      title: "ABC applied to DEF",
      short: "Apply",
      text: "For, if the triangle ABC be applied to the triangle DEF, and if the point A be placed on " +
        "the point D and the straight line AB on DE, then the point B will also coincide with E, " +
        "because AB is equal to DE.",
      note: "The dashed outline is the triangle ABC applied to DEF: A on D, AB along DE.",
      show: ["applied"],
    },
    {
      title: "AC on DF",
      short: "AC on DF",
      text: "Again, AB coinciding with DE, the straight line AC will also coincide with DF, because the " +
        "angle BAC is equal to the angle EDF;\n" +
        "hence the point C will also coincide with the point F, because AC is again equal to DF.",
      show: [],
    },
    {
      title: "The bases coincide",
      short: "Base",
      text: "But B also coincided with E; hence the base BC will coincide with the base EF.\n" +
        "[For if, when B coincides with E and C with F, the base BC does not coincide with the base " +
        "EF, two straight lines will enclose a space: which is impossible. Therefore the base BC will " +
        "coincide with EF] and will be equal to it. [C.N. 4]",
      show: [],
    },
    {
      title: "Q.E.D.",
      short: "Q.E.D.",
      text: "Thus the whole triangle ABC will coincide with the whole triangle DEF, and will be equal " +
        "to it. {C.N. 4}\n" +
        "And the remaining angles will also coincide with the remaining angles and will be equal to " +
        "them, {C.N. 4} the angle ABC to the angle DEF, and the angle ACB to the angle DFE.\n" +
        "Therefore etc.\n" +
        "(Being) what it was required to prove.",
      show: ["triABC", "triDEF", "angABC", "angDEF", "angACB", "angDFE"],
    },
  ],

  measure: ["BC", "EF", "angABC", "angDEF", "angACB", "angDFE", "triABC", "triDEF"],
  unit: "AB",
  claims: [
    { label: "BC = EF", eq: ["BC", "EF"], from: 5 },
    { label: "∠ABC = ∠DEF", eq: ["angABC", "angDEF"], from: 5 },
    { label: "∠ACB = ∠DFE", eq: ["angACB", "angDFE"], from: 5 },
    { label: "△ABC = △DEF", eq: ["triABC", "triDEF"], from: 5 },
  ],
  arc: "congruence",
};
