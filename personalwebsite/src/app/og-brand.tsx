// ImageResponse uses Satori, whose OKLCH support is less reliable than the
// browser's. These are sRGB equivalents of the canonical tokens in globals.css.
export const OG_COLORS = {
  surface: "#F9F4E6",
  surfaceRaised: "#FBF4E9",
  ink: "#1D140E",
  inkMuted: "#554B43",
  hairline: "#D3C9BA",
  accent: "#00839C",
  mosaicRed: "#BA5A5A",
  mosaicGreen: "#A4CE8B",
  mosaicBlue: "#86BCBD",
} as const;

// A restrained version of the cultural-mosaic frame used on the site. Two corner
// clusters of tesserae, separated by cream gaps, give every social card the same
// visual signature.
export function OgMosaicFrame() {
  const gap = { stroke: OG_COLORS.surface, strokeWidth: 2, strokeLinejoin: "round" as const };
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 210 190"
        width="250"
        height="226"
        style={{ position: "absolute", right: -34, top: -20, opacity: 0.9 }}
        fill="none"
      >
        <polygon points="210,4 158,16 168,64 210,54" fill={OG_COLORS.mosaicRed} {...gap} />
        <polygon points="158,16 108,10 120,60 168,64" fill={OG_COLORS.mosaicGreen} {...gap} />
        <polygon points="108,10 64,24 80,66 120,60" fill={OG_COLORS.mosaicBlue} {...gap} />
        <polygon points="64,24 28,40 44,72 80,66" fill={OG_COLORS.mosaicRed} {...gap} />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 205 170"
        width="238"
        height="198"
        style={{ position: "absolute", left: -46, bottom: -32, opacity: 0.9 }}
        fill="none"
      >
        <polygon points="0,168 56,150 44,104 0,120" fill={OG_COLORS.mosaicRed} {...gap} />
        <polygon points="56,150 108,140 92,96 44,104" fill={OG_COLORS.mosaicGreen} {...gap} />
        <polygon points="108,140 150,126 132,88 92,96" fill={OG_COLORS.mosaicBlue} {...gap} />
        <polygon points="150,126 188,116 168,84 132,88" fill={OG_COLORS.mosaicRed} {...gap} />
      </svg>
    </>
  );
}
