"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

const plantSchema = z.object({
  common_name: z.string().trim().min(1, "El nombre común es obligatorio."),
  scientific_name: z.string().trim().min(1, "El nombre científico es obligatorio."),
});

export interface PlantFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsFrom(parsed: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of parsed.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createPlant(_prev: PlantFormState, formData: FormData): Promise<PlantFormState> {
  await requireProfile();
  const parsed = plantSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("plants").insert(parsed.data);
  if (error) return { error: "No se pudo guardar la planta. Intenta de nuevo." };

  revalidatePath("/plantas");
  revalidatePath("/dashboard");
  redirect("/plantas");
}

export async function updatePlant(id: string, _prev: PlantFormState, formData: FormData): Promise<PlantFormState> {
  await requireProfile();
  const parsed = plantSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("plants").update(parsed.data).eq("id", id);
  if (error) return { error: "No se pudo actualizar la planta. Intenta de nuevo." };

  revalidatePath("/plantas");
  redirect("/plantas");
}

export async function deletePlant(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("plants").delete().eq("id", id);
  revalidatePath("/plantas");
  revalidatePath("/dashboard");
}
