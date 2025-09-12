"use client"
import React, { useState } from "react";
import AuditEmptyIcon from "@/components/desktop";
import { useResponseDataStore, useUrlStore, useDOMInatorSelectedRoutesStore } from "../state/urlState";


const navLinks=[
    {name:"Links & Sheets", colour:"text-indigo-300", hoverColour: "hover:text-indigo-100", bgColour: "hover:bg-indigo-900/40"}, 
    {name:"Faulty CSS", colour:"text-emerald-300", hoverColour: "hover:text-emerald-100", bgColour: "hover:bg-emerald-900/40"}, 
    {name:"Offside Tags", colour:"text-rose-300", hoverColour: "hover:text-rose-100", bgColour: "hover:bg-rose-900/40"}
]






export default function DominatorPage() {
    const url = useUrlStore((state) => state.url);
    const [loading, setLoading] = useState(false);
    const responseData = useResponseDataStore(state => state.responseData);
    const userRoutes = responseData?.data?.routes || [];
    const selectedRoutes = useDOMInatorSelectedRoutesStore(state => state.selectedRoutes);
    const setSelectedRoutes = useDOMInatorSelectedRoutesStore(state => state.setSelectedRoutes);



async function GetDOMresults() {
    setLoading(true);
    const url=useUrlStore.getState().url;
    if (!url) return;
    try {
        const response = await fetch('/api/dominator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url.trim() }),
        });
        const data = await response.json();
        console.log(data);
        setLoading(false);
    } catch (err) {
        console.error('Failed to get DOM results', err);
        setLoading(false);
    }
}

//select functions
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
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-neutral-200">DOMinator</h1>
                        <p className="text-neutral-400">Analyze and extract images from any webpage. Use the sidebar to navigate different issue groups.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
                        <div className="p-4 bg-neutral-850 rounded-lg border-neutral-800 border lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    className="px-4 py-2 text-white bg-neutral-700 cursor-pointer rounded"
                                    onClick= { GetDOMresults }
                                >
                                    {loading ? 'Analyzing...' : 'Analyze URL'}
                                </button>
                            </div>
                            <div className="text-neutral-400">Results will appear here after analysis.</div>
                        </div>
                    </div>
                     <div>
                        <Nav/>
                    </div>   
                      <div className="flex flex-col items-center justify-center py-20">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <div className="mb-4 h-12 w-12 rounded-full border-b-2 border-neutral-400 animate-spin" />
                                <p className="text-neutral-300">Running analysis...</p>
                            </div>
                        ) : (
                            <>
                                <AuditEmptyIcon size={220} iconColor="#5b5b5b" accentColor="#5b5b5b" />
                                <h3 className="mt-6 text-2xl font-bold text-neutral-200">No Results Yet</h3>
                                <p className="mt-2 text-neutral-400">Start an analysis to populate this area.</p>
                            </>
                        )}
                    </div>
                    {/* Empty or results area */}
                    {/* <EmptyState loading={loading} onStart={async () => { setLoading(true); await GetDOMresults(); setLoading(false); }} /> */}
                </div>
            </main>
        </div>
    );
}

function Nav(){
    return (
        <div className="z-50 sticky top-0 gap-4 mx-auto my-4 max-w-2xl h-14 bg-white/5 rounded-[150px] border-neutral-500 shadow-md backdrop-blur-3xl border">
            <div className="flex items-center h-full text-[15px] font-bold">
                {navLinks.map((link, index) => (
                    <div 
                        key={link.name} 
                        className={`
                            flex-1 flex items-center justify-center h-full
                            ${index === 0 ? 'rounded-l-full' : ''}
                            ${index === navLinks.length - 1 ? 'rounded-r-full' : ''}
                            ${link.colour} ${link.hoverColour} ${link.bgColour}
                            ${index < navLinks.length - 1 ? 'border-r border-neutral-600/50' : ''}
                            transition-all duration-200 cursor-pointer
                        `}
                    >
                        {link.name}
                    </div>
                ))}
            </div>
        </div>
    )
}


function EmptyState({ loading }: { loading: boolean; onStart: () => Promise<void> }){
    return (
        <div className="flex flex-col items-center justify-center py-20">
            {loading ? (
                <div className="flex flex-col items-center">
                    <div className="mb-4 h-12 w-12 rounded-full border-b-2 border-neutral-400 animate-spin" />
                    <p className="text-neutral-300">Running analysis...</p>
                </div>
            ) : (
                <>
                    <AuditEmptyIcon size={220} iconColor="#5b5b5b" accentColor="#5b5b5b" />
                    <h3 className="mt-6 text-2xl font-bold text-neutral-200">No Results Yet</h3>
                    <p className="mt-2 text-neutral-400">Start an analysis to populate this area.</p>
                </>
            )}
        </div>
    );
}