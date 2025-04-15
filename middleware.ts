import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Exclude login path from authentication check
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next()
  }

  // Get token from local storage (client-side) or from session cookies (server-side)
  const token = request.cookies.get("auth-token")?.value

  // Check if token exists (this is a simplified version)
  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    // We can't read localStorage in middleware, so we'll do additional checks in components
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Add all the paths that require authentication
export const config = {
  matcher: ["/cameras/:path*", "/dashboard/:path*", "/settings/:path*"],
}
