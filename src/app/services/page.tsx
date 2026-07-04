import type { Metadata } from "next";
import Image from "next/image";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import { serviceDetails } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web design, online stores, SEO, custom software and AI integration for East African businesses, from brand identity to the platform that runs your business.",
  alternates: { canonical: "/services/" },
};

export default function Services() {
  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          <div className="grid md:grid-cols-[1fr_340px] gap-10 items-end mb-20">
            <h1 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl">
              Services<span className="text-violet">.</span>
            </h1>
            <p className="gs-reveal text-sm text-white/60 font-medium leading-relaxed">
              Digital solutions designed for businesses in Kenya and East
              Africa. From your brand identity to your online presence to the
              software behind it.
            </p>
          </div>

          <div className="space-y-24 md:space-y-32">
            {serviceDetails.map((s, i) => (
              <div
                key={s.tag}
                className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${
                  i % 2 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="gs-reveal relative aspect-[4/3] rounded-3xl overflow-hidden bg-panel border border-white/5">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <div>
                  <span className="gs-reveal inline-block px-4 py-1.5 rounded-full border border-blue text-blue text-xs font-bold mb-6">
                    {s.tag}
                  </span>
                  <h2 className="gs-reveal display text-4xl md:text-6xl mb-6">
                    {s.title}
                  </h2>
                  <p className="gs-reveal text-base md:text-lg font-bold leading-relaxed mb-6 [color:#8b83e8]">
                    {s.lead}
                  </p>
                  <ul className="space-y-2">
                    {s.items.map((item) => (
                      <li key={item} className="gs-reveal text-white/70 text-sm md:text-base font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
