"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperadmin } from "@/lib/auth";

export async function setSystemActive(formData: FormData) {
  const profile = await requireSuperadmin();
  const active = formData.get("active") === "true";
  const reason = String(formData.get("reason") || "").trim();

  const supabase = await createClient();
  await supabase
    .from("system_settings")
    .update({
      is_active: active,
      suspended_reason: active ? null : reason || null,
      suspended_by: active ? null : profile.id,
      suspended_at: active ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  revalidatePath("/base-de-datos");
  revalidatePath("/dashboard");
}
