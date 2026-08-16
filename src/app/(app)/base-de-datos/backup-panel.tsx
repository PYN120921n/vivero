"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackupPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "Esto reemplaza TODAS las semillas, plantas y cotizaciones actuales con lo que traiga este archivo. Esta acción no se puede deshacer. ¿Continuar?"
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setRestoring(true);
    setMessage(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "No se pudo restaurar el respaldo." });
      } else {
        setMessage({ type: "success", text: "Respaldo restaurado correctamente." });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "No se pudo leer el archivo." });
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <a href="/api/backup/export">
          <Button variant="secondary">
            <Download size={16} /> Descargar respaldo (JSON)
          </Button>
        </a>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={restoring}>
          <Upload size={16} /> {restoring ? "Restaurando…" : "Restaurar desde archivo"}
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      </div>

      <p className="flex items-start gap-2 text-xs text-stone-500">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        Restaurar reemplaza todo el catálogo y el historial de cotizaciones con el contenido del archivo. No afecta las
        cuentas de usuario ni el estado del killswitch.
      </p>

      {message && (
        <p className={`text-sm rounded-lg px-3 py-2 border ${message.type === "success" ? "bg-forest-50 text-forest-800 border-forest-200" : "bg-red-50 text-red-700 border-red-100"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
