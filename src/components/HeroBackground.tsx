import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * HeroBackground — auto-rotating hero images with a soft crossfade and a
 * subtle Ken Burns zoom. Pure CSS/JS, no deps.
 *
 * Revert: replace <HeroBackground .../> in the hero with the previous single
 * <img .../> and delete this file.
 */
export function HeroBackground({
  images,
  interval = 5000,
}: {
  images: string[];
  interval?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    if (prefersReducedMotion()) return; // keep the first image static
    const id = setInterval(() => {
      setActive((a) => (a + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          aria-hidden="true"
          loading={i === 0 ? "eager" : "lazy"}
          // If a hero image fails to load, hide it so a broken-image icon never
          // shows through the overlay; the dark overlay + other slides remain.
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          style={{
            animation: "kenburns 14s ease-in-out infinite alternate",
          }}
        />
      ))}
    </div>
  );
}
