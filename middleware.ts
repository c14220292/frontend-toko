import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil token dari cookie
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Halaman yang butuh login
  const isProtectedPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/pos") ||
    path.startsWith("/inventory") ||
    path.startsWith("/procurement") ||
    path.startsWith("/produk") ||
    path.startsWith("/supplier") ||
    path.startsWith("/inbound");

  // Jika mencoba ke halaman terlindungi TAPI tidak punya token -> Lempar ke login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang akan diawasi oleh Satpam (Middleware) ini
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pos/:path*",
    "/inventory/:path*",
    "/procurement/:path*",
    "/produk/:path*",
    "/supplier/:path*",
    "/inbound/:path*",
    "/login",
  ],
};
