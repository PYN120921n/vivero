import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlantForm } from "../../plant-form";
import { updatePlant } from "../../actions";

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plant } = await supabase.from("plants").select("*").eq("id", id).single();

  if (!plant) notFound();

  const action = updatePlant.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Editar planta</h1>
        <p className="text-sm text-stone-500">
          {plant.code} · {plant.common_name}
        </p>
      </div>
      <PlantForm action={action} plant={plant} submitLabel="Guardar cambios" />
    </div>
  );
}
