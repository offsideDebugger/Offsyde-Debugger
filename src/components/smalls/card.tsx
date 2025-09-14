'use client';

import React from 'react';
import { 
    useDominatorDataStore, 
    useDominatorLinksDataStore, 
    useDominatorCSSDataStore,
    DominatorData,
    DominatorLinksData,
    DominatorCSSData 
} from '@/app/state/urlState';

// Single DOM Analysis Card for a specific route
interface DominatorRouteCardProps {
    route: string;
    data: DominatorData;
}

const DominatorRouteCard: React.FC<DominatorRouteCardProps> = ({ route, data }) => {
    // Null-safe fallbacks with explicit typing (no any)
    const brokenImageData: DominatorData['brokenImageData'] = Array.isArray(data?.brokenImageData)
        ? data.brokenImageData
        : [];
    const brokenVideos: DominatorData['brokenVideos'] = Array.isArray(data?.brokenVideos)
        ? data.brokenVideos
        : [];
    const brokenAudios: DominatorData['brokenAudios'] = Array.isArray(data?.brokenAudios)
        ? data.brokenAudios
        : [];
    const brokenIframes: DominatorData['brokenIframes'] = Array.isArray(data?.brokenIframes)
        ? data.brokenIframes
        : [];
    const videoCount = typeof data?.videoCount === 'number' ? data.videoCount : 0;
    const audioCount = typeof data?.audioCount === 'number' ? data.audioCount : 0;
    const iframeCount = typeof data?.iframeCount === 'number' ? data.iframeCount : 0;

    const totalIssues = brokenImageData.filter((img) => img?.isBroken).length +
        brokenVideos.length +
        brokenAudios.length +
        brokenIframes.length;

    return (
        <div className="p-6 w-full bg-rose-900/20 border-neutral-700 rounded-lg shadow-lg border">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-neutral-100">Offside Tags</h3>
                    </div>
                    <p className="text-sm text-neutral-400 truncate" title={route}>Route: {route}</p>
                    <p className="text-xs text-neutral-500 truncate" title={data?.title ?? ''}>{data?.title ?? '—'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-400">Total Issues</p>
                    <p className={`text-2xl font-bold ${totalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>{totalIssues}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Images</span>
                        <span className="text-sm font-medium text-neutral-100">{brokenImageData.length}</span>
                    </div>
                    <div className="mt-1 text-xs text-red-400">{brokenImageData.filter((img) => img?.isBroken).length} broken</div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Videos</span>
                        <span className="text-sm font-medium text-neutral-100">{videoCount}</span>
                    </div>
                    <div className="mt-1 text-xs text-red-400">{brokenVideos.length} issues</div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Audio</span>
                        <span className="text-sm font-medium text-neutral-100">{audioCount}</span>
                    </div>
                    <div className="mt-1 text-xs text-red-400">{brokenAudios.length} issues</div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">iFrames</span>
                        <span className="text-sm font-medium text-neutral-100">{iframeCount}</span>
                    </div>
                    <div className="mt-1 text-xs text-red-400">{brokenIframes.length} issues</div>
                </div>
            </div>

            {/* Detailed Issues */}
            <div className="space-y-6">
                {/* Broken Images */}
                <div>
                    <h4 className="mb-3 font-semibold text-neutral-200">Broken Images</h4>
                    {brokenImageData.filter(i => i.isBroken).length === 0 ? (
                        <p className="text-sm text-neutral-500">No broken images detected.</p>
                    ) : (
                        <ul className="overflow-y-auto pr-2 max-h-72 space-y-3">
                            {brokenImageData.filter(i => i.isBroken).map((img) => (
                                <li key={img.index} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-200 truncate" title={img.alt || img.src}>
                                                {img.alt || 'No alt'}
                                            </p>
                                            <a href={img.src} target="_blank" rel="noreferrer" className="block text-xs text-blue-400 truncate" title={img.src}>
                                                {img.src || 'No src'}
                                            </a>
                                            <p className="mt-1 text-[11px] text-neutral-500">Natural: {img.naturalWidth}x{img.naturalHeight} • Rendered: {img.renderedWidth}x{img.renderedHeight}</p>
                                            {Array.isArray(img.issues) && img.issues.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {img.issues.map((issue, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 text-[11px] text-rose-300 bg-rose-900/40 rounded-full border-rose-800/50 border">
                                                            {issue}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className="px-2 py-0.5 text-[11px] text-rose-200 bg-rose-700/30 border-rose-800 shrink-0 rounded border">Broken</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Broken Videos */}
                <div>
                    <h4 className="mb-3 font-semibold text-neutral-200">Broken Videos</h4>
                    {brokenVideos.length === 0 ? (
                        <p className="text-sm text-neutral-500">No broken videos detected.</p>
                    ) : (
                        <ul className="overflow-y-auto pr-2 max-h-72 space-y-3">
                            {brokenVideos.map((vid) => (
                                <li key={vid.index} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <p className="text-sm font-medium text-neutral-200 truncate" title={vid.src || (vid.sources?.[0] || '')}>Video</p>
                                    <p className="text-xs text-neutral-400 truncate" title={vid.src || (vid.sources?.[0] || '')}>{vid.src || (vid.sources?.[0] || 'No src')}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                                        <span className="px-2 py-0.5 text-rose-300 bg-rose-900/40 border-rose-800/50 rounded border">No valid source</span>
                                        <span className="px-2 py-0.5 text-neutral-300 bg-neutral-800 border-neutral-700 rounded border">Sources: {Array.isArray(vid.sources) ? vid.sources.length : 0}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Broken Audios */}
                <div>
                    <h4 className="mb-3 font-semibold text-neutral-200">Broken Audios</h4>
                    {brokenAudios.length === 0 ? (
                        <p className="text-sm text-neutral-500">No broken audios detected.</p>
                    ) : (
                        <ul className="overflow-y-auto pr-2 max-h-72 space-y-3">
                            {brokenAudios.map((aud) => (
                                <li key={aud.index} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <p className="text-sm font-medium text-neutral-200 truncate" title={aud.src || (aud.sources?.[0] || '')}>Audio</p>
                                    <p className="text-xs text-neutral-400 truncate" title={aud.src || (aud.sources?.[0] || '')}>{aud.src || (aud.sources?.[0] || 'No src')}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                                        <span className="px-2 py-0.5 text-rose-300 bg-rose-900/40 border-rose-800/50 rounded border">No valid source</span>
                                        <span className="px-2 py-0.5 text-neutral-300 bg-neutral-800 border-neutral-700 rounded border">Sources: {Array.isArray(aud.sources) ? aud.sources.length : 0}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Broken iFrames */}
                <div>
                    <h4 className="mb-3 font-semibold text-neutral-200">Broken iFrames</h4>
                    {brokenIframes.length === 0 ? (
                        <p className="text-sm text-neutral-500">No broken iframes detected.</p>
                    ) : (
                        <ul className="overflow-y-auto pr-2 max-h-72 space-y-3">
                            {brokenIframes.map((ifr) => (
                                <li key={ifr.index} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-200 truncate" title={ifr.title || ifr.src}>{ifr.title || 'iFrame'}</p>
                                            <a href={ifr.src} target="_blank" rel="noreferrer" className="block text-xs text-blue-400 truncate" title={ifr.src}>
                                                {ifr.src || 'No src'}
                                            </a>
                                            {Array.isArray(ifr.issues) && ifr.issues.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {ifr.issues.map((issue, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 text-[11px] text-rose-300 bg-rose-900/40 rounded-full border-rose-800/50 border">
                                                            {issue}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className="px-2 py-0.5 text-[11px] text-rose-200 bg-rose-700/30 border-rose-800 shrink-0 rounded border">Broken</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center pt-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    totalIssues === 0 
                        ? 'bg-green-900 text-green-300' 
                        : totalIssues < 5 
                            ? 'bg-yellow-900 text-yellow-300' 
                            : 'bg-red-900 text-red-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        totalIssues === 0 ? 'bg-green-400' : totalIssues < 5 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span>
                        {totalIssues === 0 ? 'All Clear' : totalIssues < 5 ? 'Minor Issues' : 'Critical Issues'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Single Links Analysis Card for a specific route
interface DominatorLinksRouteCardProps {
    route: string;
    data: DominatorLinksData;
}

const DominatorLinksRouteCard: React.FC<DominatorLinksRouteCardProps> = ({ route, data }) => {
    const summary = data?.summary ?? { totalIssues: 0, stylesheetIssues: 0, scriptIssues: 0 };
    const totalIssues = summary.totalIssues ?? 0;
    const stylesheetIssues = summary.stylesheetIssues ?? 0;
    const scriptIssues = summary.scriptIssues ?? 0;
    const stylesheetCount = typeof data?.stylesheetCount === 'number' ? data.stylesheetCount : 0;
    const scriptCount = typeof data?.scriptCount === 'number' ? data.scriptCount : 0;
    const brokenStylesheets = Array.isArray(data?.brokenStylesheets) ? data.brokenStylesheets : [];
    const brokenScripts = Array.isArray(data?.brokenScripts) ? data.brokenScripts : [];

    return (
        <div className="p-6 w-full bg-indigo-900/20 border-neutral-700 rounded-lg shadow-lg border">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-neutral-100">Links & Sheets</h3>
                    </div>
                    <p className="text-sm text-neutral-400 truncate" title={route}>Route: {route}</p>
                    <p className="text-xs text-neutral-500 truncate" title={data?.title ?? ''}>{data?.title ?? '—'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-400">Total Issues</p>
                    <p className={`text-2xl font-bold ${totalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>{totalIssues}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Stylesheets</span>
                        <span className="text-sm font-medium text-neutral-100">{stylesheetCount}</span>
                    </div>
                    <div className="mt-1 text-xs text-red-400">{stylesheetIssues} issues</div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Scripts</span>
                        <span className="text-sm font-medium text-neutral-100">{scriptCount}</span>
                    </div>
                    <div className="mt-1 text-xs text-red-400">{scriptIssues} issues</div>
                </div>
            </div>

            {/* Detailed Issues */}
            <div className="space-y-6">
                {/* Broken Stylesheets */}
                <div>
                    <h4 className="mb-3 font-semibold text-neutral-200">Broken Stylesheets</h4>
                    {brokenStylesheets.length === 0 ? (
                        <p className="text-sm text-neutral-500">No stylesheet issues detected.</p>
                    ) : (
                        <ul className="overflow-y-auto pr-2 max-h-72 space-y-3">
                            {brokenStylesheets.map((sheet) => (
                                <li key={sheet.index} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <p className="text-sm font-medium text-neutral-200 truncate" title={sheet.href}>{sheet.href || 'No href'}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Array.isArray(sheet.issues) && sheet.issues.length > 0 ? sheet.issues.map((issue, idx) => (
                                            <span key={idx} className="px-2 py-0.5 text-[11px] text-indigo-300 bg-indigo-900/40 rounded-full border-indigo-800/50 border">{issue}</span>
                                        )) : (
                                            <span className="px-2 py-0.5 text-[11px] text-neutral-300 bg-neutral-800 rounded-full border-neutral-700 border">Unknown issue</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-neutral-400">
                                        {sheet.media && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">media: {sheet.media}</span>}
                                        {sheet.crossorigin && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">crossorigin: {sheet.crossorigin}</span>}
                                        {sheet.integrity && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">integrity</span>}
                                        {sheet.disabled && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">disabled</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Broken Scripts */}
                <div>
                    <h4 className="mb-3 font-semibold text-neutral-200">Broken Scripts</h4>
                    {brokenScripts.length === 0 ? (
                        <p className="text-sm text-neutral-500">No script issues detected.</p>
                    ) : (
                        <ul className="overflow-y-auto pr-2 max-h-72 space-y-3">
                            {brokenScripts.map((scr) => (
                                <li key={scr.index} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <p className="text-sm font-medium text-neutral-200 truncate" title={scr.src}>{scr.src || 'No src'}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Array.isArray(scr.issues) && scr.issues.length > 0 ? scr.issues.map((issue, idx) => (
                                            <span key={idx} className="px-2 py-0.5 text-[11px] text-indigo-300 bg-indigo-900/40 rounded-full border-indigo-800/50 border">{issue}</span>
                                        )) : (
                                            <span className="px-2 py-0.5 text-[11px] text-neutral-300 bg-neutral-800 rounded-full border-neutral-700 border">Unknown issue</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-neutral-400">
                                        {scr.type && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">type: {scr.type}</span>}
                                        {scr.async && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">async</span>}
                                        {scr.defer && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">defer</span>}
                                        {scr.crossorigin && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">crossorigin: {scr.crossorigin}</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center pt-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    totalIssues === 0 
                        ? 'bg-green-900 text-green-300' 
                        : totalIssues < 3 
                            ? 'bg-yellow-900 text-yellow-300' 
                            : 'bg-red-900 text-red-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        totalIssues === 0 ? 'bg-green-400' : totalIssues < 3 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span>
                        {totalIssues === 0 ? 'All Resources OK' : totalIssues < 3 ? 'Minor Issues' : 'Critical Issues'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Single CSS Analysis Card for a specific route
interface DominatorCSSRouteCardProps {
    route: string;
    data: DominatorCSSData;
}

const DominatorCSSRouteCard: React.FC<DominatorCSSRouteCardProps> = ({ route, data }) => {
    const totalIssues = typeof data?.totalIssues === 'number' ? data.totalIssues : 0;
    const summary = data?.summary ?? { criticalIssues: 0, warningIssues: 0, infoIssues: 0 };
    const { criticalIssues, warningIssues } = summary;
    const stylesheetCount = typeof data?.stylesheetCount === 'number' ? data.stylesheetCount : 0;
    const inlineStylesCount = typeof data?.inlineStylesCount === 'number' ? data.inlineStylesCount : 0;

    return (
        <div className="p-6 w-full bg-emerald-900/20 border-neutral-700 rounded-lg shadow-lg border">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-neutral-100">Faulty CSS</h3>
                    </div>
                    <p className="text-sm text-neutral-400 truncate" title={route}>Route: {route}</p>
                    <p className="text-xs text-neutral-500 truncate" title={data?.title ?? ''}>{data?.title ?? '—'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-400">Total Issues</p>
                    <p className={`text-2xl font-bold ${totalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>{totalIssues}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Stylesheets</span>
                        <span className="text-sm font-medium text-neutral-100">{stylesheetCount}</span>
                    </div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Inline Styles</span>
                        <span className="text-sm font-medium text-neutral-100">{inlineStylesCount}</span>
                    </div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Critical</span>
                        <span className="text-sm font-medium text-red-400">{criticalIssues}</span>
                    </div>
                </div>
                <div className="p-3 bg-neutral-700/40 border-neutral-700 rounded border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Warnings</span>
                        <span className="text-sm font-medium text-yellow-400">{warningIssues}</span>
                    </div>
                </div>
            </div>

            {/* All CSS Issues */}
            <div>
                <h4 className="mb-3 font-semibold text-neutral-200">All CSS Issues</h4>
                {Array.isArray(data?.issues) && data.issues.length > 0 ? (
                    <ul className="overflow-y-auto pr-2 max-h-80 space-y-3">
                        {data.issues.map((iss, idx) => {
                            const sev = iss.severity || 'low';
                            const sevClasses = sev === 'high' ? 'bg-red-900/40 text-red-300 border-red-800/50' : sev === 'medium' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50' : 'bg-blue-900/40 text-blue-300 border-blue-800/50';
                            return (
                                <li key={idx} className="p-3 bg-neutral-900/60 border-neutral-700 rounded border">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-[11px] rounded-full border ${sevClasses}`}>{sev}</span>
                                                <span className="text-xs text-neutral-400">{iss.type}</span>
                                            </div>
                                            <p className="text-sm text-neutral-200">{iss.message}</p>
                                            <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-neutral-400">
                                                {iss.url && <a className="px-2 py-0.5 max-w-[28rem] text-blue-300 bg-neutral-800 border-neutral-700 rounded border truncate" href={iss.url} target="_blank" rel="noreferrer" title={iss.url}>source</a>}
                                                {iss.element && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">el: {iss.element}</span>}
                                                {typeof iss.count === 'number' && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">count: {iss.count}</span>}
                                                {iss.size && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">size: {iss.size}</span>}
                                                {typeof iss.status === 'number' && <span className="px-2 py-0.5 bg-neutral-800 border-neutral-700 rounded border">status: {iss.status}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-neutral-500">No CSS issues detected.</p>
                )}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center pt-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    totalIssues === 0 
                        ? 'bg-green-900 text-green-300' 
                        : criticalIssues > 0 
                            ? 'bg-red-900 text-red-300'
                            : warningIssues > 0
                                ? 'bg-yellow-900 text-yellow-300'
                                : 'bg-blue-900 text-blue-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        totalIssues === 0 
                            ? 'bg-green-400' 
                            : criticalIssues > 0 
                                ? 'bg-red-400'
                                : warningIssues > 0
                                    ? 'bg-yellow-400'
                                    : 'bg-blue-400'
                    }`}></div>
                    <span>
                        {totalIssues === 0 
                            ? 'CSS Clean' 
                            : criticalIssues > 0 
                                ? 'Critical Issues'
                                : warningIssues > 0
                                    ? 'Minor Issues'
                                    : 'Informational'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};

// Main Tab-based Results Container
interface TabBasedResultsProps {
    selectedTab: string;
}

export const TabBasedDominatorResults: React.FC<TabBasedResultsProps> = ({ selectedTab }) => {
    const { dominatorData } = useDominatorDataStore();
    const { dominatorLinksData } = useDominatorLinksDataStore();
    const { dominatorCSSData } = useDominatorCSSDataStore();

    // Map tab cardColors to data types and get the appropriate data
    const getDataForTab = () => {
        switch (selectedTab) {
            case 'bg-indigo-900/20': // Links & Sheets tab
                return { type: 'links', data: dominatorLinksData || {} };
            case 'bg-emerald-900/20': // Faulty CSS tab
                return { type: 'css', data: dominatorCSSData || {} };
            case 'bg-rose-900/20': // Offside Tags tab (DOM analysis)
                return { type: 'dom', data: dominatorData || {} };
            default:
                return { type: 'none', data: {} };
        }
    };

    const { type, data } = getDataForTab();

    // Show empty state if no tab is selected or no data
    if (!selectedTab || type === 'none' || Object.keys(data).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="p-8 border-neutral-700 rounded-lg shadow-lg border">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center mb-4 w-16 h-16 rounded-full">
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-300">
                            {!selectedTab ? 'Select a Tab' : 'No Analysis Data'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {!selectedTab 
                                ? 'Choose a tab above to view analysis results' 
                                : 'Run an analysis to see results for this category'
                            }
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Render cards in a vertical stack like forensics
    const renderCards = () => {
        const record = (data || {}) as Record<string, unknown>;
        const routes = Object.keys(record);

        return (
            <div className="mx-auto w-full max-w-7xl space-y-6">
                {routes.map((route) => {
                    const routeData = record[route];
                    if (!routeData) return null;

                    switch (type) {
                        case 'dom':
                            return <DominatorRouteCard key={route} route={route} data={routeData as DominatorData} />;
                        case 'links':
                            return <DominatorLinksRouteCard key={route} route={route} data={routeData as DominatorLinksData} />;
                        case 'css':
                            return <DominatorCSSRouteCard key={route} route={route} data={routeData as DominatorCSSData} />;
                        default:
                            return null;
                    }
                })}
            </div>
        );
    };

    return renderCards();
};