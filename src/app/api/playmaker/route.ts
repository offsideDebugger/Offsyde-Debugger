import { NextRequest, NextResponse } from "next/server";
import { performance } from "perf_hooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const routes: string[] = body.routes;

    const results = await Promise.all(
      routes.map(async (route) => {
        try {
          let redirectCount = 0;
          let finalUrl = route;

          // --- Measure TTFB ---
          const t0 = performance.now();
          const response = await fetch(route, { redirect: "manual" });
          const ttfb = performance.now() - t0;

          // --- Redirect Count ---
          if (response.status >= 300 && response.status < 400) {
            redirectCount++;
            finalUrl = response.headers.get("location") || route;
          }

          // --- Headers ---
          const cacheControlPresent = response.headers.has("cache-control");
          const corsPresent = response.headers.has("access-control-allow-origin");
          const contentTypePresent = response.headers.has("content-type");

          // --- Header Severities ---
          const headers = {
            cacheControl: {
              present: cacheControlPresent ? 1 : 0,
              severity: cacheControlPresent ? "good" : "warn"
            },
            cors: {
              present: corsPresent ? 1 : 0,
              severity: corsPresent ? "good" : "warn"
            },
            contentType: {
              present: contentTypePresent ? 1 : 0,
              severity: contentTypePresent ? "good" : "bad" // Missing content-type is very bad
            }
          };

          // --- JSON Empty Check ---
          let jsonEmpty = -1;
          if (contentTypePresent && response.headers.get("content-type")?.includes("application/json")) {
            const data = await response.json();
            jsonEmpty =
              (Array.isArray(data) && data.length === 0) ||
              (typeof data === "object" && Object.keys(data).length === 0)
                ? 1
                : 0;
          }

          // --- Load Test (3 Hits) ---
          let totalTime = 0;
          for (let i = 0; i < 3; i++) {
            const start = performance.now();
            await fetch(finalUrl);
            totalTime += performance.now() - start;
          }
          const loadTestAvg = totalTime / 3;

          // --- Severities ---
          const ttfbSeverity = ttfb > 1000 ? "bad" : ttfb > 500 ? "warn" : "good";
          const loadSeverity = loadTestAvg > 1500 ? "bad" : loadTestAvg > 800 ? "warn" : "good";
          const statusSeverity = response.status >= 500 ? "bad" : response.status >= 400 ? "warn" : "good";
          const jsonSeverity = jsonEmpty === 1 ? "warn" : jsonEmpty === 0 ? "good" : "neutral";

          return {
            url: route,
            status: response.status,
            statusSeverity,
            ttfb: Number(ttfb.toFixed(2)),
            ttfbSeverity,
            redirects: redirectCount,
            headers,
            jsonEmpty,
            jsonSeverity,
            loadTestAvg: Number(loadTestAvg.toFixed(2)),
            loadSeverity
          };
        } catch {
          return {
            url: route,
            status: 0,
            statusSeverity: "bad",
            ttfb: 0,
            ttfbSeverity: "bad",
            redirects: 0,
            headers: {
              cacheControl: { present: 0, severity: "warn" },
              cors: { present: 0, severity: "warn" },
              contentType: { present: 0, severity: "bad" }
            },
            jsonEmpty: -1,
            jsonSeverity: "neutral",
            loadTestAvg: 0,
            loadSeverity: "bad"
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Failed to process routes" }, { status: 500 });
  }
}