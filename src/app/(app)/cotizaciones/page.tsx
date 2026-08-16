import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Table, Th, Td, Badge } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { QUOTATION_STATUS_LABELS } from "@/lib/constants";
import type { QuotationProductType, QuotationStatus } from "@/lib/types";
import { FileSpreadsheet, Search } from "lucide-react";

type SearchParams = { q?: string; status?: string; type?: string };

const VALID_STATUSES: QuotationStatus[] = ["pendiente", "aprobada", "rechazada", "facturada"];
const VALID_TYPES: QuotationProductType[] = ["semillas", "plantas"];

export default async function QuotationHistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, status, type } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("quotations").select("*").order("created_at", { ascending: false });
  if (status && VALID_STATUSES.includes(status as QuotationStatus)) query = query.eq("status", status as QuotationStatus);
  if (type && VALID_TYPES.includes(type as QuotationProductType)) query = query.eq("product_type", type as QuotationProductType);
  if (q) query = query.or(`client_name.ilike.%${q}%,folio.ilike.%${q}%`);

  const { data: quotations } = await query.limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Historial de cotizaciones</h1>
        <p className="text-sm text-stone-500">Todas las cotizaciones generadas, con su estado actual.</p>
      </div>

      <Card>
        <CardBody>
          <form className="grid sm:grid-cols-[1fr_auto_auto] gap-3 mb-4" action="/cotizaciones">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input name="q" defaultValue={q} placeholder="Buscar por cliente o folio…" className="pl-9" />
            </div>
            <Select name="status" defaultValue={status ?? ""} wrapperClassName="w-auto">
              <option value="">Todos los estados</option>
              {Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select name="type" defaultValue={type ?? ""} wrapperClassName="w-auto">
              <option value="">Semillas y plantas</option>
              <option value="semillas">Semillas</option>
              <option value="plantas">Plantas</option>
            </Select>
          </form>

          {quotations && quotations.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Folio</Th>
                  <Th>Cliente</Th>
                  <Th>Tipo</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-stone-50">
                    <Td>
                      <Link href={`/cotizaciones/${quote.id}`} className="font-mono text-xs text-forest-700 hover:underline">
                        {quote.folio}
                      </Link>
                    </Td>
                    <Td>
                      <Link href={`/cotizaciones/${quote.id}`} className="font-medium text-forest-900 hover:underline">
                        {quote.client_name}
                      </Link>
                    </Td>
                    <Td className="capitalize text-stone-600">{quote.product_type}</Td>
                    <Td className="text-stone-600">{formatShortDate(quote.quote_date)}</Td>
                    <Td className="text-right font-medium text-forest-900">{formatCurrency(quote.total)}</Td>
                    <Td>
                      <Badge tone={statusTone(quote.status)}>{QUOTATION_STATUS_LABELS[quote.status]}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <FileSpreadsheet className="mx-auto text-stone-300" size={40} />
              <p className="mt-3 text-stone-500">{q || status || type ? "No se encontraron cotizaciones." : "Aún no hay cotizaciones."}</p>
              <div className="flex justify-center gap-2 mt-4">
                <LinkButton href="/cotizaciones/nueva/semillas" size="sm" variant="secondary">
                  Cotizar semillas
                </LinkButton>
                <LinkButton href="/cotizaciones/nueva/plantas" size="sm">
                  Cotizar plantas
                </LinkButton>
              </div>
            </div>
          )}
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
