import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import Stats from "@/components/Stats";
import { site, awards, achievementGallery } from "@/lib/site";

export const metadata: Metadata = {
  title: "Achievements & Awards",
  description:
    "Ken Designers is a multiple Kenya Ecommerce Awards winner, including Best E-Commerce Website Developer of the Year, judged on design and results.",
  alternates: { canonical: "/achievements/" },
};

export default function Achievements() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ken Designers awards and achievements",
    itemListElement: awards.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${a.title} (${a.org}) — ${a.status}`,
    })),
  };

  const feature = achievementGallery.find((g) => g.feature) ?? achievementGallery[0];
  const rest = achievementGallery.filter((g) => g !== feature);

  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          <div className="grid md:grid-cols-[1fr_360px] gap-10 items-end mb-14">
            <h1 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl">
              Achievements<span className="text-yellow">.</span>
            </h1>
            <p className="gs-reveal text-sm text-white/60 font-medium leading-relaxed">
              The work speaks for itself, but the recognition helps. Ken
              Designers is a multiple national award winner, judged on design,
              engineering and the results our clients get.
            </p>
          </div>

          {/* Award roll */}
          <div className="grid sm:grid-cols-2 gap-4 mb-16">
            {awards.map((a) => (
              <div
                key={a.title + a.org}
                className="gs-reveal rounded-3xl bg-panel border border-white/5 p-7 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">
                    {a.org}
                  </p>
                  <h2 className="font-extrabold text-lg leading-snug">{a.title}</h2>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-extrabold ${
                    a.status === "Won" ? "bg-yellow text-black" : "bg-violet text-white"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          {/* Ceremony gallery */}
          <p className="gs-reveal text-xs font-bold tracking-widest text-muted uppercase mb-6">
            ( From the ceremonies )
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <figure className="gs-reveal md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden bg-panel border border-white/5">
              <div className="relative aspect-[4/3] md:aspect-[16/12]">
                <Image
                  src={feature.src}
                  alt={feature.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="p-6">
                <p className="font-extrabold text-lg">{feature.title}</p>
                <p className="text-sm text-white/60 font-medium mt-1">{feature.caption}</p>
              </figcaption>
            </figure>
            {rest.map((g) => (
              <figure
                key={g.src}
                className="gs-reveal rounded-3xl overflow-hidden bg-panel border border-white/5"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="font-extrabold text-base">{g.title}</p>
                  <p className="text-xs text-white/60 font-medium mt-1">{g.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <Stats />

        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8 flex flex-wrap gap-3">
          <Link
            href="/work/"
            className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-yellow transition-colors"
          >
            See the award-winning work
          </Link>
          <Link
            href="/contact/"
            className="px-6 py-3 rounded-full bg-blue font-bold text-sm hover:bg-violet transition-colors"
          >
            Work with {site.founder.split(" ")[0]}
          </Link>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
