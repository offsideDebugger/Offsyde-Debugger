"use client"
import AuditEmptyIcon from "@/components/desktop";
import { useResponseDataStore,useSelectedRoutesStore,useAuditResultsStore,PageSpeedData } from "../state/urlState";
import { useState } from "react";

export default function Forensics() {
 
    const [loadingTest, setLoadingTest] = useState(false);
    const [loadingSingleAudit, setLoadingSingleAudit] = useState<string | null>(null);
    const responseData = useResponseDataStore(state => state.responseData);
    const userRoutes = responseData?.data?.routes || [];
    
    const selectedRoutes = useSelectedRoutesStore(state => state.selectedRoutes);
    const setSelectedRoutes = useSelectedRoutesStore(state => state.setSelectedRoutes);

    const routeResults = useAuditResultsStore(state => state.auditResults);
    const setRouteResults = useAuditResultsStore(state => state.setAuditResults);

    //main audit function for batch processing
      async function handleSubmitTests(e: React.FormEvent) {
            e.preventDefault();
            if (!userRoutes && selectedRoutes.length === 0) return;
    
            setLoadingTest(true);
            
            try {
                const results: PageSpeedData[] = [];
                
                // auditing all routes
                for (const route of selectedRoutes) {
                    const response = await fetch('/api/pagespeed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: route.trim() }),
                    });         
    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
    
                    const result = await response.json();
                    results.push(result);
                }
                
            
                setRouteResults(results);
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setRouteResults([{ error: `Failed to fetch data: ${errorMessage}`, data: undefined, success: false }]);
            } finally {
                setLoadingTest(false);
            }
        }

    //single route re-audit function
    async function handleSingleReaudit(route: string, resultIndex: number) {
        setLoadingSingleAudit(route);
        
        try {
            const response = await fetch('/api/pagespeed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: route.trim() }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            
            // Update only the specific result in the array
            const updatedResults = [...routeResults];
            updatedResults[resultIndex] = result;
            setRouteResults(updatedResults);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            // Update only the specific result with error
            const updatedResults = [...routeResults];
            updatedResults[resultIndex] = { error: `Failed to fetch data: ${errorMessage}`, data: undefined, success: false };
            setRouteResults(updatedResults);
        } finally {
            setLoadingSingleAudit(null);
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


    //endgame
    return <div>
        <div className="grid grid-cols-1 h-screen md:grid-cols-[350px_1fr]">
            <aside className="overflow-y-auto overflow-x-hidden max-h-screen">
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
            </aside>

            {/* main Page */}
            <main className="overflow-y-auto">
                <div className="p-4 min-h-full">
                    {routeResults.length === 0 ? (
                        <div className="flex flex-col justify-center items-center mt-30 min-h-full">
                            {/* Check if initial audit is running */}
                            {loadingTest ? (
                                /* Initial Audit Loading State */
                                <div className="flex flex-col justify-center items-center mt-30">
                                    <div className="mb-6 h-16 w-16 rounded-full border-b-4 border-neutral-400 animate-spin"></div>
                                    <h1 className="mb-4 text-4xl font-bold text-neutral-200">Starting Audit</h1>
                                    <p className="mb-4 text-lg text-neutral-400 text-center">
                                        Analyzing {selectedRoutes.length} route{selectedRoutes.length !== 1 ? 's' : ''}...
                                    </p>
                                    <div className="px-4 py-2 bg-neutral-700 rounded-lg">
                                        <p className="text-sm text-neutral-300">
                                            {selectedRoutes.length} selected route{selectedRoutes.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Empty State */
                                <>
                                    <div>
                                        <AuditEmptyIcon size={350} iconColor="#494848ff" accentColor="#494848ff" />
                                    </div>
                                    <div className="text-center">
                                        <h1 className="mb-2 text-5xl font-bold text-neutral-200">No Audits Yet</h1>
                                        <p className="text-lg text-neutral-400">Select routes from the left panel to start auditing.</p>
                                        <button className="px-8 py-4 mt-6 text-lg font-medium text-white bg-neutral-600 rounded-full transition-all cursor-pointer hover:bg-neutral-400" onClick={handleSubmitTests}>Start Audit</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="mx-auto p-6 w-full max-w-7xl">
                            {/* Check if batch re-audit is running */}
                            {loadingTest ? (
                                /* Batch Loading State */
                                <div className="flex flex-col justify-center items-center mt-30 py-32">
                                    <div className="mb-6 h-16 w-16 rounded-full border-b-4 border-neutral-400 animate-spin"></div>
                                    <h2 className="mb-4 text-3xl font-bold text-neutral-200">Re-auditing Batch</h2>
                                    <p className="text-lg text-neutral-400 text-center">
                                        Processing {selectedRoutes.length} route{selectedRoutes.length !== 1 ? 's' : ''}...
                                    </p>
                                    <div className="mt-4 px-4 py-2 bg-neutral-700 rounded-lg">
                                        <p className="text-sm text-neutral-300">
                                            {selectedRoutes.length} selected route{selectedRoutes.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Normal Results Content */
                                <>
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-3xl font-bold text-neutral-200">Audit Results</h2>
                                        <button 
                                            className="px-6 py-3 text-sm font-medium text-white bg-neutral-600 rounded-3xl transition-all cursor-pointer hover:bg-neutral-500"
                                            onClick={handleSubmitTests}
                                            disabled={loadingTest}
                                        >
                                            Re-audit Batch
                                        </button>
                                    </div>

                                    {/* Results Grid */}
                                    <div className="space-y-6">
                                {routeResults.map((result, index) => (
                                    <div key={index} className="p-6 bg-neutral-800 border-neutral-700 rounded-lg shadow-lg border">
                                        {/* Check if this specific card is being re-audited */}
                                        {loadingSingleAudit === result.data?.url ? (
                                            /* Loading State for Individual Card */
                                            <div className="flex flex-col justify-center items-center py-16">
                                                <div className="mb-4 h-12 w-12 rounded-full border-b-2 border-neutral-400 animate-spin"></div>
                                                <h3 className="mb-2 text-xl font-semibold text-neutral-200">Re-auditing...</h3>
                                                <p className="text-neutral-400">{result.data?.url || 'Processing audit'}</p>
                                            </div>
                                        ) : (
                                            /* Normal Card Content */
                                            <>
                                                {/* Card Header with Re-audit Button */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        {result.error ? (
                                                            <p className="text-red-400 font-medium">Error: {result.error}</p>
                                                        ) : result.success && result.data ? (
                                                            <div className="space-y-2">
                                                                <h3 className="font-bold text-xl text-neutral-200">{result.data.title}</h3>
                                                                <p className="text-blue-400 font-medium">{result.data.url}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-neutral-500">No data received</p>
                                                        )}
                                                    </div>
                                                    <button 
                                                        className="px-4 py-2 ml-4 text-sm font-medium text-white bg-neutral-600 rounded-xl transition-all cursor-pointer hover:bg-neutral-500 disabled:bg-neutral-700 disabled:cursor-not-allowed"
                                                        onClick={() => {
                                                            if (result.success && result.data) {
                                                                handleSingleReaudit(result.data.url, index);
                                                            }
                                                        }}
                                                        disabled={loadingSingleAudit === result.data?.url}
                                                    >
                                                        Re-audit
                                                    </button>
                                                </div>

                                                {result.success && result.data && (
                                                    <div className="space-y-6">
                                                {/* Performance Grade */}
                                                <div className="p-4 bg-neutral-750 rounded-lg border-neutral-600 border">
                                                    <h4 className="mb-3 font-semibold text-lg text-neutral-200">Performance Grade</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span 
                                                            className="px-4 py-2 text-white font-bold text-lg rounded-lg"
                                                            style={{ backgroundColor: result?.data?.performance?.color }}
                                                        >
                                                            {result?.data?.performance?.grade}
                                                        </span>
                                                        <span className="text-lg font-medium text-neutral-300">Load Time: {result?.data?.loadTime}</span>
                                                    </div>
                                                </div>

                                                {/* Core Metrics */}
                                                <div className="p-4 bg-neutral-750 rounded-lg border-neutral-600 border">
                                                    <h4 className="mb-4 font-semibold text-lg text-neutral-200">Core Metrics</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-3 bg-neutral-700 border-neutral-600 rounded border">
                                                            <span className="text-sm font-medium text-neutral-400">DOM Content Loaded</span>
                                                            <p className="font-mono text-xl font-bold text-blue-400">{result?.data?.metrics?.domContentLoaded}</p>
                                                        </div>
                                                        <div className="p-3 bg-neutral-700 border-neutral-600 rounded border">
                                                            <span className="text-sm font-medium text-neutral-400">Page Load Complete</span>
                                                            <p className="font-mono text-xl font-bold text-green-400">{result?.data?.metrics?.pageLoadComplete}</p>
                                                        </div>
                                                        <div className="p-3 bg-neutral-700 border-neutral-600 rounded border">
                                                            <span className="text-sm font-medium text-neutral-400">Time to First Byte</span>
                                                            <p className="font-mono text-xl font-bold text-purple-400">{result?.data?.metrics?.timeToFirstByte}</p>
                                                        </div>
                                                        <div className="p-3 bg-neutral-700 border-neutral-600 rounded border">
                                                            <span className="text-sm font-medium text-neutral-400">DOM Elements</span>
                                                            <p className="font-mono text-xl font-bold text-orange-400">{result?.data?.metrics?.domElements}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Resource Analysis */}
                                                <div className="p-4 bg-neutral-750 rounded-lg border-neutral-600 border">
                                                    <h4 className="mb-4 font-semibold text-lg text-neutral-200">Resource Analysis</h4>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="p-4 text-center bg-neutral-700 border-neutral-600 rounded border">
                                                            <p className="text-3xl font-bold text-blue-400">{result?.data?.metrics?.images}</p>
                                                            <span className="text-sm font-medium text-neutral-400">Images</span>
                                                        </div>
                                                        <div className="p-4 text-center bg-neutral-700 border-neutral-600 rounded border">
                                                            <p className="text-3xl font-bold text-green-400">{result?.data?.metrics?.scripts}</p>
                                                            <span className="text-sm font-medium text-neutral-400">Scripts</span>
                                                        </div>
                                                        <div className="p-4 text-center bg-neutral-700 border-neutral-600 rounded border">
                                                            <p className="text-3xl font-bold text-purple-400">{result?.data?.metrics?.stylesheets}</p>
                                                            <span className="text-sm font-medium text-neutral-400">Stylesheets</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                            </>
                                        )}
                                    </div>
                                ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
}