// readout.js — measurements and the numeric QED check (F-003, F-006).
//
// Measures three kinds of quantity, by the kind of the object named:
// segment → length, angleMark → angle, polygon → area. Lengths and areas
// are displayed in units of the reference segment (`unit`, default the
// first measured segment); angles in degrees to one decimal. Claims are
// evaluated in SVG units and radians with the relative tolerance of SPEC
// §Tolerance, so the residual is scale-free. A claim is shown from its
// `from` step; earlier steps show measurements only. Wording is "holds",
// never "proved" (D-006).

import { dist, angle } from "./geom.js";

/** Claim tolerance τ (SPEC §Tolerance). */
export const TAU = 1e-6;

/** Relative residual |a − b| / max(1, |a|, |b|). */
export function residual(a, b) {
  return Math.abs(a - b) / Math.max(1, Math.abs(a), Math.abs(b));
}

/** Area enclosed by a polygon's vertices, in order (shoelace). */
function area(P) {
  let s = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/** {kind, value} for a measurable object, or null if it does not exist. */
export function quantity(scene, id) {
  const def = scene.def(id);
  const v = scene.value(id);
  if (!def || v === null) return null;
  if (def.kind === "segment") return { kind: "length", value: dist(v.A, v.B) };
  if (def.kind === "angleMark") {
    const a = angle(v.A, v.V, v.B);
    return Number.isNaN(a) ? null : { kind: "angle", value: a };
  }
  if (def.kind === "polygon") return { kind: "area", value: area(v.P) };
  return null;
}

/**
 * Evaluate one claim. `eq` lists objects of one kind (segments, angles or
 * polygons) that should all be equal. Returns { ok, residual }, null when
 * an input does not exist (degenerate), or { unsupported: true }.
 */
export function evaluateClaim(scene, claim) {
  if (claim.eq) {
    const qs = claim.eq.map((id) => quantity(scene, id));
    if (qs.some((q) => q === null)) return null;
    if (qs.some((q) => q.kind !== qs[0].kind)) return { unsupported: true };
    let worst = 0;
    for (let i = 0; i < qs.length; i++) {
      for (let j = i + 1; j < qs.length; j++) worst = Math.max(worst, residual(qs[i].value, qs[j].value));
    }
    return { ok: worst <= TAU, residual: worst };
  }
  return { unsupported: true };
}

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function createReadout({ scene, data, intro, els }) {
  const measure = data.measure ?? [];
  const unitId = data.unit ?? measure.find((id) => scene.def(id)?.kind === "segment");
  const claims = data.claims ?? [];
  // Hypotheses the givens must satisfy (I.3: AB the greater). When one
  // fails, the claims are not evaluated: the proposition does not apply.
  const requires = data.requires ?? [];

  els.grid.replaceChildren();
  const cells = measure.map((id) => {
    const kind = scene.def(id)?.kind;
    const name = kind === "angleMark" ? `∠${scene.def(id).of.join("")}`
      : kind === "polygon" ? `△${scene.def(id).of.join("")}` : `|${id}|`;
    const cell = h("div", "readout-cell");
    cell.append(h("span", "readout-name", name));
    const value = h("span", "readout-value", "—");
    cell.append(value);
    els.grid.append(cell);
    return { id, value };
  });

  let step = 0;

  function format(q, unit) {
    if (q.kind === "angle") return `${((q.value * 180) / Math.PI).toFixed(1)}°`;
    if (!(unit > 0)) return "—";
    return q.kind === "area" ? (q.value / (unit * unit)).toFixed(3) : (q.value / unit).toFixed(3);
  }

  function status(lines) {
    els.status.replaceChildren();
    for (const { text, cls } of lines) els.status.append(h("div", `readout-line${cls ? ` ${cls}` : ""}`, text));
  }

  function update() {
    const unitQ = unitId ? quantity(scene, unitId) : null;
    const unit = unitQ ? unitQ.value : 1;
    const degenerate = scene.isDegenerate() || !(unit > 0);

    for (const { id, value } of cells) {
      const shown = step >= (intro.get(id) ?? Infinity);
      const q = quantity(scene, id);
      value.textContent = shown && q !== null ? format(q, unit) : "—";
    }

    const unmet = degenerate ? null : requires.find((q) => {
      const [a, b] = q.gt.map((id) => quantity(scene, id)?.value ?? null);
      return !(a !== null && b !== null && a - b > TAU * Math.max(1, a, b));
    });
    // The figure's frame shows the same state as the status line: dashed
    // when the configuration is degenerate or breaks the hypothesis.
    els.frame?.classList.toggle("is-degenerate", degenerate);
    els.frame?.classList.toggle("is-not-given", Boolean(unmet));

    if (degenerate) return status([{ text: "DEGENERATE", cls: "is-degenerate" }]);
    if (unmet) return status([{ text: `NOT AS GIVEN · ${unmet.text}`, cls: "is-fail" }]);
    const lines = [];
    for (const c of claims) {
      if (step < (c.from ?? 0)) continue;
      const r = evaluateClaim(scene, c);
      if (r === null) lines.push({ text: `${c.label} · —` });
      else if (r.unsupported) lines.push({ text: `${c.label} · not yet supported`, cls: "is-fail" });
      else lines.push({
        text: `${c.label} · ${r.ok ? "✓ holds" : "✗ fails"} · residual ${r.residual.toFixed(3)}`,
        cls: r.ok ? "" : "is-fail",
      });
    }
    status(lines);
  }

  update();

  return {
    setStep(i) { step = i; update(); },
    update,
  };
}
