// stepper.js — step card and transport (F-005, F-007).
//
// Owns the current step index. Renders the step card (title, Heath's text
// with inline citations as links, optional note, citation footer) and the
// transport (◀ ▶, pips, step names). Calls onChange(i) on every change.
// The footer is derived from the citations in the step's own text
// (IMP-006); a step with `given: true` shows "Given" instead.

import { citationHref, citationsIn, splitCitations } from "./cite.js";

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Append "[a, b]" with each citation linked. */
function appendCitations(parent, list) {
  parent.append("[");
  list.forEach((c, i) => {
    if (i) parent.append(", ");
    const href = citationHref(c);
    if (href) {
      const a = h("a", null, c);
      a.href = href;
      parent.append(a);
    } else {
      parent.append(c);
    }
  });
  parent.append("]");
}

/** Render step text: "\n" separates paragraphs; [..] are citations. */
function renderText(container, text) {
  container.replaceChildren();
  for (const para of text.split("\n")) {
    const p = h("p");
    for (const part of splitCitations(para)) {
      if (typeof part === "string") {
        p.append(part);
      } else {
        const span = h("span", "cite");
        appendCitations(span, part);
        p.append(span);
      }
    }
    container.append(p);
  }
}

export function createStepper({ steps, els, onChange }) {
  const last = steps.length - 1;
  let current = 0;

  els.pips.replaceChildren();
  const pips = steps.map((s, i) => {
    const b = h("button", "pip");
    b.type = "button";
    b.setAttribute("aria-label", `Go to step ${i}: ${s.title}`);
    b.addEventListener("click", () => go(i));
    els.pips.append(b);
    return b;
  });

  els.names.replaceChildren();
  const names = steps.map((s, i) => {
    if (i) els.names.append(h("span", "sep", "·"));
    const span = h("span", null, s.short ?? s.title);
    els.names.append(span);
    return span;
  });

  els.prev.addEventListener("click", () => go(current - 1));
  els.next.addEventListener("click", () => go(current + 1));

  function render() {
    const s = steps[current];
    els.label.textContent = `STEP ${current} / ${last}`;
    els.title.textContent = s.title;
    renderText(els.text, s.text);
    els.note.textContent = s.note ?? "";
    els.cite.replaceChildren();
    const cites = citationsIn(s.text);
    if (s.given) els.cite.append(h("span", "given", "Given"));
    else if (cites.length) appendCitations(els.cite, cites);
    pips.forEach((b, i) => {
      b.classList.toggle("is-done", i <= current);
      if (i === current) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    names.forEach((n, i) => n.classList.toggle("is-current", i === current));
    els.prev.disabled = current === 0;
    els.next.disabled = current === last;
  }

  function go(i) {
    const next = Math.max(0, Math.min(last, i));
    if (next === current) return;
    current = next;
    render();
    onChange?.(current);
  }

  render();

  return {
    get step() { return current; },
    go,
  };
}
