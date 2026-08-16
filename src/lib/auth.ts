import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Verificación de sesión. Usa getClaims(), que valida el JWT localmente
 * contra el JWKS del proyecto (rápido y seguro) en vez de getSession(), que
 * confía ciegamente en lo que venga en la cookie.
 */
export async function getCurrentUser(): Promise<{ id: string; email?: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return { id: data.claims.sub, email: data.claims.email as string | undefined };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

/**
 * Para usar al inicio de cualquier Server Action o Route Handler que
 * modifique datos. proxy.ts ya protege la navegación normal, pero según la
 * propia documentación de Next.js las Server Functions pueden quedar fuera
 * del matcher de Proxy tras un refactor, así que cada una debe validar por
 * su cuenta.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireSuperadmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "superadmin") redirect("/dashboard");
  return profile;
}

export async function getSystemActive(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("system_settings").select("is_active").eq("id", 1).single();
  return data?.is_active ?? true;
}
