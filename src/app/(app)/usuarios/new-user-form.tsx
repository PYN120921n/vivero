"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field, Input, Select } from "@/components/ui/form";
import { Button, LinkButton } from "@/components/ui/button";
import { createUser, type UserFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando…" : "Crear usuario"}
    </Button>
  );
}

export function NewUserForm() {
  const [state, formAction] = useActionState(createUser, {} as UserFormState);

  return (
    <form action={formAction} className="space-y-5 max-w-md">
      <Field label="Nombre completo" htmlFor="full_name" required error={state.fieldErrors?.full_name}>
        <Input id="full_name" name="full_name" required />
      </Field>
      <Field label="Correo electrónico" htmlFor="email" required error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Contraseña temporal" htmlFor="password" required hint="Compártela con la persona; podrá cambiarla después." error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="text" minLength={8} required />
      </Field>
      <Field label="Rol" htmlFor="role" required>
        <Select id="role" name="role" defaultValue="usuario">
          <option value="usuario">Usuario</option>
          <option value="superadmin">Superadmin</option>
        </Select>
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <SubmitButton />
        <LinkButton href="/usuarios" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
