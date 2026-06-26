import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * ScrollSyncedText — a statement whose words fill from faded to full colour,
 * one after another, synced to scroll position. Pure scroll-driven (no deps).
 *
 * Revert: remove <ScrollSyncedText /> usage and delete this file.
 */

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export function ScrollSyncedText({ text, className = "" }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);

  const words = text.split(" ");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const spans = wordRefs.current.filter(Boolean);
    const n = spans.length;

    // Reduced motion: show the whole statement at full strength, no scroll fill.
    if (prefersReducedMotion()) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // effect runs as the block travels up through the viewport
      const start = vh * 0.82;
      const end = vh * 0.28;
      const total = start - end + rect.height;
      const traveled = start - rect.top;
      const p = clamp(traveled / total, 0, 1);

      const lit = p * n;
      for (let i = 0; i < n; i++) {
        const amount = clamp(lit - i, 0, 1);
        spans[i].style.opacity = String(0.2 + 0.8 * amount);
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
  }, [text]);

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span
            ref={(node) => {
              if (node) wordRefs.current[i] = node;
            }}
            style={{ opacity: 0.2 }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
