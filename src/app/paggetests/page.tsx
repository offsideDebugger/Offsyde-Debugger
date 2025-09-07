"use client"
import Link from "next/link";
import {  useState } from "react";
import { extractLinksCheerio } from "@/utils/linkCrawler";
import { useUrlStore } from "../state/urlState";
import { useResponseDataStore } from "../state/urlState";

interface PageSpeedData {
    url: string;
    title: string;
    loadTime: string;
    metrics: {
        domContentLoaded: string;
        pageLoadComplete: string;
        timeToFirstByte: string;
        domElements: number;
        images: number;
        scripts: number;
        stylesheets: number;
    };
    performance: {
        grade: string;
        color: string;
    };
}

interface TestData {
    data?: PageSpeedData;
    success?: boolean;
    error?: string;
}


export default function PageTests() {
    const url= useUrlStore(state => state.url);
    const responseData = useResponseDataStore(state => state.responseData);
    const [loading, setLoading] = useState(false);
    const [loadingTest, setLoadingTest] = useState(false);
    const [testsData, setTestsData] = useState<TestData | null>(null);

    async function handleSubmitTests(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;

        setLoadingTest(true);
        try {
            console.log("Starting page speed test");
            const response = await fetch('/api/pagespeed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url.trim() }),
            });

            const result = await response.json();
            setTestsData(result);
        } catch (error) {
            console.error('Error:', error);
            setTestsData({ error: 'Failed to fetch data', success: false });
        } finally {
            setLoadingTest(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url) return;
        
        setLoading(true);

        //using cheerio for localhost urls
        if(url.includes("localhost")){
            console.log("using cheerio")
            try {
            const result = await extractLinksCheerio(url);
            console.log('API Response:', result);
            useResponseDataStore.getState().setResponseData( {data: result, success: true}  );
    
        } catch (error) {
            console.error('Error:', error);
            useResponseDataStore.getState().setResponseData({ error: 'Failed to fetch data' });
        } finally {
            setLoading(false);
        }
        }

        //using playwright for non-localhost urls
        else{
            try {
                console.log("using playwright")
                const response = await fetch('/api/playwright-crawl', {
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
        }
    };

    function SetUrl(e: React.ChangeEvent<HTMLInputElement>){
        useUrlStore.getState().setUrl({ url: e.target.value })
    }

  return (
    <div className="p-4">





        {/* Routes Crawling */}

        <h1 className="text-2xl font-bold mb-4">Page Speed Tests</h1>
        <p className="mb-4">Test the speed of your pages here.</p>
        
        <form onSubmit={handleSubmit} className="mb-4">
            <input 
                type="text" 
                placeholder="Enter URL (e.g., https://example.com)" 
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none w-80" 
                value={url} 
                onChange={SetUrl}
                required
            />
            <button 
                type="submit"
                disabled={loading}
                className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'KickOff in Progress...' : 'KickOff Scan'}
            </button>
        </form>
        
       
         
        {responseData && (
            <div className="mt-6 p-4 border rounded">
                <h2 className="text-xl font-semibold mb-2">Response Data:</h2>
                {responseData.error ? (
                    <p className="text-red-500">Error: {responseData.error}</p>
                ) : (
                    <div>
                        {responseData.data && (
                            <div className="mb-4">
                                <h3 className="font-semibold">Page Title:</h3>
                                <p>{responseData.data.title}</p>
                            </div>
                        )}
                        {responseData.data && responseData.data.routes && (
                            <div>
                                <h3 className="font-semibold">Routes Found ({responseData.data.routes.length}):</h3>
                                <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                                    {responseData.data.routes.slice(0, 20).map((route: string, index: number) => (
                                        <li key={index} className="text-sm">{route}</li>
                                    ))}
                                    {responseData.data.routes.length > 20 && (
                                        <li className="text-sm text-gray-500">...and {responseData.data.routes.length - 20} more</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}




        {/* Lighthouse tests */}




        <form onSubmit={handleSubmitTests} className="mb-4">
        <button 
                type="submit"
                disabled={loadingTest}
                className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loadingTest ? 'Running Tests...' : 'Run Tests'}
        </button>
        </form>

        {testsData && (
            <div className="mt-6 p-4 border rounded">
                <h2 className="text-xl font-semibold mb-2">Page Speed Results:</h2>
                {testsData.error ? (
                    <p className="text-red-500">Error: {testsData.error}</p>
                ) : testsData.success && testsData.data ? (
                    <div className="space-y-4">
                        {/* Page Info */}
                        <div className="p-4 rounded border">
                            <h3 className="font-semibold text-lg">{testsData.data.title}</h3>
                            <p className="text-gray-600">{testsData.data.url}</p>
                        </div>

                        {/* Performance Grade */}
                        <div className="p-4 rounded border">
                            <h4 className="font-semibold mb-2">Performance Grade</h4>
                            <div className="flex items-center gap-2">
                                <span 
                                    className="px-3 py-1 rounded text-white font-bold"
                                    style={{ backgroundColor: testsData.data.performance.color }}
                                >
                                    {testsData.data.performance.grade}
                                </span>
                                <span>Load Time: {testsData.data.loadTime}</span>
                            </div>
                        </div>

                        {/* Core Metrics */}
                        <div className="p-4 rounded border">
                            <h4 className="font-semibold mb-3">Core Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm">DOM Content Loaded</span>
                                    <p className="font-mono text-lg">{testsData.data.metrics.domContentLoaded}</p>
                                </div>
                                <div>
                                    <span className="text-sm">Page Load Complete</span>
                                    <p className="font-mono text-lg">{testsData.data.metrics.pageLoadComplete}</p>
                                </div>
                                <div>
                                    <span className="text-sm">Time to First Byte</span>
                                    <p className="font-mono text-lg">{testsData.data.metrics.timeToFirstByte}</p>
                                </div>
                                <div>
                                    <span className="text-sm">DOM Elements</span>
                                    <p className="font-mono text-lg">{testsData.data.metrics.domElements}</p>
                                </div>
                            </div>
                        </div>

                        {/* Resource Analysis */}
                        <div className="p-4 rounded border">
                            <h4 className="font-semibold mb-3">Resource Analysis</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{testsData.data.metrics.images}</p>
                                    <span className="text-sm">Images</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{testsData.data.metrics.scripts}</p>
                                    <span className="text-sm">Scripts</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">{testsData.data.metrics.stylesheets}</p>
                                    <span className="text-sm">Stylesheets</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>No data received</p>
                )}
            </div>
        )}





         <Link href="/" className="text-blue-500 hover:underline mb-4 block">Go back to Home</Link>
    </div>
  );
}
