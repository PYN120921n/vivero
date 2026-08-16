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

/** "12 de agosto de 2026" */
export function formatLongDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** "Mérida, Yucatán, a 12 de agosto de 2026" — replica el formato de las cotizaciones originales */
export function formatQuoteDateLine(date: string | Date, city: string): string {
  return `${city}, a ${formatLongDate(date)}`;
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export interface QuoteTotalsInput {
  items: Array<{ unit_price: number; quantity: number }>;
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
 * Calcula subtotal → descuento → impuesto → total. Se usa tanto en el
 * formulario (para la vista previa en vivo) como al guardar la cotización,
 * para que los números nunca queden desincronizados.
 */
export function calculateQuoteTotals({
  items,
  taxRate,
  discountType,
  discountValue,
  shippingCost,
}: QuoteTotalsInput): QuoteTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

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
