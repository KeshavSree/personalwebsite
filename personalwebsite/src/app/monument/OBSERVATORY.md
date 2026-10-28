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

Equal world translation along X/Y/Z is invisible to the locked camera. The gray
structure is rendered as genuinely connected rigid pieces in a separate transparent
render target, with shared world-oriented face tones. Its image is then composited
onto an XY depth plane between the ivory pillars, using the same locked camera.
Every pixel keeps its screen position, while ordinary scene depth correctly puts
the near pillar in front and the rear pillar behind it.

This separate pass is essential for the corner shading. Moving individual beams
along the camera ray preserved their silhouettes but exposed overlapping side faces
at the left doorway and right handle corners. Recoloring those faces alone could
not fix their false boundaries. Connected geometry now supplies continuous top
surfaces, and only the final image receives the impossible depth. Internal end caps
are hidden when the split rails meet. The render target resizes with the physical
drawing buffer and resolves multisample coverage before compositing.

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
single-axis rigid rotation, composited gray/pillar depth order, projected beam-corner invariance,
linear lower-walkway travel, and lower-frame optical joins.

## Limits of this verification

The measured poses and overlap relationships are checked; this is not a claim of
pixel-perfect reconstruction or identical game internals. The cosine slide curve
is an inference from the observed endpoints and intermediate positions. Transition
timing is authored for the prototype, not copied from the player's variable drag
speed. Door opening/closing, character traversal, button activation and the rest
of the level are not implemented. The model is intentionally view-dependent.

## Building integration and illustration styling

The illustration in `public/monument-valley-art/fold.png` supplies the pink stone,
ivory landings, teal dome, broad undecorated faces, and genuine arched openings.
The upright path is rose, the rotating frame is turquoise, and the sliding ring
is ivory. Invented pinstripes, outlined windows, inlays and paving grids have been
removed, along with their `ObservatoryDetail` decorator. The upright shafts now
have actual arched apertures outside the critical optical crossing zone.

### Gameplay studied for this pass

