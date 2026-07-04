"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import WhatsAppButton from "./WhatsAppButton";

const links = [
  { href: "/work/", label: "Work", sup: "12" },
  { href: "/services/", label: "Services" },
  { href: "/achievements/", label: "Awards" },
  { href: "/articles/", label: "Articles" },
  { href: "/about/", label: "Studio" },
];

// Floating pill nav, strove-style: full pill at the top of the page,
// collapses to a compact capsule once you scroll.
export default function PillNav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className={`flex items-center gap-1 rounded-full bg-panel/90 backdrop-blur-md border border-white/5 shadow-2xl transition-all duration-500 ${
          compact ? "px-3 py-2" : "px-4 py-2.5"
        }`}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-extrabold tracking-tighter text-lg px-2 select-none"
          aria-label="Ken Designers home"
        >
          ken<span className="text-blue">.</span>
        </Link>

        <div
          className={`hidden md:flex items-center overflow-hidden transition-all duration-500 ${
            compact && !open ? "max-w-0 opacity-0" : "max-w-lg opacity-100"
          }`}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              {l.label}
              {l.sup && (
                <sup className="text-[9px] text-yellow ml-0.5">{l.sup}</sup>
              )}
            </Link>
          ))}
        </div>

        {compact && !open && (
          <button
            className="hidden md:flex items-center gap-1 px-2 py-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span className="w-1 h-1 rounded-full bg-red" />
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span className="w-1 h-1 rounded-full bg-white/60" />
          </button>
        )}

        <Link
          href="/contact/"
          className="hidden md:inline-block ml-1 px-4 py-2 rounded-full bg-violet text-white text-sm font-bold hover:bg-blue transition-colors whitespace-nowrap"
        >
          Talk to us
        </Link>

        <button
          className="md:hidden flex items-center gap-1 px-3 py-2"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red" />
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden absolute top-16 inset-x-4 rounded-3xl bg-panel border border-white/5 p-6 flex flex-col gap-4 shadow-2xl">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-2xl font-extrabold tracking-tight"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact/"
            onClick={() => setOpen(false)}
            className="mt-2 px-5 py-3 rounded-full bg-violet text-center font-bold"
          >
            Talk to us
          </Link>
          <WhatsAppButton className="text-sm font-bold text-white/60">
            WhatsApp {site.phoneDisplay}
          </WhatsAppButton>
        </div>
      )}
    </div>
  );
}
