"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { services } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Violet mega-panel: giant centered heading with black service cards that
// fan out across the panel as you scroll (desktop). On mobile the cards
// are a swipeable row instead.
export default function ServicesPanel() {
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>(".svc-card");
          const spread = [
            { x: "-34vw", y: -40, r: -10 },
            { x: "-12vw", y: 90, r: 6 },
            { x: "12vw", y: -70, r: -5 },
            { x: "34vw", y: 60, r: 9 },
          ];
          gsap.fromTo(
            cards,
            { x: 0, y: 260, rotation: (i) => (i - 1.5) * 4, opacity: 0 },
            {
              opacity: 1,
              x: (i) => spread[i].x,
              y: (i) => spread[i].y,
              rotation: (i) => spread[i].r,
              ease: "none",
              stagger: 0.02,
              scrollTrigger: {
                trigger: panel.current,
                start: "top 70%",
                end: "bottom 60%",
                scrub: 0.6,
              },
            }
          );
        }
      );
      return () => mm.revert();
    },
    { scope: panel }
  );

  return (
    <section id="services" className="px-2 md:px-4 py-4 scroll-mt-20">
      <div
        ref={panel}
        className="relative overflow-hidden rounded-[2rem] bg-violet px-6 py-24 md:py-48"
      >
        <h2 className="display text-center text-5xl sm:text-6xl md:text-8xl relative z-0">
          What we
          <br />
          do best<span className="text-yellow">.</span>
        </h2>

        {/* Desktop: absolutely centered cards that fan out on scroll */}
        <div className="hidden md:block absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            {services.map((s) => (
              <article
                key={s.n}
                className="svc-card pointer-events-auto absolute w-56 lg:w-64 rounded-2xl bg-black p-6 shadow-2xl"
              >
                <p className="text-right text-xs font-bold text-violet">{s.n}</p>
                <p className="display text-6xl lg:text-7xl text-white my-6 text-center select-none">
                  {s.mark}
                </p>
                <h3 className="font-extrabold text-lg mb-2">{s.name}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{s.body}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Mobile: swipeable card row */}
        <div className="md:hidden mt-12 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6">
          {services.map((s) => (
            <article
              key={s.n}
              className="snap-center shrink-0 w-64 rounded-2xl bg-black p-6 shadow-2xl"
            >
              <p className="text-right text-xs font-bold text-violet">{s.n}</p>
              <p className="display text-6xl text-white my-5 text-center select-none">
                {s.mark}
              </p>
              <h3 className="font-extrabold text-lg mb-2">{s.name}</h3>
              <p className="text-white/60 text-xs leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
