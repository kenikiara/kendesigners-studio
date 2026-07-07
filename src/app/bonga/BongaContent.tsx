"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const DOWNLOAD_URL =
  "https://github.com/kenikiara/bonga/releases/latest/download/Bonga-win64.zip";

const rotatorWords = [
  "WhatsApp messages",
  "client emails",
  "class assignments",
  "long reports",
  "code comments",
  "captions & posts",
];

const marqueeApps = [
  "WhatsApp Web",
  "Gmail",
  "Word",
  "Excel",
  "Telegram",
  "ChatGPT",
  "VS Code",
  "Facebook",
  "Instagram Web",
  "Notion",
  "Google Docs",
];

const demos = [
  {
    raw: "niaje brian uko na ile report ya jana...",
    out: "Niaje Brian, uko na ile report ya jana?",
  },
  {
    raw: "um tell the team the invoice is is ready...",
    out: "Tell the team the invoice is ready.",
  },
  {
    raw: "meeting imehamia saa nane kesho usichelewe...",
    out: "Meeting imehamia saa nane kesho, usichelewe.",
  },
];

const bongaFaqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is it really free?",
    a: "Right now, yes. Fully. No trial, no locked features, no card. BONGA is young and I want real people using it and telling me what's broken. A paid version may come later; whoever downloads now gets it free.",
  },
  {
    q: 'Windows says "Windows protected your PC". Kwani ni virus?',
    a: (
      <>
        Not a virus. That&apos;s Microsoft SmartScreen, and it flags any new app
        that hasn&apos;t bought a code-signing certificate yet (they cost
        hundreds of dollars a year). Click <b>More info</b>, then{" "}
        <b>Run anyway</b>. The full source code is public on{" "}
        <a
          href="https://github.com/kenikiara/bonga"
          className="text-blue hover:underline"
        >
          GitHub
        </a>{" "}
        if you want to check what it does.
      </>
    ),
  },
  {
    q: "How do I install it?",
    a: (
      <>
        Download the zip, right-click → <b>Extract All</b>, open the folder,
        and double-click <b>Bonga.exe</b>. The Home screen will tell you if the
        speech model needs its one-time download (one click). Then open
        WhatsApp Web, hold <b>Right Ctrl</b>, and say hi to someone. Tip: in
        Settings you can tick &quot;Launch BONGA when Windows starts&quot; so
        it&apos;s always ready.
      </>
    ),
  },
  {
    q: "Does it understand Kiswahili?",
    a: "Yes. It ships with a multilingual model covering Kiswahili and 100+ other languages. Set your language in Settings → Language, or leave it on auto-detect.",
  },
  {
    q: "Is my voice uploaded anywhere?",
    a: "No. Transcription happens on your laptop using an open-source model (Whisper). BONGA works with the internet switched off, which is the easiest proof: airplane mode it and try.",
  },
  {
    q: "The text comes out wrong sometimes. Nifanye nini?",
    a: (
      <>
        Three fixes, in order: speak a touch slower near the mic; add the names
        it keeps missing to <b>Dictionary</b>; and if your laptop can afford
        it, switch to the higher-quality model in <b>Settings → Speech
        model</b>. Then tell me what it misheard in the feedback box below,
        real examples are gold.
      </>
    ),
  },
  {
    q: "How do I update or uninstall?",
    a: (
      <>
        Update: download the new zip from this page and replace the old folder.
        Uninstall: delete the folder. BONGA keeps its settings in your Windows
        profile; delete <b>%APPDATA%\Bonga</b> too if you want every trace
        gone.
      </>
    ),
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[0.82em] bg-panel-2 border border-white/15 rounded-md px-2 py-0.5 whitespace-nowrap">
      {children}
    </kbd>
  );
}

function Beads({ count = 12 }: { count?: number }) {
  const colors = ["#fbbc00", "#e8182a", "#f5f5f5", "#1a9d5c"];
  return (
    <div className="flex gap-1.5 items-center" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: colors[i % 4] }}
        />
      ))}
    </div>
  );
}

function ArtRow({
  left,
  right,
  arrow,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  arrow?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-3 py-3 border-b border-dashed border-white/10 last:border-b-0 text-sm">
      <span className="text-muted">{left}</span>
      {arrow && <span className="text-yellow font-extrabold">→</span>}
      <span className="font-bold text-right">{right}</span>
    </div>
  );
}

