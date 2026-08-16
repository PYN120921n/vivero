import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperadmin } from "@/lib/auth";

export const runtime = "nodejs";

const backupSchema = z.object({
  seeds: z.array(z.record(z.string(), z.unknown())).optional(),
  plants: z.array(z.record(z.string(), z.unknown())).optional(),
  quotations: z.array(z.record(z.string(), z.unknown())).optional(),
  quotation_items: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function POST(request: Request) {
  await requireSuperadmin();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "El archivo no es un JSON válido." }, { status: 400 });
  }

  const parsed = backupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "El archivo no tiene el formato esperado de un respaldo." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("restore_backup", { p_payload: parsed.data });

  if (error) {
    return NextResponse.json({ error: "No se pudo restaurar el respaldo." }, { status: 500 });
  }

  return NextResponse.json(data);
}
