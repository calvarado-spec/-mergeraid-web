import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow these paths through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname === "/coming-soon" ||
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
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack|favicon\\.ico|images|api|coming-soon).*)",
  ],
};