// Animated hero "voice orb": morphing gradient blob, pulsing rings, a live
// equalizer, and two floating message bubbles that cycle Sheng/English lines.
function HeroOrb() {
  const vizRef = useRef<HTMLDivElement>(null);

  const eqBars = useMemo(() => {
    const N = 21;
    return Array.from({ length: N }, (_, i) => {
      const t = i / (N - 1);
      const amp = 16 + 64 * Math.exp(-Math.pow((t - 0.5) / 0.27, 2)); // tall middle, short edges
      return {
        h: Math.round(amp),
        delay: -((i * 97) % 1100),
        dur: 880 + ((i * 137) % 520),
      };
    });
  }, []);

  const bubbleMsgs = useMemo(
    () => [
      [
        "Niaje Brian, uko na ile report ya jana?",
        "Meeting imehamia saa nane kesho.",
        "Tuma hiyo quote leo please.",
      ],
      [
        "Tell the team the invoice is ready.",
        "Thanks Amina, cheque is out for delivery.",
        "Draft attached, review by Friday.",
      ],
    ],
    []
  );

  const [mi, setMi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMi((m) => m + 1), 4600);
    return () => clearInterval(t);
  }, []);

  // Pointer parallax on the floating bubbles (hover devices, motion allowed).
  useEffect(() => {
    const viz = vizRef.current;
    if (!viz) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const bubbles = Array.from(
      viz.querySelectorAll<HTMLElement>(".bonga-bubble")
    );
    const onMove = (e: MouseEvent) => {
      const r = viz.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      bubbles.forEach((bb, k) => {
        const f = k === 0 ? 14 : -11;
        bb.style.transform = `translate(${x * f}px, ${y * f}px)`;
      });
    };
    const onLeave = () => bubbles.forEach((bb) => (bb.style.transform = ""));
    viz.addEventListener("mousemove", onMove);
    viz.addEventListener("mouseleave", onLeave);
    return () => {
      viz.removeEventListener("mousemove", onMove);
      viz.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={vizRef}
      aria-hidden="true"
      className="gs-reveal relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center lg:max-w-[480px]"
    >
      <span className="bonga-ring" />
      <span className="bonga-ring" style={{ animationDelay: "1.3s" }} />
      <span className="bonga-ring" style={{ animationDelay: "2.6s" }} />
      <div className="bonga-blob" />
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center gap-[5px]">
        {eqBars.map((b, i) => (
          <span
            key={i}
            className="bonga-eqbar"
            style={
              {
                "--h": `${b.h}px`,
                animationDelay: `${b.delay}ms`,
                animationDuration: `${b.dur}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="bonga-bubble absolute right-[-2%] top-[3%] z-[3] hidden max-w-[230px] rounded-2xl border border-white/10 bg-[#101014] px-4 py-3 text-sm leading-snug shadow-2xl sm:block">
        <span className="mb-1 block text-[0.62rem] font-bold uppercase tracking-widest text-muted">
          💬 WhatsApp Web
        </span>
        {bubbleMsgs[0][mi % bubbleMsgs[0].length]}
        <span className="ml-1 font-extrabold text-[#29c274]">✓</span>
      </div>
      <div
        className="bonga-bubble absolute bottom-[2%] left-[-3%] z-[3] hidden max-w-[230px] rounded-2xl border border-white/10 bg-[#101014] px-4 py-3 text-sm leading-snug shadow-2xl sm:block"
        style={{ animationDelay: "2s" }}
      >
        <span className="mb-1 block text-[0.62rem] font-bold uppercase tracking-widest text-muted">
          📧 Gmail
        </span>
        {bubbleMsgs[1][mi % bubbleMsgs[1].length]}
        <span className="ml-1 font-extrabold text-[#29c274]">✓</span>
      </div>
    </div>
  );
}

export default function BongaContent() {
  const root = useRef<HTMLDivElement>(null);

  /* hero word rotator */
  const [wi, setWi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWi((w) => (w + 1) % rotatorWords.length), 2400);
    return () => clearInterval(t);
  }, []);

  /* live demo loop */
  const [typed, setTyped] = useState("");
  const [hearing, setHearing] = useState("");
  const [pillState, setPillState] = useState<"idle" | "rec" | "busy" | "done">("idle");
  const [barHeights, setBarHeights] = useState<number[]>(Array(12).fill(5));

  useEffect(() => {
    let cancelled = false;
    let barTimer: ReturnType<typeof setInterval> | null = null;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const wave = (on: boolean) => {
      if (barTimer) {
        clearInterval(barTimer);
        barTimer = null;
      }
      if (on) {
        barTimer = setInterval(
          () =>
            setBarHeights(Array.from({ length: 12 }, () => 4 + Math.random() * 20)),
          90
        );
      } else {
        setBarHeights(Array(12).fill(5));
      }
    };
    (async () => {
      let d = 0;
      while (!cancelled) {
        const demo = demos[d % demos.length];
        d++;
        setTyped("");
        setHearing("");
        setPillState("idle");
        wave(false);
        await sleep(1600);
        if (cancelled) break;
        setPillState("rec");
        wave(true);
        for (let i = 0; i <= demo.raw.length; i += 3) {
          if (cancelled) break;
          setHearing(demo.raw.slice(0, i));
          await sleep(70);
        }
        if (cancelled) break;
        await sleep(300);
        setPillState("busy");
        wave(false);
        setHearing("");
        await sleep(800);
        if (cancelled) break;
        setPillState("done");
        for (let i = 0; i <= demo.out.length; i++) {
          if (cancelled) break;
          setTyped(demo.out.slice(0, i));
          await sleep(26);
        }
        await sleep(2400);
      }
    })();
    return () => {
      cancelled = true;
      if (barTimer) clearInterval(barTimer);
    };
  }, []);

  /* feedback thank-you state */
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (window.location.search.includes("sent=1")) setSent(true);
  }, []);

  /* FAQ accordion */
  const [open, setOpen] = useState(0);

  /* count-ups + race bars */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".bonga-count").forEach((el) => {
          const target = Number(el.dataset.value);
          const dec = Number(el.dataset.decimals || 0);
          const obj = { n: 0 };
          gsap.to(obj, {
            n: target,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = obj.n.toFixed(dec);
            },
          });
        });
        gsap.utils.toArray<HTMLElement>(".bonga-fill").forEach((el) => {
          gsap.fromTo(
            el,
            { width: "0%" },
            {
              width: el.dataset.w || "100%",
              duration: 1.6,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const pillText = {
    idle: "Hold Right Ctrl…",
    rec: "Listening…",
    busy: "Transcribing…",
    done: "Done ✓",
  }[pillState];

  return (
    <div ref={root}>
      <style>{`
        @keyframes bonga-rise{from{transform:translateY(60%);opacity:0}to{transform:none;opacity:1}}
        .bonga-rise{animation:bonga-rise .5s cubic-bezier(.16,1,.3,1)}
        @keyframes bonga-scroll{to{transform:translateX(-50%)}}
        .bonga-marquee{animation:bonga-scroll 34s linear infinite}
        .bonga-marquee-mask:hover .bonga-marquee{animation-play-state:paused}
        .bonga-blob{
          width:min(80%,360px);aspect-ratio:1;
          background:
            radial-gradient(38% 42% at 63% 30%,rgba(251,188,0,.6),transparent 62%),
            radial-gradient(48% 52% at 28% 70%,rgba(139,131,232,.85),transparent 64%),
            radial-gradient(62% 64% at 50% 46%,#006fff 0%,rgba(0,111,255,.30) 58%,transparent 74%),
            radial-gradient(closest-side,#0a1a34,#050508);
          border-radius:47% 53% 58% 42%/49% 44% 56% 51%;
          animation:bonga-morph 11s ease-in-out infinite alternate,bonga-drift 26s linear infinite;
          box-shadow:0 0 110px 6px rgba(0,111,255,.32),inset 0 0 70px rgba(0,0,0,.4);
          filter:saturate(1.15);
        }
        @keyframes bonga-morph{
          0%{border-radius:47% 53% 58% 42%/49% 44% 56% 51%}
          33%{border-radius:57% 43% 41% 59%/44% 58% 42% 56%}
          66%{border-radius:41% 59% 55% 45%/57% 42% 58% 43%}
          100%{border-radius:52% 48% 44% 56%/46% 55% 45% 54%}
        }
        @keyframes bonga-drift{to{transform:rotate(360deg)}}
        .bonga-ring{
          position:absolute;inset:0;margin:auto;width:min(80%,360px);aspect-ratio:1;border-radius:50%;
          border:1px solid rgba(61,139,255,.55);opacity:0;
          animation:bonga-ringpulse 3.9s cubic-bezier(.16,1,.3,1) infinite;
        }
        @keyframes bonga-ringpulse{0%{transform:scale(.92);opacity:.65}70%{opacity:.2}100%{transform:scale(1.42);opacity:0}}
        .bonga-eqbar{
          width:6px;border-radius:3px;background:rgba(255,255,255,.92);height:12px;
          box-shadow:0 0 16px rgba(160,200,255,.55);
          animation-name:bonga-eqb;animation-timing-function:ease-in-out;animation-iteration-count:infinite;
        }
        @keyframes bonga-eqb{0%,100%{height:10px}50%{height:var(--h,58px)}}
        .bonga-bubble{animation:bonga-floaty 6s ease-in-out infinite;transition:transform .3s cubic-bezier(.16,1,.3,1)}
        @keyframes bonga-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @media (prefers-reduced-motion: reduce){
          .bonga-rise,.bonga-marquee,.bonga-blob,.bonga-ring,.bonga-eqbar,.bonga-bubble{animation:none}
        }
      `}</style>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-36 md:pt-44 pb-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
          <div>
        <p className="gs-reveal inline-flex items-center gap-2 rounded-full bg-yellow/10 border border-yellow/25 text-yellow px-4 py-1.5 text-xs font-bold">
          ● Free for Windows · Made in Kenya 🇰🇪
        </p>
        <h1 className="gs-reveal display text-6xl sm:text-7xl md:text-8xl mt-8">
          Usiandike.
          <br />
          <span className="text-blue">Bonga.</span>
        </h1>
        <p className="gs-reveal flex flex-wrap gap-x-2 items-center mt-7 text-lg md:text-2xl font-semibold text-muted">
          <span>Speak your</span>
          <span
            key={wi}
            className="bonga-rise inline-block text-yellow min-w-[11ch]"
          >
            {rotatorWords[wi]}
          </span>
        </p>
        <div className="gs-reveal mt-7">
          <Beads />
        </div>
        <p className="gs-reveal mt-6 max-w-xl text-white/70 leading-relaxed md:text-lg">
          <strong className="text-white">Bonga ni kuongea.</strong> Hold one
          key, say what you&apos;re thinking, and BONGA types it for you in any
          app on your laptop. Clean, punctuated, hakuna filler words. No
          account, no subscription, no internet needed after setup.
        </p>
        <div className="gs-reveal mt-9 flex flex-wrap items-center gap-4">
          <a
            href={DOWNLOAD_URL}
            className="px-8 py-4 rounded-full bg-blue text-white font-bold hover:bg-violet transition-colors"
          >
            Download free for Windows
          </a>
          <a
            href="#how"
            className="px-8 py-4 rounded-full border border-white/15 font-bold text-white/85 hover:bg-panel transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="gs-reveal mt-5 text-xs font-semibold text-muted">
          ~70 MB zip · Windows 10/11 · your voice never leaves your laptop
        </p>
          </div>
          <HeroOrb />
        </div>
      </section>

      {/* Live demo */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-6 md:p-12">
          <div className="rounded-2xl bg-black border border-white/10 px-5 py-4 min-h-24">
            <p className="text-xs font-bold tracking-widest text-muted uppercase mb-2">
              WhatsApp Web · message to Brian
            </p>
            <p className="text-lg md:text-xl min-h-7">
              {typed}
              {pillState === "done" && (
                <span className="inline-block w-0.5 h-5 bg-yellow align-text-bottom ml-0.5 animate-pulse" />
              )}
            </p>
          </div>
          <p className="min-h-6 text-center text-sm text-muted italic mt-4">
            {hearing ? `hearing: "${hearing}"` : " "}
          </p>
          <div className="flex justify-center mt-5">
            <div
              className={`flex items-center justify-center gap-3 rounded-full bg-black border px-6 py-3 min-w-60 transition-colors ${
                pillState === "rec"
                  ? "border-red shadow-[0_0_0_4px_rgba(232,24,42,0.12)]"
                  : "border-white/15"
              }`}
            >
              <span className="flex items-end gap-[3px] h-6" aria-hidden="true">
                {barHeights.map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-sm bg-violet transition-[height] duration-100"
                    style={{ height: `${h}px`, backgroundColor: "#8b83e8" }}
                  />
                ))}
              </span>
              <span className="text-sm font-semibold text-white/75 min-w-[9ch]">
                {pillText}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Works-everywhere marquee */}
      <div
        className="bonga-marquee-mask relative overflow-hidden border-y border-white/5 bg-panel py-5"
        aria-hidden="true"
      >
        <div className="bonga-marquee flex gap-3 w-max">
          {[...marqueeApps, "+ any text box on Windows", ...marqueeApps, "+ any text box on Windows"].map(
            (app, i) => (
              <span
                key={i}
                className="rounded-full bg-panel-2 border border-white/10 px-5 py-2 text-sm font-semibold text-white/70 whitespace-nowrap"
              >
                {app}
              </span>
            )
          )}
        </div>
      </div>

      {/* Cleanup before/after */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <h2 className="gs-reveal display text-4xl sm:text-5xl md:text-7xl">
          It cleans up your rambling<span className="text-yellow">.</span>
        </h2>
        <p className="gs-reveal mt-5 max-w-2xl text-white/65 leading-relaxed">
          You speak the way people actually speak, with the &quot;umm&quot; and
          the repeats and the missing commas. BONGA&apos;s cleanup pass removes
          the stumbles, fixes punctuation, and keeps exactly what you meant.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-10">
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-7 md:p-8 text-white/55 leading-relaxed">
            <p className="text-xs font-bold tracking-widest uppercase text-red mb-3">
              What you said
            </p>
            &quot;<s className="decoration-red decoration-2">um</s> tell the
            team that the invoice{" "}
            <s className="decoration-red decoration-2">is is</s> ready{" "}
            <s className="decoration-red decoration-2">uh</s> and they can pick
            the cheque thursday&quot;
          </div>
          <div className="gs-reveal rounded-3xl bg-blue/10 border border-blue/40 p-7 md:p-8 leading-relaxed">
            <p className="text-xs font-bold tracking-widest uppercase text-yellow mb-3">
              What BONGA types
            </p>
            &quot;Tell the team that the invoice is ready and they can pick the
            cheque Thursday.&quot;
          </div>
        </div>
      </section>

      {/* Speed race + stats */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
        <h2 className="gs-reveal display text-4xl sm:text-5xl md:text-7xl">
          Faster than your thumbs. <span className="text-yellow">Sio siri.</span>
        </h2>
        <p className="gs-reveal mt-5 max-w-2xl text-white/65 leading-relaxed">
          People speak at about 150 words a minute and type at about 40. Watch
          the race:
        </p>
        <div className="mt-12 space-y-7">
          <div className="gs-reveal">
            <div className="flex justify-between font-semibold text-sm mb-2.5">
              <span>⌨️ Typing</span>
              <span>
                <b className="bonga-count tabular-nums" data-value="40">
                  40
                </b>{" "}
                WPM
              </span>
            </div>
            <div className="h-4 rounded-full bg-panel-2 border border-white/10 overflow-hidden">
              <div
                className="bonga-fill h-full rounded-full bg-white/20"
                data-w="27%"
                style={{ width: "27%" }}
              />
            </div>
          </div>
          <div className="gs-reveal">
            <div className="flex justify-between font-semibold text-sm mb-2.5">
              <span>🎙️ Bonga</span>
              <span>
                <b className="bonga-count tabular-nums" data-value="150">
                  150
                </b>{" "}
                WPM
              </span>
            </div>
            <div className="h-4 rounded-full bg-panel-2 border border-white/10 overflow-hidden">
              <div
                className="bonga-fill h-full rounded-full bg-gradient-to-r from-blue to-violet"
                data-w="100%"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-14">
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8">
            <p className="display text-5xl md:text-6xl text-yellow">
              <span className="bonga-count" data-value="2.5" data-decimals="1">
                2.5
              </span>
              <span className="text-2xl text-muted">&nbsp;s</span>
            </p>
            <p className="mt-4 text-sm text-white/60">
              A ten-second voice note becomes text in about 2.5 seconds, on an
              ordinary laptop.
            </p>
          </div>
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8">
            <p className="display text-5xl md:text-6xl text-yellow">
              <span className="bonga-count" data-value="100">
                100
              </span>
              +
            </p>
            <p className="mt-4 text-sm text-white/60">
              Languages, including Kiswahili. Auto-detect or pin yours in
              Settings.
            </p>
          </div>
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8">
            <p className="display text-5xl md:text-6xl text-yellow">KSh 0</p>
            <p className="mt-4 text-sm text-white/60">
              What it costs you. Free while it&apos;s young; early birds keep
              it.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28 scroll-mt-24">
        <h2 className="gs-reveal display text-4xl sm:text-5xl md:text-7xl">
          Ongea, inaandika<span className="text-blue">.</span>
        </h2>
        <p className="gs-reveal mt-5 max-w-2xl text-white/65 leading-relaxed">
          There&apos;s no new app to type inside. BONGA sits quietly in your
          system tray and works in whatever you already have open.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {[
            {
              n: "1",
              t: "Shika",
              b: (
                <>
                  Click into any text box, then hold <Kbd>Right Ctrl</Kbd>. A
                  small bar with a moving waveform appears at the bottom of your
                  screen.
                </>
              ),
            },
            {
              n: "2",
              t: "Bonga",
              b: (
                <>
                  Say it like you&apos;d say it to a friend. Don&apos;t mind the
                  &quot;aaah&quot; and &quot;umm&quot;, don&apos;t announce
                  commas. Just talk.
                </>
              ),
            },
            {
              n: "3",
              t: "Achilia",
              b: (
                <>
                  Let go of the key. In a second or two your words land in the
                  text box, cleaned and punctuated. Press <Kbd>Enter</Kbd>,
                  send.
                </>
              ),
            },
          ].map((s) => (
            <div
              key={s.n}
              className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8 hover:border-blue/50 transition-colors"
            >
              <p className="display text-5xl text-blue">{s.n}</p>
              <h3 className="font-extrabold text-xl mt-4 mb-2">{s.t}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
        <p className="gs-reveal mt-8 max-w-2xl text-white/65 leading-relaxed">
          Bonus moves: <strong className="text-white">quick-tap</strong> Right
          Ctrl for hands-free mode (talk as long as you want, tap again to
          finish), and <Kbd>Esc</Kbd> cancels a dictation you regret.
        </p>
      </section>

      {/* Offline panel */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
        <div className="gs-reveal rounded-3xl bg-blue px-7 md:px-14 py-12 md:py-16">
          <h2 className="display text-4xl sm:text-5xl md:text-7xl">
            Zero bundles. Zero cloud.{" "}
            <span className="text-yellow">Zero stress.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-white/85 leading-relaxed md:text-lg">
            Other dictation tools upload your voice to servers abroad and
            charge monthly for the privilege. BONGA runs the speech recognition{" "}
            <strong>on your own laptop</strong> using an open-source AI model.
            Your voice never leaves the machine. It works in a mat on Thika
            Road with zero bars, it works when the WiFi imekufa, it works in
            shags. Download once, bonga forever.
          </p>
          <p className="mt-4 max-w-2xl text-white/85 leading-relaxed">
            <strong>Easiest proof:</strong> put your laptop in airplane mode
            and try it. Everything still works.
          </p>
          <div className="mt-8">
            <Beads count={8} />
          </div>
        </div>
      </section>

      {/* Dictionary + history features */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28 space-y-16 md:space-y-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="gs-reveal">
            <h3 className="display text-3xl sm:text-4xl md:text-5xl">
              Teach it <span className="text-blue">your</span> people and
              places.
            </h3>
            <p className="mt-5 text-white/65 leading-relaxed">
              Generic dictation apps butcher Kenyan names. BONGA has a{" "}
              <strong className="text-white">personal dictionary</strong>: add
              Wanjiku, Kipchoge, Githurai, M-Pesa once, and it spells them
              right instead of guessing.
            </p>
            <p className="mt-4 text-white/65 leading-relaxed">
              <strong className="text-white">Snippets</strong> go further: say
              a trigger phrase like <em>&quot;insert my email&quot;</em> and a
              whole block of text you saved drops in. Signatures, payment
              details, directions to your shop.
            </p>
          </div>
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-7 md:p-8">
            <ArtRow left="wanjiko" right="Wanjiku" arrow />
            <ArtRow left="em pesa" right="M-Pesa" arrow />
            <ArtRow left="gith urai" right="Githurai" arrow />
            <ArtRow
              left={'"insert my email"'}
              right={`${site.email} ✍️`}
              arrow
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-7 md:p-8 md:order-1 order-2">
            <ArtRow left="Dictations today" right="23" />
            <ArtRow left="Words written" right="4,180" />
            <ArtRow left="Time saved vs typing" right="1.4 h" />
            <ArtRow left="History" right="Every dictation, copy anytime" />
          </div>
          <div className="gs-reveal md:order-2 order-1">
            <h3 className="display text-3xl sm:text-4xl md:text-5xl">
              Your words, <span className="text-blue">your receipts.</span>
            </h3>
            <p className="mt-5 text-white/65 leading-relaxed">
              BONGA keeps a private on-device history of everything you&apos;ve
              dictated, with one-click copy. The Home screen counts your words
              and shows the hours your mouth saved your hands.
            </p>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28 text-center">
        <h2 className="gs-reveal display text-4xl sm:text-5xl md:text-7xl">
          Bonga in your language<span className="text-yellow">.</span>
        </h2>
        <p className="gs-reveal mt-8 text-2xl md:text-4xl font-bold leading-relaxed">
          English <span className="text-white/30">·</span> Kiswahili{" "}
          <span className="text-white/30">·</span> Français{" "}
          <span className="text-white/30">·</span> العربية{" "}
          <span className="text-white/30">·</span> हिन्दी{" "}
          <span className="text-white/30">·</span> 中文{" "}
          <span className="text-white/30">+ 90 more</span>
        </p>
        <p className="gs-reveal mt-6 max-w-2xl mx-auto text-white/65 leading-relaxed">
          Auto-detect, or pin your language in Settings for best results. Pure
          English and pure Kiswahili work best; heavy Sheng mid-sentence is hit
          and miss for now, tuko njiani.
        </p>
      </section>

      {/* What's inside */}
      <section id="inside" className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28 scroll-mt-24">
        <h2 className="gs-reveal display text-4xl sm:text-5xl md:text-7xl">
          What exactly is this thing<span className="text-blue">?</span>
        </h2>
        <p className="gs-reveal mt-5 max-w-2xl text-white/65 leading-relaxed">
          Fair question. BONGA is a small Windows program, not a website and
          not a plugin. Here&apos;s the honest breakdown:
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8">
            <h3 className="font-extrabold text-lg mb-3">
              <span className="text-yellow mr-2">01</span>The brain
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Speech recognition runs on <b className="text-white">Whisper</b>,
              an open-source AI model, executing entirely on your CPU. BONGA
              ships ready to go and lets you swap models in Settings:
            </p>
            <ul className="mt-3 text-sm text-white/60">
              <li className="py-2 border-b border-dashed border-white/10">
                <b className="text-white">Fast</b> (default) · quick answers on
                modest laptops
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                <b className="text-white">High quality</b> · more accurate, a
                bit slower
              </li>
              <li className="py-2">
                All of them work <b className="text-white">fully offline</b>
              </li>
            </ul>
          </div>
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8">
            <h3 className="font-extrabold text-lg mb-3">
              <span className="text-yellow mr-2">02</span>The cleanup
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Raw speech is messy. After transcribing, BONGA:
            </p>
            <ul className="mt-3 text-sm text-white/60">
              <li className="py-2 border-b border-dashed border-white/10">
                Removes fillers: um, uh, mhh
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                Collapses stutters (&quot;the the&quot; → &quot;the&quot;)
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                Capitalizes and punctuates sentences
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                Applies your dictionary corrections
              </li>
              <li className="py-2">
                Obeys voice commands: <b className="text-white">&quot;new line&quot;</b>,{" "}
                <b className="text-white">&quot;new paragraph&quot;</b>
              </li>
            </ul>
          </div>
          <div className="gs-reveal rounded-3xl bg-panel border border-white/5 p-8">
            <h3 className="font-extrabold text-lg mb-3">
              <span className="text-yellow mr-2">03</span>The requirements
            </h3>
            <ul className="mt-3 text-sm text-white/60">
              <li className="py-2 border-b border-dashed border-white/10">
                <b className="text-white">Windows 10 or 11</b>, 64-bit
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                About <b className="text-white">4 GB RAM</b> and 350 MB disk
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                Any microphone, built-in is fine
              </li>
              <li className="py-2 border-b border-dashed border-white/10">
                No graphics card, no admin rights
              </li>
              <li className="py-2">Internet only for the first download</li>
            </ul>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Full source code is public on{" "}
              <a
                href="https://github.com/kenikiara/bonga"
                className="text-blue hover:underline"
              >
                GitHub
              </a>
              . Check it, fork it, audit it.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28 scroll-mt-24">
        <h2 className="gs-reveal display text-4xl sm:text-5xl md:text-7xl mb-10 md:mb-14">
          Maswali<span className="text-red">.</span>
        </h2>
        <div className="space-y-3 max-w-4xl">
          {bongaFaqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="gs-reveal rounded-2xl bg-panel border border-white/5 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-left"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm md:text-base">{f.q}</span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                      isOpen ? "bg-blue rotate-45" : "bg-white/10"
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 md:px-6 pb-5 text-sm text-white/65 leading-relaxed max-w-2xl">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Feedback */}
      <section id="feedback" className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28 scroll-mt-24">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-start">
          <div className="gs-reveal">
            <h2 className="display text-4xl sm:text-5xl md:text-6xl">
              Niambie. <span className="text-yellow">Seriously.</span>
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed">
              This is v1 from a one-man studio in Nairobi. Your feedback
              decides what gets built next. What it misheard, what confused
              you, what you wish it did. Sitaki flattery, nataka ukweli.
            </p>
            <p className="mt-4 text-white/65 leading-relaxed">
              Messages land straight in my inbox at{" "}
              <strong className="text-white">{site.email}</strong>.
            </p>
          </div>
          <div className="gs-reveal">
            {sent ? (
              <div className="rounded-2xl bg-blue/10 border border-blue/40 p-7">
                <p className="font-extrabold">Asante! 🙏</p>
                <p className="mt-2 text-sm text-white/70">
                  Your feedback is on its way to Ken&apos;s inbox. If you left
                  your email, you&apos;ll hear back.
                </p>
              </div>
            ) : (
              <form
                action={`https://formsubmit.co/${site.email}`}
                method="POST"
                className="grid gap-3.5"
              >
                <input type="hidden" name="_subject" value="BONGA feedback" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="hidden"
                  name="_next"
                  value={`${site.url}/bonga/?sent=1#feedback`}
                />
                <input
                  type="text"
                  name="_honey"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Your name (optional)"
                  className="w-full rounded-xl bg-panel-2 border border-white/10 px-4 py-3.5 text-sm placeholder:text-muted focus:outline-none focus:border-blue"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email, if you want a reply (optional)"
                  className="w-full rounded-xl bg-panel-2 border border-white/10 px-4 py-3.5 text-sm placeholder:text-muted focus:outline-none focus:border-blue"
                />
                <textarea
                  name="message"
                  required
                  placeholder="What worked? What broke? What did it mishear? Andika hapa…"
                  className="w-full min-h-36 resize-y rounded-xl bg-panel-2 border border-white/10 px-4 py-3.5 text-sm placeholder:text-muted focus:outline-none focus:border-blue"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-full bg-blue text-white font-bold hover:bg-violet transition-colors justify-self-start"
                >
                  Tuma feedback →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10 text-center">
        <h2 className="gs-reveal display text-5xl sm:text-6xl md:text-8xl">
          Acha kuandika.
          <br />
          Anza ku-bonga<span className="text-blue">.</span>
        </h2>
        <div className="gs-reveal mt-9 flex justify-center">
          <a
            href={DOWNLOAD_URL}
            className="px-9 py-4 rounded-full bg-blue text-white font-bold hover:bg-violet transition-colors"
          >
            Download BONGA free
          </a>
        </div>
        <p className="gs-reveal mt-5 text-xs font-semibold text-muted">
          Windows 10/11 · 64-bit · free while it&apos;s young
        </p>
      </section>
    </div>
  );
}
