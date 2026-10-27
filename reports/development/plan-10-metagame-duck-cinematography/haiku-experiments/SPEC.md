# Duck view experiment spec (shared by all experiment agents)

One molded rubber duck, drawn as five static views. Each experiment redraws ONE view.

## Landmark model (duck-local units, body length ~120; +z = duck front, +y up, +x = duck's left)

- Body: squat rounded ellipsoid, half-width 42, half-length 60, 36 tall above centre / 26 below, flat-ish bottom.
- Head: sphere radius 40, centre (0, 52, 10): nearly as wide as the body, sitting centred over the front half, lower third hidden by overlap with the body.
- Bill: flat spatula (upper + slightly smaller lower mandible) projecting ~15 units from the head front, below the eye line.
- Eyes: dark ovals on the head's sides, ~0.5 head-radius left/right of the face centre, just above the bill line. An eye only exists in a view if its side faces the camera; at grazing angles it is a thin sliver.
- Wings: flattened lobes moulded onto the body sides, ~34 units out, behind mid-body, upper half of the body.
- Tail: small raised flick at the rear top of the body.

## Camera convention (all five views share it)

Azimuth is measured from the duck's front (0 = camera in front), toward the duck's left (+x). Elevation is above the table plane.

| view | azimuth | elevation | what must read |
|---|---|---|---|
| front | 35 | +12 | face turned toward camera, both eyes (far one narrow), bill pointing left-forward, near wing at the right, tail hidden behind |
| side | 90 | +5 | pure profile, bill left, ONE eye, near wing only, tail flick at right |
| rear | 148 | +16 | the BACK of the whole object: nape and back of head, broad back, near wing at left overlapping body, far wing sliver, tail flick near the right edge, NO eyes, bill only a sliver at the far-left head edge |
| high | 35 | +52 | looking down: huge crown circle, bill small and foreshortened pointing down-left, back of body above head in image, both wings, tail peeking over the body; body compressed vertically |
| low | 35 | -16 | looking up: a visible shaded underside plane under the body, head rising above body, bill seen from below, body edge occludes the lower head |

## Guides

`guides/guide-<view>.svg` are computed silhouette guides in the final 360x270 frame (body bottom at y=246, centred x=180). `guides/guides.json` holds each part's path (`body head tail billUp billLo wingNear wingFar eyeNear eyeFar`), the painter order (`drawOrder`, back to front) and visibility facts (`*Facing` > 0 means that surface faces the camera). Parts missing from a view's visible list (eyes) must not be drawn. Guide paths are reference geometry: trace, reshape, simplify, or ignore them. The guides are overlap-agnostic circles/ellipses - an expressive duck needs more than them (see style).

## Style (match D2: solid moulded rubber toy)

- Canvas `viewBox="0 0 360 270"`, content bottom-aligned (lowest point of the body near y=246), at most 4 px margin inside the frame including strokes.
- Palette: body `#f4bc32`, shadow `#dfa52f`/`#c98f22`, highlight `#ffe27c`, wing `#e6a924`, far wing `#dba02a`, bill `#f36e2c`/`#e85e28`, outline `#4b241b` (stroke 6-8 on big shapes, 4-5 on small), eye `#45251f`.
- Restrained: big clear shapes, one soft shadow region per form, one thin highlight along the upper-left rim. No gradients required, no filters, no text, no raster images, no remote references, no animation.
- Light comes from the upper left. Keep one direction in every view.
- Shapes must not leak: shadows are clipped to their form (`<clipPath>`), outlines are continuous, features are attached (bill touches the head, wings sit on the body).
- Static inanimate prop: no expression or anatomy changes.

## Output rules

- Write ONLY inside your own folder (given in your brief). Never edit any other file in the repository.
- Files: `duck.svg` (the redraw: a single standalone `<svg>` with the class-free, inline-attribute styling above so it renders anywhere), `notes.md` (<= 12 lines: what you changed, what still looks wrong), and `render.png` (your last self-check render).
- Self-check renderer (approximate offline rasteriser, not a browser; supports path/ellipse/circle/rect/line, clipPath, translate, fill/stroke attributes; no gradients/masks/filters):
  `python C:/Users/orion/AppData/Local/Temp/claude/C--AI-Quackpot/6ad61cdb-145b-4d6c-9aaa-86e4dc7f5df2/scratchpad/render_svg.py duck.svg render.png 3`
  View the PNG with your image-reading tool and iterate at least 3 times. Judge the whole object, not path tidiness.
