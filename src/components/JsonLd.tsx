import { site, awards } from "@/lib/site";

// Organization + LocalBusiness structured data, rendered once on the home page.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#org`,
        name: site.name,
        url: site.url,
        email: site.email,
        telephone: site.phoneDisplay,
        founder: { "@type": "Person", name: site.founder },
        sameAs: [site.tiktok],
        award: awards
          .filter((a) => a.status === "Won")
          .map((a) => `${a.title} (${a.org})`),
      },
      {
        "@type": "LocalBusiness",
        "@id": `${site.url}/#business`,
        name: site.name,
        url: site.url,
        email: site.email,
        telephone: site.phoneDisplay,
        priceRange: "KSh",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
        parentOrganization: { "@id": `${site.url}/#org` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
