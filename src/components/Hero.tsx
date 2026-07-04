import CyclePill from "./CyclePill";

// basePath is not applied to raw <video src> by Next, so prefix manually.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Full-bleed cinematic video hero inside the rounded page frame.
export default function Hero() {
  return (
    <section className="relative h-[92svh] min-h-[540px] overflow-hidden rounded-3xl">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.9) contrast(1.03) saturate(1.05)" }}
        src={`${basePath}/media/hero.mp4`}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
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
