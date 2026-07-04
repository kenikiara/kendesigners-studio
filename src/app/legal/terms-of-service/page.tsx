import type { Metadata } from "next";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Engagement terms for Ken Designers projects.",
  alternates: { canonical: "/legal/terms-of-service/" },
};

export default function Terms() {
  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <div className="max-w-3xl mx-auto px-6 pb-24">
          <h1 className="gs-reveal display text-5xl md:text-7xl mb-12">
            Terms of Service<span className="text-violet">.</span>
          </h1>
          <div className="space-y-6 text-white/70 leading-relaxed text-sm md:text-base">
            <p>
              Every project starts with a written quotation stating scope,
              price and timeline. Work begins on receipt of the agreed deposit,
              with the balance due on the delivery milestones set out in the
              quotation.
            </p>
            <p>
              Client materials remain the client&apos;s property. On final
              payment, the client owns the delivered website and its content.
              Ken Designers retains the right to show the work in its
              portfolio unless agreed otherwise in writing.
            </p>
            <p>
              Support and maintenance after launch are available as a separate
              agreement. Third-party costs such as domains, hosting and paid
              plugins are billed at cost.
            </p>
            <p>
              Questions about these terms: {site.email} or {site.phoneDisplay}.
            </p>
          </div>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
