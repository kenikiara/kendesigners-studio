"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const words = ["a website?", "an online store?", "a brand?", "M-Pesa payments?", "SEO that works?"];

// Cycling CTA pill: "Need <word> Talk to us", typewriter style. The link goes
// to WhatsApp with a message pre-filled for whatever page it sits on.
export default function CyclePill({ align = "left" }: { align?: "left" | "center" }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState(words[0]);
  const [reduce, setReduce] = useState(false);
  const [href, setHref] = useState(site.whatsapp);

  useEffect(() => {
    setHref(buildWhatsAppHref());
  }, []);

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
    <div
      className={`flex ${align === "center" ? "justify-center" : "justify-start"} max-w-full`}
    >
      <a
        href={href}
        rel="noopener"
        target="_blank"
        onClick={(e) => {
          e.preventDefault();
          window.open(buildWhatsAppHref(), "_blank", "noopener");
        }}
        className="group inline-flex items-center gap-2 md:gap-3 rounded-full bg-blue pl-4 md:pl-5 pr-1.5 py-1.5 shadow-[0_0_40px_rgba(0,111,255,0.35)] ring-2 ring-white/20 hover:ring-white/50 transition-all max-w-full"
        aria-label={`Need ${words[i]} Talk to us on WhatsApp`}
      >
        <span className="text-xs sm:text-sm md:text-base font-semibold text-white/85 whitespace-nowrap">
          Need{" "}
          {/* reserve width for the longest word so the pill does not jump */}
          <span className="inline-block min-w-[6.5rem] sm:min-w-[7.5rem] md:min-w-[9rem] text-left font-extrabold text-white">
            {reduce ? words[0] : text}
            {!reduce && <span className="animate-pulse">|</span>}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-white text-black text-xs sm:text-sm md:text-base font-extrabold px-3 md:px-4 py-2 group-hover:bg-yellow transition-colors whitespace-nowrap">
          Talk to us
        </span>
      </a>
    </div>
  );
}
