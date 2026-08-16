import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperadmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  await requireSuperadmin();
  const supabase = await createClient();

  const [seeds, plants, quotations, quotationItems, settings] = await Promise.all([
    supabase.from("seeds").select("*"),
    supabase.from("plants").select("*"),
    supabase.from("quotations").select("*"),
    supabase.from("quotation_items").select("*"),
    supabase.from("system_settings").select("*").eq("id", 1).single(),
  ]);

  const backup = {
    exported_at: new Date().toISOString(),
    version: 1,
    system_status_at_export: settings.data?.is_active ?? true,
    seeds: seeds.data ?? [],
    plants: plants.data ?? [],
    quotations: quotations.data ?? [],
    quotation_items: quotationItems.data ?? [],
  };

  const filename = `respaldo-mexico-primero-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
