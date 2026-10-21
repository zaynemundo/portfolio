/** Abstract artwork for the right half of the sign-in pages: soft violet glows
 *  with flowing lines across them, in the admin's purple. Drawn as SVG so it's
 *  sharp at any size, with its own light and dark palettes. */

const PALETTES = {
  light: {
    base: ["#f3efff", "#e4dbff"],
    glows: ["#a78bfa", "#7c3aed", "#f0abfc", "#c4b5fd"],
    lines: "#7c3aed",
    lineOpacity: 0.22,
  },
  dark: {
    base: ["#0c0a14", "#1a1033"],
    glows: ["#7c3aed", "#4c1d95", "#a21caf", "#6d28d9"],
    lines: "#c4b5fd",
    lineOpacity: 0.16,
  },
};

/** Gently rippled lines, each a little lower and more stretched than the last. */
const LINES = Array.from({ length: 14 }, (_, i) => {
  const y = 520 + i * 34;
  const lift = 120 + i * 9;
  return `M -100 ${y} C 200 ${y - lift}, 420 ${y + lift * 0.6}, 700 ${y - lift * 0.4} S 1000 ${y - lift}, 1100 ${y - lift * 0.2}`;
});

export function LoginArtwork({ isDark }: { isDark: boolean }) {
  const p = isDark ? PALETTES.dark : PALETTES.light;
  const id = isDark ? "art-dark" : "art-light";

  return (
    <svg
      viewBox="0 0 1000 1200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.base[0]} />
          <stop offset="1" stopColor={p.base[1]} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="90" />
        </filter>
      </defs>

      <rect width="1000" height="1200" fill={`url(#${id}-base)`} />

      <g filter={`url(#${id}-blur)`} opacity={isDark ? 0.9 : 0.75}>
        <circle cx="780" cy="240" r="260" fill={p.glows[0]} />
        <circle cx="260" cy="520" r="300" fill={p.glows[1]} />
        <circle cx="820" cy="860" r="240" fill={p.glows[2]} />
        <circle cx="380" cy="1080" r="220" fill={p.glows[3]} />
      </g>

      <g fill="none" stroke={p.lines} strokeWidth="1.5" opacity={p.lineOpacity}>
        {LINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Two rings, like ripples, around the top glow. */}
      <g fill="none" stroke={p.lines} opacity={p.lineOpacity * 1.4}>
        <circle cx="780" cy="240" r="150" strokeWidth="1.5" />
        <circle cx="780" cy="240" r="230" strokeWidth="1" strokeDasharray="4 10" />
      </g>
    </svg>
  );
}
