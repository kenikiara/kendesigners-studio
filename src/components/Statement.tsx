import { tools } from "@/lib/site";

export default function Statement() {
  return (
    <section id="studio" className="max-w-5xl mx-auto px-6 py-24 md:py-40 scroll-mt-24">
      <p className="gs-reveal text-center text-xs font-bold tracking-widest text-muted mb-10">
        ( Studio )
      </p>
      <p className="gs-reveal text-center text-2xl md:text-4xl font-semibold leading-snug tracking-tight max-w-4xl mx-auto">
        At Ken Designers we believe getting your business online should not be
        complicated. We design, build and run websites for the East African
        market: brand sites, booking platforms, portfolios and the online
        stores we win awards for. Real customers, not just likes.
      </p>

      <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {tools.map((t) => (
          <div
            key={t}
            className="gs-reveal flex items-center justify-center h-28 md:h-40 rounded-2xl bg-panel border border-white/5 text-muted font-bold text-sm md:text-lg hover:text-white hover:border-white/15 transition-colors"
          >
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}
