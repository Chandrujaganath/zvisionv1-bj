import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Exclude login path from authentication check
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("auth-token")?.value

  // Also check for token in authorization header as a fallback
  const authHeader = request.headers.get("authorization")
  const headerToken = authHeader ? authHeader.replace("Bearer ", "") : null

  // Check if token exists in either cookies or header
  if (!token && !headerToken && !request.nextUrl.pathname.startsWith("/login")) {
    console.log("No token found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Add all the paths that require authentication
export const config = {
  matcher: ["/cameras/:path*", "/dashboard/:path*", "/settings/:path*"],
}
