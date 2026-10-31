// index.js — the 48-card index, grouped by arc (F-010).
//
// Built propositions are links with a miniature of the finished figure,
// drawn from their own data file by the same scene and renderer as the
// proposition page. Unbuilt ones are dimmed placeholders, not links.

import { arcs, props, built } from "../data/arcs.js";
import { createScene } from "./scene.js";
import { createFigure } from "./render.js";

const SVGNS = "http://www.w3.org/2000/svg";
const isBuilt = new Set(built);
const pad = (n) => String(n).padStart(2, "0");

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function card(p) {
  const live = isBuilt.has(p.n);
  const c = h(live ? "a" : "div", `card${live ? "" : " is-unbuilt"}`);
  if (live) c.href = `prop.html?p=${p.n}`;
  else c.setAttribute("aria-disabled", "true");

  const head = h("div", "card-head");
  head.append(h("span", "card-num", `I.${p.n}`));
  head.append(h("span", "card-kind", p.kind === "problem" ? "PROBLEM" : "THEOREM"));
  c.append(head);

  const mini = h("div", "card-mini");
  if (live) {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    mini.append(svg);
    drawMini(p.n, svg);
  } else {
    mini.append(h("span", "card-pending", "NOT YET BUILT"));
  }
  c.append(mini);

  c.append(h("span", "card-title", p.short));
  return c;
}

async function drawMini(n, svg) {
  try {
    const data = (await import(`../data/props/${pad(n)}.js`)).default;
    const scene = createScene(data.objects);
    createFigure({
      svg, scene, steps: data.steps, label: "",
      interactive: false, step: data.steps.length - 1,
    });
    svg.removeAttribute("role");
    svg.removeAttribute("aria-label");
  } catch {
    // A miniature that cannot be drawn leaves the card usable without it.
    svg.remove();
  }
}

function main() {
  const root = document.getElementById("index-main");
  document.getElementById("index-brief").textContent =
    `48 propositions · ${built.length} built · drag the givens, step through the construction`;
  for (const arc of arcs) {
    const section = h("section", "arc");
    section.setAttribute("aria-labelledby", `arc-${arc.id}`);
    const head = h("h2", "arc-head");
    head.id = `arc-${arc.id}`;
    head.append(h("span", "arc-label", arc.label));
    head.append(h("span", "arc-range", `I.${arc.from}–I.${arc.to}`));
    section.append(head);
    const grid = h("div", "cards");
    for (let n = arc.from; n <= arc.to; n++) grid.append(card(props[n - 1]));
    section.append(grid);
    root.append(section);
  }
}

main();
