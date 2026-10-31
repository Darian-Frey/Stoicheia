// Book I definitions, postulates and common notions (F-011).
// Text: Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I,
// pp. 153–155. Checked line by line against the Internet Archive scan
// thirteenbookseu02heibgoog, leaves 173–175, on 2026-10-31 (by Claude;
// author's own check pending, AV-004).
// Edits (D-004): terms Heath sets in bold are marked **…**; line-end
// hyphens rejoined ("any-thing", "tri-angle", "multi-lateral"); spaces
// before ";" and ":" dropped; the stray mark in "5. . That" omitted.
// `heiberg` is the bracketed number Heath prints beside C.N. 4 and 5.

export const source = {
  work: "Heath (1908), The Thirteen Books of Euclid's Elements, Vol. I",
  pages: "153–155",
  scan: "https://archive.org/details/thirteenbookseu02heibgoog/page/n173",
};

export const definitions = [
  "A **point** is that which has no part.",
  "A **line** is breadthless length.",
  "The extremities of a line are points.",
  "A **straight line** is a line which lies evenly with the points on itself.",
  "A **surface** is that which has length and breadth only.",
  "The extremities of a surface are lines.",
  "A **plane surface** is a surface which lies evenly with the straight lines on itself.",
  "A **plane angle** is the inclination to one another of two lines in a plane which meet " +
    "one another and do not lie in a straight line.",
  "And when the lines containing the angle are straight, the angle is called **rectilineal**.",
  "When a straight line set up on a straight line makes the adjacent angles equal to one " +
    "another, each of the equal angles is **right**, and the straight line standing on the " +
    "other is called a **perpendicular** to that on which it stands.",
  "An **obtuse angle** is an angle greater than a right angle.",
  "An **acute angle** is an angle less than a right angle.",
  "A **boundary** is that which is an extremity of anything.",
  "A **figure** is that which is contained by any boundary or boundaries.",
  "A **circle** is a plane figure contained by one line such that all the straight lines " +
    "falling upon it from one point among those lying within the figure are equal to one another;",
  "And the point is called the **centre** of the circle.",
  "A **diameter** of the circle is any straight line drawn through the centre and terminated " +
    "in both directions by the circumference of the circle, and such a straight line also " +
    "bisects the circle.",
  "A **semicircle** is the figure contained by the diameter and the circumference cut off by " +
    "it. And the centre of the semicircle is the same as that of the circle.",
  "**Rectilineal figures** are those which are contained by straight lines, **trilateral " +
    "figures** being those contained by three, **quadrilateral** those contained by four, and " +
    "**multilateral** those contained by more than four straight lines.",
  "Of trilateral figures, an **equilateral triangle** is that which has its three sides equal, " +
    "an **isosceles triangle** that which has two of its sides alone equal, and a **scalene " +
    "triangle** that which has its three sides unequal.",
  "Further, of trilateral figures, a **right-angled triangle** is that which has a right " +
    "angle, an **obtuse-angled triangle** that which has an obtuse angle, and an " +
    "**acute-angled triangle** that which has its three angles acute.",
  "Of quadrilateral figures, a **square** is that which is both equilateral and " +
    "right-angled; an **oblong** that which is right-angled but not equilateral; a " +
    "**rhombus** that which is equilateral but not right-angled; and a **rhomboid** that " +
    "which has its opposite sides and angles equal to one another but is neither equilateral " +
    "nor right-angled. And let quadrilaterals other than these be called **trapezia**.",
  "**Parallel** straight lines are straight lines which, being in the same plane and being " +
    "produced indefinitely in both directions, do not meet one another in either direction.",
].map((text, i) => ({ n: i + 1, text }));

export const postulatesIntro = "Let the following be postulated:";

export const postulates = [
  "To draw a straight line from any point to any point.",
  "To produce a finite straight line continuously in a straight line.",
  "To describe a circle with any centre and distance.",
  "That all right angles are equal to one another.",
  "That, if a straight line falling on two straight lines make the interior angles on the " +
    "same side less than two right angles, the two straight lines, if produced indefinitely, " +
    "meet on that side on which are the angles less than the two right angles.",
].map((text, i) => ({ n: i + 1, text }));

export const commonNotions = [
  { text: "Things which are equal to the same thing are also equal to one another." },
  { text: "If equals be added to equals, the wholes are equal." },
  { text: "If equals be subtracted from equals, the remainders are equal." },
  { text: "Things which coincide with one another are equal to one another.", heiberg: 7 },
  { text: "The whole is greater than the part.", heiberg: 8 },
].map((c, i) => ({ n: i + 1, ...c }));
