import fs from 'node:fs';
import { views } from 'file:///<REPO>/reports/development/plan-10-metagame-duck-cinematography/duck-views.js';
for (const [k, v] of Object.entries(views)) {
  for (const mode of ['improve', 'scratch']) fs.mkdirSync(`${k}-${mode}`, { recursive: true });
  const svg = v.svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  fs.writeFileSync(`${k}-improve/start.svg`, svg);
}
