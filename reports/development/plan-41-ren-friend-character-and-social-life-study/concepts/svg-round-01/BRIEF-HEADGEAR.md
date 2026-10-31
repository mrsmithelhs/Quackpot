# Headgear and hair-state addendum (Plan 41, round 2)

Read `BRIEF-COMMON.md` in this folder first and follow it. This addendum adds rules for **hair states and head coverings**. If the two conflict, this one wins for this task.

## Layers and what you may edit

- Start from `_template/ren-base-template.svg` (a fresh copy). Ren wears the template's striped tee and teal overalls in every task here; leave the torso alone **except** where your task says a towel or similar drapes over the shoulders (then you may add shapes to `LAYER-torso` for the part behind the neck and `LAYER-collar` for the part in front of the neck).
- Replace `LAYER-hair` with your drawing. Draw in this order inside it: (1) anything that sits behind the head (for example a hood back or a towel tail), (2) the hair or curls that stay visible, (3) the covering on top. Hair that peeks out from under a covering is drawn **before** the covering so the covering overlaps it.
- **Do not change** the head, face, ears, neck, or the earring group. The gold hoop (viewer's left) and the small stud (viewer's right) should stay visible unless your covering truly hides them; the stud may be hidden by a covering over the right ear.
- The pencil (`<use href="#base-pencil"/>`) rests on top of the viewer's-right ear, tip forward. Keep it **only if** it is still visible and does not collide with your covering (for example it can stay with paint or dust in the hair). Otherwise delete that line.
- There is **no neck tattoo** anymore. Do not add one. Ren's neck is bare skin.

## Key geometry (viewBox 0 0 240 300)

- The head spans about x 70 to 170 and y 52 to 176. The face (eyes, brows, nose, mouth, blush) sits between y 100 and y 165, so keep coverings above y 100 at the front (the forehead may be partly covered, but never the eyes or brows).
- Ears are circles centred near (70, 122) and (170, 122) with radius 10. The base hair is a cloud of circles reaching up to about y 34 and out to x 62 to 182.
- A covering over curly hair is a little bigger than the head silhouette (hair adds volume): it may reach x 56 to 184.

## Style

Same flat vector style as the template: thick dark-brown outline (`l3`), thinner interior lines (`l2`), flat muted fills, no gradients, no text, no logos or lettering (a cap has no logo), no patterns that need external files. Fabrics may have two or three simple fold or seam lines. Hair color is `var(--hair)`; hair clump gaps may use `#1d1411`; damp highlights use `#4a382e`.

## Procedure

Follow the common brief's procedure (render at most 3 times, only your own folder, no git, no Node). Write `<task-id>.svg`, `<task-id>-preview.png` and `notes.md` in your output folder. Final message: what you drew, what you could not match from the Gemini cell, and whether it reads clearly at a glance.
