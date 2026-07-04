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
  {
    slug: "choosing-a-web-designer-in-kenya",
    title: "How to choose a web designer in Kenya",
    description:
      "What to look for when hiring a web designer or agency in Kenya, the questions to ask, and the red flags that cost businesses money.",
    category: "Guides",
    date: "2026-03-28",
    dateLabel: "28 March 2026",
    readMinutes: 5,
    cover: { src: "/work/jesse-architect.webp", alt: "Jesse Architect portfolio website" },
    intro:
      "A website is one of the biggest marketing investments most small businesses make, and the person who builds it matters as much as the budget. Here is how to choose well.",
    sections: [
      {
        heading: "Look at the work, not the pitch",
        body: [
          "Anyone can talk. Ask to see live sites the designer has built, then open them on your phone and check how fast they load and how they feel. If the examples look like every other template, expect your site to look the same.",
        ],
      },
      {
        heading: "Ask who runs it after launch",
        body: [
          "A site is not finished at launch, it is finished when it keeps working. Ask who handles hosting, updates and problems, and whether you can reach a real person. A cheap build with no support often costs more in the long run.",
        ],
      },
      {
        heading: "Watch for the red flags",
        body: [
          "No written quotation, no clear timeline, payment fully upfront, or a portfolio you cannot verify. A professional gives you a fixed scope and price before you commit, and is happy to answer questions.",
        ],
      },
    ],
  },
  {
    slug: "why-your-business-needs-a-website",
    title: "Why your business needs a website",
    description:
      "Social media is not enough. Here is why a proper website still matters for a business in Kenya, and what it does that a Facebook page cannot.",
    category: "Guides",
    date: "2026-03-10",
    dateLabel: "10 March 2026",
    readMinutes: 4,
    cover: { src: "/work/good-morning-babyshop.webp", alt: "Good Morning Babyshop online store" },
    intro:
      "Plenty of Kenyan businesses run entirely on WhatsApp and Instagram, and that can work for a while. But a website does things a social page never will.",
    sections: [
      {
        heading: "You own it",
        body: [
          "A social account can be restricted, hacked or shut down overnight, and you lose everything. Your website is yours. It is the one place online that no platform can take away from you.",
        ],
      },
      {
        heading: "It shows up on Google",
        body: [
          "When someone searches for what you sell, a social post rarely appears, but a well-built website can. That is customers finding you at the exact moment they are ready to buy.",
        ],
      },
      {
        heading: "It builds trust",
        body: [
          "A professional site with real photos, clear prices and easy contact tells a customer you are a serious business. For higher-value purchases, that credibility is often what closes the sale.",
        ],
      },
    ],
  },
  {
    slug: "woocommerce-vs-shopify-kenya",
    title: "WooCommerce vs Shopify for Kenyan stores",
    description:
      "A practical comparison of WooCommerce and Shopify for an online store in Kenya, covering M-Pesa, fees, control and which suits your business.",
    category: "Ecommerce",
    date: "2026-02-22",
    dateLabel: "22 February 2026",
    readMinutes: 6,
    cover: { src: "/work/sheflavours.webp", alt: "SheFlavours online store and catering" },
    intro:
      "Both can run a good store, but they suit different businesses. The decision usually comes down to payments, monthly cost and how much control you want.",
    sections: [
      {
        heading: "Payments and M-Pesa",
        body: [
          "WooCommerce integrates directly with M-Pesa Daraja, so STK push at checkout feels native and the fees stay low. Shopify supports M-Pesa through third parties, which can add cost and friction. For a store selling mainly to Kenyans, this matters a lot.",
        ],
      },
      {
        heading: "Cost over time",
        body: [
          "Shopify charges a monthly subscription and, on many plans, a cut of each sale. WooCommerce has no subscription, you pay for hosting and any premium extensions. For a growing store, that difference adds up.",
        ],
      },
      {
        heading: "Control",
        body: [
          "WooCommerce is open, so almost anything can be customised: wholesale pricing, unusual delivery rules, custom checkout logic. Shopify is more locked down, which is simpler but limits you when your business does not fit the standard mould.",
        ],
      },
    ],
  },
  {
    slug: "set-up-mpesa-on-your-website",
    title: "How to set up M-Pesa on your website",
    description:
      "A plain overview of what it takes to accept M-Pesa on your website through the Daraja API, and what to get right so payments do not fail.",
    category: "Payments",
    date: "2026-02-05",
    dateLabel: "5 February 2026",
    readMinutes: 5,
    cover: { src: "/work/sabin-smarthub.webp", alt: "Sabin SmartHub store with Lipa na M-Pesa" },
    intro:
      "Accepting M-Pesa on a website is not as simple as pasting a paybill number. Done properly, it is smooth. Done carelessly, customers get charged and orders vanish.",
    sections: [
      {
        heading: "What you need",
        body: [
          "A Safaricom Daraja account with API credentials, a paybill or till, and a website that can send a payment request and receive the result. For a business, a Lipa na M-Pesa Online (STK push) setup gives the cleanest customer experience.",
        ],
      },
      {
        heading: "The part most people get wrong",
        body: [
          "The order must only be marked paid when Safaricom confirms it through a callback, not when the PIN prompt is sent. Without a reliable callback handler, money leaves the customer's account and the order never updates.",
        ],
      },
      {
        heading: "Test with real money first",
        body: [
          "Always run real low-value transactions before launch and confirm every one reconciles correctly. This is the step that separates a payment flow that works from one that quietly loses sales.",
        ],
      },
    ],
  },
  {
    slug: "make-your-website-fast-in-kenya",
    title: "Make your website fast in Kenya",
    description:
      "Why site speed matters for Kenyan visitors on mobile data, what Core Web Vitals measure, and practical ways to make your website load faster.",
    category: "Performance",
    date: "2026-01-20",
    dateLabel: "20 January 2026",
    readMinutes: 5,
    cover: { src: "/work/excavator-truck-master.webp", alt: "Excavator Truck Master store" },
    intro:
      "Most Kenyans browse on mobile data, and a slow site loses them before it even loads. Speed is not a technical nicety, it is money.",
    sections: [
      {
        heading: "Why it matters here",
        body: [
          "On a patchy 3G or 4G connection, every extra second of load time increases the chance a visitor leaves. Google also uses speed as a ranking signal, so a slow site is harder to find in the first place.",
        ],
      },
      {
        heading: "What Core Web Vitals measure",
        body: [
          "They track how fast the main content appears, how quickly the page responds to a tap, and how much the layout jumps around while loading. Getting these right makes a site feel instant instead of sluggish.",
        ],
      },
      {
        heading: "The biggest wins",
        body: [
          "Compress and correctly size images, avoid heavy unused scripts, and serve the site from fast hosting. Images are almost always the biggest culprit, and fixing them is the fastest way to a quicker site.",
        ],
      },
    ],
  },
  {
    slug: "product-descriptions-that-sell",
    title: "Product descriptions that actually sell",
    description:
      "How to write product descriptions for your online store that answer buyer questions, build trust and turn browsers into paying customers.",
    category: "Ecommerce",
    date: "2026-01-08",
    dateLabel: "8 January 2026",
    readMinutes: 4,
    cover: { src: "/work/jinsoko.webp", alt: "Jinsoko wholesale footwear store" },
    intro:
      "A product page has one job: give a shopper enough confidence to buy without seeing the item in person. Weak descriptions leave that confidence on the table.",
    sections: [
      {
        heading: "Answer the real questions",
        body: [
          "Buyers want to know size, material, what is included, how it is delivered and whether it will work for them. Answer those plainly and you remove the hesitation that stops a sale.",
        ],
      },
      {
        heading: "Sell the benefit, not just the spec",
        body: [
          "A spec sheet lists features. A good description tells the customer what those features do for them. Both matter, but the benefit is what makes someone want it.",
        ],
      },
      {
        heading: "Write for the customer, and for search",
        body: [
          "Use the words your customers actually use when they search. That helps the page rank on Google and reads naturally to a human at the same time. Never stuff keywords, it hurts both.",
        ],
      },
    ],
  },
  {
    slug: "mobile-app-or-website",
    title: "Do you need a mobile app or a website?",
    description:
      "Most businesses that think they need an app actually need a good website. Here is how to tell which one is right for you, and why.",
    category: "Guides",
    date: "2025-12-14",
    dateLabel: "14 December 2025",
    readMinutes: 5,
    cover: { src: "/work/blue-lilac.webp", alt: "Blue Lilac Tours booking website" },
    intro:
      "An app sounds impressive, but it is often the more expensive answer to a problem a website solves better. The right choice depends on how customers will actually use it.",
    sections: [
      {
        heading: "When a website is enough",
        body: [
          "If people mainly discover you through search, browse and buy or enquire, a fast mobile-friendly website does the job. It works on every phone, needs no download, and shows up on Google. For most businesses, this is the answer.",
        ],
      },
      {
        heading: "When an app makes sense",
        body: [
          "Apps earn their cost when customers use them often and need things a browser cannot do well: push notifications, offline use, hardware features. Think daily-use tools, not a shop someone visits now and then.",
        ],
      },
      {
        heading: "The middle ground",
        body: [
          "A modern website can be made installable and app-like, giving a home-screen icon and a fast experience without the cost of building and maintaining native apps for two platforms. Often that is the smart place to start.",
        ],
      },
    ],
  },
  {
    slug: "get-your-business-on-google-maps",
    title: "Getting your business on Google Maps",
    description:
      "A step-by-step look at getting your business onto Google Maps and the local results, so nearby customers can find and choose you first.",
    category: "SEO",
    date: "2025-11-26",
    dateLabel: "26 November 2025",
    readMinutes: 5,
    cover: { src: "/work/stonecrest.webp", alt: "Stonecrest Real Estate website" },
    intro:
      "When someone searches for a business near them, Google shows a map and a short list. Being on that list is one of the highest-value things a local business can do, and it is free.",
    sections: [
      {
        heading: "Claim your profile",
        body: [
          "Create and verify a Google Business Profile with your exact name, address, phone number and category. Verification proves the business is real and is what puts you on the map.",
        ],
      },
      {
        heading: "Make it complete",
        body: [
          "Add real photos, accurate opening hours, the services you offer and a clear description. A complete profile ranks better and gives customers the confidence to pick you over an empty listing.",
        ],
      },
      {
        heading: "Earn and answer reviews",
        body: [
          "Reviews strongly influence both your ranking and whether people choose you. Ask happy customers to leave one, and reply to every review, positive or negative. It signals that you care.",
        ],
      },
    ],
  },
  {
    slug: "what-website-maintenance-costs",
    title: "What website maintenance really costs",
    description:
      "A website is not a one-time cost. Here is what ongoing maintenance actually involves, why it matters, and what to budget for it.",
    category: "Guides",
    date: "2025-11-05",
    dateLabel: "5 November 2025",
    readMinutes: 4,
    cover: { src: "/work/landplan.webp", alt: "LandPlan property platform" },
    intro:
      "Many businesses budget for building a site and forget what keeps it running. A neglected website slowly breaks, slows down and becomes a security risk.",
    sections: [
      {
        heading: "What maintenance covers",
        body: [
          "Hosting and domain renewal, software and security updates, backups, and fixing things that break. On a store, it also means keeping payments, plugins and integrations working as they change.",
        ],
      },
      {
        heading: "Why it is not optional",
        body: [
          "Out-of-date software is the most common way sites get hacked. A site that is never updated also gets slower and more fragile over time. Maintenance is cheaper than recovering from a breach or a rebuild.",
        ],
      },
      {
        heading: "What to expect",
        body: [
          "Costs depend on the site. A simple brochure site needs little, an active store needs more attention. The key is knowing who is responsible before something goes wrong, not after.",
        ],
      },
    ],
  },
  {
    slug: "using-ai-to-grow-your-store",
    title: "Using AI to grow your online store",
    description:
      "Practical, non-hype ways to use AI in an online store, from writing product copy to handling enquiries, and where it genuinely saves time.",
    category: "AI",
    date: "2025-10-18",
    dateLabel: "18 October 2025",
    readMinutes: 5,
    cover: { src: "/work/ruth-jackson.webp", alt: "Ruth Jackson AI Coach platform" },
    intro:
      "AI is easy to overhype. Used well, it quietly removes repetitive work so a small team can run a bigger store. Here is where it actually helps.",
    sections: [
      {
        heading: "Product content at scale",
        body: [
          "Writing hundreds of product descriptions by hand is slow. AI can draft consistent, on-brand copy from your product details in minutes, which you then review and refine. It turns days of work into hours.",
        ],
      },
      {
        heading: "Handling enquiries",
        body: [
          "A well-set-up assistant can answer common questions instantly, day and night, and pass the tricky ones to a human. Customers get faster replies and your team spends less time repeating the same answers.",
        ],
      },
      {
        heading: "Where to be careful",
        body: [
          "AI is a tool, not a replacement for judgement. Review what it produces, keep a human in the loop for anything customer-facing that matters, and use it to speed up good work, not to cut corners.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
