# Observatory mechanism: reference and verification

Reference: [Chapter X gameplay](https://www.youtube.com/watch?v=VPXsdWT1pQQ&t=34s).
Scope: the structure and mechanism. The user explicitly excluded the background
and floating scenery. The camera stays locked to the (1,1,1) orthographic view.

## Critical constraint

This is an impossible construction, not a conventional 3D rectangle threaded
through two pillars. Do not weld all apparent joints into one physically coherent
mesh. The user's correction about wrapping around the white pillars is essential.

The detailed video comparison distinguishes TWO frames:

- At 0:34 both long rails of the tall gray frame pass behind the near ivory
  pillar and in front of the rear one.
- At 0:54 that same ordering remains true even though the gray frame is horizontal.
  A normal rigid rectangular frame would intersect the pillars during this turn.
- The low walkway wraps around the pillars: its back rail passes behind both;
  its front rail passes in front of both. It slides lengthwise, without yaw.
- At 1:14 the top arm appears to connect to the shorter pillar. Those surfaces
  occupy different physical depths but their complete faces coincide on screen.

## Frame-by-frame observations used

| Video frame | Observed geometry / movement | Implementation check |
|---|---|---|
| 0:34–0:35 | Gray rectangle vertical; gray doorway points down; top arm extends left; low frame at its rightmost position. Handle has four white rings and one dark recess. | Starting pose, door orientation, handle positions and front/back ordering inspected in browser. |
| 0:39–0:40 | Gray C sections separate and counter-rotate around their horizontal axles. Top arm turns about its vertical axle. Low walkway retains its heading while moving left. | Reversed the earlier incorrect rotation signs; replaced lower-frame yaw with an X slide. |
| 0:54 | Gray rectangle horizontal. Gray rails remain between the pillars. Low frame is about halfway through its slide. Top arm points away/right. | Enlarged the reference crossing area; corrected gray rail depth throughout rotation and world-oriented face shading. |
| 1:04 | Intermediate counter-rotation appears again while the traveler reaches the lower walkway. | Rechecked the separation and the absence of lower-frame yaw. |
| 1:14 | Gray frame vertical again; gray doorway upright; low walkway at leftmost position; top arm joins the shorter pillar visually. | Derived arm reach and pillar height relation mathematically; checked the whole docking face. |
| 1:24 | Return rotation, with the traveler on a differently oriented gray walking face. | Confirms that the visible walking surface is not restricted to world-up. Character walking is outside this implementation. |

## How the optical construction works

Equal world translation along X/Y/Z is invisible to the locked camera. Each gray
rail undergoes its rigid rotation, then receives a camera-ray depth correction
that keeps it between the pillars. All eight projected beam corners remain exactly
where the uncorrected rigid rotation would put them. This preserves the visible
motion while making the crossing impossible in ordinary space. Closing posts are
separate rigid pieces. Internal end caps are hidden when the split rails meet.

The low walkway's rear rail is offset behind the rear pillar along the same null
direction. Its apparent corner connections remain continuous throughout its slide.
Both door thresholds are solved against the projected front walkway edge.

At the top-arm half-turn, its end underside and the short pillar's top differ by
(gap, gap, gap), where gap is the pillars' depth separation. Every corner projects
identically, although their world-space centers are more than two units apart.

## Automated verification

From the app directory run `node scripts/check-observatory.mjs`.

The test checks initial overlap order, split-rail quarter-turn joins, all four
corners of the impossible top-arm dock, both door thresholds, and 361 samples of
single-axis rigid rotation, gray/pillar clearance, projected beam-corner invariance,
linear lower-walkway travel, and lower-frame optical joins.

## Limits of this verification

The measured poses and overlap relationships are checked; this is not a claim of
pixel-perfect reconstruction or identical game internals. The cosine slide curve
is an inference from the observed endpoints and intermediate positions. Transition
timing is authored for the prototype, not copied from the player's variable drag
speed. Door opening/closing, character traversal, button activation and the rest
of the level are not implemented. The model is intentionally view-dependent.
