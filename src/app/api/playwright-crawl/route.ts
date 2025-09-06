import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('Starting Playwright crawl for:', url);
        
        // Launch browser
        const browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        // Set timeout
        page.setDefaultTimeout(30000);
        
        try {
            // Navigate to the page
            console.log('Navigating to:', url);
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            // Get page title
            const title = await page.title() || 'No title found';
            console.log('Page title:', title);
            
            // Wait a bit for any dynamic content to load
            await page.waitForTimeout(2000);
            
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
