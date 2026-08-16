import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Cliente con la service role key: ignora Row Level Security por completo.
 *
 * El import "server-only" hace que el build FALLE si algún componente
 * cliente llega a importar este archivo, para que la service role key jamás
 * pueda terminar en el bundle del navegador.
 *
 * Úsalo solo dentro de Route Handlers o Server Actions que ya hayan
 * verificado explícitamente que quien llama es superadmin (ver
 * requireSuperadmin en lib/auth.ts). Este cliente NO reemplaza esa
 * verificación — el rol se sigue validando con el cliente normal antes de
 * usar este.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
