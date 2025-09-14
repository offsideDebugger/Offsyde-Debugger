import { chromium } from "playwright";
import axios from "axios";

// CSS Issue interface
interface CSSIssue {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    url?: string;
    element?: string;
    count?: number;
    size?: string;
    status?: number;
}

// Main CSS analysis API endpoint  
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

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    try {
        // Navigate to the target URL
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for dynamic content

        const allIssues: CSSIssue[] = [];

        // Check external stylesheets
        const stylesheets = await page.$$eval('link[rel="stylesheet"]', (links) => {
            return links.map((link, index) => ({
                index,
                href: link.getAttribute('href') || '',
                media: link.getAttribute('media') || '',
                crossorigin: link.getAttribute('crossorigin') || '',
                integrity: link.getAttribute('integrity') || '',
                disabled: link.hasAttribute('disabled')
            }));
        });

        // Analyze each stylesheet for issues
        for (const sheet of stylesheets) {
            // Check for missing href
            if (!sheet.href || sheet.href.trim() === '') {
                allIssues.push({
                    type: 'missing-href',
                    severity: 'high',
                    message: 'Stylesheet link missing href attribute',
                    element: `stylesheet[${sheet.index}]`
                });
                continue;
            }

            // Test stylesheet accessibility
            try {
                const response = await axios.head(sheet.href, { 
                    timeout: 5000,
                    validateStatus: () => true 
                });

                if (response.status === 404) {
                    allIssues.push({
                        type: 'stylesheet-not-found',
                        severity: 'high',
                        message: 'Stylesheet returns 404 Not Found',
                        url: sheet.href,
                        status: 404
                    });
                } else if (response.status === 403) {
                    allIssues.push({
                        type: 'stylesheet-forbidden',
                        severity: 'high',
                        message: 'Stylesheet returns 403 Forbidden',
                        url: sheet.href,
                        status: 403
                    });
                } else if (response.status !== 200) {
                    allIssues.push({
                        type: 'stylesheet-error',
                        severity: 'high',
                        message: `Stylesheet returns ${response.status} error`,
                        url: sheet.href,
                        status: response.status
                    });
                }

                // Check for large CSS files
                const contentLength = response.headers['content-length'];
                if (contentLength && parseInt(contentLength) > 100 * 1024) { // 100KB
                    allIssues.push({
                        type: 'large-css-file',
                        severity: 'medium',
                        message: `Large CSS file (${(parseInt(contentLength) / 1024).toFixed(1)}KB)`,
                        url: sheet.href,
                        size: `${(parseInt(contentLength) / 1024).toFixed(1)}KB`
                    });
                }

            } catch {
                allIssues.push({
                    type: 'stylesheet-network-error',
                    severity: 'high',
                    message: 'Failed to fetch stylesheet (network error)',
                    url: sheet.href
                });
            }

            // Check for disabled stylesheets
            if (sheet.disabled) {
                allIssues.push({
                    type: 'disabled-stylesheet',
                    severity: 'medium',
                    message: 'Stylesheet is disabled',
                    url: sheet.href
                });
            }
        }

        // Check for excessive inline styles
        const inlineStylesCount = await page.$$eval('[style]', (elements) => elements.length);
        if (inlineStylesCount > 50) {
            allIssues.push({
                type: 'excessive-inline-styles',
                severity: 'medium',
                message: `${inlineStylesCount} elements with inline styles (consider external CSS)`,
                count: inlineStylesCount
            });
        }

        // Check CSS loading performance
        const cssPerformance = await page.evaluate(() => {
            const cssResources = performance.getEntriesByType('resource').filter(resource => {
                const resourceTiming = resource as PerformanceResourceTiming;
                return resource.name.includes('.css') || resourceTiming.initiatorType === 'css';
            });
            
            return {
                cssCount: cssResources.length,
                totalLoadTime: cssResources.reduce((total, resource) => {
                    const resourceTiming = resource as PerformanceResourceTiming;
                    return total + (resourceTiming.responseEnd - resourceTiming.startTime);
                }, 0)
            };
        });

        // Check for too many CSS files
        if (cssPerformance.cssCount > 10) {
            allIssues.push({
                type: 'too-many-css-files',
                severity: 'medium',
                message: `${cssPerformance.cssCount} CSS files detected (consider bundling)`,
                count: cssPerformance.cssCount
            });
        }

        // Check for slow CSS loading
        if (cssPerformance.totalLoadTime > 3000) {
            allIssues.push({
                type: 'slow-css-loading',
                severity: 'medium',
                message: `CSS loading took ${cssPerformance.totalLoadTime.toFixed(0)}ms`,
                count: Math.round(cssPerformance.totalLoadTime)
            });
        }

        // Capture title BEFORE closing browser
        const title = await page.title().catch(() => '');
        await browser.close();

        // Return analysis results
        return new Response(JSON.stringify({
            title,
            totalIssues: allIssues.length,
            issues: allIssues,
            summary: {
                criticalIssues: allIssues.filter(issue => issue.severity === 'high').length,
                warningIssues: allIssues.filter(issue => issue.severity === 'medium').length,
                infoIssues: allIssues.filter(issue => issue.severity === 'low').length
            },
            stylesheetCount: stylesheets.length,
            inlineStylesCount
        }), { status: 200 });

    } catch (error) {
    console.error("Error analyzing CSS:", error);
    await browser.close().catch(() => {});
        return new Response(JSON.stringify({ error: "Failed to analyze CSS for the given URL" }), { status: 500 });
    }
}
