import { SeedForm } from "../seed-form";
import { createSeed } from "../actions";

export default function NewSeedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Nueva semilla</h1>
        <p className="text-sm text-stone-500">Agrega una especie al catálogo de semillas.</p>
      </div>
      <SeedForm action={createSeed} submitLabel="Guardar semilla" />
    </div>
  );
}
