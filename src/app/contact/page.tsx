import type { Metadata } from "next";
import Image from "next/image";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Start a project with Ken Designers. Call or WhatsApp +254 758 958 928, email ken@kendesigners.com, or send the brief through the form.",
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
            <div className="gs-reveal relative rounded-3xl overflow-hidden bg-panel border border-white/5 aspect-square md:sticky md:top-24">
              <Image
                src="/media/faq-editorial.webp"
                alt="Editorial red-toned portrait of a creative holding a monitor showing a shopping cart icon"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
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
