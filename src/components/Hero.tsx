import CyclePill from "./CyclePill";

// Full-bleed cinematic video hero inside the rounded page frame.
export default function Hero() {
  return (
    <section className="relative h-[92svh] min-h-[540px] overflow-hidden rounded-3xl">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/media/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <h1 className="display text-4xl sm:text-5xl md:text-7xl max-w-3xl">
            Ecommerce that generates real customers
            <span className="text-red">.</span>
          </h1>
          <p className="mt-4 text-white/70 font-medium max-w-md text-sm md:text-base">
            Award-winning web design and development studio in Nairobi. Built
            for how East Africa actually buys.
          </p>
        </div>
        <CyclePill />
      </div>
    </section>
  );
}
