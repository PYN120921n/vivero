"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { calculateQuoteTotals } from "@/lib/utils";

const itemSchema = z.object({
  seedId: z.string().uuid().optional(),
  plantId: z.string().uuid().optional(),
  commonName: z.string().min(1),
  scientificName: z.string().optional(),
  classification: z.enum(["recalcitrante", "intermedia", "ortodoxa", "vareta"]).optional(),
  availableMonths: z.string().optional(),
  seedsPerKilo: z.number().int().positive().optional(),
  bagSize: z.enum(["13x20", "25x25", "30x30", "30x40", "40x40"]).optional(),
  height: z.enum(["20-30", "40-50", "50-60", "60-70", "80-90", "100", "150", "180", "200", "300"]).optional(),
  unitPrice: z.number().min(0),
  quantity: z.number().positive(),
});

const createQuotationSchema = z.object({
  productType: z.enum(["semillas", "plantas"]),
  clientName: z.string().trim().min(1, "El nombre del cliente es obligatorio."),
  clientAddress: z.string().trim().optional(),
  quoteDate: z.string().min(1),
  validityDays: z.number().int().positive(),
  quoteCity: z.string().trim().min(1),
  notes: z.string(),
  conditions: z.array(z.string()),
  taxRate: z.number().min(0),
  discountType: z.enum(["none", "fixed", "percentage"]),
  discountValue: z.number().min(0),
  shippingCost: z.number().min(0),
  items: z.array(itemSchema).min(1, "Agrega al menos un producto a la cotización."),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

export async function createQuotation(
  input: CreateQuotationInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireProfile();
  const parsed = createQuotationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const totals = calculateQuoteTotals({
    items: data.items.map((i) => ({ unit_price: i.unitPrice, quantity: i.quantity })),
    taxRate: data.taxRate,
    discountType: data.discountType,
    discountValue: data.discountValue,
    shippingCost: data.shippingCost,
  });

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("create_quotation_with_items", {
    p_quotation: {
      product_type: data.productType,
      client_name: data.clientName,
      client_address: data.clientAddress || null,
      quote_date: data.quoteDate,
      validity_days: data.validityDays,
      quote_city: data.quoteCity,
      notes: data.notes,
      conditions: data.conditions,
      tax_rate: data.taxRate,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      shipping_cost: data.shippingCost,
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      tax_amount: totals.taxAmount,
      total: totals.total,
    },
    p_items: data.items.map((i) => ({
      seed_id: i.seedId ?? "",
      plant_id: i.plantId ?? "",
      common_name: i.commonName,
      scientific_name: i.scientificName ?? "",
      classification: i.classification ?? "",
      available_months: i.availableMonths ?? "",
      seeds_per_kilo: i.seedsPerKilo ?? "",
      bag_size: i.bagSize ?? "",
      height: i.height ?? "",
      unit_price: i.unitPrice,
      quantity: i.quantity,
      subtotal: Math.round(i.unitPrice * i.quantity * 100) / 100,
    })),
  });

  if (error || !id) {
    return { ok: false, error: "No se pudo crear la cotización. Intenta de nuevo." };
  }

  revalidatePath("/cotizaciones");
  revalidatePath("/dashboard");
  return { ok: true, id: id as string };
}

export async function approveQuotation(id: string, force: boolean) {
  await requireProfile();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("approve_quotation", { p_quotation_id: id, p_force: force });
  revalidatePath(`/cotizaciones/${id}`);
  revalidatePath("/cotizaciones");
  revalidatePath("/semillas");
  revalidatePath("/dashboard");
  if (error || !data) return { success: false as const, issues: undefined };
  return data;
}

export async function rejectQuotation(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("quotations").update({ status: "rechazada" }).eq("id", id);
  revalidatePath(`/cotizaciones/${id}`);
  revalidatePath("/cotizaciones");
  revalidatePath("/dashboard");
}

export async function markAsInvoiced(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("quotations").update({ status: "facturada" }).eq("id", id);
  revalidatePath(`/cotizaciones/${id}`);
  revalidatePath("/cotizaciones");
}

export async function duplicateQuotation(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { data: newId } = await supabase.rpc("duplicate_quotation", { p_quotation_id: id });
  revalidatePath("/cotizaciones");
  revalidatePath("/dashboard");
  if (newId) redirect(`/cotizaciones/${newId}`);
}

export async function deleteQuotation(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("quotations").delete().eq("id", id);
  revalidatePath("/cotizaciones");
  revalidatePath("/dashboard");
  redirect("/cotizaciones");
}
