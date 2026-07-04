"use client";

import { useRef } from "react";
import { tech, type Tech } from "@/lib/tech";

// Raw <img> src needs basePath prepended manually in static export.
const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

function TechCard({ t }: { t: Tech }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="gs-reveal group relative rounded-2xl bg-panel border border-white/5 p-5 md:p-6 transition-transform duration-200 will-change-transform hover:border-white/15"
      style={{
        transform:
          "perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transformStyle: "preserve-3d",
      }}
    >
      {/* cursor-following brand glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(320px circle at var(--mx,50%) var(--my,50%), ${t.color}22, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-4">
        <div
          className="shrink-0 w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg"
          style={{ transform: "translateZ(35px)" }}
        >
          <img
            src={`${bp}/tech/${t.slug}.svg`}
            alt={`${t.name} logo`}
            width={32}
            height={32}
            className="w-8 h-8"
            loading="lazy"
          />
        </div>
        <div style={{ transform: "translateZ(22px)" }}>
          <h3 className="font-extrabold text-base md:text-lg leading-tight">
            {t.name}
          </h3>
          <p className="text-white/55 text-xs md:text-sm mt-1 leading-snug">
            {t.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TechStack() {
  return (
    <section
      id="stack"
      className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28 scroll-mt-24"
    >
      <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
        <p className="gs-reveal text-xs font-bold tracking-widest text-muted uppercase mb-5">
          ( Our Tech Stack )
        </p>
        <h2 className="gs-reveal display text-4xl md:text-6xl mb-5">
          Our Tech Stack<span className="text-blue">.</span>
        </h2>
        <p className="gs-reveal text-white/60 leading-relaxed">
          We use modern, powerful tools to build solutions that are fast,
          secure, and ready to scale.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {tech.map((t) => (
          <TechCard key={t.slug} t={t} />
        ))}
      </div>
    </section>
  );
}
