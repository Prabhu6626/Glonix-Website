import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"]

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/about", "/fabrication", "/assembly", "/product", "/designenquiry", "/contact"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // Get the token from cookies or headers
  const token =
    request.cookies.get("access_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !token) {
    // Store the intended destination
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
