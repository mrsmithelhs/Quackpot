// Minimal static close-up page builder (no Node server): writes closeup.html for a single bounded Chrome capture.
import { writeFile } from 'node:fs/promises';
import { sonnetKeys } from './keys-study.mjs';
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#8c6a4e;font:12px system-ui;color:#fff">
<div style="display:flex;gap:24px;align-items:flex-end;padding:16px">
<div style="width:600px">${sonnetKeys()}</div>
<div style="width:96px">${sonnetKeys()}</div><div style="width:48px">${sonnetKeys()}</div></div>
<div style="padding:0 16px">left: 5x close-up; middle: ~96px (proposed desktop); right: ~48px (proposed narrow)</div>`;
await writeFile(new URL('./closeup.html', import.meta.url), html);
