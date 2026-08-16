"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input, Select } from "@/components/ui/form";
import { Button, LinkButton } from "@/components/ui/button";
import { SEED_CLASSIFICATION_LABELS } from "@/lib/constants";
import type { Seed } from "@/lib/types";
import type { SeedFormState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : label}
    </Button>
  );
}

export function SeedForm({
  action,
  seed,
  submitLabel,
}: {
  action: (prev: SeedFormState, formData: FormData) => Promise<SeedFormState>;
  seed?: Seed;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre común" htmlFor="common_name" required error={state.fieldErrors?.common_name}>
          <Input id="common_name" name="common_name" defaultValue={seed?.common_name} required />
        </Field>
        <Field label="Nombre científico" htmlFor="scientific_name" required error={state.fieldErrors?.scientific_name}>
          <Input id="scientific_name" name="scientific_name" defaultValue={seed?.scientific_name} required />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Clasificación" htmlFor="classification" required error={state.fieldErrors?.classification}>
          <Select id="classification" name="classification" defaultValue={seed?.classification ?? "intermedia"}>
            {Object.entries(SEED_CLASSIFICATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Meses disponibles" htmlFor="available_months" hint="Ej. Mayo-Junio, o Todo el año">
          <Input id="available_months" name="available_months" defaultValue={seed?.available_months ?? ""} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Semillas por kilo" htmlFor="seeds_per_kilo" error={state.fieldErrors?.seeds_per_kilo}>
          <Input id="seeds_per_kilo" name="seeds_per_kilo" type="number" min={1} step={1} defaultValue={seed?.seeds_per_kilo ?? ""} />
        </Field>
        <Field label="Precio por kilo (MXN)" htmlFor="unit_price" required error={state.fieldErrors?.unit_price}>
          <Input id="unit_price" name="unit_price" type="number" min={0} step="0.01" defaultValue={seed?.unit_price ?? 0} required />
        </Field>
        <Field label="Existencias (kg)" htmlFor="stock_kg" required error={state.fieldErrors?.stock_kg}>
          <Input id="stock_kg" name="stock_kg" type="number" min={0} step="0.01" defaultValue={seed?.stock_kg ?? 0} required />
        </Field>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <LinkButton href="/semillas" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
