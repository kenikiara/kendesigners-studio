"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Scroll-linked word highlight, strove-style: words brighten from grey to
// white as the paragraph scrolls through the viewport.
export default function WordReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current!.querySelectorAll("span"),
          { opacity: 0.22 },
          {
            opacity: 1,
            stagger: 0.06,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              end: "bottom 45%",
              scrub: 0.4,
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <p
      ref={ref}
      className="text-2xl md:text-4xl font-semibold leading-snug tracking-tight text-center max-w-3xl mx-auto"
    >
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`}>{w} </span>
      ))}
    </p>
  );
}
