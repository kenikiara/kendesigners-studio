import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
    { url: `${site.url}/about/`, priority: 0.8 },
    { url: `${site.url}/work/`, priority: 0.8 },
    { url: `${site.url}/services/`, priority: 0.8 },
    { url: `${site.url}/contact/`, priority: 0.8 },
    ...projects.map((p) => ({
      url: `${site.url}/work/${p.slug}/`,
      priority: 0.7,
    })),
    { url: `${site.url}/legal/privacy-policy/`, priority: 0.2 },
    { url: `${site.url}/legal/terms-of-service/`, priority: 0.2 },
  ];
}
