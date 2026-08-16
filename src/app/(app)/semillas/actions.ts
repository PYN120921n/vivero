"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

const seedSchema = z.object({
  common_name: z.string().trim().min(1, "El nombre común es obligatorio."),
  scientific_name: z.string().trim().min(1, "El nombre científico es obligatorio."),
  classification: z.enum(["recalcitrante", "intermedia", "ortodoxa", "vareta"]),
  available_months: z.string().trim().optional(),
  seeds_per_kilo: z.coerce.number().int("Debe ser un número entero.").positive("Debe ser mayor a 0.").optional(),
  unit_price: z.coerce.number().min(0, "No puede ser negativo."),
  stock_kg: z.coerce.number().min(0, "No puede ser negativo."),
});

export interface SeedFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function parseSeedForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return seedSchema.safeParse({
    ...raw,
    seeds_per_kilo: raw.seeds_per_kilo ? raw.seeds_per_kilo : undefined,
  });
}

function fieldErrorsFrom(parsed: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of parsed.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createSeed(_prev: SeedFormState, formData: FormData): Promise<SeedFormState> {
  await requireProfile();
  const parsed = parseSeedForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("seeds").insert(parsed.data);
  if (error) {
    return { error: "No se pudo guardar la semilla. Intenta de nuevo." };
  }

  revalidatePath("/semillas");
  revalidatePath("/dashboard");
  redirect("/semillas");
}

export async function updateSeed(id: string, _prev: SeedFormState, formData: FormData): Promise<SeedFormState> {
  await requireProfile();
  const parsed = parseSeedForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("seeds").update(parsed.data).eq("id", id);
  if (error) {
    return { error: "No se pudo actualizar la semilla. Intenta de nuevo." };
  }

  revalidatePath("/semillas");
  revalidatePath("/dashboard");
  redirect("/semillas");
}

export async function deleteSeed(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("seeds").delete().eq("id", id);
  revalidatePath("/semillas");
  revalidatePath("/dashboard");
}
