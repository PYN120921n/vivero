import { PlantForm } from "../plant-form";
import { createPlant } from "../actions";

export default function NewPlantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-900">Nueva planta</h1>
        <p className="text-sm text-stone-500">Agrega una especie al catálogo de plantas.</p>
      </div>
      <PlantForm action={createPlant} submitLabel="Guardar planta" />
    </div>
  );
}
