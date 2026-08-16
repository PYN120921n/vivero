"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { setSystemActive } from "./actions";
import type { SystemSettings } from "@/lib/types";

function SubmitButton({ willSuspend }: { willSuspend: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={willSuspend ? "danger" : "primary"} disabled={pending}>
      {pending ? "Guardando…" : willSuspend ? "Suspender sistema" : "Reactivar sistema"}
    </Button>
  );
}

export function KillswitchPanel({ settings }: { settings: SystemSettings }) {
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (settings.is_active) {
      if (!window.confirm('Esto bloquea el acceso a todo el equipo con rol "usuario" de inmediato. ¿Continuar?')) {
        e.preventDefault();
      }
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${
          settings.is_active ? "bg-forest-50 text-forest-800" : "bg-red-50 text-red-700"
        }`}
      >
        {settings.is_active ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
        <div className="text-sm">
          <p className="font-medium">{settings.is_active ? "El sistema está activo" : "El sistema está suspendido"}</p>
          {!settings.is_active && settings.suspended_reason && (
            <p className="text-xs opacity-80">Motivo: {settings.suspended_reason}</p>
          )}
        </div>
      </div>

      <form action={setSystemActive} onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="active" value={(!settings.is_active).toString()} />
        {settings.is_active && (
          <Textarea
            name="reason"
            placeholder="Motivo de la suspensión (opcional, lo verás tú al reactivar)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        )}
        <SubmitButton willSuspend={settings.is_active} />
      </form>
    </div>
  );
}
