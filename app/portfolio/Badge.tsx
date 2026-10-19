import type { OutcomeKey } from "@/lib/portfolio/outcomes";

export type Glyph = OutcomeKey | "first" | "hours" | "ship" | "all" | "streak";

// Scalloped sticker edge, computed once
export const SEAL = (() => {
  const pts: string[] = [];
  const n = 120;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = 41 + 3 * Math.cos(t * 14);
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  return pts.join(" ");
})();

type Shape =
  | { d: string; fill?: boolean; w?: number }
  | { cx: number; cy: number; r: number };

/** Glyph line art in a 100×100 box. Shared with the PDF so both draw the same badge. */
export const GLYPHS: Record<Glyph, Shape[]> = {
  // arrow launching off from a starting point
  agency: [{ cx: 36, cy: 64, r: 5 }, { d: "M40 60 L64 36", w: 5 }, { d: "M50 35 H65 V50", w: 5 }],
  // magnifier with a spark
  critical: [{ cx: 46, cy: 46, r: 12 }, { d: "M55 55 L66 66" }, { d: "M46 40 V46 H51", w: 3.5 }],
  // mountain with a flag at the top
  grit: [{ d: "M30 66 L46 40 L54 52 L59 45 L70 66 Z", fill: true }, { d: "M46 40 V28 L55 31 L46 34", w: 3.5 }],
  // puzzle piece
  problem: [{ d: "M35 38 H45 a5 5 0 1 1 10 0 H65 V48 a5 5 0 1 0 0 10 V66 H35 Z", fill: true }],
  // speech bubble
  communication: [{ d: "M32 36 H68 V58 H48 L38 66 V58 H32 Z", fill: true }, { d: "M40 45 H60 M40 51 H54", w: 3.5 }],
  first: [{ d: "M44 38 L52 32 V66" }, { d: "M42 66 H62" }],
  hours: [{ cx: 50, cy: 50, r: 16 }, { d: "M50 41 V50 L57 55" }],
  ship: [{ d: "M31 50 L68 33 L59 67 L50 55 Z", fill: true }, { d: "M50 55 L68 33" }],
  streak: [{ d: "M50 68c-9 0-15-6-15-14 0-9 8-12 9-22 6 4 9 9 8 15 3-2 4-5 4-8 5 4 9 10 9 15 0 8-6 14-15 14Z", fill: true }],
  all: [{ d: "M50 31 L55.6 44.2 L69.8 45.4 L59 54.8 L62.2 68.6 L50 61.2 L37.8 68.6 L41 54.8 L30.2 45.4 L44.4 44.2 Z", fill: true }],
};

function GlyphArt({ glyph }: { glyph: Glyph }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
      {GLYPHS[glyph].map((sh, i) =>
        "d" in sh ? (
          <path key={i} d={sh.d} strokeWidth={sh.w} fill={sh.fill ? "currentColor" : undefined} fillOpacity={sh.fill ? 0.22 : undefined} />
        ) : (
          <circle key={i} cx={sh.cx} cy={sh.cy} r={sh.r} />
        )
      )}
    </g>
  );
}

export default function Badge({
  glyph,
  color,
  tier = 0,
  locked = false,
  size = 84,
  title,
}: {
  glyph: Glyph;
  color: string;
  tier?: number; // 1-5, drawn as pips
  locked?: boolean;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={`gtp-badge${locked ? " is-locked" : ""}`}
    >
      {title ? <title>{title}</title> : null}
      {/* offset ink shadow, like the site's stickers */}
      <polygon points={SEAL} transform="translate(3 4)" fill="#141414" opacity={locked ? 0 : 1} />
      <polygon
        points={SEAL}
        fill={locked ? "#FBEFD9" : color}
        stroke="#141414"
        strokeWidth="2.5"
        strokeDasharray={locked ? "4 4" : undefined}
      />
      <circle cx="50" cy="50" r="27" fill={locked ? "none" : "#FFF4E6"} stroke="#141414" strokeWidth="2" opacity={locked ? 0.35 : 1} />
      <g color={locked ? "#b9ab95" : "#141414"}>
        <GlyphArt glyph={glyph} />
      </g>
      {!locked && tier > 0
        ? Array.from({ length: tier }).map((_, i) => (
            <circle
              key={i}
              cx={50 + (i - (tier - 1) / 2) * 9}
              cy={88}
              r={3.6}
              fill="#FDB927"
              stroke="#141414"
              strokeWidth="1.8"
            />
          ))
        : null}
    </svg>
  );
}
