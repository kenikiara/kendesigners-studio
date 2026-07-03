import CyclePill from "./CyclePill";
import { site, awards } from "@/lib/site";

export default function BigFooter() {
  return (
    <footer className="mt-10">
      <div className="py-20 md:py-32 flex flex-col items-center gap-10 px-6">
        <p className="text-center text-xs font-bold tracking-widest text-muted uppercase">
          {awards[0].org} winner. Let us build yours next
        </p>
        <CyclePill align="center" />
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-white/70">
          <a href={`tel:${site.phone}`} className="hover:text-white">
            {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`} className="hover:text-white">
            {site.email}
          </a>
          <a href={site.tiktok} rel="noopener" className="hover:text-white">
            TikTok {site.tiktokHandle}
          </a>
          <span className="text-white/40">{site.location}</span>
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
          <span>Ken Designers, Nairobi</span>
          <span>Winner, Kenya Ecommerce Awards</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
