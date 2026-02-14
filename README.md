# Offsyde

**Automated web auditing platform that crawls your site, audits performance, detects broken assets, and traces backend issues -- all from a single URL.**

Most web auditing tools do one thing. Offsyde chains five analysis passes together: discover every route on your site, run performance audits against each one, scan for broken images/videos/iframes, validate CSS and script loading, and trace backend response behavior. The results feed into a single scored report you can export as PDF.

No database. No accounts. Paste a URL, get answers.

---

## Features

### Scoutings -- Route Discovery
Crawl any website with Playwright-powered headless Chromium. Automatically discovers all reachable routes from a starting URL, filtering out external links, social media, and hash fragments.

### Audits -- Performance Analysis
Run batch performance audits on discovered routes. Measures DOM Content Loaded, page load time, TTFB, DOM element count, and resource counts (images, scripts, stylesheets). Routes are graded Excellent / Good / Fair / Poor with concurrency-controlled parallel execution.

### Visuals -- Frontend Debugging
Three-pass frontend analysis:
- **Offside Tags** -- Broken images (12+ checks), videos, audio elements, and iframes (10+ checks) with detailed issue classification.
- **Links & Sheets** -- Broken stylesheets, missing scripts, render-blocking resource detection.
- **Faulty CSS** -- Stylesheet errors, oversized CSS files, excessive inline styles, CSS loading performance.

### Traces -- Backend Debugging
Analyze server-side behavior across routes: TTFB measurement, HTTP status codes, redirect chain tracking, header analysis (Cache-Control, CORS, Content-Type), empty JSON body detection. Each route is load-tested with averaged results and classified by severity.

### Statsheets -- Summary Reports
Aggregated scorecard across all four analysis modules. Calculates Performance, Media Health, Link Integrity, and CSS Health scores (graded A/B/C). Exportable as a print-optimized PDF.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Runtime | React 19 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Browser Automation | Playwright Core + @sparticuz/chromium |
| Scraping | Cheerio, Axios |
| Analytics | Vercel Analytics |
| Package Manager | Bun |
| Deployment | Vercel (serverless) |

---

## Architecture

Offsyde is a monolithic Next.js application. There is no separate backend service -- all server-side logic runs as Next.js API route handlers (serverless functions on Vercel).

```
Client (React + Zustand)
  │
  ├── /scoutings ──→ POST /api/playwright-crawl
  ├── /audits    ──→ POST /api/audits
  ├── /visuals   ──→ POST /api/dominator
  │                  POST /api/dominator/links
  │                  POST /api/dominator/css
  ├── /traces    ──→ POST /api/playmaker
  └── /statsheets (client-side aggregation)
```

**Key design decisions:**
- Stateless server. No database, no user sessions. All analysis state lives in client-side Zustand stores.
- Each API route spawns headless Chromium via `@sparticuz/chromium`, optimized for serverless cold starts.
- Concurrency controls prevent resource exhaustion: max 5 concurrent audits, max 8 concurrent dominator analyses with a 50-request queue.
- Rate limiting with HTTP 429 responses and `Retry-After` headers.
- Mobile devices are blocked at the middleware level -- this is a desktop developer tool.

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/offsideDebugger/Offsyde-Debugger.git
cd Offsyde-Debugger && bun install

# Start development server
bun dev
```

Open `http://localhost:3000`. Enter a URL and start auditing.

### Local Playwright Setup

If you're working on API routes that use browser automation:

```bash
bunx playwright install chromium
```

### Available Scripts

| Command | Purpose |
|---|---|
| `bun dev` | Development server with hot reload |
| `bun run build` | Production build (catches type errors) |
| `bun start` | Serve production build |
| `bun lint` | Run ESLint |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── playwright-crawl/   # Route discovery (Playwright)
│   │   ├── audits/             # Performance auditing (Playwright)
│   │   ├── dominator/          # Asset analysis (Playwright + Axios)
│   │   │   ├── css/            # CSS validation
│   │   │   └── links/          # Link/script checking
│   │   └── playmaker/          # Backend tracing (fetch + perf_hooks)
│   ├── scoutings/              # Route crawling UI
│   ├── audits/                 # Performance audit UI
│   ├── visuals/                # Frontend debugging UI
│   ├── traces/                 # Backend debugging UI
│   ├── statsheets/             # Report generation UI
│   └── state/                  # Zustand stores (12 stores)
├── components/
│   ├── home/                   # Landing page components
│   └── smalls/                 # Reusable UI components
├── middleware.ts               # Mobile device blocking
└── utils/
    └── linkCrawler.ts          # Cheerio-based link extraction
```

---

## API Reference

All endpoints accept `POST` requests with JSON bodies.

| Endpoint | Input | Description |
|---|---|---|
| `/api/playwright-crawl` | `{ url: string }` | Crawl a site and return discovered routes |
| `/api/audits` | `{ url: string }` | Performance audit for a single URL |
| `/api/dominator` | `{ url: string }` | Detect broken images, videos, audio, iframes |
| `/api/dominator/links` | `{ url: string }` | Check stylesheets and scripts |
| `/api/dominator/css` | `{ url: string }` | Analyze CSS errors and performance |
| `/api/playmaker` | `{ routes: string[] }` | Trace backend behavior across routes |

All responses follow the shape `{ success: boolean, data: ..., error?: string }`.

---

## Environment Variables

No environment variables are required for local development. The application is fully self-contained.

For production (Vercel), the deployment is zero-config -- Vercel auto-detects Next.js and provisions the serverless environment, including the Chromium binary via `@sparticuz/chromium`.

---

## Deployment

Offsyde is designed for [Vercel](https://vercel.com):

1. Fork the repository.
2. Import the project into Vercel.
3. Deploy. No build configuration or environment variables required.

The serverless functions use `@sparticuz/chromium` which bundles a Chromium binary compatible with AWS Lambda / Vercel's runtime. Concurrency limits in the API routes are tuned for serverless execution.

---

## Contributing

We welcome contributions. Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** before submitting a pull request. It covers:

- Local setup and development workflow
- Branch naming and commit message conventions
- Pull request checklist and review process
- Coding standards for TypeScript, React, and API routes
- How to propose major changes

---

## Code of Conduct

This project follows a **[Code of Conduct](./CODE_OF_CONDUCT.md)**. By participating, you agree to uphold a professional, harassment-free environment for everyone.

---

## License

This project is private and proprietary. See the repository for license terms.
