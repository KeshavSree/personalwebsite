---
name: Keshav Sreekantham
description: A warm, editorial personal site set on a hand-laid cultural mosaic, with blue as the only interactive accent
colors:
  surface: "#F9F4E6"
  surface-raised: "oklch(97% 0.016 82)"
  surface-muted: "oklch(92% 0.028 82)"
  surface-sunken: "oklch(90% 0.032 82)"
  ink: "oklch(20% 0.018 55)"
  ink-muted: "oklch(42% 0.018 60)"
  ink-subtle: "oklch(58% 0.014 65)"
  ink-faint: "oklch(72% 0.012 70)"
  hairline: "oklch(84% 0.024 78)"
  hairline-strong: "oklch(74% 0.028 78)"
  accent: "oklch(56% 0.105 216)"
  accent-hover: "oklch(50% 0.105 216)"
  accent-soft: "oklch(91% 0.04 214)"
  accent-tint: "oklch(95% 0.02 213)"
  mosaic-red: "#BA5A5A"
  mosaic-green: "#A4CE8B"
  mosaic-blue: "#86BCBD"
typography:
  display:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.5vw, 4.25rem)"
    fontWeight: 500
    lineHeight: 0.96
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  voice:
    fontFamily: "Source Serif 4, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(1.1rem, 2vw, 1.4rem)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
    fontStyle: "italic"
  body:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-hover:
    textColor: "{colors.ink}"
  connect-link:
    textColor: "{colors.ink}"
    borderBottom: "1px {colors.hairline-strong}"
  connect-link-hover:
    textColor: "{colors.accent}"
    borderBottom: "1px {colors.accent}"
---

# Design System: Keshav Sreekantham

## 1. Overview

**Creative North Star: "The Warm Mosaic."**

A warm, paper-cream surface holding calm, considered writing, edged by a hand-laid cultural mosaic and lit by one bright object. The site reads first as a piece of writing and second as software. Density is low at rest, but the chrome is engineered, not sketched: hairlines are deliberate, type is set with care, and one saturated color is reserved for the moment something actually happens. The mosaic is ambient, not loud: muted tesserae cluster in from the edges of the page, framing the words without ever crowding them.

The aesthetic rejects three things by name. It rejects the **vibecoded** look: bento grids, glassmorphism, gradient text, hero-metric stat blocks, the generic Next.js + shadcn template aesthetic. It rejects the **corporate** look: SaaS landing voice, "Trusted by" logo walls, navy-and-gold finance palettes, feature-grid sections. It rejects the **brutalist** look: oversize black borders, monospace-everywhere, deliberately ugly grid systems. The reference point is Tennr (editorial-warm UI density that still feels engineered).

**Key Characteristics:**
- Cream surface, warm ink, one blue accent, plus a muted red/green/blue mosaic palette
- The mosaic palette is featured in the background but free to appear elsewhere; blue leads as the interactive accent, red and green support
- Sans for structure, serif italic for voice, mono for system labels
- Hairlines and tonal layering instead of shadows
- Stillness at rest, motion only on real events
- Functional color: blue marks the live cursor of attention, never decoration

## 2. Colors: The Cream and Blue Palette

A palette of one interactive accent against a tonal cream-and-ink stack. Every neutral is tinted toward warm hues (60° to 82° in OKLCH), so nothing reads as cold gray. Beyond this stack, the palette carries three muted colors (red, green, blue). They are featured in the background mosaic (Section 7), but they belong to the broader palette and can appear elsewhere too, always used deliberately and sparingly.

### Primary
- **Blue** (`oklch(56% 0.105 216)`): The single saturated color. Drawn from the mosaic's blue tile (`#86BCBD`) but deepened so cream text stays legible where the accent fills. Used on interactive accents: focus-visible borders, hover states on the section nav and connect links, and the underline on inline links in prose. Never decorative.
- **Blue Deep** (`oklch(50% 0.105 216)`): Hover state for blue surfaces and links. Slightly darker, same hue.

### Tertiary (accent supports)
- **Blue Wash** (`oklch(91% 0.04 214)`): Soft fill for accent backgrounds where the full blue would shout. Reserved for selection highlight and rare accent surfaces.
- **Blue Tint** (`oklch(95% 0.02 213)`): The faintest cream-tinted-with-blue. Used for rare active or selected accent surfaces.

