// render.js — scene → SVG, and drag input for free points (F-002, F-005).
//
// One element (or small group) per scene object, created once and updated
// in place. Objects appear from the first step whose `show` lists them;
// objects listed in no step are construction helpers and never drawn.
// All styling is by class (instrument.css); no colours here (AV-008).

import { dist } from "./geom.js";

const SVGNS = "http://www.w3.org/2000/svg";
const VIEW = { w: 600, h: 470 };
const POINT_R = 6;
const HANDLE_R = 22; // 44 px touch target (SPEC §Theme tokens)
const LABEL_OFFSET = 24;
// A dragged free point this close to another free point lands exactly on
// it, so coincident givens (AV-001) can be reached by hand (SPEC §Coordinates).
const SNAP = 8;
const FAR = 4000; // rays and lines are drawn to here and clipped by the viewBox

function el(name, attrs = {}, parent = null) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

function setAttrs(e, attrs) {
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
}

/** Step index at which each object first appears (undefined: never). */
export function introSteps(steps) {
  const intro = new Map();
  steps.forEach((s, i) => {
    for (const id of s.show ?? []) if (!intro.has(id)) intro.set(id, i);
  });
  return intro;
}

/**
 * Role decides colour (SPEC §Scene object schema): explicit `role`, else
 * free points and joins of free points are given, circles, rays and lines
 * are construction, and everything else is result.
 */
function roleOf(def, scene) {
  if (def.role) return def.role;
  if (def.free) return "given";
  if (def.by === "join" && def.of.every((id) => scene.isFree(id))) return "given";
  if (def.kind === "circle" || def.kind === "ray" || def.kind === "line") return "construction";
  return "result";
}

/**
 * Mount the figure into `svg`.
 * `onDrag()` is called after each pointer move that changed the scene.
 * `interactive: false` (index miniatures) draws no drag handles and no grid,
 * and leaves touch scrolling alone; `step` sets the initial step.
 */
