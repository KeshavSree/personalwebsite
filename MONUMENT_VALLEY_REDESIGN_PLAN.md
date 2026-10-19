# Monument Valley portfolio redesign

Status: branch prototype in progress. Branch: `codex/monument-valley-redesign`.

## Brief and non-negotiables

The target is the visual and spatial experience of a Monument Valley level. Visual fidelity is the primary acceptance criterion. A generic isometric illustration with pastel colors does not meet the brief.

- Initial view: Experience, Projects, Involvement, About stacked vertically on the left; a substantial Monument Valley-style architectural composition on the right.
- Selecting a category makes the entire category list smaller and moves it farther LEFT. The words remain horizontal and the list remains vertical.
- The monument stays on the RIGHT. Its architecture transforms through an impossible spatial connection, revealing the selected category's information on that side.
- The menu does not move toward the center. The monument does not move to the left to become a separate sidebar illustration.
- Typography and architecture both closely reference Monument Valley, especially the first game's architectural language. Preserve the user's real portfolio content.
- Implementation is being developed and reviewed on the redesign branch. Publishing and merging remain separate.

## Research and evidence

Primary references consulted:

1. [ustwo's launch essay](https://ustwo.com/blog/monument-valley-out-now/): the team describes influences including Escher, Japanese woodblock prints, architecture, flower arranging, and typographic posters. Restrained art and animation, approachable interaction, and discovery are deliberate design principles.
2. [Official Monument Valley page and screenshot gallery](https://ustwogames.co.uk/our-games/monument-valley/): visually inspected the promotional architecture, wordmark, and gallery. The pale pink/turquoise architectural world is the proposed main reference; the violet tower and green impossible-path compositions demonstrate distinct palette and silhouette families.
3. [Ken Wong's GDC session overview, The Art of Monument Valley](https://www.gdcvault.com/play/1022476/The-Art-of-Monument): identifies the integration of optical illusions, visual art, gameplay, and accessible interaction; also names Middle Eastern architecture and low-poly art among its influences. The session overview was read, not the full video.
4. [App Store interview, Monument Valley's secret history](https://apps.apple.com/my/story/id1453819075): describes architectural connections in screen space even when they do not make sense in physical 3D space.
5. [Making the impossible possible in Monument Valley](https://www.gamedeveloper.com/design/making-the-impossible-possible-in-i-monument-valley-i-): the technical director describes a fixed camera, screen-space navigation connections, depth ordering, and recalculation at snap positions. This is the interaction model for the prototype, rather than a picture dissolve.

Supplemental technical reference:

- [ustwo's making-of videos](https://monumentvalleygame.squarespace.com/blog/2014/12/3/eight-videos-about-the-making-of-monument-valley) include Peter Pashley's technical presentation. The prototype uses the published fixed-view principle; it does not claim to recreate the game's engine.

Research limitations: the supplied Google image-search link does not establish a single approved level. The official gallery supplies the initial visual anchor. The GDC 2018 slide PDF could not be retrieved; its contents are not treated as evidence. The exact game typeface has not been verified. Proposed colors, timing, dimensions, and renderer below are design decisions, not extracted game specifications.

## Art direction

### Composition and geometry

Build one authored monument with a recognizable silhouette: a tall slender tower, an arched pavilion, narrow elevated walkways, stairs, and a lower courtyard. Use generous empty atmosphere around it. Architectural proportions, repeated fine stair treads, recessed openings, and delicate roof details matter as much as the larger blocks.

Use a fixed orthographic/isometric view. Parallel edges stay parallel; distant elements do not shrink. Start with a conventional isometric projection, then tune the viewing angle against the chosen reference. No user orbit camera: the impossible connections depend on a controlled viewpoint.

Design the illusion on paper/in screen coordinates before building geometry. At least one route must appear continuous although its segments occupy incompatible depths. A rotating bridge should visibly disconnect, pass behind a tower, and reconnect somewhere spatially surprising. Ordinary rearrangement of floating cubes is insufficient.

### Color, surfaces, and atmosphere

Provisional six-color study, to be revised against the reference during the still-image pass:

| Role | Initial color |
| --- | --- |
| Mist/sky | `#C6DFDF` |
| Pale stone, top surfaces | `#F6EBD5` |
| Pink plaster | `#E4A0AC` |
| Rose shaded faces | `#BA7C96` |
| Turquoise architectural accents | `#78BDB9` |
| Deep openings and readable text | `#35475B` |

Separate top, left, and right faces with authored color relationships. Keep materials matte and edges clean. Use subtle ambient depth, selective contact shadows, and a restrained atmospheric background; avoid glossy surfaces or strong realistic lighting that exposes the geometric trick. Keep decoration sparse: a few tile patterns, recessed windows, roof ornaments, and small planting accents.

The primary reference remains the architecture in the game imagery, not the typography, buttons, or layout of ustwo's marketing website.

### Typography

Study the game's actual wordmark and in-game title/menu treatments separately. Match their geometric construction, light strokes, generous spacing, and quiet placement. The four category words are the main typographic feature; they should feel composed with the monument.

For the four fixed labels, prefer custom vector lettering if an available typeface cannot match the reference closely enough. Keep real accessible link text underneath the visual treatment. Do not claim an approximation is the game's original font. Use a readable complementary text face for descriptions, dates, and links; do not spread out body paragraphs like display lettering.

Before implementation is considered visually ready, compare the full words EXPERIENCE, PROJECTS, INVOLVEMENT, and ABOUT against the reference, especially the wide and diagonal letters. Check both initial and shrunken sizes. All-caps display lettering here is an intentional response to the reference.

## Layout and interaction

Desktop initial composition:

```text
  Keshav Sreekantham

  EXPERIENCE                       tower / pavilion
  PROJECTS                     stairs / impossible bridge
  INVOLVEMENT                      lower courtyard
  ABOUT

  quiet contact / resume links
```

Selected-category composition:

```text
 EXPERIENCE                  transformed monument on right
 PROJECTS                    with selected section landmarks
 INVOLVEMENT                  and readable section content
 ABOUT                       integrated into its open space
```

The second diagram describes direction and hierarchy, not exact placement. The menu's left edge moves closer to the viewport edge and its type shrinks to roughly 65–75% of the opening size, with safe margins and unchanged usable hit areas. The right-side composition retains its visual center and expands/reconfigures internally to make room for content.

Keep long-form content upright as HTML, aligned with the scene's open spaces rather than skewed onto tiny building faces. Major entries can correspond to architectural landmarks; selecting one reveals its details on the right. Do not require visitors to solve a puzzle or hunt for invisible targets to read the portfolio. The category click itself reveals useful information.

### Proposed first transition: Experience

1. Selection acknowledges immediately. The category stack begins shrinking and translating left.
2. A bridge rotates around its visible pivot while a stair assembly slides behind the tower. The tower remains a stable visual anchor.
3. At a deliberately occluded moment, the bridge's depth relationship changes. It emerges connected to a landing that could not have joined it under normal spatial rules.
4. The final architecture resolves into tiered landings associated with work entries. The first entry's company, role, dates, and highlights become readable in the right-side composition.

Initial timing study: roughly 0.9–1.3 seconds, with overlapping phases and gentle mechanical easing. These are starting values to tune in the browser. Avoid springy/bouncy motion. Text can become available before all decorative settling ends.

### Four configurations of the same monument

| Category | Architectural transformation | Content organization |
| --- | --- | --- |
| Experience | Bridge rotation and concealed stair translation create an impossible ascending connection | Companies/roles associated with successive landings; details readable alongside |
| Projects | A courtyard assembly rotates and reconnects distant platform ends in projection | Project titles on distinct platforms; description, tools, and links in the right-side reading area |
| Involvement | Two walkway wings slide through occlusion and meet across incompatible depths | Organizations associated with connected pavilions; role and contributions exposed directly |
| About | A tower section turns to reveal an interior arch and a stair route whose foreground/background order reverses | Biography, education, contact, and resume within the resulting open composition |

These are storyboard proposals. Each needs a verified beginning, midpoint, and endpoint before production animation. Merely giving each category a different building or palette does not satisfy the transformation requirement.

Clicking a new category transforms the current monument into the next configuration. A quiet home/name action restores the opening composition and menu size. Preserve continuity of the anchor tower and a few recognizable pieces across every state.

## Technical approach

Use the existing Next.js/React application and content. Recommended production starting point: a small Three.js scene using an orthographic camera, with HTML navigation and content above it. Use hand-authored geometry and unlit/authored face colors to control the illusion. Keep React/Framer Motion responsible for menu and text transitions; coordinate scene motion through a single transition state machine.

Renderer decision checkpoint: first construct one still composition and one impossible bridge transition. If controlled 2.5D SVG projection reproduces these more faithfully and cheaply, use it. SVG is a viable alternative for fixed-view masked illusions, but rotating assemblies must preserve believable surfaces through the motion. Do not commit to an engine solely because its initial blockout was easy.

Suggested separation:

- `MonumentExperience`: layout, selected category, navigation/history, content focus.
- `MonumentScene`: camera, architecture, materials, rendering lifecycle.
- `scene-configs`: five authored configurations: home plus four categories.
- `transition-controller`: source/target state, pivots, timing, masks/depth changes, latest requested destination.
- `CategoryNavigation`: real links with custom visual lettering.
- `CategoryContent`: semantic HTML sourced from current data.

Keep scene geometry and transition logic separate from portfolio text. Handle rapid selection by resolving safely to the latest requested category; never let multiple transforms corrupt the scene. Stop rendering while idle where possible and pause when the document is hidden.

## Repository integration

Verified current sources differ from parts of AGENTS.md's historical structure:

- `personalwebsite/src/data/work.json` and `workData.ts` supply work entries.
- `personalwebsite/src/data/projects.json` and `projectsData.ts` supply projects.
- `personalwebsite/src/data/involvement.json` and `involvementData.ts` supply involvement.
- `personalwebsite/src/data/about.json` supplies biography/education content.
- `personalwebsite/src/app/page.tsx` currently renders `HomeChatClient` and fetches contribution history.
- `ConditionalChrome.tsx` controls the existing navbar and interior mosaic frame.

Build the first visual slice at a branch-only prototype route such as `/monument`, with scoped styles and no inherited mosaic chrome. Once the full experience passes visual review, make it the branch's homepage. Preserve existing direct section URLs and usable content access; map Experience to the existing Work content. Plan browser history/deep links alongside section selection, including direct loads and Back/Forward behavior.

The contribution calendar is secondary to this composition. Proposed placement is within About or its expanded content, retaining current data handling where used. Contact and resume remain easy to reach. Confirm the current resume behavior before integrating it into the new shell.

## Build sequence and fidelity gates

1. **Reference sheet and storyboard.** Select one exact official architectural image as the main proportion/color anchor. Annotate silhouette, axes, face colors, stair dimensions, arches, lettering, and negative space. Draw home plus four final configurations and transition midpoints. The selected anchor must be explicit so fidelity can be judged against something concrete.
2. **Still-image art pass.** Render the opening desktop composition with final-quality architecture and lettering. Compare beside the reference at equal size. Fix proportions, palette, details, and composition before adding all content.
3. **One complete transition.** Build Home → Experience → Home with real work content. Demonstrate the menu moving LEFT and shrinking, the monument remaining RIGHT, and a genuinely impossible connection changing. Inspect screenshots at intermediate frames, not just endpoints.
4. **Remaining sections.** Extend the same monument and transition system to Projects, Involvement, and About. Integrate all existing content and links; test every category-to-category switch.
5. **Responsive and accessibility pass.** On narrow screens, retain the vertical category stack and a legible monument composition with content flowing below as needed. Avoid shrinking everything into an unreadable desktop miniature. Support keyboard navigation, visible focus, semantic headings, reduced motion, zoom, and a useful static fallback when rendering is unavailable.
6. **Verification and refinement.** Run type checking and a production build; inspect the lint command before using it because the package currently declares `next lint` with Next 16. Test deep links, Back/Forward, rapid clicks, resize during motion, touch, reduced motion, and renderer failure. Measure rendering on representative desktop/mobile devices. Capture full-page and transition screenshots for review.

Art gates are substantive: if the still image does not convincingly match the selected Monument Valley reference, revise it before expanding the implementation. A complete set of functioning sections is not evidence of visual fidelity.

## Acceptance criteria

- The opening screen reads unmistakably as a carefully composed Monument Valley-style level: geometry, silhouette, color relationships, detail, atmosphere, and lettering all support that result.
- Architecture is the main visual subject, with restrained interface elements.
- Category text is vertically stacked; after selection it becomes smaller and moves farther LEFT.
- The monument stays on the RIGHT throughout selection and transition.
- Every section has a visible impossible reconnection or occlusion-based spatial reversal, not only a rotation, fade, or color change.
- A stable landmark makes the changing scene feel like the same place.
- Selected-category information is readable on the right and usable without puzzle-solving.
- All real content, contact/resume actions, and direct section access remain reachable.
- Every frame has intentional overlap and face ordering; no accidental gaps, flashing surfaces, or impossible text placement.
- Keyboard, reduced motion, mobile, and rendering fallback remain usable.
- Work remains on the redesign branch until the user requests merging or publication.

## Open decisions for the visual prototype

The first game's pale pink/stone/turquoise architecture is the current anchor direction. An exact preferred level from the user would supersede it. Font identity remains unverified; the plan is to match the visual lettering carefully rather than guess a font name. Final geometry, transition durations, text placement, and renderer should be settled through the first still and motion slice.

No claim of a perfect match can be made from a written plan. The next deliverable should be the reference comparison and one polished interactive transition, with visual fidelity assessed before the rest is built.

## Prototype correction, 2026-10-18

The first implemented transition used alternate rendered images and a clipped flip. Browser review showed that it was a visual swap, not a spatial illusion; it has been removed. The current branch keeps one painted monument as a style anchor and cuts two movable architectural stages out of that image so they can move without a duplicate remaining behind. A separate stair and landing are rebuilt as projected faces every animation frame. The stair rotates and changes elevation; one cut-out turret follows an arc and the other tower stage lifts.

The fixed projection is `screenX = 470 + 100(x-z)`, `screenY = 400 + 50(x+z) - 100y`. Two points separated by `(d,d,d)` have the same projected pixel while occupying different world positions. Each category's stair endpoint and landing use that relationship. Their trajectories diverge during transition and align at the destination. This is the specific non-Euclidean mechanism to assess in browser review.

At that intermediate stage, the illustrated static architecture was visually stronger than the authored moving faces. That limitation led to the 3D reconstruction below. A screen-space equation alone does not guarantee the visual result; the endpoint and midpoint frames remain the acceptance gate.

## 3D reconstruction, 2026-10-19

The cut-out prototype proved too constrained by the illustration, so the primary view now uses a Three.js 3D reconstruction. The painted image remains only as a fallback if WebGL fails. The model has separate tower, gallery, lower courtyard, bridge, and landing groups, with modeled arch openings, stair treads, parapets, teal domes and waterways, and planting. This lets each assembly move without image seams.

The camera is orthographic at an exact isometric angle, and settled structures use world-axis alignment and quarter-turn rotations. Rotation and elevation changes happen between those states. The impossible landing is placed 1.35 world units along the camera ray from the bridge endpoint; the fixed camera projects both positions to one point while they remain physically separated. A traveler traverses the projected join after the mechanism settles.

The current 3D model is still a visual reconstruction in progress. Browser comparison against the illustration remains necessary before calling its silhouettes, arches, lighting, and transitions faithful enough. The user's style criterion applies to the model itself, not to a static image displayed behind it.