### Mosaic Palette
Three muted colors that currently anchor the background mosaic (Section 7) but belong to the broader palette. Blue also serves as the primary interactive accent (above); red and green are supporting colors, available across the site and used deliberately and sparingly.
- **Mosaic Red** (`#BA5A5A`): Muted red.
- **Mosaic Green** (`#A4CE8B`): Muted green.
- **Mosaic Blue** (`#86BCBD`): Muted blue. The interactive accent (above) is a deepened version of this.

### Neutral
- **Cream Surface** (`#F9F4E6`): The page, and the mosaic's canvas. Warm, paper-like, not white. This exact value is also the mosaic's gap-stroke color, so adjacent tiles read as cleanly separated tesserae.
- **Cream Raised** (`oklch(97% 0.016 82)`): Raised surfaces (cards, chips, panels). Slightly lighter than the page so elements lift without shadow.
- **Cream Muted** (`oklch(92% 0.028 82)`): Inline code background, disabled states.
- **Cream Sunken** (`oklch(90% 0.032 82)`): Reserved for nested wells if needed; rare.
- **Warm Ink** (`oklch(20% 0.018 55)`): Body text and headlines. Near-black with a warm cast, never `#000`.
- **Ink Muted** (`oklch(42% 0.018 60)`): Secondary text, chip text at rest, subtitle copy.
- **Ink Subtle** (`oklch(58% 0.014 65)`): Mono labels, metadata, dividers.
- **Ink Faint** (`oklch(72% 0.012 70)`): Placeholder text, the "↗" external-link glyph, separator pips.
- **Hairline** (`oklch(84% 0.024 78)`): The default 1px border. Used on cards, dividers, and borders.
- **Hairline Strong** (`oklch(74% 0.028 78)`): Slightly heavier border for connect-link underlines and project links.

### Named Rules
**The One Bright Object Rule.** Blue is the interactive accent, the live cursor of attention: it marks what is live or actionable and nothing else. If you find yourself reaching for blue to decorate a heading, a divider, or a card edge that is not interactive, stop. The accent stays rare so it stays loud. The mosaic's other two hues (red, green) are supporting palette colors, used deliberately and sparingly for expression, never to signal interactivity.

**The No True Black, No True White Rule.** Never `#000`, never `#fff`. Every neutral carries a hue cast (warm 55°-82° in OKLCH). Cold grays read as default-template; the warm cast is the signature.

## 3. Typography

**Display Font:** Host Grotesk (with `ui-sans-serif`, `system-ui`, `sans-serif` fallbacks). Loaded as a Next.js variable font; OpenType features `ss01` and `cv11` are on globally for sharper alternates.

**Voice Font:** Source Serif 4 (with `Iowan Old Style`, `Georgia`, `serif` fallbacks). Used **only in italic**. This is the voice of the site, not a body face.

**Label Font:** `ui-monospace` system stack. Used at small caps for system labels (section kickers, nav labels, metadata).

**Character:** Host Grotesk gives precise sans structure with subtle warmth in its terminals; Source Serif 4 italic adds the bookish, first-person register. Mono labels keep system chrome legibly engineered. The pairing reads as *editorial product*, not *startup landing*.

### Hierarchy
- **Display** (Host Grotesk, weight 500, `clamp(2.5rem, 6.5vw, 4.25rem)`, line-height 0.96, tracking -0.02em): The home headline ("Who is Keshav Sreekantham?"). One per page.
- **Headline** (Host Grotesk, weight 500, `clamp(2rem, 5vw, 3rem)`, line-height 1.02, tracking -0.02em): Section openers on About, Work, Projects.
- **Voice** (Source Serif 4 italic, weight 400, `clamp(1.1rem, 2vw, 1.4rem)`, line-height 1.3): Subtitle quotes and blockquotes. Always italic, always serif, always voicing Keshav.
- **Body** (Host Grotesk, weight 400, 15px, line-height 1.7): About prose, project descriptions. Capped at 65-75ch in long-form contexts.
- **Label** (Mono, weight 400, 11px, tracking 0.2em, uppercase): Kickers, section labels (Education, Skills, Interests), and metadata.
- **Inline** (Host Grotesk, weight 400, 13px-14.5px): Chip text, navigation, metadata.

### Named Rules
**The Italic Voice Rule.** Source Serif 4 only ever appears italic. Roman serif weights are forbidden on this site. The italic carries the personal voice; setting it upright would turn voice into editorial drag.