export function createFigure({ svg, scene, steps, label, onDrag, interactive = true, step: initialStep = 0 }) {
  const intro = introSteps(steps);
  svg.setAttribute("viewBox", `0 0 ${VIEW.w} ${VIEW.h}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", label);
  svg.classList.add("fig");
  svg.replaceChildren();

  if (interactive) {
    const defs = el("defs", {}, svg);
    const pattern = el("pattern", {
      id: "fig-grid", width: 20, height: 20, patternUnits: "userSpaceOnUse",
    }, defs);
    el("path", { d: "M20 0H0V20", class: "fig-grid" }, pattern);
    el("rect", { x: 0, y: 0, width: VIEW.w, height: VIEW.h, fill: "url(#fig-grid)" }, svg);

    // Fallback for browsers that ignore touch-action on SVG: a non-passive
    // touchmove that cancels scrolling while a finger is on the figure (BUG-004).
    svg.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  }

  const layer = {};
  for (const name of ["fill", "construction", "lines", "points", "labels", "handles"]) {
    layer[name] = el("g", { class: `layer-${name}` }, svg);
  }

  // Build elements.
  const parts = new Map(); // id → { shape, label, handle }
  for (const id of scene.ids) {
    const def = scene.def(id);
    if (!intro.has(id)) continue;
    const role = `role-${roleOf(def, scene)}`;
    const p = {};
    switch (def.kind) {
      case "circle":
        p.shape = el("circle", { class: `fig-circle ${role}` }, layer.construction);
        break;
      case "segment": case "ray": case "line":
        p.shape = el("line", {
          class: `fig-line ${role}`,
        }, def.kind === "segment" && role !== "role-construction" ? layer.lines : layer.construction);
        // A line Heath names by a single letter (I.3's C) carries `label`.
        if (def.label) {
          p.label = el("text", { class: `fig-label ${role}` }, layer.labels);
          p.label.textContent = def.label;
        }
        break;
      case "polygon":
        // A ghost (superposition) is drawn over the lines it lies on.
        p.shape = el("polygon", { class: `fig-poly ${role}` }, role === "role-ghost" ? layer.lines : layer.fill);
        break;
      case "angleMark":
        p.shape = el("path", { class: `fig-angle ${role}` }, layer.lines);
        break;
      case "point": {
        const naming = def.mark === "label";
        if (!naming) p.shape = el("circle", { r: POINT_R, class: `fig-point ${role}` }, layer.points);
        // `label: ""` hides the letter (the unnamed ends of I.3's line C).
        const text = def.label ?? id;
        if (text) {
          p.label = el("text", { class: `fig-label ${role}${naming ? " is-naming" : ""}` }, layer.labels);
          p.label.textContent = text;
        }
        if (def.free && interactive) p.handle = makeHandle(id);
        break;
      }
    }
    parts.set(id, p);
  }

  // ── Drag ──────────────────────────────────────────────────────────
  function toSvg(e) {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return {
      x: Math.min(VIEW.w - POINT_R, Math.max(POINT_R, pt.x)),
      y: Math.min(VIEW.h - POINT_R, Math.max(POINT_R, pt.y)),
    };
  }

  function snap(id, P) {
    for (const other of scene.ids) {
      if (other === id || !scene.isFree(other)) continue;
      const Q = scene.value(other);
      if (dist(P, Q) < SNAP) return { x: Q.x, y: Q.y };
    }
    return P;
  }

  function makeHandle(id) {
    // Pointer only for now; keyboard dragging belongs to F-009.
    const h = el("circle", { r: HANDLE_R, class: "fig-handle", "data-id": id }, layer.handles);
    let active = null;
    h.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      active = e.pointerId;
      h.setPointerCapture(e.pointerId);
      h.classList.add("is-dragging");
    });
    h.addEventListener("pointermove", (e) => {
      if (e.pointerId !== active) return;
      const P = toSvg(e);
      if (P && scene.move(id, snap(id, P))) {
        update();
        onDrag?.();
      }
    });
    const end = (e) => {
      if (e.pointerId !== active) return;
      active = null;
      h.classList.remove("is-dragging");
    };
    h.addEventListener("pointerup", end);
    h.addEventListener("pointercancel", end);
    return h;
  }

  // ── Update ────────────────────────────────────────────────────────
  let step = initialStep;

  function labelCentre() {
    // Centroid of all drawn, non-naming points: labels sit away from it.
    let sx = 0, sy = 0, n = 0;
    for (const id of scene.ids) {
      const def = scene.def(id);
      const v = scene.value(id);
      if (def.kind !== "point" || def.mark === "label" || !v || !intro.has(id)) continue;
      sx += v.x; sy += v.y; n++;
    }
    return n ? { x: sx / n, y: sy / n } : { x: VIEW.w / 2, y: VIEW.h / 2 };
  }

  function update() {
    const G = labelCentre();
    for (const [id, p] of parts) {
      const def = scene.def(id);
      const v = scene.value(id);
      let visible = v !== null && step >= intro.get(id);
      if (visible) visible = draw(def, v, p, G) !== false;
      for (const e of [p.shape, p.label, p.handle]) e?.classList.toggle("is-hidden", !visible);
    }
  }

  function draw(def, v, p, G) {
    switch (def.kind) {
      case "circle":
        setAttrs(p.shape, { cx: v.O.x, cy: v.O.y, r: v.r });
        return v.r > 0;
      case "segment":
        setAttrs(p.shape, { x1: v.A.x, y1: v.A.y, x2: v.B.x, y2: v.B.y });
        if (p.label) placeLabel(p.label, { x: (v.A.x + v.B.x) / 2, y: (v.A.y + v.B.y) / 2 }, G);
        return true;
      case "ray": case "line": {
        const d = dist(v.A, v.B);
        if (d === 0) return false;
        const ux = (v.B.x - v.A.x) / d, uy = (v.B.y - v.A.y) / d;
        const back = def.kind === "line" ? FAR : 0;
        setAttrs(p.shape, {
          x1: v.A.x - back * ux, y1: v.A.y - back * uy,
          x2: v.A.x + FAR * ux, y2: v.A.y + FAR * uy,
        });
        return true;
      }
      case "polygon":
        p.shape.setAttribute("points", v.P.map((q) => `${q.x},${q.y}`).join(" "));
        return true;
      case "angleMark":
        p.shape.setAttribute("d", anglePath(v));
        return true;
      case "point": {
        p.shape && setAttrs(p.shape, { cx: v.x, cy: v.y });
        p.handle && setAttrs(p.handle, { cx: v.x, cy: v.y });
        if (p.label) placeLabel(p.label, v, G);
        return true;
      }
    }
    return true;
  }

  // Labels sit LABEL_OFFSET away from P, on the side away from the centre G.
  function placeLabel(label, P, G) {
    const dx = P.x - G.x, dy = P.y - G.y;
    const d = Math.hypot(dx, dy);
    const [ux, uy] = d > 1e-9 ? [dx / d, dy / d] : [0, -1];
    setAttrs(label, { x: P.x + LABEL_OFFSET * ux, y: P.y + LABEL_OFFSET * uy });
  }

  function anglePath({ A, V, B }) {
    const r = 24;
    const a1 = Math.atan2(A.y - V.y, A.x - V.x);
    const a2 = Math.atan2(B.y - V.y, B.x - V.x);
    let sweep = a2 - a1;
    while (sweep <= -Math.PI) sweep += 2 * Math.PI;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    const x1 = V.x + r * Math.cos(a1), y1 = V.y + r * Math.sin(a1);
    const x2 = V.x + r * Math.cos(a2), y2 = V.y + r * Math.sin(a2);
    return `M${x1} ${y1}A${r} ${r} 0 0 ${sweep > 0 ? 1 : 0} ${x2} ${y2}`;
  }

  update();

  return {
    /** Show objects introduced at or before step `i`. */
    setStep(i) {
      step = i;
      update();
    },
    update,
  };
}
