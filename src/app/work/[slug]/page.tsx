import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GsapEffects from "@/components/GsapEffects";
import PillNav from "@/components/PillNav";
import BigFooter from "@/components/BigFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
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
    title: `${project.name} — ${project.sector}`,
    description: project.metaDescription ?? project.summary,
    alternates: { canonical: `/work/${project.slug}/` },
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
      <GsapEffects />
      <PillNav />
      <main className="pt-32 md:pt-44">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-5xl mx-auto px-4 md:px-6 pb-24">
          {/* Centered project intro, strove project-detail style */}
          <header className="text-center max-w-3xl mx-auto mb-14">
            <h1
              className="gs-reveal display text-6xl sm:text-7xl md:text-9xl bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent"
            >
              {project.name}
            </h1>
            <p className="gs-reveal mt-8 text-lg md:text-xl font-bold leading-relaxed">
              {project.summary}
            </p>
            <dl className="gs-reveal mt-10 flex flex-wrap justify-center gap-x-10 gap-y-6">
              {[
                ["Service", project.sector],
                ["Client", project.name],
                ["Year", project.year],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold text-white/50 mb-2">{label}</dt>
                  <dd className="inline-block px-4 py-1.5 rounded-full bg-white text-black text-sm font-extrabold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </header>

          <div className="space-y-6">
            {project.images.map((img) => (
              <figure key={img.src} className="gs-reveal rounded-3xl overflow-hidden border border-white/5">
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

          <div className="mt-16 grid md:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-muted mb-4">
                ( The work )
              </p>
              <div className="space-y-5 text-white/70 leading-relaxed">
                {project.description.map((para) => (
                  <p key={para.slice(0, 32)} className="gs-reveal">{para}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-muted mb-4">
                ( Role + stack )
              </p>
              <p className="gs-reveal text-white/70 mb-4">{project.role}</p>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li
                    key={s}
                    className="gs-reveal px-4 py-1.5 rounded-full bg-panel border border-white/10 text-xs font-bold text-white/70"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap gap-3">
            <Link
              href="/work/"
              className="px-6 py-3 rounded-full bg-panel border border-white/10 font-bold text-sm hover:border-white/30 transition-colors"
            >
              ← All work
            </Link>
            <WhatsAppButton
              intent={`a project like ${project.name}`}
              className="px-6 py-3 rounded-full bg-blue font-bold text-sm hover:bg-violet transition-colors"
            >
              Build something like this
            </WhatsAppButton>
          </div>
        </article>
      </main>
      <BigFooter />
    </div>
  );
}
