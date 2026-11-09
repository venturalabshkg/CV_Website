import { NextResponse, type NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let authenticated = false;
  if (token) {
    try {
      authenticated = Boolean(await readSession(token));
    } catch {
      authenticated = false;
    }
  }

  const isLogin = pathname === "/admin/login";
  if (!authenticated && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (authenticated && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
