"use client"
import Link from "next/link";
import {  useState } from "react";

import { useUrlStore } from "../state/urlState";
import { useResponseDataStore } from "../state/urlState";




export default function PageTests() {
    const url= useUrlStore(state => state.url);
    const responseData = useResponseDataStore(state => state.responseData);
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;
        
        setLoading(true);
       
            try {
                console.log("using playwright")
                const response = await fetch(`/api/playwright-crawl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url.trim() }),
            });

                const result = await response.json();
                useResponseDataStore.getState().setResponseData(result);
            } catch (error) {
                console.error('Error:', error);
                useResponseDataStore.getState().setResponseData({ error: 'Failed to fetch data' });
            } finally {
                setLoading(false);
            
        }

    };

    function SetUrl(e: React.ChangeEvent<HTMLInputElement>){
        useUrlStore.getState().setUrl({ url: e.target.value })
    }

    return (
        <div className="md:grid-cols-[320px_1fr]">
            {/* Sidebar placeholder for symmetry with other pages */}

            {/* Main */}
            <main className="overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-neutral-200">Scouting</h1>
                        <p className="text-neutral-400">Fetch and list all discoverable URLs for a site.</p>
                    </div>

                    {/* Input + CTA */}
                    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
                        <div className="p-4 bg-neutral-850 rounded-lg border-neutral-800 border lg:col-span-2">
                            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter URL (e.g., https://example.com)"
                                    className="px-4 py-3 w-full text-neutral-100 bg-neutral-800 border-neutral-700 outline-none rounded border focus:ring-2 focus:ring-neutral-500"
                                    value={url}
                                    onChange={SetUrl}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-3 text-sm font-medium text-white bg-neutral-600 rounded-2xl cursor-pointer transition hover:bg-neutral-500 disabled:bg-neutral-700 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Scouting…' : 'Scout'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results */}
                    {!responseData ? (
                        <div className="flex flex-col items-center justify-center mt-20 py-24">
                            <div className="mb-6 h-16 w-16 rounded-full border-b-4 border-neutral-600 animate-spin" hidden={!loading}></div>
                            <p className="text-neutral-400">{loading ? 'Scouting in progress…' : 'Enter a URL and hit Scout.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-6 bg-neutral-800/40 rounded-lg border-neutral-700 border">
                                {responseData.error ? (
                                    <p className="text-red-400">Error: {responseData.error}</p>
                                ) : (
                                    <div className="space-y-4">
                                        {responseData.data?.title && (
                                            <div>
                                                <h2 className="text-xl font-semibold text-neutral-200">{responseData.data.title}</h2>
                                                <p className="text-sm text-blue-400">{url}</p>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-semibold text-neutral-200">Routes Found</h3>
                                                <span className="px-2 py-1 text-xs text-neutral-200 bg-neutral-700 border-neutral-600 rounded border">
                                                    {responseData.data?.routes?.length || 0}
                                                </span>
                                            </div>

                                            {responseData.data?.routes?.length ? (
                                                <ul className="overflow-y-auto max-h-[400px] divide-y divide-neutral-800 border-neutral-800 rounded border">
                                                    {responseData.data.routes.map((route: string, i: number) => (
                                                        <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-900/30 hover:bg-neutral-900/50">
                                                            <span className="text-neutral-200 truncate" title={route}>{route}</span>
                                                            <a className="px-3 py-1 text-xs text-blue-300 bg-neutral-800 border-neutral-700 shrink-0 rounded border hover:bg-neutral-700" href={route} target="_blank" rel="noreferrer">
                                                                Open
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-neutral-500">No routes discovered.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href="/" className="inline-block text-md text-neutral-400 hover:underline">Back to hood</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
