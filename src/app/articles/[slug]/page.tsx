import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import { articles, getArticle } from "@/lib/articles";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}/` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      images: [article.cover.src],
      publishedTime: article.date,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `${site.url}${article.cover.src}`,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Person", name: site.founder },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: `${site.url}/articles/${article.slug}/`,
  };

  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <div className="p-2 md:p-3">
      <GsapEffects />
      <PillNav />
      <main className="pt-28 md:pt-36">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
          <p className="text-xs font-bold tracking-widest uppercase text-blue mb-6">
            <Link href="/articles/" className="hover:text-white">Articles</Link>
            {" · "}
            {article.category} · {article.readMinutes} min read
          </p>
          <h1 className="display text-4xl sm:text-5xl md:text-6xl mb-6">
            {article.title}
          </h1>
          <p className="text-white/50 text-sm font-semibold mb-8">
            By {site.founder} · {article.dateLabel}
          </p>

          <figure className="rounded-3xl overflow-hidden border border-white/5 mb-10">
            <div className="relative aspect-[16/9]">
              <Image
                src={article.cover.src}
                alt={article.cover.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover object-top"
                priority
              />
            </div>
          </figure>

          <p className="text-lg md:text-xl font-bold leading-relaxed mb-10">
            {article.intro}
          </p>

          <div className="space-y-10">
            {article.sections.map((s) => (
              <section key={s.heading ?? s.body[0].slice(0, 24)}>
                {s.heading && (
                  <h2 className="display text-2xl md:text-3xl mb-4">{s.heading}</h2>
                )}
                <div className="space-y-4 text-white/70 leading-relaxed">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-panel border border-white/5 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="font-extrabold text-lg max-w-sm">
              Building something for the East African market?
            </p>
            <WhatsAppButton
              intent={`a website after reading "${article.title}"`}
              className="shrink-0 px-6 py-3 rounded-full bg-blue font-bold text-sm hover:bg-violet transition-colors"
            >
              Talk to us
            </WhatsAppButton>
          </div>
        </article>

        {/* More articles */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 pb-24">
          <p className="text-xs font-bold tracking-widest uppercase text-muted mb-6">
            ( Keep reading )
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {more.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}/`}
                className="group rounded-3xl bg-panel border border-white/5 overflow-hidden"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={a.cover.src}
                    alt={a.cover.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-extrabold leading-snug group-hover:text-white/80 transition-colors">
                    {a.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BigFooter />
    </div>
  );
}
