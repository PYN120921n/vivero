import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Table, Th, Td, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { formatCurrency } from "@/lib/utils";
import { SEED_CLASSIFICATION_LABELS } from "@/lib/constants";
import { deleteSeed } from "./actions";
import { Plus, Pencil, Trash2, Search, Sprout } from "lucide-react";

export default async function SeedsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("seeds").select("*").order("common_name", { ascending: true });
  if (q) {
    query = query.or(`common_name.ilike.%${q}%,scientific_name.ilike.%${q}%`);
  }
  const { data: seeds } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Semillas</h1>
          <p className="text-sm text-stone-500">Catálogo e inventario de semillas para reforestación.</p>
        </div>
        <LinkButton href="/semillas/nueva">
          <Plus size={16} /> Nueva semilla
        </LinkButton>
      </div>

      <Card>
        <CardBody>
          <form className="mb-4" action="/semillas">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input name="q" defaultValue={q} placeholder="Buscar por nombre…" className="pl-9" />
            </div>
          </form>

          {seeds && seeds.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Código</Th>
                  <Th>Nombre</Th>
                  <Th>Clasificación</Th>
                  <Th>Meses disponibles</Th>
                  <Th className="text-right">Precio/kg</Th>
                  <Th className="text-right">Existencias</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {seeds.map((seed) => (
                  <tr key={seed.id} className="hover:bg-stone-50">
                    <Td className="text-stone-500 font-mono text-xs">{seed.code}</Td>
                    <Td>
                      <p className="font-medium text-forest-900">{seed.common_name}</p>
                      <p className="text-xs text-stone-500 italic">{seed.scientific_name}</p>
                    </Td>
                    <Td>
                      <Badge tone="neutral">{SEED_CLASSIFICATION_LABELS[seed.classification]}</Badge>
                    </Td>
                    <Td className="text-stone-600">{seed.available_months || "—"}</Td>
                    <Td className="text-right font-medium text-forest-900">{formatCurrency(seed.unit_price)}</Td>
                    <Td className="text-right">
                      <span className={seed.stock_kg < 5 ? "text-clay-700 font-medium" : "text-stone-700"}>
                        {seed.stock_kg} kg
                      </span>
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <LinkButton href={`/semillas/${seed.id}/editar`} variant="ghost" size="sm" aria-label="Editar">
                          <Pencil size={15} />
                        </LinkButton>
                        <form action={deleteSeed}>
                          <input type="hidden" name="id" value={seed.id} />
                          <ConfirmSubmitButton
                            confirmMessage={`¿Eliminar "${seed.common_name}" del catálogo? Esto no afecta cotizaciones ya generadas.`}
                            variant="ghost"
                            size="sm"
                            aria-label="Eliminar"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <Sprout className="mx-auto text-stone-300" size={40} />
              <p className="mt-3 text-stone-500">{q ? "No se encontraron semillas." : "Aún no hay semillas registradas."}</p>
              {!q && (
                <LinkButton href="/semillas/nueva" size="sm" className="mt-4">
                  <Plus size={16} /> Agregar la primera
                </LinkButton>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
