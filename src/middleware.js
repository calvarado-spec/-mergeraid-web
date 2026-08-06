import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always pass API routes, static assets, and public pages through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/coming-soon" ||
    pathname === "/sample-report" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const siteAccess = request.cookies.get("site_access");

  if (siteAccess?.value === "granted") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/coming-soon", request.url));
}

export const config = {
  // Standard Next.js pattern: skip middleware for api routes and static assets.
  // The function body above is the authoritative allow-list; this matcher is a
  // performance optimisation that prevents the middleware from even loading for
  // paths that clearly don't need it.
  matcher: ["/((?!api|_next|images|favicon\\.ico).*)"],
};
