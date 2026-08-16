import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Table, Th, Td } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { deletePlant } from "./actions";
import { Plus, Pencil, Trash2, Search, Trees } from "lucide-react";

export default async function PlantsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("plants").select("*").order("common_name", { ascending: true });
  if (q) {
    query = query.or(`common_name.ilike.%${q}%,scientific_name.ilike.%${q}%`);
  }
  const { data: plants } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Plantas</h1>
          <p className="text-sm text-stone-500">Catálogo de especies disponibles para cotizar.</p>
        </div>
        <LinkButton href="/plantas/nueva">
          <Plus size={16} /> Nueva planta
        </LinkButton>
      </div>

      <Card>
        <CardBody>
          <form className="mb-4" action="/plantas">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input name="q" defaultValue={q} placeholder="Buscar por nombre…" className="pl-9" />
            </div>
          </form>

          {plants && plants.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Código</Th>
                  <Th>Nombre común</Th>
                  <Th>Nombre científico</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-stone-50">
                    <Td className="text-stone-500 font-mono text-xs">{plant.code}</Td>
                    <Td className="font-medium text-forest-900">{plant.common_name}</Td>
                    <Td className="text-stone-600 italic">{plant.scientific_name}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <LinkButton href={`/plantas/${plant.id}/editar`} variant="ghost" size="sm" aria-label="Editar">
                          <Pencil size={15} />
                        </LinkButton>
                        <form action={deletePlant}>
                          <input type="hidden" name="id" value={plant.id} />
                          <ConfirmSubmitButton
                            confirmMessage={`¿Eliminar "${plant.common_name}" del catálogo? Esto no afecta cotizaciones ya generadas.`}
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
              <Trees className="mx-auto text-stone-300" size={40} />
              <p className="mt-3 text-stone-500">{q ? "No se encontraron plantas." : "Aún no hay plantas registradas."}</p>
              {!q && (
                <LinkButton href="/plantas/nueva" size="sm" className="mt-4">
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
