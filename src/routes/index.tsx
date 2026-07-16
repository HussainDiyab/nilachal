import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { FluidText, type FluidLine } from "@/components/FluidText";
import { EnquiryForm } from "@/components/EnquiryForm";
import { TrustStrip } from "@/components/TrustStrip";
import { WhatWeDo } from "@/components/WhatWeDo";
import { HeroBackground } from "@/components/HeroBackground";
import { ScrollSyncedText } from "@/components/ScrollSyncedText";
import { ScrollSyncedWords } from "@/components/ScrollSyncedWords";
import logoSrc from "@/assets/logo.png";
import heroImg from "@/assets/hero.jpg";
import constructionImg from "@/assets/construction.jpg";
import agricultureImg from "@/assets/agriculture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nilachal Allied Projects Limited | Real Estate & Construction" },
      {
        name: "description",
        content:
          "Nilachal Allied Projects Limited — a private limited company working across real estate, trading, hospitality and agriculture in Silchar, Assam and the Northeast, with quality and integrity.",
      },
      { property: "og:title", content: "Nilachal Allied Projects Limited" },
      {
        property: "og:description",
        content:
          "Real estate, trading, hospitality and agriculture — from the soil to the skyline, across Silchar, Assam and the Northeast.",
      },
    ],
  }),
  component: Index,
});

const EMAIL = "nilachal.alliedprojects@gmail.com";
const PHONE_DISPLAY = "+91 80118 90058";
const PHONE_TEL = "+918011890058";
// WhatsApp deep link with a prefilled enquiry message (opens WhatsApp, unlike tel:).
const WHATSAPP_NUMBER = "918011890058";
const WHATSAPP_TEXT = "Hi Nilachal, I'd like to enquire about";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

const HERO_LINES: FluidLine[] = [
  { text: "NILACHAL", scale: 1 }, // Archivo Black — heaviest
  { text: "ALLIED  PROJECTS", scale: 0.42, family: "Archivo", weight: 500 },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <WhatWeDo />
        <WhyUs />
        <Contact />
      </main>
      <TrustStrip />
      <Footer />
    </div>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a
      href="#top"
      className={`flex items-center ${className}`}
      aria-label="Nilachal Allied Projects"
    >
      <img
        src={logoSrc}
        alt="Nilachal Allied Projects"
        className="w-40 sm:w-56 h-auto object-contain"
      />
    </a>
  );
}

