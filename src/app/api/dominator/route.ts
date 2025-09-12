
import { chromium } from "playwright";
import axios from "axios";


export async function POST(request: Request) {
    // Extract and validate the URL from request body
    const { url } = await request.json();
    if (!url) {
        return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
    }

    // Launch browser with security flags for server environments
    const browser=await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
            
        // Create browser context with realistic user agent
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        // Set reasonable timeout for slow pages
        page.setDefaultTimeout(30000);
        // Wait for dynamic content to load (JS frameworks, etc.)
        await page.waitForTimeout(2000);
        
        try {
            // Navigate to the target URL
            console.log('Navigating to:', url);
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            // Grab page title for identification
            const title = await page.title() || 'No title found';
            console.log('Page title:', title);

            // Scan all video elements for missing sources
            const videoFiles = await page.$$eval('video', (videos) => {
                return videos.map((video, index) => {
                    const src = video.getAttribute('src'); // Direct src attribute
                    const sources = Array.from(video.querySelectorAll('source')).map(source => source.getAttribute('src')).filter(Boolean); // Child source elements
                    const hasValidSource = src || sources.length > 0; // Check if video has any source
                    
                    return {
                        index,
                        src,
                        sources,
                        hasValidSource,
                        outerHTML: video.outerHTML.substring(0, 200) + '...' // Truncate for readability
                    };
                });
            });

            // Scan all audio elements for missing sources
            const audioFiles = await page.$$eval('audio', (audios) => {
                return audios.map((audio, index) => {
                    const src = audio.getAttribute('src'); // Direct src attribute
                    const sources = Array.from(audio.querySelectorAll('source')).map(source => source.getAttribute('src')).filter(Boolean); // Child source elements
                    const hasValidSource = src || sources.length > 0; // Check if audio has any source
                    
                    return {
                        index,
                        src,
                        sources,
                        hasValidSource,
                        outerHTML: audio.outerHTML.substring(0, 200) + '...' // Truncate for readability
                    };
                });
            });

            // Extract only the broken media elements
            const brokenVideos = videoFiles.filter(video => !video.hasValidSource);
            const brokenAudios = audioFiles.filter(audio => !audio.hasValidSource);

            // Scan all iframe elements for security and performance issues
            const iframeFiles = await page.$$eval('iframe', (iframes) => {
                return iframes.map((iframe, index) => {
                    const src = iframe.getAttribute('src'); // External URL source
                    const srcdoc = iframe.getAttribute('srcdoc'); // Inline HTML content
                    const sandbox = iframe.getAttribute('sandbox'); // Security restrictions
                    const loading = iframe.getAttribute('loading'); // Lazy loading attribute
                    const title = iframe.getAttribute('title'); // Accessibility title
                    const name = iframe.getAttribute('name'); // Frame name for targeting
                    const width = iframe.getAttribute('width');
                    const height = iframe.getAttribute('height');
                    const rect = iframe.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(iframe);
                    
                    return {
                        index,
                        src: src || "",
                        srcdoc: srcdoc || "",
                        sandbox: sandbox || "",
                        loading: loading || "",
                        title: title || "",
                        name: name || "",
                        width,
                        height,
                        renderedWidth: iframe.clientWidth,
                        renderedHeight: iframe.clientHeight,
                        isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
                        isAboveFold: rect.top < window.innerHeight,
                        allowFullscreen: iframe.hasAttribute('allowfullscreen'),
                        referrerPolicy: iframe.getAttribute('referrerpolicy') || "",
                        frameBorder: iframe.getAttribute('frameborder') || "",
                        outerHTML: iframe.outerHTML.substring(0, 300) + '...'
                    };
                });
            });

            // Run checks on each iframe for common issues
            const iframeResults = [];
            for (const iframe of iframeFiles) {
                const issues: string[] = [];
                
                // Check if iframe has any content source
                if (!iframe.src && !iframe.srcdoc) {
                    issues.push('missing src or srcdoc');
                }
                
                // Accessibility check - screen readers need titles
                if (!iframe.title || iframe.title.trim() === '') {
                    issues.push('missing title attribute');
                }
                
                // 3. Security issues - missing sandbox
                if (!iframe.sandbox) {
                    issues.push('missing sandbox attribute');
                }
                
                // 4. Insecure HTTP iframe on HTTPS page
                if (iframe.src && iframe.src.startsWith('http://') && window.location.protocol === 'https:') {
                    issues.push('insecure HTTP iframe on HTTPS page');
                }
                
                // 5. Missing lazy loading for below-fold iframes
                if (!iframe.isAboveFold && iframe.loading !== 'lazy') {
                    issues.push('should use lazy loading');
                }
                
                // 6. Deprecated frameborder attribute
                if (iframe.frameBorder && iframe.frameBorder !== '') {
                    issues.push('deprecated frameborder attribute');
                }
                
                // 7. Missing referrer policy for external iframes
                if (iframe.src && iframe.src.startsWith('http') && !iframe.referrerPolicy) {
                    try {
                        const iframeUrl = new URL(iframe.src);
                        const currentHost = window.location.hostname;
                        if (iframeUrl.hostname !== currentHost) {
                            issues.push('external iframe missing referrerpolicy');
                        }
                    } catch {
                        // Invalid URL
                        issues.push('invalid iframe URL');
                    }
                }
                
                // 8. Invisible iframe taking up space
                if (!iframe.isVisible && (iframe.renderedWidth > 0 || iframe.renderedHeight > 0)) {
                    issues.push('invisible but takes space');
                }
                
                // 9. Oversandboxed - too restrictive
                if (iframe.sandbox && iframe.sandbox.includes('allow-scripts') && iframe.sandbox.includes('allow-same-origin')) {
                    issues.push('potentially unsafe sandbox combination');
                }
                
                // 10. Missing dimensions leading to layout shift
                if (!iframe.width && !iframe.height && iframe.renderedWidth > 0 && iframe.renderedHeight > 0) {
                    issues.push('missing width/height attributes');
                }

                iframeResults.push({ ...iframe, issues });
            }

            // Filter out iframes that have issues
            const brokenIframes = iframeResults.filter(iframe => iframe.issues.length > 0);

            // Scan all images for performance, accessibility, and optimization issues
            const images = await page.$$eval('img', (imgs) => {
                return imgs.map((img, index) => {
                    const rect = img.getBoundingClientRect(); // Get position and size info
                    const computedStyle = window.getComputedStyle(img); // Get CSS properties
                    
                    return {
                        index,
                        src: img.getAttribute('src') || "",
                        alt: img.getAttribute('alt') || "",
                        title: img.getAttribute('title') || "",
                        loading: img.getAttribute('loading') || "",
                        width: img.getAttribute('width'),
                        height: img.getAttribute('height'),
                        renderedWidth: img.clientWidth,
                        renderedHeight: img.clientHeight,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        complete: img.complete,
                        isBroken: !(img.complete && img.naturalWidth !== 0),
                        isLinked: !!img.closest('a'),
                        isAboveFold: rect.top < window.innerHeight,
                        isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
                        hasDecorativeRole: img.getAttribute('role') === 'presentation' || img.getAttribute('role') === 'none',
                        className: img.className,
                        srcset: img.getAttribute('srcset') || "",
                        sizes: img.getAttribute('sizes') || ""
                    };
                });
            });

            // Analyze each image for various issues
            const results = [];
            for (const img of images) {
                const issues: string[] = [];
                
                // Basic validation - image needs a source
                if (!img.src || img.src.trim() === "") {
                    issues.push('missing src');
                }
                
                // Client-side broken image detection
                if (img.naturalWidth === 0 || img.naturalHeight === 0 || !img.complete) {
                    issues.push('broken image');
                }
                
                // 3. Network reachability check (only if we have a valid src and it's not broken client-side)
                if (img.src && img.src.startsWith('http') && img.complete && img.naturalWidth > 0) {
                    try {
                        const res = await axios.head(img.src, { timeout: 5000 });
                        if (res.status >= 400) {
                            issues.push(`broken (HTTP ${res.status})`);
                        }
                        
                        // File size check
                        const size = Number(res.headers['content-length'] || 0);
                        if (size && size > 1_000_000) { // > 1MB
                            issues.push(`oversized (${(size / 1024 / 1024).toFixed(1)} MB)`);
                        }
                    } catch {
                        issues.push('broken (network error)');
                    }
                }
                
                // Accessibility - non-decorative images need alt text
                if (!img.hasDecorativeRole && (!img.alt || img.alt.trim().length === 0)) {
                    issues.push('missing alt text');
                }
                
                // Check for generic/useless alt text
                if (img.alt && (
                    img.alt.toLowerCase().includes('image') ||
                    img.alt.toLowerCase().includes('picture') ||
                    img.alt.toLowerCase().includes('photo') ||
                    img.alt === img.src.split('/').pop()?.split('.')[0]
                )) {
                    issues.push('poor alt text quality');
                }
                
                // Performance - images below fold should lazy load
                if (!img.isAboveFold && img.loading !== 'lazy') {
                    issues.push('should use lazy loading');
                }
                
                // 7. Eager loading for above-fold images
                if (img.isAboveFold && img.loading === 'lazy') {
                    issues.push('avoid lazy loading above fold');
                }
                
                // 8. Unoptimized format check
                if (img.src && (img.src.includes('.jpg') || img.src.includes('.jpeg') || img.src.includes('.png'))) {
                    issues.push('consider modern formats (WebP/AVIF)');
                }
                
                // 9. Missing responsive images
                if (!img.srcset && img.renderedWidth > 300) {
                    issues.push('missing responsive images (srcset)');
                }
                
                // 10. Oversized dimensions
                if (img.naturalWidth > 0 && img.renderedWidth > 0 && 
                    img.naturalWidth > img.renderedWidth * 2) {
                    const wasteRatio = ((img.naturalWidth - img.renderedWidth) / img.naturalWidth * 100).toFixed(0);
                    issues.push(`oversized dimensions (${wasteRatio}% wasted)`);
                }
                
                // 11. Invisible images taking up space
                if (!img.isVisible && (img.renderedWidth > 0 || img.renderedHeight > 0)) {
                    issues.push('invisible but takes space');
                }
                
                // 12. Images without proper aspect ratio
                if (img.naturalWidth > 0 && img.naturalHeight > 0 && img.renderedWidth > 0 && img.renderedHeight > 0) {
                    const naturalRatio = img.naturalWidth / img.naturalHeight;
                    const renderedRatio = img.renderedWidth / img.renderedHeight;
                    if (Math.abs(naturalRatio - renderedRatio) > 0.1) {
                        issues.push('distorted aspect ratio');
                    }
                }

                results.push({ ...img, issues });
            }
            
         
            // Clean up browser resources
            await browser.close();
            
            // Only return images that have issues (filter out clean ones)
            const filteredResults=results.filter((i)=> i.issues.length > 0);
            
            // Send back all the analysis results
            return new Response(JSON.stringify({ 
                title, 
                brokenImageData: filteredResults,
                brokenVideos: brokenVideos,
                brokenAudios: brokenAudios,
                brokenIframes: brokenIframes,
                videoCount: videoFiles.length,
                audioCount: audioFiles.length,
                iframeCount: iframeFiles.length
            }), { status: 200 });
        } catch (error) {
            // Handle any errors that occur during analysis
            console.error('Error loading page:', error);
            await browser.close();
            return new Response(JSON.stringify({ error: "Failed to load the page. Please ensure the URL is correct and accessible." }), { status: 500 });
        }
}