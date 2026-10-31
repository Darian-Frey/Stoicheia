// arcs.js — index table for Book I (SPEC.md §Arcs, F-010).
//
// `short` titles are the site's own labels, not Heath's text; the full
// enunciation lives in each proposition's data file. `kind` follows the
// Greek: problems end Q.E.F., theorems Q.E.D. Add a number to `built`
// when its data/props/NN.js is complete and checked against the scan.

export const built = [1, 2, 3, 4];

export const arcs = [
  { id: "constructions", label: "Constructions", from: 1, to: 3 },
  { id: "congruence", label: "Triangle congruence", from: 4, to: 8 },
  { id: "perpendiculars", label: "Perpendiculars and angles", from: 9, to: 15 },
  { id: "inequalities", label: "Inequalities", from: 16, to: 26 },
  { id: "parallels", label: "Parallels", from: 27, to: 32 },
  { id: "area", label: "Parallelograms and area", from: 33, to: 45 },
  { id: "pythagoras", label: "Pythagoras", from: 46, to: 48 },
];

const P = "problem", T = "theorem";

// Index n − 1 is proposition I.n.
export const props = [
  [P, "Equilateral triangle"],
  [P, "Placing a given line at a point"],
  [P, "Cutting off a given line"],
  [T, "SAS congruence"],
  [T, "Isosceles base angles"],
  [T, "Converse of I.5"],
  [T, "Uniqueness of a triangle"],
  [T, "SSS congruence"],
  [P, "Bisecting an angle"],
  [P, "Bisecting a line"],
  [P, "Perpendicular from a point on a line"],
  [P, "Perpendicular from a point off a line"],
  [T, "Angles on a straight line"],
  [T, "Converse of I.13"],
  [T, "Vertical angles"],
  [T, "Exterior angle exceeds interior"],
  [T, "Two angles less than two right"],
  [T, "Greater side, greater angle"],
  [T, "Greater angle, greater side"],
  [T, "Triangle inequality"],
  [T, "Lines meeting within a triangle"],
  [P, "Triangle from three lines"],
  [P, "Copying an angle"],
  [T, "Hinge theorem"],
  [T, "Converse of the hinge"],
  [T, "ASA and AAS congruence"],
  [T, "Alternate angles make parallels"],
  [T, "Corresponding angles make parallels"],
  [T, "Parallels make equal angles"],
  [T, "Parallel to the same line"],
  [P, "Parallel through a point"],
  [T, "Angle sum of a triangle"],
  [T, "Joining equal parallels"],
  [T, "Parallelogram properties"],
  [T, "Parallelograms on the same base"],
  [T, "Parallelograms on equal bases"],
  [T, "Triangles on the same base"],
  [T, "Triangles on equal bases"],
  [T, "Converse of I.37"],
  [T, "Converse of I.38"],
  [T, "Parallelogram double the triangle"],
  [P, "Parallelogram equal to a triangle"],
  [T, "Complements are equal"],
  [P, "Applying a parallelogram"],
  [P, "Parallelogram equal to a figure"],
  [P, "Square on a line"],
  [T, "Pythagoras"],
  [T, "Converse of Pythagoras"],
].map(([kind, short], i) => ({ n: i + 1, kind, short }));
