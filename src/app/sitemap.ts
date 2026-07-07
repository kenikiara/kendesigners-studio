import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { articles } from "@/lib/articles";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
    { url: `${site.url}/work/`, priority: 0.9 },
    { url: `${site.url}/services/`, priority: 0.8 },
    { url: `${site.url}/achievements/`, priority: 0.7 },
    { url: `${site.url}/articles/`, priority: 0.8 },
    { url: `${site.url}/about/`, priority: 0.7 },
    { url: `${site.url}/contact/`, priority: 0.7 },
    { url: `${site.url}/bonga/`, priority: 0.7 },
    ...projects.map((p) => ({
      url: `${site.url}/work/${p.slug}/`,
      priority: 0.6,
    })),
    ...articles.map((a) => ({
      url: `${site.url}/articles/${a.slug}/`,
      lastModified: a.date,
      priority: 0.6,
    })),
    { url: `${site.url}/legal/privacy-policy/`, priority: 0.2 },
    { url: `${site.url}/legal/terms-of-service/`, priority: 0.2 },
  ];
}
