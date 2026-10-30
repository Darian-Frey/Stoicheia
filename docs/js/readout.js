// readout.js — measurements and the numeric QED check (F-003, F-006).
//
// Lengths are displayed in units of the reference segment (`unit`,
// default measure[0]); claims are evaluated in SVG units with the relative
// tolerance of SPEC §Tolerance, so the residual is scale-free. A claim is
// shown from its `from` step; earlier steps show measurements only.
// Wording is "holds", never "proved" (D-006).

import { dist } from "./geom.js";

/** Claim tolerance τ (SPEC §Tolerance). */
export const TAU = 1e-6;

/** Relative residual |a − b| / max(1, |a|, |b|). */
export function residual(a, b) {
  return Math.abs(a - b) / Math.max(1, Math.abs(a), Math.abs(b));
}

function lengthOf(scene, id) {
  const v = scene.value(id);
  return v && v.A && v.B ? dist(v.A, v.B) : null;
}

/**
 * Evaluate one claim. Returns { ok, residual } or null when an input does
 * not exist (degenerate), or { unsupported: true } for forms not yet built.
 */
export function evaluateClaim(scene, claim) {
  if (claim.eq) {
    const ls = claim.eq.map((id) => lengthOf(scene, id));
    if (ls.some((l) => l === null)) return null;
    let worst = 0;
    for (let i = 0; i < ls.length; i++) {
      for (let j = i + 1; j < ls.length; j++) worst = Math.max(worst, residual(ls[i], ls[j]));
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
  const unitId = data.unit ?? measure[0];
  const claims = data.claims ?? [];

  els.grid.replaceChildren();
  const cells = measure.map((id) => {
    const cell = h("div", "readout-cell");
    cell.append(h("span", "readout-name", `|${id}|`));
    const value = h("span", "readout-value", "—");
    cell.append(value);
    els.grid.append(cell);
    return { id, value };
  });

  let step = 0;

  function update() {
    const unit = unitId ? lengthOf(scene, unitId) : 1;
    const degenerate = scene.isDegenerate() || !(unit > 0);

    for (const { id, value } of cells) {
      const shown = step >= (intro.get(id) ?? Infinity);
      const l = lengthOf(scene, id);
      value.textContent = shown && l !== null && unit > 0 ? (l / unit).toFixed(3) : "—";
    }

    els.status.className = "readout-status";
    if (degenerate) {
      els.status.classList.add("is-degenerate");
      els.status.textContent = "DEGENERATE";
      return;
    }
    const lines = [];
    let fail = false;
    for (const c of claims) {
      if (step < (c.from ?? 0)) continue;
      const r = evaluateClaim(scene, c);
      if (r === null) { lines.push(`${c.label} · —`); continue; }
      if (r.unsupported) { lines.push(`${c.label} · not yet supported`); fail = true; continue; }
      if (!r.ok) fail = true;
      lines.push(`${c.label} · ${r.ok ? "✓ holds" : "✗ fails"} · residual ${r.residual.toFixed(3)}`);
    }
    if (fail) els.status.classList.add("is-fail");
    els.status.textContent = lines.join("  ·  ");
  }

  update();

  return {
    setStep(i) { step = i; update(); },
    update,
  };
}
