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
    name: "Scoutings",
    title: "Route Crawling",
    desc: "Crawl a site and discover all reachable routes from a starting URL.",
    icon: "🕵️",
  },
  {
    name: "Audits",
    title: "Lighthouse-style Audits",
    desc: "Run performance, accessibility and SEO audits on selected routes.",
    icon: "🔍",
  },
  {
    name: "Visuals",
    title: "Frontend Debugging",
    desc: "Detect broken links, missing images, detached buttons and UI issues.",
    icon: "🎯",
  },
  {
    name: "Traces",
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

  {/* Hero: responsive height - full viewport on mobile (no navbar), minus navbar on desktop */}
  <section className="flex items-center justify-center px-4 min-h-screen sm:px-0 md:min-h-[calc(100vh-72px)]">
        <Container>
          <div className="grid items-center gap-8 mx-auto py-8 w-full  max-w-6xl md:py-0 lg:grid-cols-2">
            <div className="text-center space-y-6 lg:text-left ">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Debug. Audit. Report.
                <br />
                <span className="text-neutral-400 font-medium text-xl sm:text-2xl md:text-3xl lg:text-3xl">Deep site tests, frontend to backend</span>
              </h1>

              <p className="mx-auto max-w-2xl text-base text-neutral-400 sm:text-lg lg:mx-0">
                Enter a URL, scout the site for routes, then run tailored audits and checks. Offsyde surfaces
                broken UI, server issues and performance regressions and bundles them into clean, shareable
                Statsheets.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/scoutings" className="inline-block px-6 py-3 w-full text-black font-semibold text-center bg-white rounded-md sm:w-auto">Get started</Link>
                <a href="#features" className="text-sm text-neutral-400 hover:text-white">See features →</a>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-br from-white/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_65%)] to-white/2 rounded-xl border-white/6 backdrop-blur-sm border sm:p-6 lg:mt-0">
              <div className="text-xs font-mono text-neutral-300">Quick flow</div>
              <ol className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 h-8 text-xs text-black font-bold text-sm bg-blue-500 rounded-md sm:w-8">1</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Enter routes</div>
                    <div className="text-xs text-neutral-400 sm:text-sm">Provide a starting URL and optional seed routes to scout.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 h-8 text-xs text-black font-bold text-sm bg-amber-400 rounded-md sm:w-8">2</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Select tools</div>
                    <div className="text-xs text-neutral-400 sm:text-sm">Pick Audits, Visuals, Traces, or all of them.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 h-8 text-xs text-black font-bold text-sm bg-cyan-400 rounded-md sm:w-8">3</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Review & share</div>
                    <div className="text-xs text-neutral-400 sm:text-sm">Receive Statsheets — downloadable and sharable reports.</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-8 sm:py-12">
        <Container>
          <h2 className="mb-6 text-xl font-bold text-center sm:text-2xl lg:text-left">Features</h2>
          <div className="grid grid-cols-1 gap-4 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article key={f.name} className="p-4 bg-neutral-900/40 rounded-xl border-white/6 transition-transform border hover:scale-[1.02] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="text-xl sm:text-2xl">{f.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base">{f.title}</h3>
                    <p className="text-xs text-neutral-500">({f.name})</p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-neutral-400 text-sm sm:mt-4">{f.desc}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* How to use */}
      <section id="howto" className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-xl font-bold text-center sm:text-2xl lg:text-left">How to use</h2>
            <ol className="text-neutral-400 space-y-4 sm:space-y-6">
              <li className="px-4 sm:px-0">
                <strong className="block text-white text-sm sm:text-base">1 - Scout</strong>
                <span className="text-sm sm:text-base">Enter your base URL. The Scoutings tool crawls and lists discovered routes for you to pick from.</span>
              </li>
              <li className="px-4 sm:px-0">
                <strong className="block text-white text-sm sm:text-base">2 - Audits</strong>
                <span className="text-sm sm:text-base">Select routes (or run across all routes) to run Lighthouse-style audits and receive performance & accessibility scores.</span>
              </li>
              <li className="px-4 sm:px-0">
                <strong className="block text-white text-sm sm:text-base">3 - Visuals</strong>
                <span className="text-sm sm:text-base">From a selection of frontend checks (broken links, missing images, unclickable buttons), Visuals reports all findings across routes.</span>
              </li>
              <li className="px-4 sm:px-0">
                <strong className="block text-white text-sm sm:text-base">4 - Traces</strong>
                <span className="text-sm sm:text-base">Run backend checks for auth flows, common DB query failures and response anomalies across your crawled routes.</span>
              </li>
              <li className="px-4 sm:px-0">
                <strong className="block text-white text-sm sm:text-base">5 - Statsheets</strong>
                <span className="text-sm sm:text-base">Compile everything into a single, shareable report with route-level detail and audit summaries.</span>
              </li>
            </ol>
          </div>
        </Container>
      </section>

      {/* Workflow / small status panel */}
      <section id="workflow" className="py-8 sm:py-12">
        <Container>
          <div className="grid grid-cols-1 items-start gap-6 mx-auto max-w-5xl md:grid-cols-2">
            <div className="p-4 bg-neutral-900/30 rounded-lg border-white/6 border sm:p-6">
              <h3 className="mb-3 font-bold text-sm sm:text-base">Workflow snapshot</h3>
              <ul className="text-xs text-neutral-400 space-y-3 sm:text-sm">
                <li className="flex items-center gap-3">
                  <span className="inline-block flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Scouting routes collected</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-block flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  <span>Audits</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-block flex-shrink-0 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  <span>Frontend Offsides</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-block flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span>Traces checking</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-neutral-900/20 rounded-lg border-white/6 border sm:p-6">
              <h3 className="mb-3 font-bold text-sm sm:text-base">Output</h3>
              <p className="mb-4 text-xs text-neutral-400 sm:text-sm">Statsheets compile route lists, audit scores, and problem summaries into downloadable reports you can share with stakeholders.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/audits" className="px-4 py-2 text-black text-center text-sm bg-white rounded-md sm:text-base">Run a scan</Link>
                <a href="#features" className="px-4 py-2 text-xs text-neutral-300 text-center border-white/10 rounded-md border sm:text-sm">Learn more</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer CTA */}
      <section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto px-4 max-w-4xl text-center">
            <h3 className="mb-3 text-xl font-bold sm:text-2xl">Ready to dig deep?</h3>
            <p className="mb-6 text-sm text-neutral-400 sm:text-base">Start by entering a URL and let Offsyde map and analyze your site.</p>
            <Link href="/scoutings" className="inline-block px-6 py-3 w-full text-black font-semibold bg-white rounded-md sm:w-auto">Start analysis</Link>
            <div className="mt-8 mx-auto w-full border-neutral-800 border sm:mt-10"></div>
            <div className="mt-8 text-neutral-500 sm:mt-16">
                <span className="text-sm sm:text-base">&copy;{new Date().getFullYear()} Offsyde by </span> 
                <a href="https://x.com/offsideDebugger" className="text-neutral-300 text-sm sm:text-base"><u>@offsideDebugger</u></a>
                <span className="text-sm sm:text-base">. All rights reserved.</span>
            </div>
            <div className="mt-3">
                <span className="text-sm text-neutral-200 sm:text-base">&quot;Catch What Your Site Missed&quot;</span>
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
}
