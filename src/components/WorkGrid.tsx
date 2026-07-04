"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { orderedProjects as projects } from "@/lib/projects";

const filters = [
  { label: "All", match: () => true },
  { label: "Ecommerce", match: (s: string) => s.includes("Ecommerce") || s.includes("Commerce") },
  { label: "Travel", match: (s: string) => s.includes("Travel") },
  { label: "Real Estate", match: (s: string) => s.includes("Real Estate") },
  { label: "Education", match: (s: string) => s.includes("Education") },
  { label: "Portfolio", match: (s: string) => s.includes("Portfolio") },
];

// Filterable project grid, strove-style: pill filters, mixed-size cards
// with a caption under each and a "View" pill on hover.
export default function WorkGrid() {
  const [active, setActive] = useState(0);
  const shown = projects.filter((p) => filters[active].match(p.sector));

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-6 mb-10">
        {filters.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setActive(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              active === i
                ? "bg-blue text-white"
                : "bg-panel text-white/70 hover:text-white border border-white/10"
            }`}
            aria-pressed={active === i}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-10">
        {shown.map((p, i) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}/`}
            className={`group ${i % 3 === 0 ? "md:col-span-2" : ""}`}
          >
            <div
              className={`relative overflow-hidden rounded-3xl bg-panel border border-white/5 ${
                i % 3 === 0 ? "aspect-[16/8]" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={p.images[0].src}
                alt={p.images[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                loading="lazy"
              />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow text-black text-sm font-extrabold px-5 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                View
              </span>
            </div>
            <p className="mt-3 text-sm font-bold text-white/60 group-hover:text-white transition-colors">
              {p.name} <span className="text-white/30">· {p.sector}</span>
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
