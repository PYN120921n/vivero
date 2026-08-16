import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

const PUBLIC_PATHS = new Set(["/login", "/suspendido"]);

/**
 * Se ejecuta antes de cada navegación de página (ver matcher abajo — las
 * rutas /api quedan fuera a propósito: cada Route Handler valida su propia
 * sesión, como recomienda la documentación de Next.js 16 para Proxy).
 *
 * Hace dos cosas:
 *   1. Refresca la sesión de Supabase y reescribe la cookie si cambió.
 *   2. Redirige según el estado de autenticación y el killswitch:
 *      - sin sesión         → /login
 *      - con sesión, rol
 *        "usuario" y sistema
 *        suspendido         → /suspendido
 *      - con sesión y en
 *        /login             → /dashboard
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const pathname = request.nextUrl.pathname;

  if (!claims) {
    if (!PUBLIC_PATHS.has(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/suspendido") {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .single();

  if (profile?.role !== "superadmin") {
    const { data: settings } = await supabase
      .from("system_settings")
      .select("is_active")
      .eq("id", 1)
      .single();

    if (settings?.is_active === false) {
      const url = request.nextUrl.clone();
      url.pathname = "/suspendido";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
