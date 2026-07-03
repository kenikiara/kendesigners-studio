import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
    ...projects.map((p) => ({
      url: `${site.url}/work/${p.slug}/`,
      priority: 0.7,
    })),
  ];
}
