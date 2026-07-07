import type { Metadata } from "next";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import BongaContent, { DOWNLOAD_URL } from "./BongaContent";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "BONGA — free voice typing for Windows",
  description:
    "Hold one key and talk. BONGA turns your voice into clean, punctuated text in any app on your Windows laptop. Free, offline, made in Kenya by Ken Designers.",
  alternates: { canonical: "/bonga/" },
  openGraph: {
    title: "BONGA — Usiandike. Bonga.",
    description:
      "Free voice typing for Windows. Hold one key, talk, and clean text lands in WhatsApp, Gmail, Word, anywhere. Works offline. Made in Kenya.",
    images: ["/bonga/og.png"],
  },
};

function BongaJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BONGA",
    operatingSystem: "Windows 10, Windows 11",
    applicationCategory: "UtilitiesApplication",
    description:
      "Free on-device voice dictation for Windows. Hold one key, speak, and clean punctuated text is typed into any app. Works fully offline.",
    url: `${site.url}/bonga/`,
    image: `${site.url}/bonga/og.png`,
    downloadUrl: DOWNLOAD_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
    author: { "@type": "Organization", name: site.name, url: site.url },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Bonga() {
  return (
    <div className="p-2 md:p-3">
      <BongaJsonLd />
      <GsapEffects />
      <PillNav />
      <main>
        <BongaContent />
      </main>
      <BigFooter />
    </div>
  );
}
