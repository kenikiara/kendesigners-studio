import type { Metadata } from "next";
import Link from "next/link";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import ArticleCover from "@/components/ArticleCover";
import { articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Practical guides on ecommerce, M-Pesa payments, SEO and web development for businesses in Kenya and East Africa, written by the Ken Designers studio.",
  alternates: { canonical: "/articles/" },
};

export default function Articles() {
  const [lead, ...rest] = articles;

  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          <div className="grid md:grid-cols-[1fr_360px] gap-10 items-end mb-14">
            <h1 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl">
              Articles<span className="text-blue">.</span>
            </h1>
            <p className="gs-reveal text-sm text-white/60 font-medium leading-relaxed">
              Practical writing on building and selling online in East Africa:
              payments, SEO, and the decisions that actually matter. No fluff,
              no jargon for its own sake.
            </p>
          </div>

          {/* Lead article */}
          <Link
            href={`/articles/${lead.slug}/`}
            className="gs-reveal group grid md:grid-cols-2 gap-6 md:gap-10 items-center mb-16 rounded-3xl bg-panel border border-white/5 overflow-hidden"
          >
            <div className="relative aspect-[16/10] md:aspect-auto md:h-full min-h-64 overflow-hidden">
              <ArticleCover
                category={lead.category}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
            </div>
            <div className="p-6 md:p-10">
              <p className="text-xs font-bold tracking-widest uppercase text-blue mb-4">
                {lead.category} · {lead.readMinutes} min read
              </p>
              <h2 className="display text-3xl md:text-4xl mb-4 group-hover:text-white/80 transition-colors">
                {lead.title}
              </h2>
              <p className="text-white/60 leading-relaxed text-sm md:text-base">
                {lead.description}
              </p>
              <p className="mt-6 text-sm font-extrabold text-yellow">Read article →</p>
            </div>
          </Link>

          {/* Rest */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}/`}
                className="gs-reveal group rounded-3xl bg-panel border border-white/5 overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ArticleCover
                    category={a.category}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-blue mb-3">
                    {a.category} · {a.readMinutes} min
                  </p>
                  <h3 className="font-extrabold text-lg leading-snug mb-2 group-hover:text-white/80 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">{a.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
