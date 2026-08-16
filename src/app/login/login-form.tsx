"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field label="Correo electrónico" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="tucorreo@mexicoprimero.mx" required />
      </Field>
      <Field label="Contraseña" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
