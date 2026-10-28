// Review tooling: markup comparison helpers used by fidelity-check.mjs and the gallery. Not runtime.

/** Declared ids in document order, with duplicate and dangling-reference reports. */
export function idReport(svg) {
  const declared = [...svg.matchAll(/\bid="([^"]*)"/g)].map(m => m[1]);
  const seen = new Set(), duplicates = [];
  for (const id of declared) { if (seen.has(id)) duplicates.push(id); seen.add(id); }
  const refs = [...svg.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]).concat([...svg.matchAll(/\bhref="#([^"]+)"/g)].map(m => m[1]));
  const missing = [...new Set(refs.filter(r => !seen.has(r)))];
  return { declared, duplicates, missing, refCount: refs.length };
}

/**
 * Bijective id normalisation: the n-th distinct declared id becomes `id{n}`; every reference follows its
 * declaration. Duplicate declarations and dangling references are left visibly broken (a duplicate keeps
 * its first token; a missing reference becomes `MISSING(name)`), so the comparison still detects them.
 */
export function normalizeIds(svg) {
  const map = new Map();
  for (const m of svg.matchAll(/\bid="([^"]*)"/g)) if (!map.has(m[1])) map.set(m[1], `id${map.size}`);
  return svg
    .replace(/\bid="([^"]*)"/g, (_, id) => `id="${map.get(id)}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${map.has(id) ? map.get(id) : `MISSING(${id})`})`)
    .replace(/\bhref="#([^"]+)"/g, (_, id) => `href="#${map.has(id) ? map.get(id) : `MISSING(${id})`}"`);
}

/** null when equal, otherwise a short description of the first difference. */
export function firstDiff(a, b, context = 60) {
  if (a === b) return null;
  let i = 0; const n = Math.min(a.length, b.length);
  while (i < n && a[i] === b[i]) i++;
  return `lengths ${a.length} vs ${b.length}; first difference at ${i}: «${a.slice(Math.max(0, i - context), i + context)}» vs «${b.slice(Math.max(0, i - context), i + context)}»`;
}

/** Compare two markup strings after bijective id normalisation. */
export function compareMarkup(expected, actual) {
  const ne = normalizeIds(expected), na = normalizeIds(actual);
  return { equal: ne === na, diff: firstDiff(ne, na), expectedIds: idReport(expected), actualIds: idReport(actual) };
}

/** Minimal well-formedness checker (tag stack). Parse check only; it proves nothing about SVG semantics. */
export function checkWellFormed(xml) {
  const stack = [], re = /<!--[\s\S]*?-->|<(\/?)([A-Za-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m, last = 0;
  while ((m = re.exec(xml))) {
    if (m[0].startsWith('<!--')) continue;
    const [, close, name, , selfClose] = m;
    if (close) { const top = stack.pop(); if (top !== name) return `mismatched </${name}> (expected </${top}>) near ${m.index}`; }
    else if (!selfClose) stack.push(name);
    last = re.lastIndex;
  }
  if (stack.length) return `unclosed <${stack.at(-1)}>`;
  if (/<[^>]*$/.test(xml.slice(last))) return 'dangling "<"';
  return null;
}
