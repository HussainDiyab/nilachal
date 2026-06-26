/**
 * Returns true if the user has requested reduced motion via the OS/browser
 * setting. Safe to call on the server (returns false there).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
