"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const words = ["an online store?", "a brand?", "M-Pesa payments?", "a faster site?", "SEO that works?"];

// Cycling CTA pill: "Need <word> — Talk to us", typewriter style.
export default function CyclePill({ align = "left" }: { align?: "left" | "center" }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState(words[0]);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduce(true);
      return;
    }
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;
    const typeWord = (word: string, pos: number) => {
      setText(word.slice(0, pos));
      if (pos < word.length) {
        timer = setTimeout(() => typeWord(word, pos + 1), 45);
      } else {
        timer = setTimeout(() => {
          idx = (idx + 1) % words.length;
          setI(idx);
          typeWord(words[idx], 0);
        }, 2200);
      }
    };
    typeWord(words[0], 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex ${align === "center" ? "justify-center" : "justify-start"}`}>
      <a
        href={site.whatsapp}
        rel="noopener"
        className="group inline-flex items-center gap-3 rounded-full bg-blue pl-5 pr-1.5 py-1.5 shadow-[0_0_40px_rgba(0,111,255,0.35)] ring-2 ring-white/20 hover:ring-white/50 transition-all"
        aria-label={`Need ${words[i]} Talk to us on WhatsApp`}
      >
        <span className="text-sm md:text-base font-semibold text-white/85 whitespace-nowrap">
          Need <span className="font-extrabold text-white">{reduce ? words[0] : text}</span>
          {!reduce && <span className="animate-pulse">|</span>}
        </span>
        <span className="rounded-full bg-white text-black text-sm md:text-base font-extrabold px-4 py-2 group-hover:bg-yellow transition-colors whitespace-nowrap">
          Talk to us
        </span>
      </a>
    </div>
  );
}
