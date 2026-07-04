"use client";

import { useEffect, useRef, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The hero video used to show a frozen first frame while it buffered, which
// looked stuck. This keeps it invisible (the hero stays black, matching the
// site) until it is actually playing, then fades it in. A timeout fallback
// reveals it even if autoplay is blocked. Mobile gets a tighter crop angle.
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const reveal = () => setReady(true);
    const nudge = () => v.play().catch(() => {});

    v.addEventListener("playing", reveal);
    v.addEventListener("canplay", nudge);
    if (v.readyState >= 2) nudge();

    // Insurance: if autoplay is blocked and "playing" never fires, still
    // show the video after a moment rather than leaving a black hero.
    const t = setTimeout(reveal, 2500);

    return () => {
      v.removeEventListener("playing", reveal);
      v.removeEventListener("canplay", nudge);
      clearTimeout(t);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover object-[50%_36%] md:object-center transition-opacity duration-700 ease-out"
      style={{
        filter: "brightness(0.9) contrast(1.03) saturate(1.05)",
        opacity: ready ? 1 : 0,
      }}
      src={`${basePath}/media/hero.mp4`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
