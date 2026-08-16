"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Check, X, Copy, Trash2, Receipt, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Modal } from "@/components/ui/modal";
import { approveQuotation, rejectQuotation, duplicateQuotation, deleteQuotation, markAsInvoiced } from "../actions";
import type { QuotationStatus } from "@/lib/types";

type ApproveResult = Awaited<ReturnType<typeof approveQuotation>>;
type Issue = NonNullable<ApproveResult["issues"]>[number];

export function QuotationActions({ id, status }: { id: string; status: QuotationStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [issues, setIssues] = useState<Issue[] | null>(null);

  function handleApprove(force: boolean) {
    startTransition(async () => {
      const result = await approveQuotation(id, force);
      if (!result.success && result.issues && result.issues.length > 0) {
        setIssues(result.issues);
        return;
      }
      setIssues(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <a href={`/api/cotizaciones/${id}/pdf`} target="_blank" rel="noopener noreferrer">
          <Button variant="primary" size="sm">
            <Download size={15} /> Descargar PDF
          </Button>
        </a>

        {status === "pendiente" && (
          <>
            <Button variant="secondary" size="sm" onClick={() => handleApprove(false)} disabled={isPending}>
              <Check size={15} /> Aprobar
            </Button>
            <form action={rejectQuotation}>
              <input type="hidden" name="id" value={id} />
              <ConfirmSubmitButton confirmMessage="¿Rechazar esta cotización?" variant="secondary" size="sm">
                <X size={15} /> Rechazar
              </ConfirmSubmitButton>
            </form>
          </>
        )}

        {status === "aprobada" && (
          <form action={markAsInvoiced}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="secondary" size="sm">
              <Receipt size={15} /> Marcar como facturada
            </Button>
          </form>
        )}

        <form action={duplicateQuotation}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="secondary" size="sm">
            <Copy size={15} /> Duplicar
          </Button>
        </form>

        <form action={deleteQuotation}>
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmitButton
            confirmMessage="¿Eliminar esta cotización? Esta acción no se puede deshacer."
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} /> Eliminar
          </ConfirmSubmitButton>
        </form>
      </div>

      <Modal open={issues !== null} onClose={() => setIssues(null)} title="Hay problemas de existencias">
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Al aprobar esta cotización se descuenta el stock de semillas. Se encontraron los siguientes problemas:
          </p>
          <ul className="space-y-2">
            {issues?.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm rounded-lg bg-clay-50 border border-clay-200 px-3 py-2">
                <AlertTriangle size={15} className="text-clay-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{issue.item}</strong>
                  {issue.issue === "stock_insuficiente" ? (
                    <> — disponible: {issue.disponible} kg, solicitado: {issue.solicitado} kg</>
                  ) : (
                    <> — ya no existe en el catálogo</>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <Button variant="danger" size="sm" onClick={() => handleApprove(true)} disabled={isPending}>
              Aprobar de todas formas
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIssues(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
