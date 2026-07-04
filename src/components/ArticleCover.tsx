// Original, category-themed cover graphic for articles. Replaces mismatched
// project screenshots with a relevant, on-brand illustration per topic.
// Pure SVG, no external images, so it is crisp at any size and costs nothing.

type Style = { color: string };

const CATS: Record<string, Style> = {
  Payments: { color: "#006fff" },
  Guides: { color: "#7c6cf0" },
  SEO: { color: "#22c55e" },
  Ecommerce: { color: "#e8182a" },
  Performance: { color: "#fbbc00" },
  Compliance: { color: "#14b8a6" },
  AI: { color: "#a855f7" },
};

// Glyphs are drawn centred in a ~140px box around (320,150), white stroke.
function Glyph({ category }: { category: string }) {
  const s = {
    fill: "none",
    stroke: "#fff",
    strokeWidth: 11,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (category) {
    case "Payments":
      return (
        <g {...s}>
          <rect x="262" y="96" width="86" height="150" rx="16" />
          <line x1="262" y1="216" x2="348" y2="216" />
          <circle cx="384" cy="150" r="40" />
          <path d="M384 130 v40 M370 143 h28" strokeWidth="9" />
        </g>
      );
    case "SEO":
      return (
        <g {...s}>
          <circle cx="300" cy="132" r="52" />
          <line x1="338" y1="170" x2="384" y2="216" />
          <path d="M282 140 l14 -16 l14 12 l16 -22" strokeWidth="9" />
        </g>
      );
    case "Ecommerce":
      return (
        <g {...s}>
          <path d="M272 128 h96 l-10 108 h-76 z" />
          <path d="M298 128 a22 22 0 0 1 44 0" />
        </g>
      );
    case "Performance":
      return (
        <g fill="#fff" stroke="none">
          <path d="M330 84 l-52 92 h40 l-14 74 l58 -102 h-42 z" />
        </g>
      );
    case "Compliance":
      return (
        <g {...s}>
          <path d="M320 88 l58 22 v40 c0 44 -30 74 -58 90 c-28 -16 -58 -46 -58 -90 v-40 z" />
          <path d="M298 158 l16 16 l30 -34" strokeWidth="9" />
        </g>
      );
    case "AI":
      return (
        <g fill="#fff" stroke="none">
          <path d="M320 82 c8 40 20 52 60 60 c-40 8 -52 20 -60 60 c-8 -40 -20 -52 -60 -60 c40 -8 52 -20 60 -60 z" />
          <circle cx="392" cy="104" r="10" />
        </g>
      );
    default: // Guides
      return (
        <g {...s}>
          <path d="M258 104 c26 -12 54 -12 62 8 c8 -20 36 -20 62 -8 v104 c-26 -12 -54 -12 -62 8 c-8 -20 -36 -20 -62 -8 z" />
          <line x1="320" y1="112" x2="320" y2="208" />
        </g>
      );
  }
}

export default function ArticleCover({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const { color } = CATS[category] ?? CATS.Guides;
  const gid = `g-${category}`;
  return (
    <svg
      viewBox="0 0 640 360"
      className={className}
      role="img"
      aria-label={`${category} article`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={gid} cx="70%" cy="28%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="55%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${gid}-dot`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity="0.06" />
        </pattern>
      </defs>
      <rect width="640" height="360" fill="#111111" />
      <rect width="640" height="360" fill={`url(#${gid}-dot)`} />
      <rect width="640" height="360" fill={`url(#${gid})`} />
      {/* colour tile behind the glyph, echoing the tech-stack cards */}
      <rect x="234" y="60" width="172" height="172" rx="34" fill={color} opacity="0.9" />
      <Glyph category={category} />
      <text
        x="320"
        y="292"
        textAnchor="middle"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        fontSize="26"
        fontWeight="800"
        letterSpacing="3"
        fill="#ffffff"
      >
        {category.toUpperCase()}
      </text>
    </svg>
  );
}
