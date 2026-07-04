export type Project = {
  slug: string;
  name: string;
  sector: string;
  year: string;
  summary: string;
  description: string[];
  role: string;
  stack: string[];
  images: { src: string; alt: string }[];
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "jinsoko",
    name: "Jinsoko",
    year: "2025",
    sector: "Wholesale Ecommerce",
    summary:
      "A wholesale footwear platform serving over 1,000 retailers across Kenya, with bulk pricing, minimum-order logic and KES-native checkout.",
    description: [
      "Jinsoko sells shoes to retailers, not consumers, and the store logic had to reflect that. Every product carries a minimum order quantity, tiered bulk discounts, and a KSh 10,000 order floor enforced at cart level.",
      "We built the catalogue on WooCommerce with custom PHP for the wholesale rules, then tuned the storefront for the way Kenyan retailers actually buy: fast category browsing, per-pair pricing in KES, and nationwide delivery baked into the fulfilment flow.",
    ],
    role: "Design, development, wholesale pricing engine",
    stack: ["WordPress", "WooCommerce", "Custom PHP", "MySQL"],
    images: [
      {
        src: "/work/jinsoko.webp",
        alt: "Jinsoko wholesale footwear storefront with category grid, KES bulk pricing and minimum order quantities per product",
      },
    ],
    accent: "#b08d3e",
  },
  {
    slug: "good-morning-babyshop",
    name: "Good Morning Babyshop",
    year: "2025",
    sector: "Retail Ecommerce",
    summary:
      "A Nairobi baby store trusted by over 1,000 parents, with M-Pesa at checkout and a catalogue spanning eight product categories.",
    description: [
      "Good Morning Babyshop runs a physical store at Superior Center in Nairobi and needed an online catalogue that parents could trust as much as the shop floor. The brand needed warmth without losing credibility on safety-critical products like car seats and feeding gear.",
      "We designed a soft, category-first storefront and wired M-Pesa alongside card payments so a parent can reorder diapers in under a minute. Loyalty rewards and local delivery zones are handled natively, not bolted on.",
    ],
    role: "Brand-led store design, development, M-Pesa integration",
    stack: ["WordPress", "WooCommerce", "M-Pesa Daraja", "Custom PHP"],
    images: [
      {
        src: "/work/good-morning-babyshop.webp",
        alt: "Good Morning Babyshop online store homepage with pastel branding, category circles and best-seller products priced in KSh",
      },
      {
        src: "/work/good-morning-babyshop-2.webp",
        alt: "Secondary view of the Good Morning Babyshop storefront design",
      },
    ],
    accent: "#e07a9b",
  },
  {
    slug: "sabin-smarthub",
    name: "Sabin SmartHub",
    year: "2025",
    sector: "Electronics Ecommerce",
    summary:
      "An electronics retailer in Chuka selling phones, laptops and accessories countrywide, with Lipa na M-Pesa and same-day town delivery.",
    description: [
      "Sabin SmartHub competes with Nairobi's big electronics sellers from Tharaka Nithi County. The site had to make a county-town shop feel as credible as any national brand: genuine-product guarantees, 12-month warranties and transparent KSh pricing on every listing.",
      "We built a fast catalogue with brand and category navigation, deal badges driven by real stock data, and Lipa na M-Pesa checkout. Same-day delivery in Chuka and countrywide shipping are quoted directly in the purchase flow.",
    ],
    role: "Store design, development, payments and delivery logic",
    stack: ["WordPress", "WooCommerce", "M-Pesa Daraja", "MySQL"],
    images: [
      {
        src: "/work/sabin-smarthub.webp",
        alt: "Sabin SmartHub electronics store homepage showing phones, laptops and accessories with KSh pricing and Lipa na M-Pesa payment badges",
      },
    ],
    accent: "#2563ab",
  },
  {
    slug: "huwii-events",
    name: "Huwii Events",
    year: "2024",
    sector: "Events + Commerce",
    summary:
      "An events company covering 47 counties, with a WooCommerce catalogue where team-building games are listed for both hire and sale.",
    description: [
      "Huwii Events runs team building, interactive games and full event management for corporates, schools, churches and NGOs. The unusual requirement: their equipment doubles as inventory, so every game needed both a hire price and a sale price.",
      "We treated the catalogue as a dual-mode WooCommerce build with hire and sale variants per product, then wrapped it in a loud, high-energy brand system with video proof of past events and a TikTok feed embedded on the homepage.",
    ],
    role: "Brand site, dual hire-and-sale catalogue, video integration",
    stack: ["WordPress", "WooCommerce", "Custom PHP", "GSAP"],
    images: [
      {
        src: "/work/huwii-events.webp",
        alt: "Huwii Events homepage with orange and black branding, team building services and a games catalogue showing hire and sale prices in KSh",
      },
      {
        src: "/work/huwii-events-2.webp",
        alt: "Alternate design view of the Huwii Events website",
      },
    ],
    accent: "#e0641f",
  },
  {
    slug: "sense-of-adventure",
    name: "Sense of Adventure",
    year: "2024",
    sector: "Travel + Booking",
    summary:
      "A safari operator's booking site covering Kenya and East Africa, with itinerary packages priced in KES and a 4.9-star Tripadvisor record front and centre.",
    description: [
      "Sense of Adventure Kenya sells tailor-made safaris from an office in Thika Road, Nairobi. International visitors research hard before they book, so the site leads with destinations, transparent package pricing and five hundred verified reviews.",
      "We structured the catalogue around destinations and experiences, from Masai Mara packages to beach-and-safari combos, each with duration, park count and tour type surfaced at card level. Enquiries route straight to the operations team.",
    ],
    role: "Design, development, booking enquiry flow",
    stack: ["WordPress", "Custom PHP", "SEO Architecture"],
    images: [
      {
        src: "/work/sense-of-adventure.webp",
        alt: "Sense of Adventure Kenya safari website with Kilimanjaro hero image, destination cards and safari packages priced from KES 28,000",
      },
      {
        src: "/work/sense-of-adventure-2.webp",
        alt: "Alternate view of the Sense of Adventure safari website design",
      },
    ],
    accent: "#2e6b3e",
  },
  {
    slug: "landplan",
    name: "LandPlan",
    year: "2024",
    sector: "Real Estate",
    summary:
      "A land and property company with 5,000 clients, listing verified plots with title-deed status and prices from KSh 650,000.",
    description: [
      "LandPlan sells land, designs homes and runs construction projects across Kenya. Land buying in Kenya is a trust problem before it is anything else, so every listing carries verification status and a ready-title-deed badge backed by their legal team.",
      "We built the listings engine around location, acreage and land use, with residential, commercial and mixed-use filtering. Project galleries and a WhatsApp-first contact flow close the loop from browsing to a site visit.",
    ],
    role: "Listings platform design and development",
    stack: ["WordPress", "Custom PHP", "MySQL"],
    images: [
      {
        src: "/work/landplan.webp",
        alt: "LandPlan property website homepage with land listings showing acreage, location, KSh prices and ready title deed badges",
      },
      {
        src: "/work/landplan-2.webp",
        alt: "Alternate view of the LandPlan land and property website",
      },
    ],
    accent: "#3e7d4e",
  },
  {
    slug: "jesse-architect",
    name: "Jesse Architect",
    year: "2024",
    sector: "Portfolio",
    summary:
      "A portfolio for a registered architect with 50 completed projects, built to convert enquiries for residential and commercial work.",
    description: [
      "Jesse is a registered architect (A1690, BORAQS) in Nairobi with eight years of practice. His portfolio needed to feel like his buildings: composed, warm and precise, with the registration credentials that matter in Kenyan construction shown plainly.",
      "We designed a dark editorial layout in charcoal and brass, structured his services from feasibility studies through construction supervision, and built a featured-projects grid that filters by residential, commercial and interiors.",
    ],
    role: "Brand direction, portfolio design and build",
    stack: ["WordPress", "Custom Theme", "GSAP"],
    images: [
      {
        src: "/work/jesse-architect.webp",
        alt: "Jesse Architect portfolio homepage in dark charcoal and brass, with featured residential and commercial projects in Kiambu and Nairobi",
      },
    ],
    accent: "#c19a49",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
