
import ExportButton from "./printButton";

export default async function Statsheets() {
    
   

    // Placeholder values for the grid. These will be wired to real stores/APIs later.
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const overview = {
        project: 'Your Site',
        baseUrl: 'https://example.com',
        routes: 0,
        issues: 0,
    };
    const scores = [
        { name: 'Performance', grade: 'B', color: 'bg-emerald-600/80', sub: 'load time' },
        { name: 'Accessibility', grade: 'B+', color: 'bg-sky-600/80', sub: 'contrast' },
        { name: 'Best Practices', grade: 'A-', color: 'bg-violet-600/80', sub: 'standards' },
        { name: 'SEO', grade: 'A', color: 'bg-amber-600/80', sub: 'meta' },
    ];
    const metrics = [
        { label: 'DOM Content Loaded', value: '—', accent: 'text-blue-400' },
        { label: 'Page Load Complete', value: '—', accent: 'text-green-400' },
        { label: 'Time to First Byte', value: '—', accent: 'text-purple-400' },
        { label: 'DOM Elements', value: '—', accent: 'text-orange-400' },
        { label: 'Images', value: '—', accent: 'text-cyan-400' },
        { label: 'Scripts', value: '—', accent: 'text-pink-400' },
        { label: 'Stylesheets', value: '—', accent: 'text-yellow-400' },
    ];

    return (
        <div className="mx-auto mt-8 max-w-7xl statsheet">
            {/* Header */}
                <div className="px-4">
                    {/* Print-only centered brand */}
                    <h1 className="print-only print-brand">Offsyde</h1>
                <div className="flex flex-col items-start justify-between items-center gap-3 sm:flex-row">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-100 no-print md:text-4xl">Statsheets</h1>
                        <p className="mt-2 text-neutral-400 no-print">Sharable summaries of crawls, audits, and checks—styled to your theme.</p>
                    </div>
                    <div className="no-print">
                        <ExportButton />
                    </div>
                </div>
               
            </div>

            {/* Grid */}
            <div className="grid gap-6 px-4 mt-6 statsheet-grid md:grid-cols-12">
                {/* Overview card */}
                <section className="p-5 bg-black/40 rounded-2xl border-neutral-800 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] avoid-break border md:col-span-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs tracking-wide text-neutral-400">Project</p>
                            <h2 className="text-xl font-semibold text-neutral-100">{overview.project}</h2>
                            <p className="mt-1 text-sm text-neutral-400 truncate">{overview.baseUrl}</p>
                        </div>
                        <span className="px-2.5 py-1.5 text-xs text-neutral-300 bg-neutral-900/70 rounded-md border-neutral-800 border">{today}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="p-3 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <p className="text-[10px] tracking-widest text-neutral-400 uppercase">Routes</p>
                            <p className="text-2xl font-bold text-neutral-100">{overview.routes}</p>
                        </div>
                        <div className="p-3 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <p className="text-[10px] tracking-widest text-neutral-400 uppercase">Issues</p>
                            <p className="text-2xl font-bold text-neutral-100">{overview.issues}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-neutral-500">Run audits to populate your Statsheet. This is a preview layout.</p>
                </section>

                {/* Scorecards */}
                <section className="grid grid-cols-2 gap-4 avoid-break md:col-span-8">
                    {scores.map((s) => (
                        <div key={s.name} className="p-5 bg-black/40 rounded-2xl border-neutral-800 border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-neutral-400">{s.name}</p>
                                    <p className="text-[11px] text-neutral-500">{s.sub}</p>
                                </div>
                                <span className={`inline-flex items-center justify-center w-12 h-12 text-white text-xl font-bold rounded-lg ${s.color}`}>{s.grade}</span>
                            </div>
                            <div className="overflow-hidden mt-4 h-1.5 bg-neutral-800 rounded-full">
                                <div className={`h-full w-2/3 rounded-full opacity-70 transition-all ${s.color}`}></div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Core metrics */}
                <section className="p-5 bg-black/40 rounded-2xl border-neutral-800 avoid-break border md:col-span-7">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-200">Core metrics</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {metrics.map((m) => (
                            <div key={m.label} className="p-3 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                                <p className="text-[10px] tracking-wider text-neutral-400 uppercase">{m.label}</p>
                                <p className={`mt-1 font-mono text-lg font-bold ${m.accent}`}>{m.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Resource split / placeholder issues */}
                <section className="p-5 bg-black/40 rounded-2xl border-neutral-800 avoid-break border md:col-span-5">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-200">Highlights</h3>
                    <ul className="text-sm text-neutral-300 space-y-2">
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Top route by load</span>
                            <span className="text-neutral-200">—</span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Largest script</span>
                            <span className="text-neutral-200">—</span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Missing alt images</span>
                            <span className="text-neutral-200">—</span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Non-200 responses</span>
                            <span className="text-neutral-200">—</span>
                        </li>
                    </ul>
                </section>

                {/* Routes table (placeholder) */}
                <section className="p-5 bg-black/40 rounded-2xl border-neutral-800 avoid-break border md:col-span-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-200">Routes summary</h3>
                        <span className="px-2 py-1 text-[11px] text-neutral-300 bg-neutral-900/70 rounded-md border-neutral-800 border">0 routes</span>
                    </div>
                    <div className="overflow-hidden mt-3 rounded-lg border-neutral-800 border">
                        <div className="grid grid-cols-12 text-xs text-neutral-400 bg-neutral-950/50">
                            <div className="col-span-6 px-3 py-2">Route</div>
                            <div className="col-span-2 px-3 py-2">Status</div>
                            <div className="col-span-2 px-3 py-2">TTFB</div>
                            <div className="col-span-2 px-3 py-2">Load</div>
                        </div>
                        <div className="p-6 text-center text-sm text-neutral-500">Run a crawl and audits to populate this table.</div>
                    </div>
                </section>
            </div>
        </div>
    );
}