**The Mono Labels Only Rule.** Mono is reserved for system labels and kickers. Not for body, not for code blocks larger than a phrase, not for emphasis. Inline `code` fragments use mono; full prose passages do not.

## 4. Elevation

The system is **flat-by-default with tonal layering**. Depth comes from cream tonal steps (`surface` < `surface-raised` < `surface-muted`) and 1px hairlines, not from shadows. Shadows are avoided entirely; if one is ever needed it stays almost invisible.

### Named Rules
**The Tonal Lift Rule.** When a surface needs to sit above the page, raise it by stepping up the cream scale (`surface` → `surface-raised`) and outlining it with a hairline. Cards, chips, and panels lift with tone and hairline alone.

**The No Decorative Shadow Rule.** Shadows are not atmospheric. They never sit under hero text, never glow under buttons, never blur a card edge for "depth." Depth is tonal and hairline, not shadow.

## 5. Components

### Buttons & links
- **Text links and "See everything" actions**: no fill, no border. `ink-muted` at rest, `ink` on hover. Underline only on inline links inside prose (blue underline, 1px, 3px offset).
- **Connect links** (LinkedIn, GitHub, Email, Resume): `ink` text with a `hairline-strong` 1px bottom border that switches to `accent` on hover, with a trailing "↗" glyph that also switches to `accent`.
- **Section nav** (home hero rail): inline `<Link>` list, each with a `hairline-strong` bottom border that turns `accent` on hover and focus.

### Chips
- **Chip** (project links, tags): `surface-raised` fill, `hairline` 1px border, `ink-muted` text, pill shape, 14px×6px padding. Hover: border switches to `ink`, text to `ink`. Never blue at rest.

### Navigation
- Top nav: `surface/85` background with `backdrop-blur-sm`, sticky. Wordmark "keshav" set in Source Serif 4 italic with a 6px blue dot trailing. Inline link list in `ink-muted`, hover to `ink`. Shown on all pages except the home page, which carries its own section nav in the hero rail (a dot-separated link list with mono-faint pip dividers).

### Quote / Blockquote
- Left border: 2px blue. 1em padding-left. Source Serif 4 italic, `ink-muted` text. Used sparingly — e.g. the closing quote on About.

### Named Rules
**The No Filled Surfaces Rule.** No UI element has a filled background heavier than `surface-raised`. Cards and chips live on the cream scale, separated by hairlines.

## 6. Do's and Don'ts

### Do:
- **Do** keep blue (`oklch(56% 0.105 216)`) reserved for the live cursor of attention: focus-visible borders, hover states on the section nav and connect links, the blockquote rule, and inline links inside prose.
- **Do** layer surfaces tonally (`surface` → `surface-raised` → `surface-muted`) and separate them with 1px hairlines.
- **Do** use Source Serif 4 only in italic, only for voice (subtitles, blockquotes).
- **Do** use mono at 11px, 0.2em tracking, uppercase, for system labels (kickers, nav labels, metadata).
- **Do** cap body line length at 65-75ch in long-form contexts (About prose, project descriptions).
- **Do** ease motion with `cubic-bezier(0.2, 0.8, 0.2, 1)` (rise) or `cubic-bezier(0.16, 1, 0.3, 1)` (slip). Both are exponential ease-out curves. Disable all custom motion when `prefers-reduced-motion: reduce`.
- **Do** match new interactive states to the existing pattern: hairline border at rest, blue border on focus or active.
- **Do** keep the background mosaic quiet and edge-bound: ~30% coverage, 0% at the top, muted tiles only, no motion. It frames the page; it never competes with the words.

