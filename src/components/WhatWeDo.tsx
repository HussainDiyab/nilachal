import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * WhatWeDo — the Services section.
 *
 * 1. A curved divider peels up from the (light) About section into this
 *    (dark) section.
 * 2. A pinned, scroll-driven 3D intro flips the "WHAT WE DO?" title in like a
 *    page turning toward the viewer.
 * 3. The individual services then reveal one by one as you scroll.
 *
 * Self-contained. Revert: remove <WhatWeDo /> from index.tsx (restore the old
 * <Practice /> + <Sectors />) and delete this file.
 */

const SERVICES = [
  {
    n: "01",
    t: "Real Estate Development",
    d: "End-to-end residential and commercial projects, conceived and built from the ground up.",
  },
  {
    n: "02",
    t: "Land Acquisition & Sales",
    d: "Buying and selling residential, commercial and agricultural land with full professional diligence.",
  },
  {
    n: "03",
    t: "Residential Construction",
    d: "Homes and housing delivered with quality, transparency and lasting value.",
  },
  {
    n: "04",
    t: "Commercial Construction",
    d: "Offices, retail and institutional builds executed to exacting standards.",
  },
  {
    n: "05",
    t: "Agricultural Land",
    d: "Developing and trading agricultural holdings as long-term investments in growth.",
  },
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export function WhatWeDo() {
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 3D scroll-driven intro for the title
  useEffect(() => {
    const track = trackRef.current;
    const title = titleRef.current;
    if (!track || !title) return;

    // Reduced motion: show the title flat and still, skip the 3D scroll flip.
    if (prefersReducedMotion()) {
      title.style.transform = "none";
      title.style.opacity = "1";
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const total = track.offsetHeight - window.innerHeight;
      const scrolled = clamp(-track.getBoundingClientRect().top, 0, Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;

      // title flips up & fades in over the first ~65% of the pin
      const intro = clamp(p / 0.65, 0, 1);
      const rot = (1 - intro) * 72; // degrees, lying back -> flat
      const ty = (1 - intro) * 18; // vh, rises from below
      const scale = 0.82 + intro * 0.18;
      title.style.transform = `translateY(${ty}vh) rotateX(${rot}deg) scale(${scale})`;
      title.style.opacity = String(intro);
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
  }, []);

  // reveal each service one by one
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".svc-row"));
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      rows.forEach((r) => r.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="services" className="relative bg-primary text-primary-foreground">
      {/* Curved divider — the light section dips down into this dark one */}
      <div className="absolute inset-x-0 -top-px leading-[0] pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block w-full h-[60px] sm:h-[100px]"
          aria-hidden="true"
        >
          <path d="M0,0 L1440,0 L1440,8 C1080,120 360,120 0,8 Z" fill="var(--background)" />
        </svg>
      </div>

      {/* 3D pinned intro */}
      <div ref={trackRef} style={{ height: "180vh" }}>
        <div
          className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
          style={{ perspective: "1200px" }}
        >
          <h2
            ref={titleRef}
            className="text-center font-light tracking-[0.02em] leading-[0.95] will-change-transform"
            style={{ transformOrigin: "bottom center" }}
          >
            <span className="block text-[13px] sm:text-sm uppercase tracking-[0.3em] text-primary-foreground/50 mb-6">
              Our Services
            </span>
            <span
              className="block uppercase text-[64px] sm:text-[120px] lg:text-[170px]"
              style={{ fontFamily: '"Archivo Black", sans-serif' }}
            >
              What We Do?
            </span>
          </h2>
        </div>
      </div>

      {/* Services, revealed one by one */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10 pb-24 sm:pb-40 -mt-[20vh]">
        <div className="divide-y divide-primary-foreground/15 border-t border-primary-foreground/15">
          {SERVICES.map((s) => (
            <article
              key={s.n}
              className="svc-row grid grid-cols-12 gap-4 sm:gap-6 py-10 sm:py-14 group"
            >
              <div className="col-span-2 sm:col-span-1 text-[12px] tracking-[0.2em] text-primary-foreground/45 pt-3">
                {s.n}
              </div>
              <h3 className="col-span-10 sm:col-span-6 text-3xl sm:text-5xl font-light tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-2">
                {s.t}
              </h3>
              <p className="col-span-12 sm:col-span-4 sm:col-start-9 text-sm sm:text-base text-primary-foreground/60 leading-relaxed">
                {s.d}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
