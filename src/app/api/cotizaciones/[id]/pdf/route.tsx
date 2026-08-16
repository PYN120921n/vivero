import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { QuotePDF } from "@/lib/pdf/QuotePDF";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireProfile();
  const { id } = await params;

  const supabase = await createClient();
  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!quotation) {
    return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", id)
    .order("sort_order", { ascending: true });

  const buffer = await renderToBuffer(<QuotePDF quotation={quotation} items={items ?? []} />);
  const filename = `cotizacion-${quotation.folio.replace("/", "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
