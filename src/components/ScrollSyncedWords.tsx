import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * ScrollSyncedWords — a fixed prefix ("We shape") beside a vertical list of
 * words. The block pins while scrolling moves the list past a highlight line;
 * whichever word aligns with the prefix is lit, neighbours stay dimmed.
 * Pure scroll-driven (no deps).
 *
 * Revert: remove <ScrollSyncedWords /> usage and delete this file.
 */

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const STEP_VH = 22; // scroll length allotted per word
const STAGE_VH = 60; // height of the pinned stage

export function ScrollSyncedWords({
  prefix,
  words,
  heading,
}: {
  prefix: string;
  words: string[];
  heading?: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<HTMLDivElement[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return; // static list rendered instead
    const track = trackRef.current;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!track || !stage || !list) return;
    const els = wordRefs.current.filter(Boolean);
    const n = els.length;
    if (!n) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const total = track.offsetHeight - stage.offsetHeight;
      const offset = (window.innerHeight - stage.offsetHeight) / 2;
      const scrolled = clamp(offset - track.getBoundingClientRect().top, 0, Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;

      const active = p * (n - 1);
      const lh = els[0].offsetHeight || 1;
      list.style.transform = `translateY(${((n - 1) / 2 - active) * lh}px)`;

      for (let i = 0; i < n; i++) {
        const dist = Math.abs(i - active);
        const amt = clamp(1.2 - dist, 0, 1);
        els[i].style.opacity = String(0.14 + 0.86 * amt);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [words]);

  // Reduced motion: a calm, static stacked list — no pinning, no scroll motion.
  if (reduced) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 py-24 sm:py-32 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
        <div className="flex flex-wrap items-baseline gap-x-5">
          <span className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[-0.02em] text-primary leading-[1.15]">
            {prefix}
          </span>
          <div className="flex flex-col">
            {words.map((w, i) => (
              <span
                key={i}
                className="font-serif-italic text-4xl sm:text-6xl lg:text-7xl tracking-[-0.02em] text-primary leading-[1.15]"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        {heading && <div className="hidden lg:block shrink-0">{heading}</div>}
      </div>
    );
  }

  return (
    <div ref={trackRef} style={{ height: `${words.length * STEP_VH + STAGE_VH}vh` }}>
      <div
        ref={stageRef}
        className="sticky overflow-hidden flex items-center"
        style={{ height: `${STAGE_VH}vh`, top: `${(100 - STAGE_VH) / 2}vh` }}
      >
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 flex items-center justify-between gap-x-8">
          <div className="flex items-center gap-x-5 sm:gap-x-8 min-w-0">
            <span className="shrink-0 text-4xl sm:text-6xl lg:text-7xl font-light tracking-[-0.02em] text-primary leading-[1.1]">
              {prefix}
            </span>
            <div className="relative">
              <div ref={listRef} className="will-change-transform">
                {words.map((w, i) => (
                  <div
                    key={i}
                    ref={(node) => {
                      if (node) wordRefs.current[i] = node;
                    }}
                    className="font-serif-italic text-4xl sm:text-6xl lg:text-7xl tracking-[-0.02em] text-primary leading-[1.1]"
                    style={{ opacity: 0.14 }}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {heading && <div className="hidden lg:block shrink-0">{heading}</div>}
        </div>
      </div>
    </div>
  );
}
