import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionRole = request.cookies.get("madrasti_session_role")?.value;

  // 1. Allow public static assets and system routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // 2. Strict Admin Route Guard: Only ADMIN role can access /admin and subroutes
  if (pathname.startsWith("/admin")) {
    if (!sessionRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (sessionRole !== "ADMIN") {
      // Strictly prevent non-admins from viewing or accessing admin routes
      if (sessionRole === "TEACHER") {
        return NextResponse.redirect(new URL("/teacher", request.url));
      }
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  // 3. Strict Teacher Route Guard: Only TEACHER and ADMIN can access /teacher
  if (pathname.startsWith("/teacher")) {
    if (!sessionRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (sessionRole !== "TEACHER" && sessionRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  // 4. Student Route Guard
  if (pathname.startsWith("/student")) {
    if (!sessionRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 5. If visiting login while authenticated, redirect to appropriate role dashboard
  if (pathname === "/login") {
    if (sessionRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (sessionRole === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }
    if (sessionRole === "STUDENT") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  // 6. Root redirect to the user's dashboard or login
  if (pathname === "/") {
    if (sessionRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (sessionRole === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }
    if (sessionRole === "STUDENT") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};