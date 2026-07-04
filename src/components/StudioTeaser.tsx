import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

// Home teaser for the studio: founder portrait on black, link to /about.
export default function StudioTeaser() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
        <div className="gs-reveal relative rounded-3xl overflow-hidden bg-panel border border-white/5">
          <Image
            src="/studio/ken-suit.webp"
            alt="Ken Murithi, founder and lead developer of Ken Designers, in a black suit"
            width={1000}
            height={1240}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-auto"
            loading="lazy"
          />
          <p className="absolute bottom-4 left-5 text-xs font-bold tracking-widest uppercase text-white/70">
            {site.founder} · Founder, Lead Developer
          </p>
        </div>
        <div>
          <p className="gs-reveal text-xs font-bold tracking-widest text-muted uppercase mb-6">
            ( The studio )
          </p>
          <h2 className="gs-reveal display text-4xl md:text-6xl mb-6">
            Built in Nairobi.
            <br />
            Judged nationally<span className="text-red">.</span>
          </h2>
          <p className="gs-reveal text-white/70 leading-relaxed max-w-md mb-8">
            Ken Designers is led by Ken Murithi, winner of Best E-Commerce
            Website Developer of the Year at the Kenya Ecommerce Awards. One
            studio, every discipline: design, engineering, payments and SEO.
          </p>
          <Link
            href="/about/"
            className="gs-reveal inline-block px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-yellow transition-colors"
          >
            About the studio
          </Link>
        </div>
      </div>
    </section>
  );
}
