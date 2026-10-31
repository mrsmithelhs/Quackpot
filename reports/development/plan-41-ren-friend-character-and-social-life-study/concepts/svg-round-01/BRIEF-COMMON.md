# Common brief for Ren SVG drawing tasks (Plan 41, round 1)

You are drawing one **concept SVG variation** of the character Ren for a fictional educational browser game. This is report-local concept art, not production art. The art style is already settled; your job is to draw **one** assigned outfit or hair state in that exact style.

## Files

- Template (start from a copy, never edit it): `reports/development/plan-41-ren-friend-character-and-social-life-study/concepts/svg-round-01/_template/ren-base-template.svg` (and its render `ren-base-template.png`, which shows exactly what the unmodified template looks like).
- Gemini concept sheets (inspiration only; they are looser than the template, so **the template wins on style, face, hair and proportions**): `.../concepts/gemini-round-01/outfits/*.png` and `.../hair/hair-01-messy.png`. The task message names the sheet and the cell (a 2x2 grid read top-left, top-right, bottom-left, bottom-right). View it with your Read tool.
- Write **only** inside your own output folder named in the task message. Never edit the template, the Gemini images, other agents' folders, or any other repo file.

## Style rules (match the template exactly)

- Flat vector. A **thick dark-brown outline** `#3a2c26`: use class `l3` (3 px, round joins) on main garment/hair shapes and `l2` (2 px) on inner details. Flat fills only. **No gradients, filters, patterns defined in `<defs>` that need external files, text, `<image>`, `<foreignObject>`, scripts or external references.**
- The palette is muted: denim teal `#4f6d7a`, cream `#f1e3c8`, terracotta `#c76b3d`, olive `#6b7b4a`, mustard `#c8923a`, warm browns, gold `#d9a441`. Add other muted colors only when the task needs them.
- The viewBox is `0 0 240 300`. The bottom edge (y = 300) cuts the figure at the chest/waist, so garment shapes simply run off the bottom. Keep everything inside x 6 to 234.
- The template's layers: `LAYER-torso` (clothing behind the neck), `LAYER-collar` (parts in front of the neck but behind the head/chin, such as scarves, turtlenecks, collars), `LAYER-hair`, then the tattoo, earrings and pencil. **Do not change** the head, face, ears, neck, earrings or skin. Skin comes from classes `skin`/`shade`, so reuse those classes for any arms or neck you draw.
- Sleeves and arms: at this crop, upper arms may appear at the left and right edges. If a garment is short-sleeved or sleeveless, draw bare skin (`class="skin l3"`) below the sleeve to the bottom edge. Long sleeves simply continue to the bottom edge.
- The tiny sprout tattoo sits on the right side of the neck (viewer's right) around x 131 to 153, y 188 to 212. **Keep it visible** unless the garment genuinely covers that spot (a turtleneck), in which case delete the `<use href="#base-tat"/>` line.
- Unique ids: prefix every new `id` with your task id so ids never collide when files are combined.
- Keep it simple and readable at small size: bold shapes, at most a few interior detail lines. No logos, brand marks, lettering, or readable symbols. No stereotyped or costume-like cultural cues.
- Ren is androgynous: keep the garments ordinary and neutral.

## Procedure

1. Copy the template to your output path and edit the copy.
2. View the Gemini cell named in your task, then draw it in the template's style. Where the Gemini sheet and the template disagree on style, follow the template.
3. Render a preview to check it. You may render at most **3 times** total with a headless local browser, using your own temporary profile folder so you never collide with other agents (replace NAME with your task id and use your own output paths):
   `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$TEMP/edge-NAME" --screenshot="<abs path to preview.png>" --window-size=720,900 "file:///<abs path to your svg>"`
   Then wait a few seconds, check that the PNG exists, and view it with your Read tool. Fix what is clearly wrong (overlapping layers, garment passing in front of the face, pieces floating off the body, the neck tattoo wrongly hidden or wrongly shown). Do not chase perfection.
4. Do not run Node or any build, do not use git, do not use the network, do not install anything, and do not spawn other agents.
5. Write a short `notes.md` next to your SVG: what you drew (one line), anything you could not draw as specified, any template line you removed (such as the tattoo), and one honest sentence about how it looks at a glance.

## Output (exactly these files in your folder)

- `<task-id>.svg`: the final SVG (standalone, valid, viewBox `0 0 240 300`)
- `<task-id>-preview.png`: your last render
- `notes.md`

Final message: list the files, say whether the render shows the result you intended, and mention any shortcuts. Keep it short.
