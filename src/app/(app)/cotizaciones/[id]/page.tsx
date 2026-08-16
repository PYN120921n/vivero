import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge, Table, Th, Td } from "@/components/ui/card";
import { formatCurrency, formatQuoteDateLine, formatShortDate } from "@/lib/utils";
import { QUOTATION_STATUS_LABELS, SEED_CLASSIFICATION_LABELS, SIGNATURES } from "@/lib/constants";
import { QuotationActions } from "./quotation-actions";
import { ChevronLeft } from "lucide-react";
import type { QuotationStatus } from "@/lib/types";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!quotation) notFound();

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/cotizaciones" className="text-sm text-forest-700 hover:underline flex items-center gap-1 mb-3">
          <ChevronLeft size={15} /> Historial de cotizaciones
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl text-forest-900">{quotation.folio}</h1>
              <Badge tone={statusTone(quotation.status)}>{QUOTATION_STATUS_LABELS[quotation.status]}</Badge>
            </div>
            <p className="text-sm text-stone-500 mt-0.5">
              {quotation.client_name} · {formatShortDate(quotation.quote_date)}
            </p>
          </div>
          <QuotationActions id={quotation.id} status={quotation.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg text-forest-900">Detalle de la cotización</h2>
        </CardHeader>
        <CardBody className="space-y-5">
          <p className="text-sm text-stone-600">{formatQuoteDateLine(quotation.quote_date, quotation.quote_city)}</p>
          <p className="text-sm text-stone-600">
            Válida hasta el <strong>{formatShortDate(quotation.valid_until)}</strong>
          </p>
          {quotation.client_address && <p className="text-sm text-stone-600">{quotation.client_address}</p>}
          <p className="text-sm text-forest-800 italic">{quotation.notes}</p>

          <Table>
            <thead>
              <tr>
                <Th>Producto</Th>
                {quotation.product_type === "semillas" ? (
                  <>
                    <Th>Clasificación</Th>
                    <Th className="text-right">Semillas/kg</Th>
                  </>
                ) : (
                  <Th>Bolsa / Altura</Th>
                )}
                <Th className="text-right">Precio</Th>
                <Th className="text-right">Cantidad</Th>
                <Th className="text-right">Subtotal</Th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id}>
                  <Td>
                    <p className="font-medium text-forest-900">{item.common_name}</p>
                    <p className="text-xs text-stone-500 italic">{item.scientific_name}</p>
                  </Td>
                  {quotation.product_type === "semillas" ? (
                    <>
                      <Td>{item.classification ? SEED_CLASSIFICATION_LABELS[item.classification] : "—"}</Td>
                      <Td className="text-right">{item.seeds_per_kilo ?? "—"}</Td>
                    </>
                  ) : (
                    <Td className="text-xs text-stone-600">
                      {item.bag_size} cm · {item.height} cm
                    </Td>
                  )}
                  <Td className="text-right">{formatCurrency(item.unit_price)}</Td>
                  <Td className="text-right">
                    {item.quantity} {quotation.product_type === "semillas" ? "kg" : "pza"}
                  </Td>
                  <Td className="text-right font-medium text-forest-900">{formatCurrency(item.subtotal)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              {quotation.discount_amount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Descuento</span>
                  <span>−{formatCurrency(quotation.discount_amount)}</span>
                </div>
              )}
              {quotation.tax_amount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>IVA</span>
                  <span>{formatCurrency(quotation.tax_amount)}</span>
                </div>
              )}
              {quotation.shipping_cost > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Envío</span>
                  <span>{formatCurrency(quotation.shipping_cost)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg text-forest-900 pt-1.5 border-t border-stone-200">
                <span>Total</span>
                <span>{formatCurrency(quotation.total)}</span>
              </div>
            </div>
          </div>

          {quotation.conditions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-forest-800 mb-2">Condiciones</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-stone-600">
                {quotation.conditions.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="pt-4 border-t border-stone-200 grid sm:grid-cols-2 gap-4">
            {SIGNATURES.map((s) => (
              <div key={s.name} className="text-sm text-stone-600">
                <p className="font-medium text-forest-900">{s.name}</p>
                <p className="text-xs">{s.title}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function statusTone(status: QuotationStatus): "warning" | "success" | "danger" | "info" {
  if (status === "pendiente") return "warning";
  if (status === "aprobada") return "success";
  if (status === "rechazada") return "danger";
  return "info";
}
