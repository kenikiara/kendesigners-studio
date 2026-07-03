"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { stats } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Stats() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
          const target = Number(el.dataset.value);
          const obj = { n: 0 };
          gsap.to(obj, {
            n: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(obj.n)).padStart(2, "0");
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8 md:p-10"
          >
            <p className="text-xs font-bold tracking-widest text-muted uppercase mb-8">
              {s.label}
            </p>
            <p className="display text-7xl md:text-8xl">
              <span className="stat-num" data-value={s.value}>
                {String(s.value).padStart(2, "0")}
              </span>
              <span className="text-blue">{s.suffix}</span>
            </p>
            <p className="mt-8 text-sm text-white/60 font-medium">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
