import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";



export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const isMobile = /Mobi|Android|iPhone|iPod/i.test(ua);

  if (isMobile) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Offsyde</title>
        <style>
          body {
            margin: 0;
            height: 100vh;
            
            background: black;
            color: white;
            font-family: sans-serif;
            text-align: center;
            display: flex;
             justify-content: center; 
             align-items: center; 
      
            padding: 20px;
          }
        </style>
      </head>
      <body>
 
        <p style="font-size: 1.5rem; font-weight: 900;">
          Offsyde is a platform for devs,<br/>
          so if you don’t make websites on a phone,<br/>
          why test it on a phone ?
        </p>
     

      </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: "/:path*",
};