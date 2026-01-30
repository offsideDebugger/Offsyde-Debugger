# Offsyde 🔍

A comprehensive web auditing and debugging platform built with Next.js that helps developers analyze, optimize, and debug their web applications. Offsyde provides automated route discovery, performance audits, visual debugging, and backend tracing capabilities.

## Features

### 🕵️ Scoutings - Route Crawling
Automatically crawl and discover all reachable routes from a starting URL using Playwright-powered web scraping. Get a complete map of your website's structure.

### 🔍 Audits - Lighthouse-style Performance Testing
Run comprehensive performance, accessibility, and SEO audits on selected routes. Get detailed metrics including:
- Performance scores
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index
- Accessibility and SEO scores

### 🎯 Visuals - Frontend Debugging
Detect and analyze frontend issues across your application:
- **Links & Sheets**: Identify broken links, missing hrefs, and link issues
- **Faulty CSS**: Find CSS errors and stylesheet problems
- **Offside Tags**: Detect broken images, videos, audio elements, and iframes

### ⚡ Traces - Backend Debugging
Analyze backend issues with network request monitoring:
- Spot auth failures
- Identify database query errors
- Monitor HTTP status codes
- Track response times
- Analyze request/response headers

### 📊 Statsheets - Summary Reports
Generate comprehensive, shareable reports consolidating:
- Route discovery results
- Performance audit summaries
- Visual debugging findings
- Backend trace analysis
- Printable/exportable formats

## Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Browser Automation**: Playwright Core
- **Performance Auditing**: Lighthouse
- **Web Scraping**: Cheerio, Axios
- **Serverless Chrome**: @sparticuz/chromium
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd offsyde
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
offsyde/
├── src/
│   ├── app/
│   │   ├── api/              # API routes for backend processing
│   │   │   ├── audits/       # Lighthouse audits endpoint
│   │   │   ├── dominator/    # Frontend debugging endpoints
│   │   │   │   ├── css/      # CSS analysis
│   │   │   │   └── links/    # Link checking
│   │   │   ├── playmaker/    # Backend tracing endpoint
│   │   │   └── playwright-crawl/ # Route crawling endpoint
│   │   ├── scoutings/        # Route crawling page
│   │   ├── audits/           # Performance audits page
│   │   ├── visuals/          # Frontend debugging page
│   │   ├── traces/           # Backend debugging page
│   │   ├── statsheets/       # Report generation page
│   │   └── state/            # Zustand state management
│   ├── components/           # React components
│   │   ├── home/             # Homepage components
│   │   └── smalls/           # Reusable UI components
│   └── utils/                # Utility functions
├── public/                   # Static assets
└── scripts/                  # Build and utility scripts
```

## Usage

### 1. Scouting Routes
1. Navigate to the **Scoutings** page
2. Enter your website's base URL
3. Click "Crawl" to discover all routes
4. Select routes you want to analyze

### 2. Running Audits
1. Navigate to the **Audits** page
2. Select routes from your scouting results
3. Run batch audits or individual route audits
4. View detailed performance metrics

### 3. Visual Debugging
1. Navigate to the **Visuals** page
2. Select routes to analyze
3. Choose analysis type:
   - Links & Sheets
   - Faulty CSS
   - Offside Tags
4. Review detected issues

### 4. Backend Tracing
1. Navigate to the **Traces** page
2. Select routes for analysis
3. Run backend trace analysis
4. Review network requests, status codes, and errors

### 5. Generating Reports
1. Navigate to the **Statsheets** page
2. View consolidated results from all analyses
3. Export or print comprehensive reports

## API Endpoints

- `POST /api/playwright-crawl` - Crawl website and discover routes
- `POST /api/audits` - Run Lighthouse audits on a URL
- `POST /api/dominator` - Analyze frontend elements (images, videos, iframes)
- `POST /api/dominator/links` - Check for broken links and link issues
- `POST /api/dominator/css` - Analyze CSS errors and stylesheet issues
- `POST /api/playmaker` - Trace backend requests and analyze server responses

## Deployment

### Deploy on Vercel

The easiest way to deploy Offsyde is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to a Git repository
2. Import the project to Vercel
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Environment Considerations

- The application uses Playwright with Chromium for browser automation
- Serverless functions have concurrency limits to manage resource usage
- Chromium binary is optimized for serverless environments using @sparticuz/chromium

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues, questions, or feature requests, please open an issue in the repository.
