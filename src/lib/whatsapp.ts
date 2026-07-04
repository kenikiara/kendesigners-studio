import { site } from "./site";
import { projects } from "./projects";
import { articles } from "./articles";

// Turn the current page into a plain-English intent so the WhatsApp message
// is relevant to wherever the client decided to reach out.
function intentFromPath(path: string): string {
  const work = path.match(/^\/work\/([^/]+)\/?$/);
  if (work) {
    const p = projects.find((x) => x.slug === work[1]);
    if (p) return `a project like ${p.name}`;
  }
  const article = path.match(/^\/articles\/([^/]+)\/?$/);
  if (article) {
    const a = articles.find((x) => x.slug === article[1]);
    if (a) return `a website after reading your article "${a.title}"`;
  }
  if (path.startsWith("/services")) return "your services";
  if (path.startsWith("/work")) return "one of your projects";
  if (path.startsWith("/achievements")) return "working with an award-winning studio";
  if (path.startsWith("/articles")) return "a website";
  if (path.startsWith("/about")) return "working with your studio";
  return "a new website";
}

// Build a wa.me link with a pre-filled, context-aware message that includes
// the page the client contacted from. Reads the live URL at call time, so it
// works the same on the real domain, GitHub Pages, or localhost.
export function buildWhatsAppHref(intentOverride?: string): string {
  let href = site.url;
  let path = "/";
  if (typeof window !== "undefined") {
    href = window.location.href;
    path = window.location.pathname;
  }
  const intent = intentOverride ?? intentFromPath(path);
  const message = `Hi Ken Designers, I'm interested in ${intent}. I'm reaching out from this page: ${href}`;
  return `${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
