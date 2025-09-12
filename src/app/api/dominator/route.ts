
import { chromium } from "playwright";



export async function POST(request: Request) {
    const { url } = await request.json();
    if (!url) {
        return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
    }

    const browser=await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
            
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        // Set timeout
        page.setDefaultTimeout(30000);
        // Wait a bit for any dynamic content to load
        await page.waitForTimeout(2000);
        
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

            const images = await page.$$eval('img',( imgs )=> {
                return imgs.map((img )=> ({
                    src: img.getAttribute('src') || "",
                    alt: img.getAttribute('alt'),
                    loading: img.getAttribute('loading'),
                    renderedwidth: img.clientWidth,
                    renderedheight: img.clientHeight,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete,
                    isBroken: !(img.complete && img.naturalWidth !== 0),
                    isLinked: !!img.closest('a'),
                }));
            });

            const results=[];
            for(const img of images){
                const issues:string[] = [];
                //check if the image is broken
                if(img.naturalWidth === 0 || img.naturalHeight === 0){
                    issues.push('broken');
                }else{
                    try{
                        //see if the image URL is reachable
                        const res=await axios.head(img.src);
                        if(res.status >= 400) issues.push('broken (status code '+res.status+')');
                        //oversized check
                        const size=Number(res.headers['content-length'] || 0);
                        if(size && size>1_000_000) issues.push(`too large )(${(size/1024).toFixed(1)} KB)`);
                    }catch(err){
                        issues.push('broken (network error)');
                    }
                }

                //missing alt attribute
                if(!img.alt || img.alt.trim().length===0){
                    issues.push('missing alt');
                }

                //lazy loading check
                const isBelowFold = img.renderedheight + img.renderedwidth !== 0 && img.renderedheight + img.renderedwidth > 0;
                if( isBelowFold && img.loading !== 'lazy'){
                    issues.push('not lazy loaded');
                }

                //unoptimized format check
                if(img.src.endsWith('.jpg') || img.src.endsWith('.jpeg') || img.src.endsWith('.png')){
                    issues.push("consider_webp/avif");
                }

                //missing link check

                if(!img.isLinked){
                    issues.push('unlinked_image');
                }

                results.push({...img, issues})


            }
            
         
            await browser.close();
            return results.filter((i)=> i.issues.length > 0);
            // Get page content
        } catch (error) {
            console.error('Error loading page:', error);
            await browser.close();
            return new Response(JSON.stringify({ error: "Failed to load the page. Please ensure the URL is correct and accessible." }), { status: 500 });
        }
}