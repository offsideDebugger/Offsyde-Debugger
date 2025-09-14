import { chromium } from "playwright";
import axios from "axios";

// Helper function to check if a URL should be exempt from network testing
function isExemptFromNetworkTest(url: string): boolean {
    const exemptPatterns = [
        /_next\/static\/css\//, // Next.js static CSS
        /_next\/static\/chunks\//, // Next.js chunks
        /_next\/static\/js\//, // Next.js static JS
        /\/__next\/static\//, // Alternative Next.js pattern
        /\/webpack\//, // Webpack dev server
        /\/hot-update\.(css|js)$/, // Hot reload files
        /\/app-.*\.(css|js)$/, // App-specific generated files
        /\/pages-.*\.(css|js)$/, // Pages-specific generated files
        /\/main-.*\.(css|js)$/, // Main bundle files
        /\/chunk-.*\.(css|js)$/, // Chunk files
        /\/build\/static\/(css|js)\//, // Create React App build files
        /\/dist\/static\/(css|js)\//, // Common dist folder files
        /\/assets\/.*-[a-f0-9]{8,}\.(css|js)$/, // Vite hashed assets
        /localhost:\d+\//, // Local development servers
        /127\.0\.0\.1:\d+\//, // Local development servers
        /192\.168\.\d+\.\d+:\d+\//, // Local network development servers
    ];

    return exemptPatterns.some(pattern => pattern.test(url));
}

// Analyze CSS stylesheets and JavaScript files for issues
export async function POST(request: Request) {
    const { url } = await request.json();
    if (!url) {
        return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
    }

    // Launch browser with security flags
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    try {
        // Navigate to the target page
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Extract stylesheet information
        const stylesheets = await page.$$eval('link[rel="stylesheet"]', (links) => {
            const base = window.location.href;
            return links.map((link, index) => {
                const href = link.getAttribute('href');
                const media = link.getAttribute('media');
                const type = link.getAttribute('type');
                const crossorigin = link.getAttribute('crossorigin');
                
                const normalizedHref = href ? (() => { try { return new URL(href, base).toString(); } catch { return href; } })() : '';
                return {
                    index,
                    href: normalizedHref,
                    media: media || "",
                    type: type || "",
                    crossorigin: crossorigin || "",
                    hasValidSrc: !!(href && href.trim() !== ""),
                    outerHTML: link.outerHTML
                };
            });
        });

        // Extract JavaScript file information
        const jsScripts = await page.$$eval('script[src]', (scripts) => {
            const base = window.location.href;
            return scripts.map((script, index) => {
                const src = script.getAttribute('src');
                const type = script.getAttribute('type');
                const async = script.hasAttribute('async');
                const defer = script.hasAttribute('defer');
                const crossorigin = script.getAttribute('crossorigin');
                
                const normalizedSrc = src ? (() => { try { return new URL(src, base).toString(); } catch { return src; } })() : '';
                return {
                    index,
                    src: normalizedSrc,
                    type: type || "",
                    async,
                    defer,
                    crossorigin: crossorigin || "",
                    hasValidSrc: !!(src && src.trim() !== ""),
                    outerHTML: script.outerHTML.substring(0, 200) + '...'
                };
            });
        });

        // Analyze stylesheets for issues
        const stylesheetResults = [];
        for (const stylesheet of stylesheets) {
            const issues: string[] = [];
            
            // Check if stylesheet has missing src
            if (!stylesheet.hasValidSrc) {
                issues.push('missing href attribute');
            } else if (!isExemptFromNetworkTest(stylesheet.href)) {
                // Test stylesheet availability (skip build-generated assets)
                try {
                    const response = await axios.head(stylesheet.href, { 
                        timeout: 5000,
                        validateStatus: () => true // Don't throw on error status codes
                    });
                    
                    if (response.status === 404) {
                        issues.push('stylesheet not found (404)');
                    } else if (response.status === 403) {
                        issues.push('stylesheet forbidden (403)');
                    } else if (response.status !== 200) {
                        issues.push(`stylesheet error (${response.status})`);
                    }
                } catch {
                    issues.push('stylesheet network error');
                }
            }
            
            // Check for missing media queries on non-screen stylesheets
            if (!stylesheet.media && stylesheet.href.includes('print')) {
                issues.push('print stylesheet missing media attribute');
            }
            
            stylesheetResults.push({ ...stylesheet, issues });
        }

        // Analyze JavaScript files for issues
        const jsResults = [];
        for (const script of jsScripts) {
            const issues: string[] = [];
            
            // Check if script has missing src
            if (!script.hasValidSrc) {
                issues.push('missing src attribute');
            } else if (!isExemptFromNetworkTest(script.src)) {
                // Test JavaScript file availability (skip build-generated assets)
                try {
                    const response = await axios.head(script.src, { 
                        timeout: 5000,
                        validateStatus: () => true // Don't throw on error status codes
                    });
                    
                    if (response.status === 404) {
                        issues.push('script not found (404)');
                    } else if (response.status === 403) {
                        issues.push('script forbidden (403)');
                    } else if (response.status !== 200) {
                        issues.push(`script error (${response.status})`);
                    }
                } catch {
                    issues.push('script network error');
                }
            }
            
            // Check for performance issues
            if (!script.async && !script.defer) {
                issues.push('blocking script (consider async/defer)');
            }
            
            jsResults.push({ ...script, issues });
        }

        // Filter out only problematic resources
        const brokenStylesheets = stylesheetResults.filter(sheet => sheet.issues.length > 0);
        const brokenScripts = jsResults.filter(script => script.issues.length > 0);

        // Capture title BEFORE closing browser
        const title = await page.title().catch(() => '');
        await browser.close();

        // Return analysis results
        return new Response(JSON.stringify({
            title,
            brokenStylesheets,
            brokenScripts,
            stylesheetCount: stylesheets.length,
            scriptCount: jsScripts.length,
            summary: {
                totalIssues: brokenStylesheets.length + brokenScripts.length,
                stylesheetIssues: brokenStylesheets.length,
                scriptIssues: brokenScripts.length
            }
        }), { status: 200 });


    } catch (error) {
    console.error("Error processing the page:", error);
    await browser.close().catch(() => {});
        return new Response(JSON.stringify({ error: "Failed to process the URL" }), { status: 500 });
    }
}