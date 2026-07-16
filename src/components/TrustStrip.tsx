import { Fragment } from "react";

/*
 * TrustStrip — a single editorial line of credentials shown just above the
 * footer: a thin hairline over centered, letter-spaced uppercase text with
 * dot separators. No boxes, no background band.
 *
 * Self-contained. Revert: remove <TrustStrip /> from index.tsx and delete this
 * file. Update the values in CREDENTIALS below if company details change.
 */
const CREDENTIALS = [
  "Registered Private Limited Company",
  "Incorporated July 2025",
  "CIN U42900AS2025PTC028575",
];

export function TrustStrip() {
  return (
    <section aria-label="Company credentials" className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-10 sm:py-12">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {CREDENTIALS.map((c, i) => (
            <Fragment key={c}>
              {i > 0 && (
                <span aria-hidden="true" className="hidden sm:inline text-muted-foreground/40">
                  ·
                </span>
              )}
              <span>{c}</span>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
