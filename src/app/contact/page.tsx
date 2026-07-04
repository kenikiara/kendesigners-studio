import type { Metadata } from "next";
import Image from "next/image";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Start a project with Ken Designers. Call or WhatsApp +254 758 958 928, or send your brief. You will talk to Ken Murithi directly.",
  alternates: { canonical: "/contact/" },
};

export default function Contact() {
  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          <h1 className="gs-reveal display text-6xl sm:text-7xl md:text-9xl mb-14">
            Talk to us<span className="text-yellow">.</span>
          </h1>
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
            <figure className="gs-reveal md:sticky md:top-24">
              <div className="relative rounded-3xl overflow-hidden bg-panel border border-white/5 aspect-[4/5]">
                <Image
                  src="/studio/ken-suit.webp"
                  alt="Ken Murithi, founder and lead developer of Ken Designers, in a black suit"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 to-transparent">
                  <p className="font-extrabold text-lg">Ken Murithi</p>
                  <p className="text-sm text-white/70 font-semibold">
                    Founder &amp; Lead Developer. You will talk to me directly.
                  </p>
                </div>
              </div>
            </figure>
            <div className="gs-reveal rounded-3xl bg-panel-2/50 border border-white/5 p-6 md:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
