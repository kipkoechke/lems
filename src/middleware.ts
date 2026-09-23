import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

// Define API routes that should be excluded from middleware
const apiRoutes = ["/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get the token from cookies or headers
  const token =
    request.cookies.get("authToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Next prefetches routes in the background. Answering a prefetch with a
  // redirect makes the client cache that redirect for the real navigation
  // later — so a route prefetched while signed out stays "redirect to login"
  // even after the cookie is set, and the user is stuck until a hard reload.
  // Answer prefetches with an empty 204 instead: nothing is cached, and the
  // real navigation is resolved against the cookie it actually carries.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    if (isPrefetch) {
      return new NextResponse(null, { status: 204 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has token and trying to access public route (like login), redirect
  // to the dashboard itself — "/" only redirects there again, costing a second
  // round trip.
  if (token && isPublicRoute) {
    if (isPrefetch) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|serviceWorker).*)",
  ],
};
