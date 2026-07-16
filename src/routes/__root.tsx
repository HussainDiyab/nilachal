import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CustomCursor } from "../components/CustomCursor";

/*
 * Absolute site URL — used for the Open Graph / Twitter share image, the
 * canonical link, and the JSON-LD structured data below.
 *
 * ⚠️ REPLACE this with your real domain once it's live, e.g.
 *      "https://nilachalallied.com"
 * ...and update the same URL in public/sitemap.xml. Social platforms
 * (WhatsApp, LinkedIn, X) need an ABSOLUTE https URL to resolve the share
 * image, so previews won't render correctly until this is a real domain.
 */
const SITE_URL = "https://REPLACE-WITH-YOUR-DOMAIN.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// LocalBusiness / RealEstateAgent structured data — helps Google show a rich
// result with the company's contact details, location and credentials.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Nilachal Allied Projects Limited",
  description:
    "Private limited company working across real estate, trading, hospitality and agriculture in Silchar, Assam and the Northeast.",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  image: OG_IMAGE,
  email: "nilachal.alliedprojects@gmail.com",
  telephone: "+918011890058",
  foundingDate: "2025-07-23",
  identifier: {
    "@type": "PropertyValue",
    propertyID: "CIN",
    value: "U42900AS2025PTC028575",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kanakpur Part II",
    addressLocality: "Silchar",
    addressRegion: "Assam",
    postalCode: "788005",
    addressCountry: "IN",
  },
  areaServed: ["Silchar", "Assam", "Northeast India"],
  knowsAbout: ["Real Estate", "Trading", "Hospitality", "Agriculture"],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nilachal Allied Projects Limited | Real Estate, Construction & Agriculture" },
      {
        name: "description",
        content:
          "Nilachal Allied Projects Limited is a private limited company working across real estate, trading, hospitality and agriculture in Silchar, Assam and the Northeast — with integrity and lasting value.",
      },
      { name: "author", content: "Nilachal Allied Projects Limited" },
      { name: "theme-color", content: "#1c2a52" },
      { property: "og:title", content: "Nilachal Allied Projects Limited" },
      {
        property: "og:description",
        content:
          "Real estate, trading, hospitality and agriculture — building and trading across Silchar, Assam and the Northeast.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Nilachal Allied Projects Limited" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: SITE_URL },
      // Branded 1200x630 share image. Uses the absolute SITE_URL above so
      // WhatsApp / LinkedIn / X can resolve it once the real domain is set.
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "Nilachal Allied Projects Limited" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:title", content: "Nilachal Allied Projects Limited" },
      {
        name: "twitter:description",
        content:
          "Real estate, trading, hospitality and agriculture across Silchar, Assam and the Northeast.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;800;900&family=Fraunces:ital,wght@0,300;0,400;1,400;1,500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CustomCursor />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
