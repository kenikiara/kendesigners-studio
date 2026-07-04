import type { Metadata } from "next";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ken Designers handles the information you share with us.",
};

export default function Privacy() {
  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <div className="max-w-3xl mx-auto px-6 pb-24">
          <h1 className="gs-reveal display text-5xl md:text-7xl mb-12">
            Privacy Policy<span className="text-blue">.</span>
          </h1>
          <div className="space-y-6 text-white/70 leading-relaxed text-sm md:text-base">
            <p>
              This site does not run trackers, analytics cookies or third-party
              advertising. The contact form sends your message directly to our
              WhatsApp; nothing is stored on a server by this website.
            </p>
            <p>
              Information you share with us during a project (briefs, content,
              credentials for systems we build for you) is used only to deliver
              that project. We do not sell or share client information with
              third parties.
            </p>
            <p>
              Embedded third-party content, such as videos or social media
              posts, is governed by the privacy policies of those platforms.
            </p>
            <p>
              Questions about your data: {site.email} or {site.phoneDisplay}.
            </p>
          </div>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
