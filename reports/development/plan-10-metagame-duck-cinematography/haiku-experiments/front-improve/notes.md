start.svg was a side-three-quarter drawing (raised tail, eye on the side of the head); its geometry was dropped, not patched.
duck.svg is rebuilt from the front guide paths (body, head, wingNear, billUp, billLo, eyeNear, eyeFar); tail and wingFar are hidden by the guide's overlap, so omitted.
Inline fill/stroke attributes only; no classes, gradients, filters or text. Light from upper left.
Body and head have lower-right shade bands clipped to their form; the head casts a contact shadow onto the body.
Wing is clipped to the body silhouette (it poked above the shoulder like an arm before).
Bill is a tapered spatula with an unoutlined base, so it reads as joined to the face.
Iterations: 0 converted baseline, 1 guide geometry, 2 wing clip + spatula bill, 3 bill base taper.
Still wrong: the wing is a flat lobe with a scribbled groove, sitting high against the head.
Still wrong: the near eye sits near face centre, so the 35-degree turn reads weakly; the head looks large against the body.
Still wrong: the lower mandible shows as a dark double line under the upper bill; the far eye is a sliver that reads as a smudge.
Still wrong: body bottom is at y=246 per the guide (~24px below), not the SPEC's 4px margin; I kept the guide frame.
Checked only with the offline renderer, not a browser.
