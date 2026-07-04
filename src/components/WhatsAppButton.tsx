"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { buildWhatsAppHref } from "@/lib/whatsapp";

// A real anchor whose href becomes the context-aware WhatsApp link after
// mount (avoids a hydration mismatch), and is recomputed on click so the
// message always carries the current page.
export default function WhatsAppButton({
  intent,
  className,
  children,
}: {
  intent?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [href, setHref] = useState(site.whatsapp);

  useEffect(() => {
    setHref(buildWhatsAppHref(intent));
  }, [intent]);

  return (
    <a
      href={href}
      rel="noopener"
      target="_blank"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.open(buildWhatsAppHref(intent), "_blank", "noopener");
      }}
    >
      {children}
    </a>
  );
}
