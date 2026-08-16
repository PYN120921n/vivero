import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeedForm } from "../../seed-form";
import { updateSeed } from "../../actions";

export default async function EditSeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: seed } = await supabase.from("seeds").select("*").eq("id", id).single();

  if (!seed) notFound();

  const action = updateSeed.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Editar semilla</h1>
        <p className="text-sm text-stone-500">
          {seed.code} · {seed.common_name}
        </p>
      </div>
      <SeedForm action={action} seed={seed} submitLabel="Guardar cambios" />
    </div>
  );
}
