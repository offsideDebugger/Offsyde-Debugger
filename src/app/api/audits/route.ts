import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import chromiumPkg from '@sparticuz/chromium';

// Queue system to handle concurrent requests properly
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;
const requestQueue: Array<() => Promise<void>> = [];

// Process queued requests
async function processQueue() {
    if (requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) {
        return;
    }
    
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
        activeRequests++;
        try {
            await nextRequest();
        } finally {
            activeRequests--;
            // Process next item in queue
            setTimeout(processQueue, 100);
        }
    }
}

export async function POST(request: NextRequest) {
    const { url } = await request.json();
    
    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Return a promise that will be resolved when the request is processed
    return new Promise<Response>((resolve) => {
        const processRequest = async () => {
            console.log(`Processing audit for: ${url} (${activeRequests}/${MAX_CONCURRENT_REQUESTS} active)`);
            
            try {
        
        // Launch browser with better error handling
        let browser;
        try {
            browser = await chromium.launch({
                args: [...chromiumPkg.args, '--disable-dev-shm-usage', '--disable-gpu'],
                executablePath: await chromiumPkg.executablePath(),
                headless: true,
            });
        } catch (launchError) {
            console.error('Browser launch failed:', launchError);
            resolve(NextResponse.json({
                error: 'Browser initialization failed. This might be a temporary server issue.',
                success: false
            }, { status: 500 }));
            return;
        }
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Measure page load time
            const startTime = Date.now();
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 45000 
            });
            
            // Wait longer for heavy pages to load resources
            console.log('Waiting for page resources to load...');
            
            // Try to wait for network idle first (most accurate)
            try {
                await page.waitForLoadState('networkidle', { timeout: 8000 });
                console.log('Network idle achieved');
            } catch {
                // If network idle times out, wait a fixed longer time for heavy pages
                console.log('Network idle timeout, using fixed wait for heavy page');
                await page.waitForTimeout(6000); // 6 seconds for heavy pages
            }
            
            // Additional wait to ensure all dynamic content is loaded
            await page.waitForTimeout(2000);
            
            const loadTime = Date.now() - startTime;
            
            // Get basic page info
            const title = await page.title();
            const consoleErrors:string[]=[];
            page.on('console', msg => {
                if (msg.type() === 'error')
                    consoleErrors.push(msg.text());
            });
            const failedRequests:string[]=[];
            page.on("response", response => {
                if (!response.ok())
                    failedRequests.push(`${response.url()} - ${response.status()}`);
            });
         
            const metrics = await page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                return {
                    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                    pageLoadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                    timeToFirstByte: Math.round(navigation.responseStart - navigation.fetchStart),
                    domElements: document.querySelectorAll('*').length,
                    images: document.querySelectorAll('img').length,
                    scripts: document.querySelectorAll('script').length,
                    stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length
                };
            });
            
            await browser.close();
            
            resolve(NextResponse.json({
                success: true,
                data: {
                    url,
                    title,
                    loadTime: `${loadTime}ms`,
                    metrics: {
                        domContentLoaded: `${metrics.domContentLoaded}ms`,
                        pageLoadComplete: `${metrics.pageLoadComplete}ms`,
                        timeToFirstByte: `${metrics.timeToFirstByte}ms`,
                        domElements: metrics.domElements,
                        images: metrics.images,
                        scripts: metrics.scripts,
                        stylesheets: metrics.stylesheets
                    },
                    performance: {
                        grade: loadTime < 2000 ? 'Excellent' : loadTime < 4000 ? 'Good' : loadTime < 6000 ? 'Fair' : 'Poor',
                        color: loadTime < 2000 ? 'green' : loadTime < 4000 ? 'orange' : loadTime < 6000 ? 'yellow' : 'red'
                    },
                    consoleErrors,
                    failedRequests
                }
            }));
            
        } catch (pageError) {
            console.error('Error during page test:', pageError);
            await browser.close();
            
            resolve(NextResponse.json({
                error: `Failed to test page: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`,
                success: false
            }, { status: 500 }));
        }
        
        } catch (error) {
            console.error('Page speed test error:', error);
            
            resolve(NextResponse.json({
                error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: false
            }, { status: 500 }));
        }
        };

        // Add to queue or process immediately
        requestQueue.push(processRequest);
        processQueue();
    });
}
