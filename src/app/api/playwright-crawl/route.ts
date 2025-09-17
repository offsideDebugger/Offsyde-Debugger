import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import chromiumPkg from '@sparticuz/chromium';

// Force clean slate - prevent state pollution between requests
let globalBrowser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

// Cleanup any hanging browser instances
async function forceCleanup() {
    if (globalBrowser) {
        try {
            await globalBrowser.close();
        } catch {
            console.log('Cleaned up hanging browser instance');
        }
        globalBrowser = null;
    }
}



export async function POST(request: NextRequest) {
    // ALWAYS start with cleanup to prevent state pollution
    await forceCleanup();
    
    try {
        const { url } = await request.json();
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('Starting Playwright crawl for:', url);
        
        // Launch browser with better error handling and resource management
        let browser;
        try {
            browser = await chromium.launch({
                args: [
                    ...chromiumPkg.args, 
                    '--disable-dev-shm-usage', 
                    '--disable-gpu',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--single-process', // Prevent multiple processes
                    '--disable-background-timer-throttling',
                    '--disable-renderer-backgrounding'
                ],
                executablePath: await chromiumPkg.executablePath(),
                headless: true,
            });
            
            // Track browser globally for cleanup
            globalBrowser = browser;
            
        } catch (launchError) {
            console.error('Browser launch failed:', launchError);
            await forceCleanup(); // Clean up on launch failure
            return NextResponse.json({
                error: 'Browser initialization failed. This might be a temporary server issue.',
                success: false
            }, { status: 500 });
        }
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            // Prevent context/page premature closing
            bypassCSP: true,
            ignoreHTTPSErrors: true
        });
        
        const page = await context.newPage();
        
        // Set generous timeout for crawling operations
        page.setDefaultTimeout(60000);
        
        try {
            // Navigate to the page
            console.log('Navigating to:', url);
            
            // Robust navigation with multiple fallback strategies
            let navigationSuccess = false;
            
            // Strategy 1: Try domcontentloaded (fastest)
            try {
                await page.goto(url, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                navigationSuccess = true;
            } catch (loadError) {
                console.warn('DOMContentLoaded failed, trying load event:', loadError);
                
                // Strategy 2: Try load event
                try {
                    await page.goto(url, { 
                        waitUntil: 'load',
                        timeout: 40000 
                    });
                    navigationSuccess = true;
                } catch (loadError2) {
                    console.warn('Load event failed, trying commit only:', loadError2);
                    
                    // Strategy 3: Just wait for commit (most basic)
                    await page.goto(url, { 
                        waitUntil: 'commit',
                        timeout: 20000 
                    });
                    navigationSuccess = true;
                }
            }
            
            if (!navigationSuccess) {
                throw new Error('All navigation strategies failed');
            }
            
            // Get page title
            const title = await page.title() || 'No title found';
            console.log('Page title:', title);
            
            // Wait for dynamic content and heavy page resources
            console.log('Waiting for dynamic content to load...');
            
            // Try network idle first for better accuracy
            try {
                await page.waitForLoadState('networkidle', { timeout: 5000 });
                console.log('Network idle achieved');
            } catch {
                // Fallback for heavy pages - wait longer
                console.log('Using extended wait for heavy page');
                await page.waitForTimeout(4000);
            }
            
            // Small additional wait for any remaining dynamic content
            await page.waitForTimeout(1000);
            
            // Extract all links from the page
            const links = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a[href]'));
                return anchors
                    .map(anchor => {
                        const href = anchor.getAttribute('href');
                        if (!href) return null;
                        
                        
                        try {
                            return new URL(href, window.location.href).href;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean)
                    .filter((url, index, array) => array.indexOf(url) === index); 
            });
            
            console.log(`Found ${links.length} unique links`);
            
  
               const uniqueLinks = [...new Set(links)];
    
                const socials=["facebook.com","twitter.com","instagram.com","linkedin.com","youtube.com","pinterest.com","tiktok.com","reddit.com","tumblr.com","flickr.com","wa.me","api.whatsapp.com","chat.whatsapp.com","discord.com","discord.gg","medium.com","github.com","gitlab.com","bitbucket.org","x.com","mailto:","tel:","visualstudio.com"]
                
                const FinalLinks = uniqueLinks.filter(link  => {
                    return !socials.some(social => link?.includes(social)) && !link?.includes("#");
                });

               

            console.log(`Filtered to ${FinalLinks.length} same-origin links`);
            
            await browser.close();
            globalBrowser = null; // Clear global reference
            
            return NextResponse.json({
                success: true,
                data: {
                    url,
                    title,
                    routes: FinalLinks,
                    allLinks: links,
                    stats: {
                        totalLinks: links.length,
                        sameOriginLinks: FinalLinks.length
                    }
                }
            });
            
        } catch (pageError) {
            console.error('Error during page crawling:', pageError);
            
            // Ensure browser is always closed, even on error
            try {
                await browser.close();
                globalBrowser = null;
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
            await forceCleanup(); // Double cleanup on error
            
            return NextResponse.json({
                error: `Failed to crawl page: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`,
                success: false,
                details: 'The page might be too heavy, have JavaScript errors, or network issues'
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Playwright crawl error:', error);
        
        // Force cleanup on any outer error
        await forceCleanup();
        
        return NextResponse.json({
            error: `Crawler failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false
        }, { status: 500 });
    }
}
