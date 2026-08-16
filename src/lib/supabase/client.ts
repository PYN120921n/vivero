import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para usarse en Client Components ("use client").
 * Se crea una instancia nueva cada vez que se llama — es económico y evita
 * compartir estado entre renders.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
