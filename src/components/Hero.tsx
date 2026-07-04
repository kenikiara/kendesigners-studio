import CyclePill from "./CyclePill";
import HeroVideo from "./HeroVideo";

// Full-bleed cinematic video hero inside the rounded page frame.
export default function Hero() {
  return (
    <section className="relative h-[88svh] min-h-[520px] md:h-[92svh] overflow-hidden rounded-3xl bg-[#030303]">
      <HeroVideo />
      {/* Fade the studio background into the site's exact black so it blends */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 115% at 50% 42%, transparent 30%, rgba(3,3,3,0.72) 72%, #030303 100%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/40" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <h1 className="display text-4xl sm:text-5xl md:text-7xl max-w-3xl">
            Websites that generate real customers
            <span className="text-red">.</span>
          </h1>
          <p className="mt-4 text-white/70 font-medium max-w-md text-sm md:text-base">
            Award-winning web design and development studio in Nairobi. Brand
            sites, booking platforms and the ecommerce we are known for.
          </p>
        </div>
        <CyclePill />
      </div>
    </section>
  );
}
