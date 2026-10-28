import fs from 'node:fs';
import { views } from 'file:///<REPO>/reports/development/plan-10-metagame-duck-cinematography/duck-views.js';
let n = 0; fs.mkdirSync(process.argv[2], { recursive: true });
for (const [k, v] of Object.entries(views)) {
  const suffix = `-i${++n}`;
  const s = v.svg.replace(/\bid="([^"]+)"/g, (_, id) => `id="${id}${suffix}"`).replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}${suffix})`).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  fs.writeFileSync(`${process.argv[2]}/${k}.svg`, s);
  console.log(k, v.label, s.length, 'ids', (s.match(/\bid="/g) || []).length);
}
