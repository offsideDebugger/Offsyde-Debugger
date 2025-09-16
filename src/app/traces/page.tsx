
"use client"
import React, { useState } from "react";
import AuditEmptyIcon from "@/components/desktop";
import { 
    useResponseDataStore, 
    useUrlStore, 
    usePlaymakerDataStore,
    usePlaymakerRoutesStore
} from "../state/urlState";
import type { PlaymakerResult } from "../state/urlState";

type Severity = 'good' | 'warn' | 'bad';

function severityClasses(severity: Severity) {
    if (severity === 'good') return 'text-neutral-300 border-neutral-700 bg-neutral-900/60';
    if (severity === 'warn') return 'text-amber-300 border-amber-900/60 bg-amber-950/30';
    return 'text-rose-300 border-rose-900/60 bg-rose-950/30';
}

function Metric({ label, value, severity }: { label: string; value: string; severity: Severity }) {
    const classes = severityClasses(severity);
    return (
        <div className={`rounded-lg border px-4 py-3 ${classes}`}>
            <p className="text-[10px] tracking-wider uppercase">{label}</p>
            <p className="text-base font-semibold">{value}</p>
        </div>
    );
}

export default function Playmaker(){
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<number | null>(null);
    const responseData = useResponseDataStore(state => state.responseData);
    const userRoutes = responseData?.data?.routes || [];
    const selectedRoutes = usePlaymakerRoutesStore(state => state.selectedRoutes);
    const setSelectedRoutes = usePlaymakerRoutesStore(state => state.setSelectedRoutes);
    const playmakerData = usePlaymakerDataStore(state => state.playmakerData);
    const setPlaymakerData = usePlaymakerDataStore(state => state.setPlaymakerData);
    const clearPlaymakerData = usePlaymakerDataStore(state => state.clearData);

    const hasResults = !!(playmakerData && playmakerData.results && playmakerData.results.length > 0);

    async function analyze() {
        setLoading(true);
        const base = useUrlStore.getState().url?.trim();
        if (!base || selectedRoutes.length === 0) {
            setLoading(false);
            return;
        }

        try {
            clearPlaymakerData();
            const fullRoutes = selectedRoutes.map((route) => {
                try {
                    return new URL(route, base).toString();
                } catch {
                    const joined = `${base.replace(/\/+$/, '')}/${String(route).replace(/^\/+/, '')}`;
                    return joined;
                }
            });

            const res = await fetch(`${process.env.URL}/api/playmaker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ routes: fullRoutes })
            });
            const data = await res.json();
            if (data && data.results) setPlaymakerData(data);
        } catch (e) {
            console.error('Playmaker analyze failed', e);
        } finally {
            setLoading(false);
        }
    }
       function toggleSelect(route: string) {
        if (selectedRoutes.includes(route)) {
            setSelectedRoutes(selectedRoutes.filter(r => r !== route));
        } else {
            setSelectedRoutes([...selectedRoutes, route]);
        }
    }

      const handleSelectAll = () => {
        if (selectedRoutes.length === userRoutes.length) {
            setSelectedRoutes([]);
        } else {
            setSelectedRoutes([...userRoutes]);
        }
    };


    return (
        <div className="grid grid-cols-1 h-screen md:grid-cols-[320px_1fr]">
            {/* Sidebar */}
            <aside className="overflow-y-auto border-r border-neutral-800">
                <nav >
                <div className="sticky top-0 flex justify-center items-center p-8 border-b border-neutral-800 backdrop-blur-md">
                        <button className="px-10 py-3 text-white text-[14px] font-medium bg-neutral-700 rounded-full transition-all cursor-pointer hover:bg-neutral-600" onClick={handleSelectAll} >Select All</button>
                    </div>
                    {userRoutes.length===0 && <div className="flex justify-center mt-60 p-4 h-full text-neutral-500 text-[20px]">No routes found</div>}
                    <ul>
                        {userRoutes.map((route, i) => (
                            <li key={i} className={`flex items-center justify-start h-16 px-4 py-4 text-[16px] border-b border-neutral-800 transition-all hover:z-10 hover:scale-x-105 hover:cursor-pointer ${
                                selectedRoutes.includes(route) 
                                    ? 'bg-white text-neutral-900' 
                                    : 'text-neutral-400 hover:bg-neutral-800'
                            }`}
                            onClick={() => toggleSelect(route)}
                            >
                                {route}
                            </li>
                        ))}
                    </ul>
                </nav>

            </aside>
            {/* Main */}
            <main className="overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-100 to-neutral-400">Playmaker</h1>
                        <p className="mt-1 text-sm text-neutral-400">Quick endpoint checks: status, TTFB, redirects, headers, and load behavior.</p>
                    </div>

                    {/* Action panel */}
                    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
                        <div className="p-5 bg-black/40 rounded-2xl border-neutral-800 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] border backdrop-blur-sm lg:col-span-2">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="px-5 py-3 text-neutral-100 bg-black rounded-lg border-neutral-700 transition-colors cursor-pointer border hover:border-neutral-500 hover:bg-neutral-900"
                                        onClick={analyze}
                                    >
                                        {loading ? 'Playmaking…' : 'Check Offsides'}
                                    </button>
                                    <span className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 rounded-full border-neutral-800 border">
                                        Selected: <span className="text-neutral-100">{selectedRoutes.length}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="px-3 py-1 text-neutral-300 bg-neutral-900/70 rounded-lg border-neutral-800 border">Routes: <span className="text-neutral-100">{userRoutes.length}</span></span>
                                    <span className="px-3 py-1 text-neutral-300 bg-neutral-900/70 rounded-lg border-neutral-800 border">Results: <span className="text-neutral-100">{playmakerData?.results?.length || 0}</span></span>
                                </div>
                            </div>
                        </div>
                        {/* Spacer / small tip */}
                        <div className="p-5 bg-black/40 rounded-2xl border-neutral-800 border">
                            <p className="text-xs text-neutral-400">Tip: Select relative routes from the left; we resolve them against your base URL.</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="py-6">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <div className="mb-4 mt-30 h-12 w-12 rounded-full border-b-2 border-neutral-400 animate-spin" />
                                <p className="text-neutral-300">Running checks…</p>
                            </div>
                        ) : !hasResults ? (
                            <div className="flex flex-col items-center gap-4">
                                <AuditEmptyIcon size={300} iconColor="#3b3b3b" accentColor="#3b3b3b" />
                                <div className="text-center">
                                    <h2 className="mb-2 text-2xl font-bold text-neutral-200">No Playmaker Results</h2>
                                    <p className="text-neutral-500">Choose routes and hit <span className="text-neutral-100">Check Offsides</span> to inspect endpoints.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2">
                                {playmakerData?.results?.map((r: PlaymakerResult, idx: number) => (
                                    <div key={idx} className="p-6 bg-black/40 rounded-3xl border-neutral-800 transition-colors group border hover:border-neutral-700 md:p-7">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="min-w-0">
                                                <p className="text-sm text-neutral-400 truncate">{new URL(r.url).origin}</p>
                                                <h3 className="text-lg font-semibold text-neutral-100 truncate">{new URL(r.url).pathname || '/'}</h3>
                                            </div>
                                            <span className={`px-2.5 py-1.5 text-xs rounded-md border ${r.statusSeverity==='good' ? 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40' : r.statusSeverity==='warn' ? 'text-amber-300 border-amber-900/60 bg-amber-950/40' : 'text-rose-300 border-rose-900/60 bg-rose-950/40'}`}>{r.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <Metric label="TTFB" value={`${r.ttfb} ms`} severity={r.ttfbSeverity} />
                                            <Metric label="Load Avg" value={`${r.loadTestAvg} ms`} severity={r.loadSeverity} />
                                            <Metric label="Redirects" value={String(r.redirects)} severity={r.redirects>0? 'warn':'good'} />
                                            <Metric label="JSON" value={r.jsonEmpty===1? 'empty': r.jsonEmpty===0? 'ok':'n/a'} severity={r.jsonSeverity==='neutral'?'good':r.jsonSeverity} />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
                                            {(['cacheControl','cors','contentType'] as const).map((h) => {
                                                const item = r.headers[h];
                                                const label = h === 'cacheControl' ? 'Cache' : h === 'cors' ? 'CORS' : 'Type';
                                                const cls = item.severity==='good' ? 'text-neutral-300 border-neutral-700 bg-neutral-900/60' : item.severity==='warn' ? 'text-amber-300 border-amber-900/60 bg-amber-950/30' : 'text-rose-300 border-rose-900/60 bg-rose-950/30';
                                                return <span key={h} className={`px-2 py-1 rounded-md border ${cls}`}>{label}: {item.present ? 'yes' : 'no'}</span>;
                                            })}
                                        </div>
                                        <div className="flex items-center justify-between gap-3 mt-4">
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <span className={`px-2 py-1 rounded-md border ${severityClasses(r.ttfbSeverity)}`}>TTFB: {r.ttfbSeverity}</span>
                                                <span className={`px-2 py-1 rounded-md border ${severityClasses(r.loadSeverity)}`}>Load: {r.loadSeverity}</span>
                                                <span className={`px-2 py-1 rounded-md border ${severityClasses(r.statusSeverity)}`}>Status: {r.statusSeverity}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="px-3 py-1.5 text-xs text-neutral-200 rounded-md border-neutral-700 cursor-pointer border hover:bg-neutral-900"
                                                    onClick={() => {
                                                        navigator.clipboard?.writeText(r.url).then(() => {
                                                            setCopied(idx);
                                                            setTimeout(() => setCopied(null), 1200);
                                                        }).catch(() => {/* noop */});
                                                    }}
                                                >
                                                    {copied === idx ? 'Copied' : 'Copy URL'}
                                                </button>
                                                <a
                                                    href={r.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 text-xs text-neutral-200 rounded-md border-neutral-700 border hover:bg-neutral-900"
                                                >
                                                    Open
                                                </a>
                                            </div>
                                        </div>
                                        <details className="mt-4 group-open:mt-4">
                                            <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-300">Raw details</summary>
                                            <pre className="overflow-auto mt-2 p-3 max-h-64 text-[11px] text-neutral-300 bg-neutral-950/70 rounded-md border-neutral-800 border">{JSON.stringify(r, null, 2)}</pre>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
)

}