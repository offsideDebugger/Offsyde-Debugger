import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import chromiumPkg from '@sparticuz/chromium';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('Starting Playwright crawl for:', url);
        
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
            return new Response(JSON.stringify({
                error: 'Browser initialization failed. This might be a temporary server issue.',
                success: false
            }), { status: 500 });
        }
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        // Set timeout
        page.setDefaultTimeout(30000);
        
        try {
            // Navigate to the page
            console.log('Navigating to:', url);
            
            // Try to load the page with fallback strategies
            try {
                await page.goto(url, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 45000 
                });
            } catch (loadError) {
                console.warn('DOMContentLoaded timeout, trying with networkidle:', loadError);
                // Fallback: try with networkidle but shorter timeout
                await page.goto(url, { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
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
            await browser.close();
            
            return NextResponse.json({
                error: `Failed to crawl page: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`,
                success: false
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Playwright crawl error:', error);
        
        return NextResponse.json({
            error: `Crawler failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false
        }, { status: 500 });
    }
}
