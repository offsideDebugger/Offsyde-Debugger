import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Force log to appear
    console.log("� MIDDLEWARE IS RUNNING!");
    console.log("URL:", request.url);
    console.log("Pathname:", request.nextUrl.pathname);
    
    const ua = request.headers.get("user-agent") || "";
    console.log("User Agent:", ua);
    
    // Simple test - block everything that contains "iPhone" in user agent
    if (ua.includes("iPhone") || ua.includes("Mobile")) {
        console.log("🚫 BLOCKING!");
        return new NextResponse(`
            <html>
                <body style="background: red; color: white; font-size: 50px; text-align: center; padding: 100px;">
                    MOBILE BLOCKED!
                </body>
            </html>
        `, {
            status: 200,
            headers: { "Content-Type": "text/html" }
        });
    }
    
    console.log("✅ ALLOWING");
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/forensics/:path*',
        '/audits/:path*'
    ],
};