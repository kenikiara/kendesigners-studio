import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/projects";

// Home showcase: first four projects, with a link to the full index.
export default function WorkShowcase() {
  return (
    <section id="work" className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32 scroll-mt-24">
      <h2 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl">
        Work<span className="text-blue">.</span>
      </h2>
      <p className="gs-reveal mt-6 max-w-md text-sm md:text-base text-white/70 font-medium leading-relaxed">
        Every project we take is a chance to transform a business. This is the
        work we are proud of: identities built on strategy, design with
        purpose, and results you can measure.
      </p>

      <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-4 md:gap-6">
        {projects.slice(0, 4).map((p, i) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}/`}
            className={`gs-reveal group relative overflow-hidden rounded-3xl bg-panel border border-white/5 ${
              i % 3 === 0 ? "md:col-span-2" : ""
            }`}
          >
            <div className={`relative ${i % 3 === 0 ? "aspect-[16/8]" : "aspect-[4/3]"} overflow-hidden`}>
              <Image
                src={p.images[0].src}
                alt={p.images[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 inset-x-0 p-5 md:p-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] md:text-xs font-bold tracking-widest text-white/60 uppercase mb-1.5">
                  {p.sector}
                </p>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {p.name}
                </h3>
              </div>
              <span className="shrink-0 rounded-full bg-white text-black font-extrabold text-lg w-11 h-11 flex items-center justify-center group-hover:bg-yellow group-hover:rotate-45 transition-all">
                ↗
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="gs-reveal mt-10 flex justify-center">
        <Link
          href="/work/"
          className="px-7 py-3.5 rounded-full bg-white text-black font-extrabold text-sm hover:bg-yellow transition-colors"
        >
          View all projects ({projects.length})
        </Link>
      </div>
    </section>
  );
}
