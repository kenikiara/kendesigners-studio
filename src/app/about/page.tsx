import type { Metadata } from "next";
import Image from "next/image";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import Stats from "@/components/Stats";
import WordReveal from "@/components/WordReveal";
import { site, awards, tools } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the studio",
  description:
    "Ken Designers is an independent web design and development studio in Nairobi, led by Ken Murithi, winner of Best E-Commerce Website Developer of the Year.",
};

export default function About() {
  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main>
        {/* Blue hero panel, strove estudio-style */}
        <section className="rounded-3xl bg-blue px-6 md:px-12 pt-40 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_340px] gap-10 items-end">
            <h1 className="gs-reveal display text-5xl sm:text-6xl md:text-8xl">
              Web Design &<br />
              Development<span className="text-yellow">.</span>
            </h1>
            <p className="gs-reveal text-sm font-semibold leading-relaxed text-white/90">
              We are an independent studio specialised in websites and digital
              platforms, from the identity of your brand to the system that
              runs your business. We work with founders and teams who want to
              build something that lasts.
            </p>
          </div>
        </section>

        <p className="text-center text-xs font-bold tracking-widest text-muted py-14">
          ( About us )
        </p>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <WordReveal text="Investing in your website is not an expense. It is the decision that separates businesses that grow from businesses that survive. We have spent years proving that for Kenyan companies, one launch at a time." />
        </section>

        {/* Founder */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
            <div className="gs-reveal relative rounded-3xl overflow-hidden bg-panel border border-white/5">
              <Image
                src="/studio/ken-suit.webp"
                alt="Ken Murithi, founder and lead developer of Ken Designers, in a black suit"
                width={1000}
                height={1240}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-auto"
              />
            </div>
            <div>
              <p className="gs-reveal text-xs font-bold tracking-widest text-muted uppercase mb-6">
                ( The founder )
              </p>
              <h2 className="gs-reveal display text-4xl md:text-6xl mb-6">
                {site.founder}<span className="text-blue">.</span>
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed max-w-md">
                <p className="gs-reveal">
                  Ken is a developer who has spent years building for one
                  specific market: businesses that sell to East Africans. That
                  focus shows in details most agencies never touch, from M-Pesa
                  flows that do not drop transactions to delivery logic that
                  understands how Kenya actually ships.
                </p>
                <p className="gs-reveal">
                  The work has been judged nationally: {awards[0].title} and{" "}
                  {awards[1].title} at the {awards[0].org}, with current
                  nominations at the {awards[2].org}.
                </p>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2">
                {tools.map((t) => (
                  <li
                    key={t}
                    className="gs-reveal px-4 py-1.5 rounded-full bg-panel border border-white/10 text-xs font-bold text-white/70"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="grid sm:grid-cols-2 gap-4">
            {awards.map((a) => (
              <div
                key={a.title + a.org}
                className="gs-reveal rounded-3xl bg-panel border border-white/5 p-7 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">
                    {a.org}
                  </p>
                  <h3 className="font-extrabold text-lg leading-snug">{a.title}</h3>
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
        </section>

        <Stats />
      </main>
      <BigFooter />
    </div>
  );
}
