import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Banned-user gate (JWT-baked, ~5 min staleness on ban — see lib/auth.ts CLAIMS_TTL_MS).
// Admin-only gate for /admin/*.

const PUBLIC_PREFIXES = [
  "/_next",
  "/favicon",
  "/uploads",
  "/api/auth",
  "/api/otp",
  "/onboarding",
  "/suspended",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/") {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/admin")) {
    if (!token) {
      // eslint-disable-next-line no-console
      console.log(`[mw] /admin -> /onboarding (no session) path=${pathname}`);
      const url = req.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    if (!token.isAdmin) {
      // eslint-disable-next-line no-console
      console.log(`[mw] /admin -> /dashboard (not admin) uid=${token.uid} path=${pathname}`);
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (token?.isBanned) {
    const url = req.nextUrl.clone();
    url.pathname = "/suspended";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
