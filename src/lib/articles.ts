export type Section = { heading?: string; body: string[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO
  dateLabel: string;
  readMinutes: number;
  cover: { src: string; alt: string };
  intro: string;
  sections: Section[];
};

export const articles: Article[] = [
  {
    slug: "how-mpesa-stk-push-works",
    title: "How M-Pesa STK push works on your store",
    description:
      "A plain-English guide to M-Pesa Daraja STK push: what happens when a customer pays, why some integrations drop transactions, and what a reliable checkout needs.",
    category: "Payments",
    date: "2026-06-20",
    dateLabel: "20 June 2026",
    readMinutes: 6,
    cover: {
      src: "/work/jinsoko.webp",
      alt: "Jinsoko wholesale store checkout that uses M-Pesa STK push",
    },
    intro:
      "STK push is the prompt that appears on a customer's phone asking them to enter their M-Pesa PIN. It feels simple to the buyer, but a lot happens behind it, and that is exactly where weak integrations fail.",
    sections: [
      {
        heading: "What happens when a customer pays",
        body: [
          "Your store sends a request to Safaricom's Daraja API with the amount and the customer's phone number. Safaricom pushes a PIN prompt to that phone. When the customer confirms, Safaricom processes the payment and sends the result back to your store through a callback URL.",
          "The order should only be marked paid when that callback confirms success, not when the prompt is sent. This is the single most common mistake we see: stores that assume payment happened because the prompt appeared.",
        ],
      },
      {
        heading: "Why transactions get lost",
        body: [
          "Callbacks arrive asynchronously, sometimes seconds later, sometimes after a retry. If your store has no reliable callback handler, or the callback URL is not publicly reachable, the money leaves the customer's account but the order never updates. The customer is charged and sees nothing.",
          "A production-grade integration reconciles every transaction: it records the checkout request, waits for the callback, and also queries Safaricom directly for any transaction that has not resolved. Nothing is left to chance.",
        ],
      },
      {
        heading: "What a reliable checkout needs",
        body: [
          "A publicly reachable HTTPS callback endpoint, idempotent handling so a repeated callback does not double-count an order, a status query fallback, and clear customer messaging while the payment settles. Get those right and M-Pesa checkout becomes the smoothest part of the buying experience.",
        ],
      },
    ],
  },
  {
    slug: "wordpress-or-nextjs-kenyan-business",
    title: "WordPress or Next.js for your business?",
    description:
      "The honest trade-offs between WooCommerce and a custom Next.js build for a Kenyan business, and how to choose without wasting money.",
    category: "Guides",
    date: "2026-06-05",
    dateLabel: "5 June 2026",
    readMinutes: 5,
    cover: {
      src: "/work/sabin-smarthub.webp",
      alt: "Sabin SmartHub WooCommerce electronics store",
    },
    intro:
      "There is no single right answer, and anyone who tells you otherwise is selling the tool they happen to know. The right choice depends on who runs the site after launch and how custom the logic needs to be.",
    sections: [
      {
        heading: "When WooCommerce wins",
        body: [
          "If your team needs to add products, run promotions and manage orders every day without calling a developer, WooCommerce is hard to beat. It has a mature admin, a huge plugin ecosystem, and M-Pesa and local delivery integrations that already exist. For most Kenyan retail and wholesale stores, this is the pragmatic choice.",
        ],
      },
      {
        heading: "When Next.js wins",
        body: [
          "If you are building a product rather than a shop, something with custom workflows, unusual data, heavy traffic or an app-like feel, a custom Next.js build gives you control and speed that a CMS cannot. It costs more up front and needs a developer to change, but it scales cleanly.",
        ],
      },
      {
        heading: "How we decide",
        body: [
          "We ask two questions: who edits the site after launch, and how much of the logic is off the shelf. A store a client team runs daily leans WordPress. A bespoke platform with custom rules leans Next.js. We build both, so the recommendation is based on your situation, not our comfort zone.",
        ],
      },
    ],
  },
  {
    slug: "ecommerce-website-cost-kenya",
    title: "How much does an ecommerce website cost in Kenya?",
    description:
      "What actually drives the price of an online store in Kenya, from a simple catalogue to a custom platform, and where the money goes.",
    category: "Guides",
    date: "2026-05-18",
    dateLabel: "18 May 2026",
    readMinutes: 5,
    cover: {
      src: "/work/good-morning-babyshop.webp",
      alt: "Good Morning Babyshop online store built for the Kenyan market",
    },
    intro:
      "The honest answer is that it depends, but not in a way meant to dodge the question. A few concrete factors decide the price, and understanding them helps you brief better and compare quotes fairly.",
    sections: [
      {
        heading: "What drives the price",
        body: [
          "Three things move the cost most: the number of products and how they are structured, the payment and delivery logic, and how custom the design is. A small catalogue with standard M-Pesa checkout is a very different job from a wholesale store with tiered pricing and minimum-order rules.",
        ],
      },
      {
        heading: "Where the money goes",
        body: [
          "Most of the value is in the parts customers never see directly: reliable payments, delivery zones that match how you actually ship, tax-ready invoicing, and a design system built for your brand rather than a template. Skimp on these and the store looks fine but leaks sales.",
        ],
      },
      {
        heading: "Getting a fair quote",
        body: [
          "Ask for a fixed price and timeline in writing, tied to a clear scope. A good studio will tell you what is in and what is out before you pay a deposit. We put all of this in a quotation so there are no surprises mid-project.",
        ],
      },
    ],
  },
  {
    slug: "local-seo-for-kenyan-businesses",
    title: "Local SEO: getting found on Google in Kenya",
    description:
      "Practical local SEO steps for businesses in Kenya, from Google Business Profile to the on-page basics that help customers find you first.",
    category: "SEO",
    date: "2026-05-02",
    dateLabel: "2 May 2026",
    readMinutes: 6,
    cover: {
      src: "/work/sense-of-adventure.webp",
      alt: "Sense of Adventure safari site structured for local search intent",
    },
    intro:
      "Most Kenyan buyers start on Google, often with a location in the query. If your business is not showing up for those searches, a competitor is getting the call you should have had.",
    sections: [
      {
        heading: "Claim and complete Google Business Profile",
        body: [
          "This is the highest-return local SEO task and it is free. A complete, verified profile with accurate hours, photos, categories and a consistent name, address and phone number is what puts you in the map results. Keep it updated and respond to reviews.",
        ],
      },
      {
        heading: "Get the on-page basics right",
        body: [
          "Every page needs a clear title, a useful meta description, one main heading, and content that answers what the searcher actually wants. Add structured data so Google understands your business, products and location. These are not tricks, they are how you communicate clearly to a machine.",
        ],
      },
      {
        heading: "Build local relevance",
        body: [
          "Content that speaks to how your customers search, county and neighbourhood terms, local delivery, prices in shillings, tells Google you serve that market. Consistency across your site, profile and any listings compounds over time into rankings that are hard to displace.",
        ],
      },
    ],
  },
  {
    slug: "kra-etims-online-store",
    title: "KRA eTIMS and your online store, explained",
    description:
      "A short, practical overview of KRA eTIMS for ecommerce in Kenya and why building your store to be eTIMS-ready from day one saves pain later.",
    category: "Compliance",
    date: "2026-04-14",
    dateLabel: "14 April 2026",
    readMinutes: 4,
    cover: {
      src: "/work/excavator-truck-master.webp",
      alt: "Excavator Truck Master store that handles higher-value invoiced sales",
    },
    intro:
      "Tax compliance is not the exciting part of running a store, but building for it from the start is far cheaper than retrofitting it under pressure later.",
    sections: [
      {
        heading: "What eTIMS is",
        body: [
          "eTIMS is the Kenya Revenue Authority's electronic tax invoicing system. Businesses within its scope are expected to generate compliant electronic invoices for their sales. For an online store, that means your checkout and order records need to produce the right invoice data.",
        ],
      },
      {
        heading: "Why build for it early",
        body: [
          "Retrofitting compliant invoicing onto a live store, with real orders and real customers, is stressful and error-prone. Structuring order and tax data correctly from the start means compliance is a setting you switch on, not a rebuild you scramble through.",
        ],
      },
      {
        heading: "A note, not advice",
        body: [
          "Rules change and your obligations depend on your specific business. Confirm your position with a qualified tax professional. What we do is make sure the store you launch can meet those obligations cleanly when you need it to.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
