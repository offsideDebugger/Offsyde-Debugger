"use client"
import Link from "next/link";
import {  useState } from "react";
import { extractLinksCheerio } from "@/utils/linkCrawler";
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
        //using playwright for localhost urls
       if((url.includes("localhost")) || (url.includes("127.0.0.1"))){
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

        //using cheerio for non-localhost urls
        else{
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
    };

    function SetUrl(e: React.ChangeEvent<HTMLInputElement>){
        useUrlStore.getState().setUrl({ url: e.target.value })
    }

  return (
    <div className="p-4">





        {/* Routes Crawling */}

        <h1 className="mb-4 text-2xl font-bold">Page Speed Tests</h1>
        <p className="mb-4">Test the speed of your pages here.</p>
        
        <form onSubmit={handleSubmit} className="mb-4">
            <input 
                type="text" 
                placeholder="Enter URL (e.g., https://example.com)" 
                className="p-2 w-80 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                value={url} 
                onChange={SetUrl}
                required
            />
            <button 
                type="submit"
                disabled={loading}
                className="ml-2 p-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'KickOff in Progress...' : 'KickOff Scan'}
            </button>
        </form>
        
       
         
        {responseData && (
            <div className="mt-6 p-4 border rounded">
                <h2 className="mb-2 text-xl font-semibold">Response Data:</h2>
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
                                <ul className="overflow-y-auto max-h-40 list-disc list-inside">
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
         <Link href="/" className="block mb-4 text-blue-500 hover:underline">Go back to Home</Link>
    </div>
  );
}
