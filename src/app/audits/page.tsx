"use client"
import { useState } from "react";
import { useUrlStore, useResponseDataStore, PageSpeedData } from "../state/urlState";


export default function Audit() {
    const [loadingTest, setLoadingTest] = useState(false);
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
    const [routeResults, setRouteResults] = useState<PageSpeedData[]>([]);
    const responseData = useResponseDataStore(state => state.responseData);

    const url = useUrlStore(state => state.url);

    const routes = responseData?.data?.routes || [];

    const handleRouteToggle = (route: string) => {
        setSelectedRoutes(prev => 
            prev.includes(route) 
                ? prev.filter(r => r !== route)
                : [...prev, route]
        );
    };

    const handleSelectAll = () => {
        if (selectedRoutes.length === routes.length) {
            setSelectedRoutes([]);
        } else {
            setSelectedRoutes([...routes]);
        }
    };
    
    async function handleSubmitTests(e: React.FormEvent) {
        e.preventDefault();
        if (!url && selectedRoutes.length === 0) return;

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

  

    return(
        <div>
            {/* Routes Checkboxes */}
            {routes.length > 0 && (
                <div className="mb-6 p-6 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Select Routes to Test</h3>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                            {selectedRoutes.length === routes.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {routes.map((route, index) => (
                            <label 
                                key={index} 
                                className="group flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-white transition-all duration-200 bg-white/70"
                            >
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoutes.includes(route)}
                                        onChange={() => handleRouteToggle(route)}
                                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    {selectedRoutes.includes(route) && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-200">
                                    {route}
                                </span>
                            </label>
                        ))}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-base font-medium text-gray-700">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {selectedRoutes.length} of {routes.length} routes selected
                            </span>
                        </div>
                    </div>
                </div>
            )}
            


            <form onSubmit={handleSubmitTests} className="mb-4">
            <button 
                    type="submit"
                    disabled={loadingTest || selectedRoutes.length === 0}
                    className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loadingTest ? 'Running Tests...' : 'Run Tests'}
            </button>
            </form>

            {/* Results Display */}
            {routeResults.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Test Results</h2>
                    {routeResults.map((result, index) => (
                        <div key={index} className="p-6 border-2 border-gray-200 rounded-lg bg-white shadow-sm">
                            {result.error ? (
                                <p className="text-red-500 font-medium">Error: {result.error}</p>
                            ) : result.success && result.data ? (
                                <div className="space-y-4">
                                    {/* Page Info */}
                                    <div className="p-4 rounded-lg border bg-gray-50">
                                        <h3 className="font-bold text-xl text-gray-800">{result.data.title}</h3>
                                        <p className="text-blue-600 font-medium">{result.data.url}</p>
                                    </div>

                                    {/* Performance Grade */}
                                    <div className="p-4 rounded-lg border bg-gray-50">
                                        <h4 className="font-semibold mb-3 text-lg">Performance Grade</h4>
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className="px-4 py-2 rounded-lg text-white font-bold text-lg"
                                                style={{ backgroundColor: result?.data?.performance?.color }}
                                            >
                                                {result?.data?.performance?.grade}
                                            </span>
                                            <span className="text-lg font-medium">Load Time: {result?.data?.loadTime}</span>
                                        </div>
                                    </div>

                                    {/* Core Metrics */}
                                    <div className="p-4 rounded-lg border bg-gray-50">
                                        <h4 className="font-semibold mb-4 text-lg">Core Metrics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white rounded border">
                                                <span className="text-sm font-medium text-gray-600">DOM Content Loaded</span>
                                                <p className="font-mono text-xl font-bold text-blue-600">{result?.data?.metrics?.domContentLoaded}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded border">
                                                <span className="text-sm font-medium text-gray-600">Page Load Complete</span>
                                                <p className="font-mono text-xl font-bold text-green-600">{result?.data?.metrics?.pageLoadComplete}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded border">
                                                <span className="text-sm font-medium text-gray-600">Time to First Byte</span>
                                                <p className="font-mono text-xl font-bold text-purple-600">{result?.data?.metrics?.timeToFirstByte}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded border">
                                                <span className="text-sm font-medium text-gray-600">DOM Elements</span>
                                                <p className="font-mono text-xl font-bold text-orange-600">{result?.data?.metrics?.domElements}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resource Analysis */}
                                    <div className="p-4 rounded-lg border bg-gray-50">
                                        <h4 className="font-semibold mb-4 text-lg">Resource Analysis</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-white rounded border">
                                                <p className="text-3xl font-bold text-blue-600">{result?.data?.metrics?.images}</p>
                                                <span className="text-sm font-medium text-gray-600">Images</span>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded border">
                                                <p className="text-3xl font-bold text-green-600">{result?.data?.metrics?.scripts}</p>
                                                <span className="text-sm font-medium text-gray-600">Scripts</span>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded border">
                                                <p className="text-3xl font-bold text-purple-600">{result?.data?.metrics?.stylesheets}</p>
                                                <span className="text-sm font-medium text-gray-600">Stylesheets</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No data received</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    )

}