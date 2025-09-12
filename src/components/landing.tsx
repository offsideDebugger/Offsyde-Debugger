"use client";

import React from "react";
import Link from "next/link";
import Container from "./container";

type Feature = {
  name: string; // short feature name in brackets
  title: string; // display title
  desc: string; // short description
  icon: string; // emoji/icon
};

const features: Feature[] = [
  {
    name: "Scouting",
    title: "Route Crawling",
    desc: "Crawl a site and discover all reachable routes from a starting URL.",
    icon: "🕵️",
  },
  {
    name: "Forensics",
    title: "Lighthouse-style Audits",
    desc: "Run performance, accessibility and SEO audits on selected routes.",
    icon: "🔍",
  },
  {
    name: "DOMinator",
    title: "Frontend Debugging",
    desc: "Detect broken links, missing images, detached buttons and UI issues.",
    icon: "🎯",
  },
  {
    name: "Playmaker",
    title: "Backend Debugging",
    desc: "Spot auth failures, DB query errors and common server-side problems.",
    icon: "⚡",
  },
  {
    name: "Statsheets",
    title: "Summary Reports",
    desc: "Get a sharable, consolidated report of routes, audits and problems.",
    icon: "📊",
  },
];

export default function Landing(): React.ReactElement {
  return (
    <div className="text-white">
  {/* Header is provided globally; intentionally omitted here to avoid duplication */}

  {/* Hero: height equals viewport minus navbar so content is vertically centered between navbar and fold */}
  <section style={{ height: 'calc(100vh - 72px)' } as React.CSSProperties} className="flex items-center justify-center">
        <Container>
          <div className="grid items-center gap-8 mx-auto w-full max-w-6xl lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Debug. Audit. Report.
                <br />
                <span className="text-neutral-400 font-medium">Deep site forensics, frontend to backend</span>
              </h1>

              <p className="max-w-2xl text-lg text-neutral-400">
                Enter a URL, scout the site for routes, then run tailored audits and checks. Offsyde surfaces
                broken UI, server issues and performance regressions and bundles them into clean, shareable
                Statsheets.
              </p>

              <div className="flex items-center gap-4">
                <Link href="/paggetests" className="inline-block px-6 py-3 text-black font-semibold bg-white rounded-md">Get started</Link>
                <a href="#features" className="text-sm text-neutral-400 hover:text-white">See features →</a>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-white/3 to-white/2 rounded-xl border-white/6 backdrop-blur-sm border">
              <div className="text-xs font-mono text-neutral-300">Quick flow</div>
              <ol className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 text-black font-bold bg-blue-500 rounded-md">1</div>
                  <div>
                    <div className="font-semibold">Enter routes</div>
                    <div className="text-sm text-neutral-400">Provide a starting URL and optional seed routes to scout.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 text-black font-bold bg-amber-400 rounded-md">2</div>
                  <div>
                    <div className="font-semibold">Select tools</div>
                    <div className="text-sm text-neutral-400">Pick Forensics, DOMinator, Playmaker, or all of them.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 text-black font-bold bg-cyan-400 rounded-md">3</div>
                  <div>
                    <div className="font-semibold">Review & share</div>
                    <div className="text-sm text-neutral-400">Receive Statsheets — downloadable and sharable reports.</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-12">
        <Container>
          <h2 className="mb-6 text-2xl font-bold">Features</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <article key={f.name} className="p-5 bg-neutral-900/40 rounded-xl border-white/6 transition-transform border hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{f.icon}</div>
                  <div>
                    <h3 className="font-bold">{f.title}</h3>
                    <p className="text-xs text-neutral-500">({f.name})</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-neutral-400">{f.desc}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* How to use */}
      <section id="howto" className="py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-2xl font-bold">How to use</h2>
            <ol className="text-neutral-400 space-y-6">
              <li>
                <strong className="block text-white">1 - Scout</strong>
                Enter your base URL. The Scoutings tool crawls and lists discovered routes for you to pick from.
              </li>
              <li>
                <strong className="block text-white">2 - Forensics</strong>
                Select routes (or run across all routes) to run Lighthouse-style audits and receive performance & accessibility scores.
              </li>
              <li>
                <strong className="block text-white">3 - DOMinator</strong>
                From a selection of frontend checks (broken links, missing images, unclickable buttons), DOMinator reports all findings across routes.
              </li>
              <li>
                <strong className="block text-white">4 - Playmaker</strong>
                Run backend checks for auth flows, common DB query failures and response anomalies across your crawled routes.
              </li>
              <li>
                <strong className="block text-white">5 - Statsheets</strong>
                Compile everything into a single, shareable report with route-level detail and audit summaries.
              </li>
            </ol>
          </div>
        </Container>
      </section>

      {/* Workflow / small status panel */}
      <section id="workflow" className="py-12">
        <Container>
          <div className="grid items-start gap-6 mx-auto max-w-5xl md:grid-cols-2">
            <div className="p-6 bg-neutral-900/30 rounded-lg border-white/6 border">
              <h3 className="mb-3 font-bold">Workflow snapshot</h3>
              <ul className="text-sm text-neutral-400 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                  Scouting routes collected
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  Forensics auditing
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  DOMinator scanning
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  Playmaker checking
                </li>
              </ul>
            </div>

            <div className="p-6 bg-neutral-900/20 rounded-lg border-white/6 border">
              <h3 className="mb-3 font-bold">Output</h3>
              <p className="text-sm text-neutral-400">Statsheets compile route lists, audit scores, and problem summaries into downloadable reports you can share with stakeholders.</p>
              <div className="flex gap-3 mt-4">
                <Link href="/paggetests" className="px-4 py-2 text-black bg-white rounded-md">Run a scan</Link>
                <a href="#features" className="px-4 py-2 text-sm text-neutral-300 border-white/10 rounded-md border">Learn more</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer CTA */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-3 text-2xl font-bold">Ready to dig deep?</h3>
            <p className="mb-6 text-neutral-400">Start by entering a URL and let Offsyde map and analyze your site.</p>
            <Link href="/paggetests" className="inline-block px-6 py-3 text-black font-semibold bg-white rounded-md">Start analysis</Link>
            <div className="mt-10 mx-auto w-full border-neutral-800 border"></div>
            <div className="mt-16 text-neutral-500">
                <span className="text-md">&copy;{new Date().getFullYear()} Offsyde by </span> <a href="https://x.com/offsideDebugger" className="text-neutral-300 text-md"><u>@offsideDebugger</u></a>. <span>All rights reserved.</span>
            </div>
            <div className="mt-3">
                <span className="text-md text-neutral-200">&quot;Catch What Your Site Missed&quot;</span>
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
}
