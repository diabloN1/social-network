import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const isProtected =
    request.nextUrl.pathname.startsWith("/home") ||
    request.nextUrl.pathname === "/";

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}
