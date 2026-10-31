// defs.js — definitions, postulates and common notions page (F-011).
//
// Renders data/foundations.js with one stable anchor per entry
// (#def-N, #post-N, #cn-N; SPEC §URLs), the targets of every citation
// link. Each entry lists the built propositions that cite it, derived
// from their step text by cite.js, so the page cannot disagree with them.

import { source, definitions, postulatesIntro, postulates, commonNotions } from "../data/foundations.js";
import { built } from "../data/arcs.js";
import { usesOf } from "./cite.js";

const pad = (n) => String(n).padStart(2, "0");

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Heath's bold terms are marked **…** in the data. */
function renderText(parent, text) {
  text.split("**").forEach((part, i) => {
    if (!part) return;
    parent.append(i % 2 ? h("strong", "term", part) : part);
  });
}

function entry({ id, label, text, citedBy, marker }) {
  const li = h("li", "found-entry");
  li.id = id;
  const num = h("a", "found-num", label);
  num.href = `#${id}`;
  li.append(num);
  const body = h("div", "found-body");
  const p = h("p", "found-text");
  if (marker) p.append(h("span", "found-marker", `[${marker}] `));
  renderText(p, text);
  body.append(p);
  if (citedBy.length) {
    const cited = h("div", "found-cited");
    cited.append("Cited in ");
    citedBy.forEach((n, i) => {
      if (i) cited.append(", ");
      const a = h("a", null, `I.${n}`);
      a.href = `prop.html?p=${n}`;
      cited.append(a);
    });
    body.append(cited);
  }
  li.append(body);
  return li;
}

function section(id, title, intro, items) {
  const s = h("section", "panel found-section");
  s.setAttribute("aria-labelledby", id);
  const head = h("h2", "found-head", title);
  head.id = id;
  s.append(head);
  if (intro) s.append(h("p", "found-intro", intro));
  const ol = h("ol", "found-list");
  for (const it of items) ol.append(entry(it));
  s.append(ol);
  return s;
}

async function citations() {
  // citation string → proposition numbers citing it
  const map = new Map();
  for (const n of built) {
    try {
      const data = (await import(`../data/props/${pad(n)}.js`)).default;
      for (const c of usesOf(data)) {
        if (!map.has(c)) map.set(c, []);
        map.get(c).push(n);
      }
    } catch {
      // A data file that fails to load only loses its "Cited in" links.
    }
  }
  return map;
}

async function main() {
  const src = document.getElementById("defs-source");
  src.append(`${source.work}, pp. ${source.pages} · `);
  const scan = h("a", null, "scan");
  scan.href = source.scan;
  src.append(scan);

  const cited = await citations();
  const by = (c) => cited.get(c) ?? [];
  const main = document.getElementById("defs-main");

  main.append(section("defs-head", "Definitions", null, definitions.map((d) => ({
    id: `def-${d.n}`, label: `Def. ${d.n}`, text: d.text, citedBy: by(`Def. ${d.n}`),
  }))));
  main.append(section("posts-head", "Postulates", postulatesIntro, postulates.map((p) => ({
    id: `post-${p.n}`, label: `Post. ${p.n}`, text: p.text, citedBy: by(`Post. ${p.n}`),
  }))));
  const cn = section("cn-head", "Common Notions", null, commonNotions.map((c) => ({
    id: `cn-${c.n}`, label: `C.N. ${c.n}`, text: c.text, citedBy: by(`C.N. ${c.n}`), marker: c.heiberg,
  })));
  cn.append(h("p", "found-note",
    "The bracketed [7] and [8] are printed by Heath beside Common Notions 4 and 5: their numbers in Heiberg's Greek text."));
  main.append(cn);

  // Entries are built after load, so the browser's :target never matches
  // them; mark the anchored entry ourselves and follow later hash changes.
  markTarget(true);
  addEventListener("hashchange", () => markTarget(false));
}

function markTarget(scroll) {
  for (const e of document.querySelectorAll(".found-entry.is-target")) e.classList.remove("is-target");
  const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (!el) return;
  el.classList.add("is-target");
  if (scroll) el.scrollIntoView();
}

main();
