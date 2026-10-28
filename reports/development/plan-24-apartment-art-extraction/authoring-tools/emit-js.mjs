import fs from 'node:fs';
const styled = JSON.parse(fs.readFileSync(process.argv[2] + '/styled.json', 'utf8'));
const meta = {
  front: ['Front three-quarter', 'Camera azimuth 35°, elevation +12°: face turned toward camera, near eye full and far eye a narrow sliver, bill forward-left, near wing on the right, tail hidden behind the head and body.'],
  side: ['Side profile', 'Azimuth 90°, elevation +5°: one eye, bill in profile, only the near wing (it overlaps body and the head’s lower flank), tail flick at the rear.'],
  rear: ['Rear three-quarter', 'Azimuth 148°, elevation +16°: the whole body is turned away — back of the head, no eyes, broad back, near wing at left, tail flick nearest the camera at right, bill reduced to a sliver behind the head.'],
  high: ['High angle', 'Azimuth 35°, elevation +52°: the crown dominates, body compresses behind it, bill foreshortens downward, wings sit on the body flanks, tail peeks over the back.'],
  low: ['Low angle', 'Azimuth 35°, elevation −16°: the base underside is visible, the body edge overlaps the head’s lower half, the bill and chin plane are seen from below.']
};
let js = '// Five static views of ONE rubber duck, baked from a shared landmark model and camera convention\n// (see sonnet-view-repair.md). Same export keys/interface as before; the SVG strings are static.\nexport const views = {\n';
js += Object.keys(meta).map(k => `  ${k}: {\n    label: ${JSON.stringify(meta[k][0])},\n    note: ${JSON.stringify(meta[k][1])},\n    svg: \`${styled[k]}\`\n  }`).join(',\n');
js += '\n};\n';
fs.writeFileSync(process.argv[3], js);
