import type { BagSize, PlantHeight, QuotationStatus, SeedClassification } from "@/lib/types";

/**
 * Datos reales de la empresa, tal cual estaban en el sistema original
 * (js/cotizaciones.js). Se dejan como constantes de código —igual que en el
 * original— en vez de una tabla configurable, porque cambian con muy poca
 * frecuencia; si algún día se editan seguido, es fácil moverlos a una tabla
 * `company_settings` más adelante.
 */
export const COMPANY = {
  name: "MEXICO PRIMERO S DE S.S",
  activities: "GANADERIA, AGRICULTURA Y REFORESTACIÓN",
  shortAddress: "DOMICILIO CONOCIDO TZUCACAB, YUCATAN",
  fullAddress: "Calle 39 No. 92, entre 22 y 24, C.P. 97960, Tzucacab, Yucatán",
  rfc: "MPR980510JT9",
  phone: "99-97-48-26-11",
  email: "administracion@mexicoprimero.mx",
} as const;

export const SIGNATURES = [
  { name: "P.A. Ing. Luis Gerardo Herrera Tuz", title: "Consultor Ambiental" },
  { name: "Prof. Alberto Casanova Martín", title: `Director y Apoderado Legal de "${COMPANY.name}"` },
] as const;

export function defaultConditions(): string[] {
  return [
    "Condiciones de pago: 70% de anticipo y 30% restante al finalizar el trabajo o la entrega del producto.",
    "Para la facturación es necesario enviar el CIF (Cédula de Identificación Fiscal). Tratándose únicamente de plantas, la tasa de IVA aplicable es cero (0).",
    "Cotización válida 10 días a partir de la fecha de emisión; de no confirmarse el pedido en ese plazo, favor de solicitar una nueva cotización.",
    "Tiempo de entrega posterior al anticipo: 5 días hábiles (sujeto a programación).",
    "La existencia está sujeta a cambio sin previo aviso.",
    `Precios vigentes ${new Date().getFullYear()}.`,
  ];
}

export const SEED_CLASSIFICATION_LABELS: Record<SeedClassification, string> = {
  recalcitrante: "Recalcitrante",
  intermedia: "Intermedia",
  ortodoxa: "Ortodoxa",
  vareta: "Vareta",
};

export const BAG_SIZES: BagSize[] = ["13x20", "25x25", "30x30", "30x40", "40x40"];

export const PLANT_HEIGHTS: PlantHeight[] = [
  "20-30", "40-50", "50-60", "60-70", "80-90", "100", "150", "180", "200", "300",
];

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  facturada: "Facturada",
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, { bg: string; text: string }> = {
  pendiente: { bg: "#FEF3C7", text: "#92400E" },
  aprobada: { bg: "#D1FAE5", text: "#065F46" },
  rechazada: { bg: "#FEE2E2", text: "#991B1B" },
  facturada: { bg: "#DBEAFE", text: "#1E40AF" },
};

export const DEFAULT_INTRO_NOTE =
  "De la manera más atenta y respetuosa pongo a consideración la siguiente cotización:";
