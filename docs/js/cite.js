// cite.js — citations in Heath's step text (SPEC.md §Proposition data, F-007).
//
// Heath's text, as transcribed, is the single source of citations
// (IMP-006): a step's footer and a proposition's dependency list (`uses`)
// are both derived from the citations inline in its steps. Heath's own are
// in square brackets, [Def. 15]; citations Stoicheia adds where Heath
// leaves an inference implicit are in braces, {Def. 15} (D-011).
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
 * Split text into plain strings and citation groups:
 * "a [Post. 1] b {Def. 15}" →
 *   ["a ", {cites: ["Post. 1"], added: false}, " b ", {cites: ["Def. 15"], added: true}].
 */
export function splitCitations(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]|\{([^}]+)\}/g)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const added = m[2] !== undefined;
    out.push({ cites: (added ? m[2] : m[1]).split(/,\s*/), added });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Citations in text as {cite, added}, in order of first appearance,
 * without repeats; a citation Heath gives anywhere in the text counts as
 * his, even if Stoicheia also adds it elsewhere.
 */
export function citationEntries(text) {
  const out = [];
  for (const part of splitCitations(text)) {
    if (typeof part === "string") continue;
    for (const cite of part.cites) {
      const seen = out.find((e) => e.cite === cite);
      if (!seen) out.push({ cite, added: part.added });
      else if (!part.added) seen.added = false;
    }
  }
  return out;
}

/** Citations in text, Heath's and added, in order of first appearance, without repeats. */
export function citationsIn(text) {
  return citationEntries(text).map((e) => e.cite);
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
