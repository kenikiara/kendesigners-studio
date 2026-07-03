import GsapEffects from "@/components/GsapEffects";
import JsonLd from "@/components/JsonLd";
import PillNav from "@/components/PillNav";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import WorkShowcase from "@/components/WorkShowcase";
import ServicesPanel from "@/components/ServicesPanel";
import Stats from "@/components/Stats";
import Faq from "@/components/Faq";
import BigFooter from "@/components/BigFooter";

export default function Home() {
  return (
    <div className="p-2 md:p-3">
      <JsonLd />
      <GsapEffects />
      <PillNav />
      <main>
        <Hero />
        <Statement />
        <WorkShowcase />
        <ServicesPanel />
        <Stats />
        <Faq />
      </main>
      <BigFooter />
    </div>
  );
}
