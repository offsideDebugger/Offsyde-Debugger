import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import chromiumPkg from '@sparticuz/chromium';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('Starting page speed test for:', url);
        
        // Launch browser
        const browser = await chromium.launch({
            args: chromiumPkg.args,
            executablePath: await chromiumPkg.executablePath(),
            headless: true,
        });
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Measure page load time
            const startTime = Date.now();
            
            await page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 50000 
            });
            
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
            
            return NextResponse.json({
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
            });
            
        } catch (pageError) {
            console.error('Error during page test:', pageError);
            await browser.close();
            
            return NextResponse.json({
                error: `Failed to test page: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`,
                success: false
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Page speed test error:', error);
        
        return NextResponse.json({
            error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false
        }, { status: 500 });
    }
}
