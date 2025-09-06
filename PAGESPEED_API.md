# Page Speed API Documentation

## Overview
The Page Speed API (`/api/pagespeed`) is a Next.js API route that provides simple page performance testing using Playwright browser automation. It measures essential performance metrics without the complexity of full Lighthouse audits.

## Endpoint
```
POST /api/pagespeed
```

## Request Format
```json
{
  "url": "https://example.com"
}
```

## Response Format
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "loadTime": "1250ms",
    "metrics": {
      "domContentLoaded": "800ms",
      "pageLoadComplete": "1200ms",
      "timeToFirstByte": "150ms",
      "domElements": 45,
      "images": 3,
      "scripts": 8,
      "stylesheets": 2
    },
    "performance": {
      "grade": "Excellent",
      "color": "green"
    }
  }
}
```

## How It Works

### 1. Browser Launch
- Uses Playwright's Chromium browser in headless mode
- Configured with security flags for server environments
- Creates new browser context and page for each test

### 2. Page Loading
- Navigates to the target URL
- Waits for network idle state (no network requests for 500ms)
- Measures total load time from start to finish
- 30-second timeout for slow pages

### 3. Performance Metrics Collection
Uses browser's Performance API to gather:

#### Core Timing Metrics
- **DOM Content Loaded**: Time when HTML parsing is complete
- **Page Load Complete**: Time when all resources finish loading
- **Time to First Byte**: Server response time

#### Page Analysis
- **DOM Elements**: Total count of HTML elements
- **Images**: Number of `<img>` tags
- **Scripts**: Number of `<script>` tags
- **Stylesheets**: Number of CSS `<link>` tags

### 4. Performance Grading
Automatic performance assessment based on total load time:

| Load Time | Grade | Color |
|-----------|-------|--------|
| < 2 seconds | Excellent | Green |
| 2-4 seconds | Good | Orange |
| 4-6 seconds | Fair | Yellow |
| > 6 seconds | Poor | Red |

## Code Structure

```typescript
// Browser setup
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

// Performance measurement
const startTime = Date.now();
await page.goto(url, { waitUntil: 'networkidle' });
const loadTime = Date.now() - startTime;

// Metrics collection using Performance API
const metrics = await page.evaluate(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  return {
    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
    // ... other metrics
  };
});
```

## Error Handling

### Common Errors
- **400**: Missing URL in request body
- **500**: Page load timeout, network issues, or invalid URL

### Error Response Format
```json
{
  "error": "Failed to test page: Navigation timeout exceeded",
  "success": false
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
const response = await fetch('/api/pagespeed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await response.json();
console.log(`Load time: ${result.data.loadTime}`);
console.log(`Performance: ${result.data.performance.grade}`);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/pagespeed \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## Performance Considerations

### Timeouts
- Page navigation: 30 seconds
- Network idle: 500ms of no network activity
- Total test time: Usually 2-10 seconds per URL

### Resource Usage
- Each test launches a new browser instance
- Browser is properly closed after each test
- Memory usage scales with page complexity

### Rate Limiting
- No built-in rate limiting
- Consider implementing rate limiting for production use
- Each test uses significant CPU/memory resources

## Dependencies

### Required Packages
```json
{
  "playwright": "^1.x.x"
}
```

### Browser Installation
```bash
npx playwright install chromium
```

## Limitations

1. **JavaScript Required**: Only tests pages that render with JavaScript
2. **No Mobile Testing**: Currently desktop-only measurements
3. **Basic Metrics**: Simplified compared to full Lighthouse audits
4. **No Caching**: Each test is a fresh page load
5. **Single Page**: Doesn't test user flows or multi-page scenarios

## Comparison with Lighthouse

| Feature | Page Speed API | Lighthouse |
|---------|----------------|------------|
| Setup Complexity | Simple | Complex |
| Dependencies | Playwright only | Lighthouse + Chrome |
| Test Speed | Fast (2-10s) | Slower (10-30s) |
| Metrics | Basic performance | Comprehensive audits |
| SEO/Accessibility | No | Yes |
| Best Practices | No | Yes |
| Resource Usage | Lower | Higher |

## Future Enhancements

Potential improvements:
- Mobile device emulation
- Custom performance budgets
- Multiple URL batch testing
- Caching analysis
- Core Web Vitals measurement
- Screenshot capture
- Network throttling simulation

## Troubleshooting

### Common Issues

1. **Browser Launch Fails**
   - Install Playwright browsers: `npx playwright install`
   - Check system dependencies

2. **Timeout Errors**
   - Increase timeout for slow sites
   - Check URL accessibility
   - Verify network connectivity

3. **Permission Errors**
   - Ensure proper file permissions
   - Check browser sandbox settings

### Debug Mode
Add logging for troubleshooting:
```typescript
console.log('Testing URL:', url);
console.log('Load time:', loadTime);
console.log('Metrics:', metrics);
```
