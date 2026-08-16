"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/auth";

const createUserSchema = z.object({
  email: z.string().trim().email("Correo inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  full_name: z.string().trim().min(1, "El nombre es obligatorio."),
  role: z.enum(["usuario", "superadmin"]),
});

export interface UserFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  await requireSuperadmin();

  const parsed = createUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Revisa los campos marcados.", fieldErrors };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (error || !data.user) {
    return { error: error?.message === "User already registered" ? "Ese correo ya tiene una cuenta." : "No se pudo crear el usuario." };
  }

  if (parsed.data.role === "superadmin") {
    await admin.from("profiles").update({ role: "superadmin" }).eq("id", data.user.id);
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function setUserRole(formData: FormData) {
  const actor = await requireSuperadmin();
  const id = String(formData.get("id"));
  const role = String(formData.get("role"));

  if (id === actor.id) return;
  if (role !== "usuario" && role !== "superadmin") return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/usuarios");
}

export async function deleteUser(formData: FormData) {
  const actor = await requireSuperadmin();
  const id = String(formData.get("id"));

  if (id === actor.id) return;

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/usuarios");
}
