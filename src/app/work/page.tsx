import type { Metadata } from "next";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import WorkGrid from "@/components/WorkGrid";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects by Ken Designers: websites, online stores, booking platforms and portfolios built for the East African market.",
};

export default function WorkIndex() {
  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          <div className="grid md:grid-cols-[1fr_360px] gap-10 items-end mb-12">
            <h1 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl">
              Work<span className="text-blue">.</span>
            </h1>
            <p className="gs-reveal text-sm text-white/60 font-medium leading-relaxed">
              A selection of projects where strategy, design and engineering
              work together to produce real results. Each one reflects our
              approach: understand the business, solve the concrete problem,
              build something that converts and scales.
            </p>
          </div>
          <WorkGrid />
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
