// Plan 26 check helpers: a small well-formedness checker and an id/reference report for SVG strings.
// (Same approach as the Plan 24 tools, re-implemented here so this folder has no dependency on another report folder.)

export function checkWellFormed(xml) {
  const stack = [], re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/([A-Za-z][\w:.-]*)\s*>|<([A-Za-z][\w:.-]*)((?:\s+[\w:.-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;
  let last = 0, m;
  while ((m = re.exec(xml))) {
    const between = xml.slice(last, m.index);
    if (/[<]/.test(between)) return { ok: false, error: `stray '<' near ${m.index}` };
    last = re.lastIndex;
    if (m[1]) { const top = stack.pop(); if (top !== m[1]) return { ok: false, error: `mismatched </${m[1]}> (open: ${top}) near ${m.index}` }; }
    else if (m[2] && !m[4]) stack.push(m[2]);
  }
  if (/[<]/.test(xml.slice(last))) return { ok: false, error: 'trailing markup' };
  return stack.length ? { ok: false, error: `unclosed: ${stack.join(',')}` } : { ok: true };
}

export function idReport(...svgs) {
  const all = svgs.join('');
  const ids = [...all.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const refs = [...all.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)].map(m => m[1] || m[2]);
  const known = new Set(ids);
  return { ids: ids.length, duplicates: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))], dangling: [...new Set(refs.filter(r => !known.has(r)))] };
}
