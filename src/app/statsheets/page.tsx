"use client";
import ExportButton from "./printButton";
import { useUrlStore,
    useAuditResultsStore,
    useDominatorCSSDataStore,
    
    useDominatorDataStore,
    useDominatorLinksDataStore,
    usePlaymakerDataStore,
    useResponseDataStore

    
} from "../state/urlState";



export default  function Statsheets() {
    
    // Get data from stores
    const { responseData } = useResponseDataStore();
    const { auditResults } = useAuditResultsStore();
    const { dominatorData } = useDominatorDataStore();
    const { dominatorLinksData } = useDominatorLinksDataStore();
    const { dominatorCSSData } = useDominatorCSSDataStore();
    const { playmakerData } = usePlaymakerDataStore();
    const { url } = useUrlStore();

    // Calculate values based on data
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    
    // Calculate overview data
    const totalRoutes = responseData?.data?.routes?.length || 0;
    const totalIssues = Object.values(dominatorData || {}).reduce((sum, data) => {
        return sum + data.brokenImageData.filter(img => img.isBroken).length + 
               data.brokenVideos.length + data.brokenAudios.length + data.brokenIframes.length;
    }, 0) + 
    Object.values(dominatorLinksData || {}).reduce((sum, data) => {
        return sum + data.summary.totalIssues;
    }, 0) + 
    Object.values(dominatorCSSData || {}).reduce((sum, data) => {
        return sum + data.totalIssues;
    }, 0);
    
    const overview = {
        project: responseData?.data?.title || 'Your Site',
        baseUrl: url || 'https://example.com',
        routes: totalRoutes,
        issues: totalIssues,
    };

    // Calculate meaningful scores based on actual data
    const performanceScore = (() => {
        if (!playmakerData?.results?.length) return { grade: '—', severity: 'neutral' };
        const avgLoad = playmakerData.results.reduce((sum, r) => sum + r.loadTestAvg, 0) / playmakerData.results.length;
        if (avgLoad < 1000) return { grade: 'A', severity: 'good' };
        if (avgLoad < 2000) return { grade: 'B', severity: 'warn' };
        return { grade: 'C', severity: 'bad' };
    })();

    const brokenElementsScore = (() => {
        if (!dominatorData || Object.keys(dominatorData).length === 0) return { grade: '—', count: 0 };
        const brokenCount = Object.values(dominatorData).reduce((sum, data) => 
            sum + data.brokenImageData.filter(img => img.isBroken).length + 
            data.brokenVideos.length + data.brokenAudios.length + data.brokenIframes.length, 0
        );
        if (brokenCount === 0) return { grade: 'A', count: brokenCount };
        if (brokenCount < 5) return { grade: 'B', count: brokenCount };
        return { grade: 'C', count: brokenCount };
    })();

    const linkIntegrityScore = (() => {
        if (!dominatorLinksData || Object.keys(dominatorLinksData).length === 0) return { grade: '—', issues: 0 };
        const linkIssues = Object.values(dominatorLinksData).reduce((sum, data) => sum + data.summary.totalIssues, 0);
        if (linkIssues === 0) return { grade: 'A', issues: linkIssues };
        if (linkIssues < 3) return { grade: 'B', issues: linkIssues };
        return { grade: 'C', issues: linkIssues };
    })();

    const cssHealthScore = (() => {
        if (!dominatorCSSData || Object.keys(dominatorCSSData).length === 0) return { grade: '—', issues: 0 };
        const cssIssues = Object.values(dominatorCSSData).reduce((sum, data) => sum + data.totalIssues, 0);
        if (cssIssues === 0) return { grade: 'A', issues: cssIssues };
        if (cssIssues < 10) return { grade: 'B', issues: cssIssues };
        return { grade: 'C', issues: cssIssues };
    })();
    
    const scores = [
        { name: 'Performance', grade: performanceScore.grade, color: 'bg-emerald-600/80', sub: 'avg load' },
        { name: 'Media Health', grade: brokenElementsScore.grade, color: 'bg-sky-600/80', sub: 'broken elements' },
        { name: 'Link Integrity', grade: linkIntegrityScore.grade, color: 'bg-violet-600/80', sub: 'script/style issues' },
        { name: 'CSS Health', grade: cssHealthScore.grade, color: 'bg-amber-600/80', sub: 'style issues' },
    ];

    // Calculate metrics from audit results
    const avgMetrics = auditResults.reduce((acc, result) => {
        const metrics = result.data?.metrics;
        if (metrics) {
            acc.domContentLoaded += parseFloat(metrics.domContentLoaded.replace('ms', '')) || 0;
            acc.pageLoadComplete += parseFloat(metrics.pageLoadComplete.replace('ms', '')) || 0;
            acc.timeToFirstByte += parseFloat(metrics.timeToFirstByte.replace('ms', '')) || 0;
            acc.domElements += metrics.domElements || 0;
            acc.images += metrics.images || 0;
            acc.scripts += metrics.scripts || 0;
            acc.stylesheets += metrics.stylesheets || 0;
            acc.count++;
        }
        return acc;
    }, {
        domContentLoaded: 0, pageLoadComplete: 0, timeToFirstByte: 0,
        domElements: 0, images: 0, scripts: 0, stylesheets: 0, count: 0
    });

    const hasMetrics = avgMetrics.count > 0;
    
    // Get totals from all available data sources for more accuracy
    const totalImages = Object.values(dominatorData || {}).reduce((sum, data) => sum + data.brokenImageData.length, 0) || 
                       (hasMetrics ? Math.round(avgMetrics.images / avgMetrics.count) : 0);
    const totalScripts = Object.values(dominatorLinksData || {}).reduce((sum, data) => sum + data.scriptCount, 0) || 
                        (hasMetrics ? Math.round(avgMetrics.scripts / avgMetrics.count) : 0);
    const totalStylesheets = Object.values(dominatorLinksData || {}).reduce((sum, data) => sum + data.stylesheetCount, 0) || 
                            (hasMetrics ? Math.round(avgMetrics.stylesheets / avgMetrics.count) : 0);

    const metrics = [
        { 
            label: 'DOM Content Loaded', 
            value: hasMetrics ? `${Math.round(avgMetrics.domContentLoaded / avgMetrics.count)}ms avg` : '—', 
            accent: 'text-blue-400' 
        },
        { 
            label: 'Page Load Complete', 
            value: hasMetrics ? `${Math.round(avgMetrics.pageLoadComplete / avgMetrics.count)}ms avg` : '—', 
            accent: 'text-green-400' 
        },
        { 
            label: 'TTFB (Browser)', 
            value: hasMetrics ? `${Math.round(avgMetrics.timeToFirstByte / avgMetrics.count)}ms avg` : '—', 
            accent: 'text-purple-400' 
        },
        { 
            label: 'DOM Elements', 
            value: hasMetrics ? `${Math.round(avgMetrics.domElements / avgMetrics.count)} avg` : '—', 
            accent: 'text-orange-400' 
        },
        { 
            label: 'Images', 
            value: totalImages > 0 ? totalImages.toString() : '—', 
            accent: 'text-cyan-400' 
        },
        { 
            label: 'Scripts', 
            value: totalScripts > 0 ? totalScripts.toString() : '—', 
            accent: 'text-pink-400' 
        },
        { 
            label: 'Stylesheets', 
            value: totalStylesheets > 0 ? totalStylesheets.toString() : '—', 
            accent: 'text-yellow-400' 
        },
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
                    <h3 className="mb-3 text-sm font-semibold text-neutral-200">Core metrics {hasMetrics ? `(${avgMetrics.count} routes)` : ''}</h3>
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
                            <span className="text-neutral-200">
                                {(() => {
                                    if (!playmakerData?.results?.length) return '—';
                                    const slowest = playmakerData.results.reduce((prev, curr) => 
                                        curr.loadTestAvg > prev.loadTestAvg ? curr : prev
                                    );
                                    return `${Math.round(slowest.loadTestAvg)}ms`;
                                })()}
                            </span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Largest script</span>
                            <span className="text-neutral-200">
                                {(() => {
                                    if (!dominatorLinksData || Object.keys(dominatorLinksData).length === 0) return '—';
                                    const totalScripts = Object.values(dominatorLinksData).reduce((sum, data) => 
                                        sum + data.scriptCount, 0
                                    );
                                    return totalScripts.toString();
                                })()}
                            </span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Missing alt images</span>
                            <span className="text-neutral-200">
                                {(() => {
                                    if (!dominatorData || Object.keys(dominatorData).length === 0) return '—';
                                    const missingAlt = Object.values(dominatorData).reduce((sum, data) => 
                                        sum + data.brokenImageData.filter(img => !img.alt || img.alt.trim() === '').length, 0
                                    );
                                    return missingAlt.toString();
                                })()}
                            </span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2 bg-neutral-900/40 rounded-lg border-neutral-800 border">
                            <span className="text-neutral-400">Non-200 responses</span>
                            <span className="text-neutral-200">
                                {(() => {
                                    if (!playmakerData?.results?.length) return '—';
                                    const non200 = playmakerData.results.filter(result => result.status !== 200).length;
                                    return non200.toString();
                                })()}
                            </span>
                        </li>
                    </ul>
                </section>

                {/* Routes table */}
                <section className="p-5 bg-black/40 rounded-2xl border-neutral-800 avoid-break border md:col-span-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-200">Routes summary</h3>
                        <span className="px-2 py-1 text-[11px] text-neutral-300 bg-neutral-900/70 rounded-md border-neutral-800 border">
                            {totalRoutes} routes
                        </span>
                    </div>
                    <div className="overflow-hidden mt-3 rounded-lg border-neutral-800 border">
                        <div className="grid grid-cols-12 text-xs text-neutral-400 bg-neutral-950/50">
                            <div className="col-span-6 px-3 py-2">Route</div>
                            <div className="col-span-2 px-3 py-2">Status</div>
                            <div className="col-span-2 px-3 py-2">TTFB (Server)</div>
                            <div className="col-span-2 px-3 py-2">Load</div>
                        </div>
                        {playmakerData?.results?.length ? (
                            playmakerData.results.map((result, index) => (
                                <div key={index} className="grid grid-cols-12 text-xs text-neutral-300 border-t border-neutral-800">
                                    <div className="col-span-6 px-3 py-2 truncate">{result.url}</div>
                                    <div className="col-span-2 px-3 py-2">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            result.statusSeverity === 'good' ? 'bg-green-900/30 text-green-400' :
                                            result.statusSeverity === 'warn' ? 'bg-yellow-900/30 text-yellow-400' :
                                            'bg-red-900/30 text-red-400'
                                        }`}>
                                            {result.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 px-3 py-2">{result.ttfb}ms</div>
                                    <div className="col-span-2 px-3 py-2">{Math.round(result.loadTestAvg)}ms</div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-neutral-500">
                                {totalRoutes > 0 ? 'Run Playmaker audits to see route performance data.' : 'Run a crawl and audits to populate this table.'}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
