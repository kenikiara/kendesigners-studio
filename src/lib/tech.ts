export type Tech = {
  slug: string;
  name: string;
  desc: string;
  color: string; // brand colour for the hover glow
};

export const tech: Tech[] = [
  { slug: "nextjs", name: "Next.js", desc: "React framework for fast production apps", color: "#ffffff" },
  { slug: "react", name: "React", desc: "Component-based user interfaces", color: "#61DAFB" },
  { slug: "typescript", name: "TypeScript", desc: "Typed JavaScript that scales safely", color: "#3178C6" },
  { slug: "javascript", name: "JavaScript", desc: "The language that runs the web", color: "#F7DF1E" },
  { slug: "python", name: "Python", desc: "Backend logic, automation and AI", color: "#3776AB" },
  { slug: "flask", name: "Flask", desc: "Lightweight Python web framework", color: "#ffffff" },
  { slug: "postgresql", name: "PostgreSQL", desc: "Powerful, reliable relational database", color: "#4169E1" },
  { slug: "mongodb", name: "MongoDB", desc: "Flexible document database", color: "#47A248" },
  { slug: "wordpress", name: "WordPress", desc: "Custom themes and WooCommerce stores", color: "#3858E9" },
];
