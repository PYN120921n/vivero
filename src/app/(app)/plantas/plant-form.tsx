"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input } from "@/components/ui/form";
import { Button, LinkButton } from "@/components/ui/button";
import type { Plant } from "@/lib/types";
import type { PlantFormState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : label}
    </Button>
  );
}

export function PlantForm({
  action,
  plant,
  submitLabel,
}: {
  action: (prev: PlantFormState, formData: FormData) => Promise<PlantFormState>;
  plant?: Plant;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre común" htmlFor="common_name" required error={state.fieldErrors?.common_name}>
          <Input id="common_name" name="common_name" defaultValue={plant?.common_name} required />
        </Field>
        <Field label="Nombre científico" htmlFor="scientific_name" required error={state.fieldErrors?.scientific_name}>
          <Input id="scientific_name" name="scientific_name" defaultValue={plant?.scientific_name} required />
        </Field>
      </div>

      <p className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
        El precio, tamaño de bolsa y altura se definen al agregar la planta a una cotización, ya que varían según lo que pida cada cliente.
      </p>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <LinkButton href="/plantas" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
