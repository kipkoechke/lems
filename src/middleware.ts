import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

// Define API routes that should be excluded from middleware
const apiRoutes = ["/api"];

export function middleware(request: NextRequest) {
  console.log("Middleware - pathname:", request.nextUrl.pathname);
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

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has token and trying to access public route (like login), redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
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
