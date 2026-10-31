// Proposition I.2 — to place at a given point a straight line equal to a given straight line.
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// p. 244. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaf 264, on 2026-10-31 (by Claude; author's
// own check pending, AV-004). Edits: citations respelt to the SPEC grammar
// ("I. 1" → "I.1"); spaces before ";" dropped; margin line numbers
// omitted (D-004). Added citations (D-011), in braces: {Def. 15} for "BC is
// equal to BG" and "DL is equal to DG"; {Def. 20} for "DA is equal to DB".

export default {
  n: 2,
  kind: "problem",
  title: "To place at a given point (as an extremity) a straight line equal to a given straight line.",
  short: "Placing a given line at a point",
  given: "Let A be the given point, and BC the given straight line.",
  brief: { given: "point A, straight line BC", required: "straight line at A equal to BC" },

  objects: [
    { id: "A", kind: "point", free: true, at: { x: 215, y: 285 } },
    { id: "B", kind: "point", free: true, at: { x: 290, y: 262 } },
    { id: "C", kind: "point", free: true, at: { x: 300, y: 172 } },
    { id: "BC", kind: "segment", by: "join", of: ["B", "C"] },
    { id: "AB", kind: "segment", by: "join", of: ["A", "B"], role: "construction" },

    // The equilateral triangle DAB on AB, constructed as in I.1. Its two
    // circles are helpers, cited rather than drawn; D is above AB on
    // screen when A is left of B, as in Heath's figure.
    { id: "circAB", kind: "circle", by: "circle", of: ["A", "B"] },
    { id: "circBA", kind: "circle", by: "circle", of: ["B", "A"] },
    { id: "D", kind: "point", by: "xCC", of: ["circAB", "circBA"], pick: "cw", role: "construction" },
    { id: "DA", kind: "segment", by: "join", of: ["D", "A"], role: "construction" },
    { id: "DB", kind: "segment", by: "join", of: ["D", "B"], role: "construction" },

    // Circle CGH, centre B, distance BC; G where DB produced meets it.
    { id: "circB", kind: "circle", by: "circle", of: ["B", "C"] },
    { id: "G", kind: "point", by: "xLC", of: ["D", "B", "circB"], pick: "far:D", role: "construction" },
    { id: "H", kind: "point", by: "onCircle", of: ["circB"], deg: 145, mark: "label" },
    { id: "BG", kind: "segment", by: "join", of: ["B", "G"], role: "construction" },

    // Circle GKL, centre D, distance DG; L where DA produced meets it.
    { id: "circD", kind: "circle", by: "circle", of: ["D", "G"] },
    { id: "L", kind: "point", by: "xLC", of: ["D", "A", "circD"], pick: "near:A" },
    { id: "K", kind: "point", by: "onCircle", of: ["circD"], deg: 160, mark: "label" },

    // AE, BF: DA, DB produced (Post. 2) a little beyond L and G.
    { id: "E", kind: "point", by: "extend", of: ["D", "L"], len: 26, mark: "label" },
    { id: "F", kind: "point", by: "extend", of: ["D", "G"], len: 26, mark: "label" },
    { id: "AE", kind: "segment", by: "join", of: ["A", "E"], role: "construction" },
    { id: "BF", kind: "segment", by: "join", of: ["B", "F"], role: "construction" },

    { id: "AL", kind: "segment", by: "join", of: ["A", "L"] },
  ],

  steps: [
    {
      title: "The given point and line",
      short: "Given",
      text: "Let A be the given point, and BC the given straight line.\n" +
        "Thus it is required to place at the point A (as an extremity) a straight line equal " +
        "to the given straight line BC.",
      given: true,
      note: "A, B and C may be dragged; the construction follows.",
      show: ["A", "B", "C", "BC"],
    },
    {
      title: "Join AB",
      short: "Join",
      text: "From the point A to the point B let the straight line AB be joined; [Post. 1]",
      show: ["AB"],
    },
    {
      title: "Equilateral triangle DAB",
      short: "Triangle",
      text: "and on it let the equilateral triangle DAB be constructed. [I.1]",
      show: ["D", "DA", "DB"],
    },
    {
      title: "Produce DA and DB",
      short: "Produce",
      text: "Let the straight lines AE, BF be produced in a straight line with DA, DB; [Post. 2]",
      show: ["AE", "E", "BF", "F"],
    },
    {
      title: "Circle with centre B",
      short: "Circle B",
      text: "with centre B and distance BC let the circle CGH be described; [Post. 3]",
      show: ["circB", "G", "H", "BG"],
    },
    {
      title: "Circle with centre D",
      short: "Circle D",
      text: "and again, with centre D and distance DG let the circle GKL be described. [Post. 3]",
      show: ["circD", "K", "L"],
    },
    {
      title: "Q.E.F.",
      short: "Q.E.F.",
      text: "Then, since the point B is the centre of the circle CGH, BC is equal to BG. {Def. 15}\n" +
        "Again, since the point D is the centre of the circle GKL, DL is equal to DG. {Def. 15}\n" +
        "And in these DA is equal to DB; {Def. 20} therefore the remainder AL is equal to the remainder " +
        "BG. [C.N. 3]\n" +
        "But BC was also proved equal to BG; therefore each of the straight lines AL, BC is " +
        "equal to BG.\n" +
        "And things which are equal to the same thing are also equal to one another; [C.N. 1] " +
        "therefore AL is also equal to BC.\n" +
        "Therefore at the given point A the straight line AL is placed equal to the given " +
        "straight line BC.\n" +
        "(Being) what it was required to do.",
      show: ["AL"],
    },
  ],

  measure: ["BC", "BG", "AL"],
  unit: "BC",
  claims: [
    { label: "AL = BC", eq: ["AL", "BC"], from: 6 },
  ],
  arc: "constructions",
};
