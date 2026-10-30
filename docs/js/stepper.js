// stepper.js — step card and transport (F-005, F-007).
//
// Owns the current step index. Renders the step card (title, Heath's text
// with inline citations as links, optional note, citation footer) and the
// transport (◀ ▶, pips, step names). Calls onChange(i) on every change.

const CITE_FORMS = [
  [/^Def\. (\d+)$/, (n) => `defs.html#def-${n}`],
  [/^Post\. (\d+)$/, (n) => `defs.html#post-${n}`],
  [/^C\.N\. (\d+)$/, (n) => `defs.html#cn-${n}`],
  [/^I\.(\d+)$/, (n) => `prop.html?p=${n}`],
];

/** Link target for a citation string (SPEC grammar), or null. */
export function citationHref(cite) {
  for (const [re, href] of CITE_FORMS) {
    const m = re.exec(cite);
    if (m) return href(m[1]);
  }
  return null;
}

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
    let last = 0;
    for (const m of para.matchAll(/\[([^\]]+)\]/g)) {
      p.append(para.slice(last, m.index));
      const span = h("span", "cite");
      appendCitations(span, m[1].split(/,\s*/));
      p.append(span);
      last = m.index + m[0].length;
    }
    p.append(para.slice(last));
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
    if (s.cite === "Given") els.cite.append(h("span", "given", "Given"));
    else if (s.cite) appendCitations(els.cite, s.cite.split(/,\s*/));
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
