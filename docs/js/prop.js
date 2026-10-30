// prop.js — proposition page bootstrap (F-004).
//
// Reads ?p=NN, imports data/props/NN.js, builds the scene, and wires the
// figure, stepper and readout. Out-of-range or missing p → index
// (SPEC §URLs); a proposition whose data file does not exist yet gets a
// notice instead of a broken page.

import { createScene } from "./scene.js";
import { createFigure, introSteps } from "./render.js";
import { createStepper } from "./stepper.js";
import { createReadout } from "./readout.js";

const TOTAL = 48;
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

function propLinks(n) {
  const links = $("prop-links");
  links.replaceChildren();
  if (n > 1) {
    const a = document.createElement("a");
    a.href = `prop.html?p=${n - 1}`;
    a.textContent = "◂ PREV PROP";
    links.append(a);
  }
  if (n < TOTAL) {
    const a = document.createElement("a");
    a.href = `prop.html?p=${n + 1}`;
    a.textContent = "NEXT PROP ▸";
    links.append(a);
  }
}

function notice(n, message) {
  document.title = `I.${n} · Stoicheia`;
  $("prop-title").textContent = `Proposition I.${n}`;
  $("prop-brief").replaceChildren();
  const main = $("prop-main");
  const p = document.createElement("p");
  p.className = "notice";
  p.textContent = message;
  main.replaceChildren(p);
  $("transport-controls").hidden = true;
}

function brief(data) {
  const el = $("prop-brief");
  el.replaceChildren();
  const parts = [];
  if (data.brief?.given) parts.push(`GIVEN: ${data.brief.given}`);
  if (data.brief?.required) parts.push(`REQUIRED: ${data.brief.required}`);
  parts.forEach((t, i) => {
    if (i) {
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "·";
      el.append(sep);
    }
    el.append(t);
  });
}

async function main() {
  const raw = new URLSearchParams(location.search).get("p");
  const n = Number(raw);
  if (raw === null || !Number.isInteger(n) || n < 1 || n > TOTAL) {
    location.replace("index.html");
    return;
  }

  $("prop-badge").textContent = `BK I · PROP ${pad(n)} / ${TOTAL}`;
  propLinks(n);

  let data;
  try {
    data = (await import(`../data/props/${pad(n)}.js`)).default;
  } catch {
    notice(n, `Proposition I.${n} is not built yet.`);
    return;
  }

  let scene;
  try {
    scene = createScene(data.objects);
  } catch (err) {
    // Malformed data is an authoring error; show it rather than a blank page.
    notice(n, `Proposition I.${n} could not be loaded: ${err.message}`);
    return;
  }

  document.title = `I.${n} · ${data.short} · Stoicheia`;
  $("prop-title").textContent = data.title;
  brief(data);

  const intro = introSteps(data.steps);
  const readout = createReadout({
    scene, data, intro,
    els: { grid: $("readout-grid"), status: $("readout-status") },
  });
  const figure = createFigure({
    svg: $("figure-svg"),
    scene,
    steps: data.steps,
    label: `Proposition I.${n}: ${data.title} Construction revealed step by step; the given points can be dragged.`,
    onDrag: () => readout.update(),
  });
  createStepper({
    steps: data.steps,
    els: {
      label: $("step-label"), title: $("step-title"), text: $("step-text"),
      note: $("step-note"), cite: $("step-cite"),
      prev: $("step-prev"), next: $("step-next"),
      pips: $("step-pips"), names: $("step-names"),
    },
    onChange: (i) => {
      figure.setStep(i);
      readout.setStep(i);
    },
  });
}

main();
