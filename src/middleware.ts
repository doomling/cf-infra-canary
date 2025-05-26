import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo redirigimos desde la raíz
  if (pathname === "/") {
    const userAgent = request.headers.get("user-agent") || "";

    // Criterio canario: usuarios con Chrome
    const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg");

    // Si no tiene cookie, asignamos versión basada en User-Agent
    const version = request.cookies.get("version");

    if (!version) {
      if (isChrome) {
        const response = NextResponse.redirect(new URL("/canary", request.url));
        response.cookies.set("version", "canary", {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        return response;
      } else {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.set("version", "stable", {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        return response;
      }
    }

    // Ya tiene cookie: respetamos asignación
    if (version.value === "canary") {
      return NextResponse.redirect(new URL("/canary", request.url));
    }
  }

  return NextResponse.next();
}
