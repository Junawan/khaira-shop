import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  if (
    pathname.startsWith("/admin")
  ) {
    const auth =
      request.cookies.get(
        "admin-auth"
      );

    if (!auth) {
      return NextResponse.redirect(
        new URL(
          "/login-admin",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};