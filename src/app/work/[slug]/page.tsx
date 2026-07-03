import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import { projects, getProject } from "@/lib/projects";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.name} — ${project.sector} case study`,
    description: project.summary,
    openGraph: {
      title: `${project.name} | Ken Designers`,
      description: project.summary,
      images: [project.images[0].src],
    },
  };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.summary,
    creator: { "@type": "Organization", name: site.name, url: site.url },
    image: `${site.url}${project.images[0].src}`,
    genre: project.sector,
  };

  return (
    <div className="p-2 md:p-3">
      <PillNav />
      <main className="pt-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <p className="text-xs font-bold tracking-widest uppercase text-muted mb-4">
            ( Case study · {project.sector} )
          </p>
          <h1 className="display text-5xl sm:text-6xl md:text-8xl">
            {project.name}
            <span className="text-blue">.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-3xl">
            {project.summary}
          </p>

          <dl className="grid sm:grid-cols-2 gap-4 my-10">
            <div className="rounded-2xl bg-panel border border-white/5 p-6">
              <dt className="text-xs font-bold tracking-widest uppercase text-muted mb-2">
                Role
              </dt>
              <dd className="font-semibold text-sm">{project.role}</dd>
            </div>
            <div className="rounded-2xl bg-panel border border-white/5 p-6">
              <dt className="text-xs font-bold tracking-widest uppercase text-muted mb-2">
                Stack
              </dt>
              <dd className="font-semibold text-sm">{project.stack.join(" · ")}</dd>
            </div>
          </dl>

          <div className="space-y-5 text-base md:text-lg text-white/70 leading-relaxed max-w-3xl mb-14">
            {project.description.map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>

          <div className="space-y-6">
            {project.images.map((img) => (
              <figure key={img.src} className="rounded-3xl overflow-hidden border border-white/5">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={1600}
                  height={1200}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              href="/#work"
              className="px-6 py-3 rounded-full bg-panel border border-white/10 font-bold text-sm hover:border-white/30 transition-colors"
            >
              ← All work
            </Link>
            <a
              href={site.whatsapp}
              rel="noopener"
              className="px-6 py-3 rounded-full bg-blue font-bold text-sm hover:bg-violet transition-colors"
            >
              Build something like this
            </a>
          </div>
        </article>
      </main>
      <BigFooter />
    </div>
  );
}
