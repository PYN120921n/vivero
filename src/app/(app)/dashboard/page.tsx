import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { QUOTATION_STATUS_LABELS } from "@/lib/constants";
import type { QuotationStatus } from "@/lib/types";
import { Sprout, Trees, FileClock, AlertTriangle, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [seedsCountRes, plantsCountRes, quotationStatusesRes, recentRes, lowStockRes] = await Promise.all([
    supabase.from("seeds").select("id", { count: "exact", head: true }),
    supabase.from("plants").select("id", { count: "exact", head: true }),
    supabase.from("quotations").select("status"),
    supabase
      .from("quotations")
      .select("id, folio, client_name, product_type, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("seeds").select("id, common_name, stock_kg").lt("stock_kg", 5).order("stock_kg", { ascending: true }).limit(6),
  ]);

  const statuses = quotationStatusesRes.data ?? [];
  const pendingCount = statuses.filter((q) => q.status === "pendiente").length;
  const approvedCount = statuses.filter((q) => q.status === "aprobada").length;

  const stats = [
    { label: "Semillas en catálogo", value: seedsCountRes.count ?? 0, icon: Sprout, href: "/semillas" },
    { label: "Plantas en catálogo", value: plantsCountRes.count ?? 0, icon: Trees, href: "/plantas" },
    { label: "Cotizaciones pendientes", value: pendingCount, icon: FileClock, href: "/cotizaciones?status=pendiente" },
    { label: "Cotizaciones aprobadas", value: approvedCount, icon: FileClock, href: "/cotizaciones?status=aprobada" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Panel</h1>
          <p className="text-sm text-stone-500">Resumen del inventario y las cotizaciones de Vivero Chaka.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/cotizaciones/nueva/semillas" size="sm" variant="secondary">
            <Plus size={16} /> Cotizar semillas
          </LinkButton>
          <LinkButton href="/cotizaciones/nueva/plantas" size="sm">
            <Plus size={16} /> Cotizar plantas
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-forest-300 transition-colors h-full">
              <CardBody className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-stone-500">{stat.label}</p>
                  <p className="font-display text-3xl text-forest-900 mt-1">{stat.value}</p>
                </div>
                <div className="rounded-full bg-forest-50 text-forest-700 p-2">
                  <stat.icon size={18} />
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Cotizaciones recientes</h2>
            <Link href="/cotizaciones" className="text-sm text-forest-700 hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentRes.data && recentRes.data.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {recentRes.data.map((q) => (
                  <li key={q.id}>
                    <Link href={`/cotizaciones/${q.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-stone-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-forest-900 truncate">{q.client_name}</p>
                        <p className="text-xs text-stone-500">
                          {q.folio} · {formatShortDate(q.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-forest-800">{formatCurrency(q.total)}</span>
                        <Badge tone={statusTone(q.status)}>{QUOTATION_STATUS_LABELS[q.status]}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500 px-5 py-8 text-center">Aún no hay cotizaciones registradas.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Stock bajo</h2>
          </CardHeader>
          <CardBody className="p-0">
            {lowStockRes.data && lowStockRes.data.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {lowStockRes.data.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="text-sm text-forest-900 truncate">{s.common_name}</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-clay-700">
                      <AlertTriangle size={13} />
                      {s.stock_kg} kg
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500 px-5 py-8 text-center">Sin alertas de inventario.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function statusTone(status: QuotationStatus): "warning" | "success" | "danger" | "info" {
  if (status === "pendiente") return "warning";
  if (status === "aprobada") return "success";
  if (status === "rechazada") return "danger";
  return "info";
}
