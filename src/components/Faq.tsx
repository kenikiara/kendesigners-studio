"use client";

import Image from "next/image";
import { useState } from "react";
import { faqs } from "@/lib/site";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32 scroll-mt-24">
      <h2 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl mb-14 md:mb-20">
        FAQ<span className="text-red">.</span>
      </h2>

      <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-10 md:gap-14 items-start">
        <figure className="gs-reveal max-w-xs">
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <Image
              src="/media/faq-editorial.webp"
              alt="Editorial red-toned portrait of a creative holding a monitor showing a shopping cart icon"
              fill
              sizes="(max-width: 768px) 90vw, 320px"
              className="object-cover"
              loading="lazy"
            />
          </div>
          <figcaption className="mt-4 text-xs font-bold leading-relaxed text-white/70">
            We believe in total transparency. If you cannot find what you are
            looking for here, message us on WhatsApp and we will sort it out
            together.
          </figcaption>
        </figure>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="gs-reveal rounded-2xl bg-panel border border-white/5 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-left"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm md:text-base">{f.q}</span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                      isOpen ? "bg-blue rotate-45" : "bg-white/10"
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 md:px-6 pb-5 text-sm text-white/65 leading-relaxed max-w-2xl">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
