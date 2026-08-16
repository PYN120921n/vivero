"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Modal construido sobre <dialog>, el elemento nativo del navegador: da
 * accesibilidad (foco atrapado, cierre con Esc, capa superior) sin librerías
 * adicionales.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto rounded-2xl border border-stone-200 p-0 shadow-xl backdrop:bg-forest-950/40 w-[90vw] max-w-md"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
        <h2 className="font-display text-lg text-forest-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-forest-800 rounded-full p-1 hover:bg-stone-100"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
