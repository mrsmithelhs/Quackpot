// Plan 26 report-local SVG insertion. Prototype tooling only (not an effects API): every insertion names an exact anchor in the
// kit's finished output and fails if the anchor is missing or matches more than once. Inserted content is wrapped in
// <!--p26:begin NAME--> ... <!--p26:end NAME--> markers so tests can remove it again and recover the kit output byte for byte.

export class AnchorError extends Error {}

function matches(svg, anchor) {
  if (typeof anchor === 'string') { const out = []; let i = svg.indexOf(anchor); while (i !== -1) { out.push({ index: i, length: anchor.length }); i = svg.indexOf(anchor, i + anchor.length); } return out; }
  const re = new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g');
  return [...svg.matchAll(re)].map(m => ({ index: m.index, length: m[0].length }));
}

/** Insert `content` before ('before') or after ('after') the single match of `anchor`. */
export function insertAt(svg, { name, anchor, where }, content) {
  const found = matches(svg, anchor);
  if (found.length !== 1) throw new AnchorError(`anchor '${name}' matched ${found.length} times (expected exactly 1)`);
  const at = where === 'after' ? found[0].index + found[0].length : found[0].index;
  return `${svg.slice(0, at)}<!--p26:begin ${name}-->${content}<!--p26:end ${name}-->${svg.slice(at)}`;
}

/** Remove every inserted block again (used by tests to prove the kit output is otherwise untouched). */
export function stripInserted(svg) { return svg.replace(/<!--p26:begin ([\w-]+)-->[\s\S]*?<!--p26:end \1-->/g, ''); }
export function insertedNames(svg) { return [...svg.matchAll(/<!--p26:begin ([\w-]+)-->/g)].map(m => m[1]); }
