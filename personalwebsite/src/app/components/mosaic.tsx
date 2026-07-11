// Cultural-mosaic decoration. Hand-authored tesserae (no procedural generation):
// every polygon's points are laid by hand so the two page backgrounds are fixed
// pieces. Tiles are the muted mosaic palette, separated by a uniform gap drawn as
// a thick cream stroke (the page surface) with a round linejoin — the NEW_DESIGN
// §7 implementation tip. Purely decorative: pointer-events-none, no motion.
//
// Margins: the mosaic never touches the screen edge. The bottom strip is lifted
// off the page bottom by a uniform gap (its baseline is a single straight line),
// and each side hill is lifted off the page side; those gaps live in the frame
// components (MosaicFrame / HomeMosaicFrame) as bottom-/left-/right- offsets.

type MosaicColor = "red" | "green" | "blue";
export type Tile = { points: string; c: MosaicColor };

const FILL: Record<MosaicColor, string> = {
  red: "var(--color-mosaic-red)",
  green: "var(--color-mosaic-green)",
  blue: "var(--color-mosaic-blue)",
};

/** Renders a group of tiles. Embed inside an <svg> that owns the viewBox. */
export function MosaicTiles({ tiles, gap = 3 }: { tiles: Tile[]; gap?: number }) {
  return (
    <>
      {tiles.map((t, i) => (
        <polygon
          key={i}
          points={t.points}
          fill={FILL[t.c]}
          stroke="var(--color-surface)"
          strokeWidth={gap}
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}

// ── Bottom strip ──────────────────────────────────────────────────────────
// One irregular row of tiles across a 1440×130 viewBox with a flat baseline at
// y=130 (the frame lifts the whole strip off the page bottom, so the baseline
// reads as a straight parallel line with a gap beneath it). Column widths vary
// and the top contour wanders; critically, every side edge is slanted (each tile's
// bottom vertex is offset from its top vertex) so no tile meets the baseline at a
// right angle. The row mixes quads, triangles and pentagons, and two small
// second-layer hills near the corners make it ~2 tiles deep there. Colours never
// repeat across a shared edge.
const BOTTOM_TILES: Tile[] = [
  // first layer, left → right
  { points: "0,88 52,76 104,64 118,130 0,130", c: "red" }, // pentagon (left end: vertical outer edge)
  { points: "104,64 196,80 182,130", c: "green" }, // triangle
  { points: "104,64 182,130 118,130", c: "blue" }, // triangle
  { points: "196,80 300,56 288,130", c: "blue" }, // triangle
  { points: "196,80 288,130 182,130", c: "red" }, // triangle
  { points: "300,56 340,48 388,66 402,130 288,130", c: "green" }, // pentagon
  { points: "388,66 470,50 456,130 402,130", c: "red" }, // quad
  { points: "470,50 516,60 560,72 546,130 456,130", c: "green" }, // pentagon
  { points: "560,72 620,58 676,60 690,130 546,130", c: "red" }, // pentagon
  { points: "676,60 744,82 730,130 690,130", c: "blue" }, // quad
  { points: "744,82 858,56 872,130", c: "green" }, // triangle
  { points: "744,82 872,130 730,130", c: "red" }, // triangle
  { points: "858,56 940,76 926,130 872,130", c: "blue" }, // quad
  { points: "940,76 1020,54 1006,130 926,130", c: "green" }, // quad
  { points: "1020,54 1064,48 1110,66 1096,130 1006,130", c: "red" }, // pentagon
  { points: "1110,66 1180,52 1168,130", c: "green" }, // triangle
  { points: "1110,66 1168,130 1096,130", c: "blue" }, // triangle
  { points: "1180,52 1252,58 1266,130 1168,130", c: "red" }, // quad
  { points: "1252,58 1330,78 1316,130 1266,130", c: "green" }, // quad
  { points: "1330,78 1388,60 1440,66 1440,130 1316,130", c: "red" }, // pentagon (right end: vertical outer edge)
  // second layer — left corner hill
  { points: "0,64 62,48 52,76 0,88", c: "blue" }, // quad
  { points: "62,48 148,60 104,64 52,76", c: "green" }, // quad
  { points: "148,60 196,80 104,64", c: "red" }, // triangle
  // second layer — right corner hill
  { points: "1252,58 1338,46 1330,78", c: "blue" }, // triangle
  { points: "1338,46 1404,54 1440,66 1388,60 1330,78", c: "green" }, // pentagon
];

export function MosaicBottomStrip({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 130"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute bottom-[12px] left-[12px] z-[3] h-[92px] w-[calc(100%_-_24px)] sm:h-[116px] ${className}`}
      fill="none"
    >
      <MosaicTiles tiles={BOTTOM_TILES} gap={3} />
    </svg>
  );
}

// ── Side hills ────────────────────────────────────────────────────────────
// Two distinct clusters (never a mirror of each other). Each keeps a flat outer
// edge (parallel to the screen edge, per spec) — the frame lifts it off the side
// so there is a gap — but ONLY that outer gap is parallel. The interior is a few
// large tesserae, mostly triangles and pentagons (no quads). The silhouette is a
// broad, shallow Gaussian: near the top and bottom the contour hugs the edge
// first, then flares — so the ends meet the edge with switched (concave)
// curvature, like a normal distribution's tails, rather than a convex point.
// No right angles; no same-colour neighbours. Authored flat-on-left; place on a
// right edge with side="right".
const HILL_A: Tile[] = [
  { points: "0,12 5,58 14,104 0,126", c: "blue" }, // quad (long top tail)
  { points: "0,126 14,104 34,146 60,180 0,190", c: "red" }, // pentagon
  { points: "0,190 60,180 72,198", c: "green" }, // triangle
  { points: "0,190 72,198 56,232", c: "blue" }, // triangle
  { points: "0,190 56,232 34,274 14,318 0,296", c: "green" }, // pentagon
  { points: "0,296 14,318 5,360 0,372", c: "red" }, // quad (long bottom tail)
];

const HILL_B: Tile[] = [
  { points: "0,12 6,50 20,92 46,124 0,104", c: "red" }, // pentagon (short top tail)
  { points: "0,104 46,124 66,150", c: "blue" }, // triangle
  { points: "0,104 66,150 70,172 0,162", c: "green" }, // quad (peak)
  { points: "0,162 70,172 56,205 36,250 0,268", c: "red" }, // pentagon
  { points: "0,268 36,250 18,296", c: "blue" }, // triangle
  { points: "0,268 18,296 8,340 0,356", c: "green" }, // quad (long bottom tail)
];

const HILLS = {
  a: { tiles: HILL_A, vb: "0 0 84 380" },
  b: { tiles: HILL_B, vb: "0 0 80 360" },
};

export function MosaicHill({
  variant,
  side,
  className = "",
}: {
  variant: "a" | "b";
  side: "left" | "right";
  className?: string;
}) {
  const { tiles, vb } = HILLS[variant];
  return (
    <svg
      aria-hidden="true"
      viewBox={vb}
      preserveAspectRatio="xMinYMid meet"
      className={`pointer-events-none absolute ${side === "right" ? "-scale-x-100" : ""} ${className}`}
      fill="none"
    >
      <MosaicTiles tiles={tiles} gap={2.4} />
    </svg>
  );
}

// ── Panel backing ─────────────────────────────────────────────────────────
// Sits behind the home nav/Connect box and bleeds past its rectangle on every
// side — the panel covers the centre, so the mosaic pokes out around all four
// edges. Same chunky bottom-strip tile style, but two courses deep since it
// backs a box rather than edging the page. Rendered behind the panel surface
// (earlier in the DOM at the same z), stretched to the panel + margin box.
const PANEL_TILES: Tile[] = [
  { points: "8,20 94,12 102,104", c: "red" }, // triangle
  { points: "8,20 102,104 16,92", c: "green" }, // triangle
  { points: "94,12 220,24 210,90 102,104", c: "green" }, // quad
  { points: "220,24 312,14 324,102 210,90", c: "red" }, // quad
  { points: "312,14 372,2 438,24 430,94 324,102", c: "green" }, // pentagon (prominent top peak)
  { points: "438,24 552,10 556,100 430,94", c: "red" }, // quad
  { points: "552,10 674,18 662,88 556,100", c: "green" }, // quad
  { points: "16,92 102,104 110,184 6,176", c: "red" }, // quad
  { points: "102,104 210,90 222,172 166,194 110,184", c: "blue" }, // pentagon (prominent bottom peak)
  { points: "210,90 324,102 338,184 222,172", c: "green" }, // quad
  { points: "324,102 430,94 442,174 338,184", c: "red" }, // quad
  { points: "430,94 556,100 556,186", c: "green" }, // triangle
  { points: "430,94 556,186 442,174", c: "blue" }, // triangle
  { points: "556,100 662,88 674,176 556,186", c: "red" }, // quad
];

export function MosaicPanelBacking() {
  return (
    <div
      aria-hidden="true"
      style={{ animationDelay: "300ms" }}
      className="rise pointer-events-none absolute -left-7 -right-7 -top-5 -bottom-6 z-0 hidden md:block"
    >
      <svg
        viewBox="0 0 680 196"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <MosaicTiles tiles={PANEL_TILES} gap={2.4} />
      </svg>
    </div>
  );
}

// ── Nav highlight tile ──────────────────────────────────────────────────────
// A single blue tessera behind the active nav item. An asymmetric quad — a
// parallelogram knocked slightly out of true so no two sides are parallel —
// stretched to the item box. The cream stroke echoes the mosaic gap and softens
// the corners against the page. Text on top is set to the surface (cream).
export function MosaicNavTile({ className = "" }: { className?: string }) {
  // The inset box lives on this <span> (a non-replaced element, so it honors all
  // four offsets). The <svg> is a replaced element — if it owned the offsets it
  // would size its height from the viewBox ratio and ignore `bottom` — so it
  // just fills the span.
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block ${className}`}
    >
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="block h-full w-full"
        fill="none"
      >
        <polygon
          points="8,6 94,3 96,33 4,37"
          fill="var(--color-mosaic-blue)"
          stroke="var(--color-surface)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ── Thin divider ────────────────────────────────────────────────────────────
// A hairline replacement: one serrated row of mosaic triangles forming a thin,
// bumpy line that stretches to any width. Unlike the hand-laid hero pieces
// above, this is GENERATED — a divider is a repeating structural rule, not a
// curated composition — but it keeps the same tessera look (cream gap between
// tiles, three-colour palette, no colour repeated across a shared edge).
// Vertices alternate along a top and bottom contour and jitter so the line
// reads as bumpy rock rather than a ruler. Three PRESETS (different step + bump
// seed) are pre-built so callers can scatter a bit of variety across a page.
function buildDividerTiles(width: number, step: number, seed: number): Tile[] {
  const n = Math.round(width / step);
  // deterministic bump so SSR and client render identically (no hydration drift)
  const jig = (i: number, s: number) => (((i * 37 + s + seed * 13) % 7) - 3) * 0.9;
  const vertex = (i: number) => ({
    x: Math.min(i * step, width),
    y: (i % 2 === 0 ? 3 : 14) + jig(i, i % 2 === 0 ? 0 : 3),
  });
  const pts = Array.from({ length: n + 1 }, (_, i) => vertex(i));
  const colors: MosaicColor[] = ["red", "green", "blue"];
  const tiles: Tile[] = [];
  for (let k = 0; k < pts.length - 2; k++) {
    const [a, b, c] = [pts[k], pts[k + 1], pts[k + 2]];
    // offset the palette by the preset seed so each preset opens on a different
    // colour (adjacent tiles still differ, so no colour repeats across an edge)
    tiles.push({ points: `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`, c: colors[(k + seed) % 3] });
  }
  return tiles;
}

const DIVIDER_PRESETS: Tile[][] = [
  buildDividerTiles(760, 64, 0),
  buildDividerTiles(760, 72, 1),
  buildDividerTiles(760, 80, 2),
];

export function MosaicDivider({
  variant = 0,
  className = "",
}: {
  variant?: number;
  className?: string;
}) {
  const tiles = DIVIDER_PRESETS[((variant % 3) + 3) % 3];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 760 18"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-[17px] w-full ${className}`}
      fill="none"
    >
      <MosaicTiles tiles={tiles} gap={1.8} />
    </svg>
  );
}

// ── Bullet marker ─────────────────────────────────────────────────────────
// One tiny mosaic tessera (a little diamond) used in place of a dash before a
// list bullet. `variant` cycles the palette colour, so a list of bullets reads
// as red / green / blue tesserae down the margin.
const BULLET_COLORS: MosaicColor[] = ["red", "green", "blue"];

export function MosaicBullet({
  variant = 0,
  className = "",
}: {
  variant?: number;
  className?: string;
}) {
  const c = BULLET_COLORS[((variant % 3) + 3) % 3];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 6 6"
      className={`pointer-events-none ${className}`}
      fill="none"
    >
      <polygon
        points="3,0.5 5.5,3 3,5.5 0.5,3"
        fill={FILL[c]}
        stroke="var(--color-surface)"
        strokeWidth={0.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Arch (broken bridge) ────────────────────────────────────────────────────
// An About-page-only feature: a broken mosaic ARCH spanning a tall region. Each
// half is a chunky rocky band that reaches out from a crown TIP near the centre
// (where the two halves point at each other across a gap) and widens GRADUALLY the
// whole way toward the page-side wall. Near the wall the underside follows a y=1/x
// elbow: the band stays a slim rocky rim (little "meat") across the whole span, then
// hooks sharply DOWN and runs a long tapering TAIL down the page edge — horizontal
// asymptote along the top, vertical asymptote down the edge. The span (bridge) keeps
// its thickness; only the base is thin. It fans around a few INTERIOR vertices
// (junctions never touching air). Both contours are jagged (rocky). The halves are
// asymmetrical: the left is longer, the right shorter and shallower.
//
// Every vertex is placed BY HAND (no grid, no shared column lines, no parallel
// edges), matching the loose chunky style of the bottom strip / side hills. Colours
// never repeat across a shared edge and use all three roughly evenly; the
// tessellation is watertight (every interior edge shared by exactly two tiles —
// verified by rendering it). Because the middle is empty and the mass hugs the top
// and the two page edges, it is placed (in about/page.tsx) with negative vw margins
// so page text can sit within its height instead of being pushed below it.
const ARCH_TILES: Tile[] = [
  // ── LEFT half — thick bridge span, then slim 1/x base; the underside now ROUNDS
  //    through the elbow (curved arc) instead of a hard corner into the tail ──
  { points: "655,62 586,50 604,82", c: "red" }, // triangle (crown tip)
  { points: "586,50 604,82 520,96 514,62", c: "blue" }, // quad
  { points: "514,62 520,96 442,58", c: "red" }, // triangle
  { points: "442,58 520,96 440,132 350,142 368,76", c: "blue" }, // pentagon
  { points: "350,142 368,76 300,74", c: "red" }, // triangle
  { points: "350,142 300,74 258,90 300,166", c: "blue" }, // quad
  { points: "300,166 258,90 258,176", c: "green" }, // triangle (bridge / base seam)
  { points: "258,90 258,176 224,130", c: "red" }, // triangle
  { points: "224,130 258,90 190,104 150,146", c: "green" }, // quad
  { points: "150,146 190,104 98,92", c: "blue" }, // triangle
  { points: "150,146 98,92 0,110 70,150", c: "red" }, // quad
  { points: "70,150 0,110 0,150", c: "green" }, // triangle
  { points: "258,176 224,130 150,146 196,166", c: "blue" }, // quad
  { points: "150,146 196,166 140,178 94,190 70,150", c: "green" }, // pentagon (rounded elbow)
  { points: "94,190 70,150 0,150 62,214", c: "red" }, // quad (rounded elbow)
  { points: "0,150 62,214 48,262 0,320 0,230", c: "blue" }, // pentagon (tail)
  { points: "48,262 0,320 34,330", c: "red" }, // triangle (tail)
  { points: "34,330 0,320 0,410 23,412", c: "green" }, // quad (tail)
  { points: "23,412 0,410 12,492", c: "blue" }, // triangle (tail)
  { points: "0,410 12,492 0,556 0,500", c: "green" }, // quad (tail tip)

  // ── RIGHT half — thick bridge span, then slim 1/x base with the same rounded elbow ──
  { points: "800,74 872,62 886,92", c: "red" }, // triangle (crown tip)
  { points: "872,62 886,92 948,74", c: "green" }, // triangle
  { points: "948,74 886,92 968,108 1052,134 1024,70", c: "blue" }, // pentagon
  { points: "1052,134 1024,70 1098,86", c: "green" }, // triangle
  { points: "1052,134 1098,86 1166,82 1132,150", c: "blue" }, // quad
  { points: "1132,150 1166,82 1200,168", c: "green" }, // triangle
  { points: "1200,168 1166,82 1206,98", c: "blue" }, // triangle
  { points: "1206,98 1200,168 1206,186", c: "red" }, // triangle (bridge / base seam)
  { points: "1206,98 1206,186 1242,130", c: "blue" }, // triangle
  { points: "1242,130 1206,98 1284,110 1318,144", c: "green" }, // quad
  { points: "1284,110 1318,144 1348,96", c: "red" }, // triangle
  { points: "1348,96 1318,144 1370,150 1440,110", c: "green" }, // quad
  { points: "1370,150 1440,110 1440,150", c: "blue" }, // triangle
  { points: "1206,186 1242,130 1300,178 1244,166", c: "red" }, // quad
  { points: "1242,130 1300,178 1346,190 1370,150 1318,144", c: "blue" }, // pentagon (rounded elbow)
  { points: "1370,150 1346,190 1378,214 1440,150", c: "red" }, // quad (rounded elbow)
  { points: "1378,214 1440,150 1440,230 1440,320 1392,262", c: "green" }, // pentagon (tail)
  { points: "1392,262 1440,320 1406,330", c: "red" }, // triangle (tail)
  { points: "1440,320 1406,330 1417,412 1440,410", c: "blue" }, // quad (tail)
  { points: "1440,410 1417,412 1428,492", c: "green" }, // triangle (tail)
  { points: "1440,410 1428,492 1440,556 1440,500", c: "red" }, // quad (tail tip)
];

export function MosaicArch({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 42 1440 522"
      className={`pointer-events-none block h-auto w-full ${className}`}
      fill="none"
    >
      <MosaicTiles tiles={ARCH_TILES} gap={3} />
    </svg>
  );
}