### Don't:
- **Don't** use `#000` or `#fff`. Every neutral carries a 55°-82° hue cast in OKLCH. Cold grays read as template.
- **Don't** decorate with blue. No blue underlines on every link, no blue section dividers, no blue icons that aren't interactive. The accent is rare on purpose.
- **Don't** wrap things in cards. Surfaces use hairlines and tonal lift, not filled cards. Nested cards are always wrong.
- **Don't** use side-stripe borders (`border-left` greater than 1px as a colored stripe) on callouts, alerts, or list items. The blockquote blue rule is the exception, not a pattern to copy.
- **Don't** ship a hero-metric template (big number + small label + supporting stat). That's the SaaS cliché. Anti-reference.
- **Don't** use bento grids, glassmorphism, gradient text, or "Trusted by" logo walls. These are the **vibecoded** and **corporate** anti-references from Section 1.
- **Don't** ship a brutalist grid: oversize black borders, monospace-everywhere, Helvetica-on-white-with-yellow-blocks. Restraint, not aggression.
- **Don't** add ambient or decorative motion (looping background animations, scroll-driven parallax, hover wiggles). Motion fires on real events only — the mosaic included: it is laid once and stays still.
- **Don't** overload the UI with saturated color. Blue is the primary interactive accent; the mosaic's red and green are supporting palette colors, used deliberately and never as a competing interactive signal. When in doubt, reach for a tonal step or a hairline instead of adding more color.
- **Don't** rename or reorder the section headers in this file. "Colors" not "Color Palette". "Do's and Don'ts" not "Guidelines".

## 7. Background: The Cultural Mosaic

The site's ambient background is a warm, organic mosaic: muted tesserae laid on a perturbed grid that clusters in from the edges of the page. It replaces the botanical linework of the earlier design. It is decoration that stays quiet, framing the reading surface without ever sitting under text at full density, animating, or borrowing the interactive accent. Everything below is the blueprint for replicating the "Warm Organic / Cultural" aesthetic.

### Palette
- **Canvas** (`#F9F4E6`): the same value as the page surface; the mosaic is laid directly on it, and the canvas color doubles as the gap stroke between tiles.
- **Tiles:** Mosaic Red (`#BA5A5A`), Mosaic Green (`#A4CE8B`), Mosaic Blue (`#86BCBD`).

### Grid & Placement Strategy
The background is built on a dynamic, perturbed grid.
- **Coverage:** The screen should only be partially covered (~30%) in a tasteful, non-uniform manner.
- **Top Edge:** STRICTLY 0% coverage.
- **Bottom Edge:** 100% horizontal coverage, but thin (maximum 2 layers/grid cells deep). The top edge of this bottom section should have a smooth, wavy contour.
- **Side Edges:** Sparse, somewhat large blobs that extend inward. These blobs must be asymmetrical (never mirroring the other side).
- **Cleanup:** No isolated shapes. Any grid cell with only 1 neighbor must be removed to ensure cohesive clustering.

### Shape & Geometry Constraints
- **Variety:** Tiles should be a mix of Quads, Triangles, and Pentagons (5-sided shapes). Avoid having only triangles or only quads.
- **Organic Inner Edges:** The interior vertices of the grid should be randomly perturbed to create organic, irregular shapes.
- **Parallel Outer Edges:** The outermost vertices must remain perfectly straight and parallel to the screen's edge.
- **Edge Smoothing:** When the active grid drops a level (creating a step or corner in the blob), the shapes must adapt:
  - *Deep Cuts:* Use a single triangle to sharply smooth the corner.
  - *Shallow Cuts:* Use polygons (5 to 8 sides) to create a rounded, smooth macro-edge for the aggregated tiles.
- **No Thin Slices:** Avoid generating extremely thin or sliver-like polygons.

### Spacing & Gaps
- **Uniform Margins:** The distance between the screen edge and the outermost shapes must be consistent across the entire page (e.g., using a fixed `MARGIN`).
- **Uniform Gaps:** The visual gap between individual mosaic tiles must be perfectly uniform across the entire canvas. *Implementation Tip: Instead of shrinking polygons towards their centroid (which creates uneven gaps based on shape size), use a thick stroke matching the background color (`#F9F4E6`) with a `round` stroke-linejoin.*

### Color Distribution
- **No Clustering:** Colors must be distributed so that tiles of the same color rarely touch. Using a modulo hash function based on row, column, and sub-shape index is recommended.

### Named Rules
**The Quiet Mosaic Rule.** The mosaic itself is background texture: it stays at the edges (~30% coverage, 0% at the top), never crowds the words, never animates, and never becomes interactive. It is the mosaic *element* that stays quiet, not the colors — those belong to the broader palette and may appear elsewhere.

**The Edge-Bound Rule.** The mosaic reads as a frame, not a field. Coverage concentrates along the bottom (thin, wavy) and the two sides (sparse, asymmetric, never mirrored), leaving the top and the reading column clear. Uniform margins and uniform gaps keep it feeling laid by hand rather than generated.
