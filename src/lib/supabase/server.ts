import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para usarse en Server Components, Server Actions y
 * Route Handlers. Se crea una instancia nueva en cada request — nunca se
 * comparte entre requests.
 *
 * IMPORTANTE: en un Server Component puro no se pueden escribir cookies
 * (Next.js lo prohíbe durante el render), así que si `setAll` falla ahí lo
 * ignoramos a propósito: el refresco de sesión ya lo garantiza `proxy.ts` en
 * cada navegación. Si este cliente se usa dentro de una Server Action o un
 * Route Handler, sí puede escribir cookies sin problema.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llamó desde un Server Component durante el render.
            // proxy.ts ya se encarga de refrescar la sesión en cada request.
          }
        },
      },
    }
  );
}
