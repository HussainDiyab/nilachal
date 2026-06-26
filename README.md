# Nilachal Allied Projects — Website

The official one-page marketing site for **Nilachal Allied Projects Limited**, a
private limited company in real estate, construction and agriculture based in
Silchar, Assam. The site presents the company's story, services and contact
details with a minimal, editorial design and a few bespoke WebGL motion touches.

## Tech stack

- **React 19** + **TypeScript**
- **TanStack Start / Router** — file-based routing and SSR
- **TanStack Query** — data/query client
- **Tailwind CSS v4** — styling (design tokens in `src/styles.css`)
- **Vite** — build tool
- **lucide-react** — icons
- Bespoke **raw WebGL** effects (no 3D library) for the fluid hero text and
  image displacement

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:3000)
```

To test on a phone over your local network: `npm run dev -- --host`.

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the local dev server                   |
| `npm run build`    | Production build                             |
| `npm run preview`  | Preview the production build locally         |
| `npm run lint`     | Run ESLint                                   |
| `npm run format`   | Format the codebase with Prettier            |

## Project structure

```
src/
  routes/          # pages (index.tsx is the single landing page) + __root.tsx layout
  components/       # custom UI: hero, sections, scroll effects, custom cursor
  lib/              # small helpers (motion preference, error handling)
  styles.css        # Tailwind theme tokens + global styles
public/             # static assets (favicon, robots.txt)
```

## Deployment

The build targets **Cloudflare** (via Nitro). Run `npm run build`, then deploy
the generated `.output` with `npx nitro deploy --prebuilt` (or your Cloudflare
Pages/Workers pipeline of choice).