const NAV_LINKS = [
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#why-us", label: "Why Us" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll + close on Escape while the mobile overlay is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-border/60">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 h-[85px] flex items-center justify-between">
        <Wordmark />
        <nav className="hidden md:flex items-center gap-10 text-[14px] uppercase tracking-[0.18em] text-muted-foreground">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="group hidden md:inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] bg-primary text-primary-foreground px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          Enquire
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        {/* Mobile hamburger — only shown below the desktop breakpoint */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="md:hidden inline-flex items-center justify-center p-2 -mr-2 text-primary"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-7 w-7" />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={`md:hidden fixed inset-0 z-[60] bg-white transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Top bar floats above the centered nav so the close button stays tappable */}
      <div className="absolute top-0 inset-x-0 z-10 mx-auto w-full max-w-[1400px] px-6 sm:px-10 h-[85px] flex items-center justify-between">
        <Wordmark />
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center p-2 -mr-2 text-primary"
          aria-label="Close menu"
        >
          <X className="h-7 w-7" />
        </button>
      </div>

      <nav className="h-full flex flex-col items-center justify-center gap-12 px-6">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="text-base uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors"
          >
            {l.label}
          </a>
        ))}
        <a
          href="#contact"
          onClick={onClose}
          className="group mt-4 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors"
        >
          Enquire
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </nav>
    </div>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen min-h-screen-dvh flex flex-col items-center justify-center overflow-hidden pt-[85px]"
    >
      {/* Auto-rotating background images */}
      <HeroBackground images={[heroImg, constructionImg, agricultureImg]} interval={5000} />
      {/* Dark blue overlay */}
      <div className="absolute inset-0 bg-primary/72" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="leading-none">
          <FluidText lines={HERO_LINES} />
        </h1>
        <p className="-mt-1 text-sm sm:text-lg text-white/60 tracking-[0.22em] uppercase font-light">
          From the soil to the skyline.
        </p>
        <div className="mt-14 flex items-center">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] bg-white text-primary px-7 py-3.5 hover:bg-white/90 transition-colors"
          >
            Enquire
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/40">
        <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-3">
            <h3 className="uppercase font-light text-muted-foreground leading-[0.9] tracking-[0.04em] text-5xl sm:text-6xl lg:text-7xl">
              About
              <br />
              Us
            </h3>
            <span className="mt-5 block h-px w-16 bg-muted-foreground/40" />
          </div>
          <div className="lg:col-span-9">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl tracking-[-0.02em] text-primary font-light leading-[1.08]">
              A private limited company built on{" "}
              <span className="font-serif-italic">land, trust</span> and enduring craft.
            </h2>
            <div className="mt-12 grid sm:grid-cols-2 gap-10 lg:gap-16 max-w-4xl">
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Nilachal Allied Projects Limited is a private limited company working across real
                estate, trading, hospitality and agriculture. We develop, build and deliver both
                commercial and residential projects — from the ground up — with a commitment to
                quality, transparency and lasting value.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                At the core of our practice is land. We acquire, develop and trade property — buying
                and selling residential, commercial and agricultural land — while guiding clients
                through every stage with professional diligence. Beyond the ground itself, our
                trading and hospitality ventures carry the same diligence into everything we take
                on.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section id="why-us" className="border-t border-border bg-secondary/40">
      {/* Big "Why us?" heading + the "because" answer that fills word by word */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-24 sm:pt-36">
        <h2 className="text-[72px] sm:text-[120px] lg:text-[160px] leading-[0.82] font-light tracking-[-0.03em] text-primary">
          Why us<span className="font-serif-italic text-primary/50">?</span>
        </h2>
        <ScrollSyncedText
          text="Because we build homes and shape the land beneath them. From the soil of Assam to the skyline we raise — buying, building and cultivating with integrity — we turn the ground into value that lasts for generations."
          className="mt-10 max-w-4xl text-2xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-primary font-light leading-[1.22]"
        />
      </div>

      {/* Scroll-synced word cycler */}
      <ScrollSyncedWords
        prefix="We shape"
        words={["land", "homes", "skylines", "harvests", "communities", "futures"]}
      />
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-24 sm:py-36">
        <h2 className="text-4xl sm:text-6xl lg:text-7xl tracking-[-0.03em] text-primary font-light leading-[1.02]">
          Tell us what <span className="font-serif-italic">you'd like</span>
          <br />
          to build.
        </h2>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Enquiry form */}
          <div className="lg:col-span-7">
            <EnquiryForm whatsappUrl={WHATSAPP_URL} />
          </div>

          {/* Direct contact details */}
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-8">
            <a href={`mailto:${EMAIL}`} className="group block border-t border-primary pt-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Write
              </div>
              <div className="mt-3 text-lg sm:text-xl text-primary break-all group-hover:font-serif-italic transition-all">
                {EMAIL}
              </div>
            </a>
            <a href={`tel:${PHONE_TEL}`} className="group block border-t border-primary pt-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Call
              </div>
              <div className="mt-3 text-lg sm:text-xl text-primary whitespace-nowrap group-hover:font-serif-italic transition-all">
                {PHONE_DISPLAY}
              </div>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border-t border-primary pt-4"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                WhatsApp
              </div>
              <div className="mt-3 text-lg sm:text-xl text-primary whitespace-nowrap group-hover:font-serif-italic transition-all">
                {PHONE_DISPLAY}
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#3d4250] text-white/65">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
          <div>
            <Wordmark className="[&_img]:brightness-0 [&_img]:invert" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Office</div>
            <address className="mt-3 not-italic text-sm leading-relaxed text-white/90">
              Kanakpur Part II, Silchar 788005,
              <br />
              Assam, India
            </address>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Reach us</div>
            <div className="mt-3 flex flex-col sm:items-end gap-1 text-sm text-white/90">
              <a href={`mailto:${EMAIL}`} className="break-all hover:text-white transition-colors">
                {EMAIL}
              </a>
              <a href={`tel:${PHONE_TEL}`} className="hover:text-white transition-colors">
                {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] uppercase tracking-[0.22em] text-white/40">
          <div>© {new Date().getFullYear()} Nilachal Allied Projects Limited</div>
          <div>Real Estate · Trading · Hospitality · Agriculture</div>
        </div>
      </div>
    </footer>
  );
}