- [Water Palace, Chapter IV](https://www.youtube.com/watch?v=dZlbMXO2CEY):
  inspected the building at 0:55, 1:10 and 1:25. Stairs, walls, terraces and
  openings belong to the same building; the moving routes reconnect its levels.
  Its changing viewpoint is NOT adopted: our camera remains locked.
- [The Labyrinth, Chapter VI](https://www.youtube.com/watch?v=nAQz8YPCI-k):
  inspected the early lift at approximately 0:10 and 0:25, then the castle
  at approximately 4:00, 4:14, 4:24, 4:29 and 4:34. The castle provides the
  relevant model: a vertical moving section closes the height gap to a door.

These observations guide the connections, rather than asserting that this is
another exact reconstruction of a particular level. The original Chapter X
mechanism retains its dimensions, axles, rotation signs, and optical compositor.

### Actual connections

`ObservatoryArchitecture.ts` receives the mechanism dimensions so its landings
are derived from the same geometry:

- The courtyard lift's right edge docks against the ivory ring's left edge in
  the starting configuration. At the half-turn it descends to the courtyard.
  At quarter-turns it meets a permanent intermediate gallery.
- The gallery runs around the central uprights and ends at the second lift.
  That lift rises to the outer corner of the turquoise frame in BOTH horizontal
  configurations. Its entire docking edge coincides in the locked projection.
- The lifts are open arched pavilions with ivory walking roofs. Six overlapping,
  rigid stone stages translate vertically beneath each pavilion; no mesh scales
  during animation. The right station has a permanent foundation buttress.

The two lift motions are phased to the existing turn angle. Their cosine/squared
sine timing is authored for this scene; it is not a measurement of the game.
The cap pavilion remains attached to its original Y axle. The courtyard, arcade,
and gallery are fixed. The camera is fixed during every transition.

### Verification

The existing 361-sample geometry sweep now also checks both lift landing edges,
the middle-gallery elevation, rigid stage dimensions, vertical-only translation,
continuous stage overlap, and clearance of the split-frame seams. Browser review
covers the four stops and an intermediate transition. Character traversal is
still not implemented; these are architectural connections, not a playable route.

## Integral moving architecture

The next pass extends the existing turquoise C bodies, without adding axles or
changing the static palace:

- A fourteen-tread flight and continuous stone stringer belong to the left C.
  The flight runs beside the frame with full-width return landings at both ends,
  avoiding the solid upper beam. The cream treads rotate with the body, including
  sideways and inverted orientations.
- A deep arched passage fills the right C between its existing rails. It rotates
  oppositely about the existing X axle. Its opening becomes a horizontal well at
  quarter-turns and an inverted arch at the half-turn.
- Both additions use the existing optical rendering pass. They inherit the
  frame's impossible ordering between the uprights; they introduce no separate
  depth swap or hidden teleport. The original split joints remain exposed.

The geometry sweep checks actual stair landing edges over 361 angles, fixed
local transforms, and walking-surface normals through the full rotation.
All four poses were inspected in the browser. This extends the existing illusion;
it does not add a new independent impossible junction or character traversal.

### Join and shading corrections

The tower docking roof now shares the rotating frame's material, full beam
thickness, and optical render pass. Testing only the top edge missed a false
side face caused by mixing world depth with composited depth. All four corners
of the full docking face are now checked in both horizontal configurations.
Handle rims are confined to the middle of the end face, clear of both docks.

The turquoise material uses one world-normal shading rule for every piece.
Stair tread caps replace the top .044 units of their stone body instead of
occupying the same face. Stair landings butt against the ring, with matching
thickness, rather than overlapping it. Gallery slabs have exact footprints;
their supports stop at the slab underside, eliminating coplanar pink/ivory
surfaces along the route.

## Open foundation and square supports

The baseplate, perimeter foundation walls, edging, water channel, and planting
attached to that ground plane are removed. Gallery supports now have equal X/Z
cross-sections, as do both lift shafts. The elevated gallery routes and docking
coordinates remain in place. The right lift roof is tan, as requested, while
retaining the frame's optical depth pass. The rear tower sleeve and shaft now
share the same peach material. Supports terminate at the previous foundation
height; they do not extend infinitely.

Both lift roofs now use the same square footprint as their shafts and window
sections, without overhangs or narrowed lower stages. Their centers are derived
from the docking edges so shrinking the roofs does not open gaps. The left lift
now lowers only to gallery height; its former descent to the removed courtyard
and the extra shaft length that required have been eliminated.

## Home and its shared lift route

The initial view is a fifth Home pose. The ivory rectangle's underside rests
at `galleryTop`; the upright turquoise frame's bottom rail rests at the ivory
walking elevation. Its orientation matches Position 1. All poses use the same
optical branch and compositor, avoiding depth-order changes during the lift.

`setObservatoryHomeTransition` raises the two frames together over 3.2 seconds,
with the turquoise frame traveling farther to open clearance continuously.
The endpoint is exactly Position 1. `ObservatoryMotion` then selects the shortest
existing turn to the requested orientation. Returning Home uses the reverse
route: turn to Position 1, then lower the frames. Each leg eases in and out.
New requests received during movement take effect at the next leg boundary,
so retargeting cannot teleport geometry or interrupt a checked path.

The Home link and four category links expose all destinations: Work is
Position 1, Projects is Position 2, Involvement is Position 3, and About is
Position 4. Reduced-motion mode settles each leg
immediately. The geometry check samples the lift at 241 points, checks both
frames against the gazebo pavilions, verifies the contact elevations, and
checks every outbound and return route alongside the original turn checks.

The courtyard tower also supplies a depth-only silhouette mask to the turquoise
pass. This makes the stair disappear behind the tower during the Home lift while
the tower remains behind the ivory path. The mask shares the shaft geometry and
tracks its transforms; it does not participate in shadow casting or move any
visible geometry.

Home also retracts both central shafts into the fog, retaining the scale of their
windows and pavilion. The upper bridge keeps its length, turns halfway around,
and places its walking surface flush with the blue upper rail in the locked
projection. Its height and angle ease back together during the shared lift.
The blue closing post aligns with the ivory
back-right corner. These Home offsets interpolate away during the shared lift;
the original four stops restore their exact tower and frame transforms.

In Home the rear tower retracts below the blue silhouette. The right gallery
and its gazebo rise together until their front edge meets the blue upper walking
surface; the left gazebo floor meets the top of the bottom stair landing. All three offsets
ease away during the shared lift. The central bridge and shaft cast and sample
shadows at their connected position during Home, with a camera-ray correction
that also eases away, rather than painting a separate shadow over the join.

### Portfolio navigation and reading layout

`ObservatoryNavigation.ts` owns the category-to-position mapping and hash links.
`#experience` also resolves to Work for older links. Browser Back/Forward and
direct hash loads update both the reading column and the palace destination.
The Home link returns to the opening pose; the old bottom controls are removed.

Home frames the palace larger and near the center. A separate 1.8-second eased
orthographic camera shift moves it toward 77.5% across and 60.5% down the desktop
viewport and reduces its zoom to .864 when a category opens (20% above the
previous category framing). The diagonal pan and
pullback settle the palace toward the bottom-right beside the left reading column.
This framing does not alter any mesh,
shaft contact, or motion route. Changing destinations during the camera shift
starts from the current framing; the structure still completes its checked
mechanical animation legs. Reduced motion settles the framing immediately.
The Home zoom also follows shaft retraction, keeping the full-height spire in
view during the return turn before enlarging the lowered Home structure.

The opening title is “Who is Keshav Sreekantham?” on one line, with the original
typing answers below it: 80ms per character, a 2600ms hold, and 40ms deletion.
Reduced motion shows a static answer. The old site's LinkedIn and GitHub icons,
an email envelope, and Resume sit directly beneath the Home category list.
The separate name heading and navigation caption are removed. The floating traveler
is removed, and the purple window is a child of the front shaft so it travels
with the shaft throughout the Home transition.

The server renders `ObservatoryContent.tsx` from the existing Work, Projects,
Involvement, and About data sources. It preserves the original visible copy,
headings, media, and links. Only the selected section is mounted in the reading
column, which scrolls independently from the palace. At phone widths the palace
sits above a full-width reading area. Golden hover grain and sparkles remain on
the category links.

The same keyed category links morph between the Home stack and the horizontal
reading navigation with Framer Motion layout projection. Each link, numeral,
and label retains its element and moves/resizes over 1.1 seconds; Home reverses
the layout. Reduced motion settles it immediately. Social icons and Resume use
the same light gold as the category labels.

`node scripts/check-observatory-content.mjs` checks verbatim authored text across
all four rendered sections and verifies their navigation destinations. The
existing geometry sweep continues to check all mechanical routes separately.

Home's top-right GitHub strip preserves the original rose tiles, sideways
“Github!” label, oldest-to-newest week order and centered plain Scroll hint.
Native scrolling starts at the newest bottom edge, parked 170px from the top.
Scrolling upward goes back in time and pulls that edge down by the actual scroll
distance. The prompt is not clickable and there is no expand/collapse button.
The right gazebo, gallery and outer wings descend at staggered rates driven by
that scroll distance, spread over 1.7 viewport lengths with earlier staggered starts; the blue passage slides along its negative X ground axis, diagonally upper-left in the isometric view, with its world height fixed. Scrolling back
to the newest weeks restores the palace. Additive offsets reset before any
Home/category mechanical pose changes and do not alter the category stops.
The strip hides at phone widths and respects reduced motion.

The compositor updates scene matrices explicitly around its connected-shadow
and optical passes, sharing those transforms across depth/color renders. During
camera, mechanism or history motion, rendering caps DPR at 1.5 (versus up to 2
at rest); the full-resolution frame returns as soon as motion settles. Camera
projection is updated once per rendered animation frame. The Home typing answer
uses a slightly larger 24–32px responsive size.

Work entries now show one concise summary paragraph from `work.json`, retaining
all impact numbers from the original highlights. Other sections retain verbatim
copy. The content check verifies the summaries and preservation of each metric.

Involvement rows link into a focused detail view within the same reading column,
using `#involvement/<slug>`. Selecting a row replaces the list; the palace and
main menu stay mounted. A back link, Escape, and browser history return to the
list and restore its scroll position and focused entry. Direct links are supported.
All full organization copy is server-authored and preserved in the detail view.
Top navigation hover auras and particle drift run downward; Home retains its
horizontal aura.
Logo sources are purduestack.org/assets/graphic-logo-BIWetStM.png,
mlpurdue.com/_astro/mlp.6d6565a9.png and Purdue Bands' public 192px drum mark.

Work has a face-aligned white inscription on the blue upper beam. Its transparent
texture uses solid pure-white letters with a soft white halo, without shading
or a recessed bevel. The plane is a child of the right axle and shares its optical render
layer, depth occlusion and motion. It fades in only at the settled Work pose and
fades out on departure; its texture, geometry and material are disposed on teardown.

Projects and Involvement share `ObservatoryEntryBrowser.tsx` for list-to-detail
navigation, focus restoration and browser history. Project previews show only
titles and descriptions. Their `#projects/<id>` detail views mount dates, tools,
external links, awards and media; embeds are absent from the preview list.
