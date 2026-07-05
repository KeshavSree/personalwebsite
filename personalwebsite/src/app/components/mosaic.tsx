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
      preserveAspectRatio="none"
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
