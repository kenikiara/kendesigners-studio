import Link from "next/link";
import CyclePill from "./CyclePill";
import { site, awards } from "@/lib/site";

export default function BigFooter() {
  return (
    <footer className="mt-10">
      <div className="py-20 md:py-28 flex flex-col items-center gap-10 px-6">
        <p className="text-center text-xs font-bold tracking-widest text-muted uppercase">
          {awards[0].org} winner. Let us build yours next
        </p>
        <CyclePill align="center" />

        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-bold text-white/80"
        >
          <Link href="/work/" className="hover:text-white">Work</Link>
          <Link href="/services/" className="hover:text-white">Services</Link>
          <Link href="/achievements/" className="hover:text-white">Achievements</Link>
          <Link href="/articles/" className="hover:text-white">Articles</Link>
          <Link href="/about/" className="hover:text-white">Studio</Link>
          <Link href="/contact/" className="hover:text-white">Contact</Link>
          {/* static page in public/, not a Next route — plain <a> with manual basePath */}
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/bonga/`}
            className="hover:text-white"
          >
            BONGA
          </a>
          <a href={site.tiktok} rel="noopener" className="hover:text-white">TikTok</a>
        </nav>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-white/50">
          <a href={`tel:${site.phone}`} className="hover:text-white">
            {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`} className="hover:text-white">
            {site.email}
          </a>
          <span>{site.location}</span>
        </div>
      </div>

      <div className="relative bg-blue rounded-t-[2rem] overflow-hidden">
        <p
          className="display text-white text-center whitespace-nowrap select-none leading-none tracking-tighter"
          style={{ fontSize: "clamp(5rem, 24vw, 24rem)", marginBottom: "-0.18em" }}
          aria-hidden="true"
        >
          KEN<span className="align-super" style={{ fontSize: "0.25em" }}>©</span>
        </p>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-5 text-xs font-bold text-white/90 border-t border-white/20">
          <Link href="/legal/privacy-policy/" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/legal/terms-of-service/" className="hover:underline">
            Terms of Service
          </Link>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
