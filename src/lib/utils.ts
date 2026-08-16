import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DiscountType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value ?? 0);
}

/**
 * Convierte a Date de forma segura para ambos casos que llegan de Supabase:
 *
 * - Columnas `date`:
 *   "2026-08-16"
 *   Se anclan a mediodía local para evitar que la fecha se recorra
 *   un día por diferencias de huso horario.
 *
 * - Columnas `timestamptz`:
 *   "2026-08-16T14:00:07+00:00"
 *   Ya contienen hora y zona horaria, por lo que se parsean directamente.
 *
 * Esto evita errores como:
 * RangeError: Invalid time value
 */
function toDate(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T12:00:00`)
    : new Date(date);
}

/** "12 de agosto de 2026" */
export function formatLongDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(date));
}

/**
 * "Mérida, Yucatán, a 12 de agosto de 2026"
 *
 * Replica el formato de las cotizaciones originales.
 */
export function formatQuoteDateLine(
  date: string | Date,
  city: string
): string {
  return `${city}, a ${formatLongDate(date)}`;
}

/** "12/08/2026" */
export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(date));
}

export interface QuoteTotalsInput {
  items: Array<{
    unit_price: number;
    quantity: number;
  }>;
  taxRate: number;
  discountType: DiscountType;
  discountValue: number;
  shippingCost: number;
}

export interface QuoteTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Calcula:
 *
 * subtotal → descuento → impuesto → total
 *
 * Se utiliza tanto en el formulario (para la vista previa en vivo)
 * como al guardar la cotización, para mantener los valores sincronizados.
 */
export function calculateQuoteTotals({
  items,
  taxRate,
  discountType,
  discountValue,
  shippingCost,
}: QuoteTotalsInput): QuoteTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = subtotal * (discountValue / 100);
  } else if (discountType === "fixed") {
    discountAmount = discountValue;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  const taxableBase = subtotal - discountAmount;
  const taxAmount = taxableBase * (taxRate / 100);
  const total = taxableBase + taxAmount + (shippingCost || 0);

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    taxAmount: round2(taxAmount),
    total: round2(total),
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
