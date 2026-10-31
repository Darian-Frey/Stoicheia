// cite.js — citations in Heath's step text (SPEC.md §Proposition data, F-007).
//
// Heath's text, as transcribed, is the single source of citations
// (IMP-006): a step's footer and a proposition's dependency list (`uses`)
// are both derived from the bracketed citations inline in its steps.
// Pure; no DOM.

const FORMS = [
  { re: /^Def\. (\d+)$/, rank: 0, href: (n) => `defs.html#def-${n}` },
  { re: /^Post\. (\d+)$/, rank: 1, href: (n) => `defs.html#post-${n}` },
  { re: /^C\.N\. (\d+)$/, rank: 2, href: (n) => `defs.html#cn-${n}` },
  { re: /^I\.(\d+)$/, rank: 3, href: (n) => `prop.html?p=${n}` },
];

function parse(cite) {
  for (const f of FORMS) {
    const m = f.re.exec(cite);
    if (m) return { rank: f.rank, n: Number(m[1]), href: f.href(m[1]) };
  }
  return null;
}

/** True if `cite` is in the SPEC grammar: Def. N, Post. N, C.N. N, I.N. */
export function isCitation(cite) {
  return parse(cite) !== null;
}

/** Link target for a citation, or null if it is not in the grammar. */
export function citationHref(cite) {
  return parse(cite)?.href ?? null;
}

/**
 * Split text into plain strings and bracketed citation groups:
 * "a [Post. 1] b" → ["a ", ["Post. 1"], " b"].
 */
export function splitCitations(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]/g)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1].split(/,\s*/));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Citations in text, in order of first appearance, without repeats. */
export function citationsIn(text) {
  const seen = [];
  for (const part of splitCitations(text)) {
    if (Array.isArray(part)) for (const c of part) if (!seen.includes(c)) seen.push(c);
  }
  return seen;
}

/** Canonical order: Def., Post., C.N., then propositions, each by number. */
export function compareCitations(a, b) {
  const pa = parse(a), pb = parse(b);
  if (!pa || !pb) return pa ? -1 : pb ? 1 : a.localeCompare(b);
  return pa.rank - pb.rank || pa.n - pb.n;
}

/** Everything a proposition relies on, derived from its steps' text. */
export function usesOf(data) {
  const all = new Set();
  for (const s of data.steps ?? []) for (const c of citationsIn(s.text ?? "")) all.add(c);
  return [...all].sort(compareCitations);
}
