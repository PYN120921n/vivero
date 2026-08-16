"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader, Badge, Table, Th, Td } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { calculateQuoteTotals } from "@/lib/utils";
import { BAG_SIZES, PLANT_HEIGHTS, SEED_CLASSIFICATION_LABELS, defaultConditions, DEFAULT_INTRO_NOTE } from "@/lib/constants";
import type { BagSize, DiscountType, PlantHeight, QuotationProductType, SeedClassification } from "@/lib/types";
import { createQuotation, type CreateQuotationInput } from "./actions";

export interface PickerProduct {
  id: string;
  commonName: string;
  scientificName: string;
  classification?: SeedClassification;
  availableMonths?: string;
  seedsPerKilo?: number;
  unitPrice?: number;
  stockKg?: number;
}

interface CartItem {
  key: string;
  seedId?: string;
  plantId?: string;
  commonName: string;
  scientificName?: string;
  classification?: SeedClassification;
  availableMonths?: string;
  seedsPerKilo?: number;
  bagSize?: BagSize;
  height?: PlantHeight;
  unitPrice: number;
  quantity: number;
  stockKg?: number;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function QuotationBuilder({ productType, products }: { productType: QuotationProductType; products: PickerProduct[] }) {
  const router = useRouter();
  const isSeeds = productType === "semillas";

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [quoteDate, setQuoteDate] = useState(todayISO());
  const [validityDays, setValidityDays] = useState(10);
  const [quoteCity, setQuoteCity] = useState("Mérida, Yucatán");
  const [notes, setNotes] = useState(DEFAULT_INTRO_NOTE);
  const [conditions, setConditions] = useState<string[]>(defaultConditions());
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [staging, setStaging] = useState<PickerProduct | null>(null);
  const [stagingBagSize, setStagingBagSize] = useState<BagSize>(BAG_SIZES[0]);
  const [stagingHeight, setStagingHeight] = useState<PlantHeight>(PLANT_HEIGHTS[0]);
  const [stagingPrice, setStagingPrice] = useState("0");
  const [stagingQty, setStagingQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyAddedIds = useMemo(() => new Set(items.map((i) => i.seedId ?? i.plantId)), [items]);

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !alreadyAddedIds.has(p.id))
      .filter((p) => p.commonName.toLowerCase().includes(q) || p.scientificName.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, products, alreadyAddedIds]);

  const totals = useMemo(
    () =>
      calculateQuoteTotals({
        items: items.map((i) => ({ unit_price: i.unitPrice, quantity: i.quantity })),
        taxRate,
        discountType,
        discountValue,
        shippingCost,
      }),
    [items, taxRate, discountType, discountValue, shippingCost]
  );

  function addSeed(product: PickerProduct) {
    setItems((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        seedId: product.id,
        commonName: product.commonName,
        scientificName: product.scientificName,
        classification: product.classification,
        availableMonths: product.availableMonths,
        seedsPerKilo: product.seedsPerKilo,
        unitPrice: product.unitPrice ?? 0,
        quantity: 1,
        stockKg: product.stockKg,
      },
    ]);
    setSearch("");
  }

  function openPlantStaging(product: PickerProduct) {
    setStaging(product);
    setStagingBagSize(BAG_SIZES[0]);
    setStagingHeight(PLANT_HEIGHTS[0]);
    setStagingPrice("0");
    setStagingQty("1");
  }

  function confirmAddPlant() {
    if (!staging) return;
    const price = Number(stagingPrice) || 0;
    const qty = Number(stagingQty) || 1;
    setItems((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        plantId: staging.id,
        commonName: staging.commonName,
        scientificName: staging.scientificName,
        bagSize: stagingBagSize,
        height: stagingHeight,
        unitPrice: price,
        quantity: qty,
      },
    ]);
    setStaging(null);
    setSearch("");
  }

  function updateQuantity(key: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateCondition(idx: number, value: string) {
    setConditions((prev) => prev.map((c, i) => (i === idx ? value : c)));
  }
  function removeCondition(idx: number) {
    setConditions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setError(null);
    if (!clientName.trim()) {
      setError("Ingresa el nombre del cliente.");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un producto a la cotización.");
      return;
    }

    setSubmitting(true);
    const payload: CreateQuotationInput = {
      productType,
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim() || undefined,
      quoteDate,
      validityDays,
      quoteCity: quoteCity.trim(),
      notes,
      conditions: conditions.filter((c) => c.trim().length > 0),
      taxRate,
      discountType,
      discountValue,
      shippingCost,
      items: items.map((i) => ({
        seedId: i.seedId,
        plantId: i.plantId,
        commonName: i.commonName,
        scientificName: i.scientificName,
        classification: i.classification,
        availableMonths: i.availableMonths,
        seedsPerKilo: i.seedsPerKilo,
        bagSize: i.bagSize,
        height: i.height,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    };

    const result = await createQuotation(payload);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/cotizaciones/${result.id}`);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Datos del cliente</h2>
          </CardHeader>
          <CardBody className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre o razón social" htmlFor="clientName" required>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" />
            </Field>
            <Field label="Dirección (opcional)" htmlFor="clientAddress">
              <Input id="clientAddress" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Productos</h2>
          </CardHeader>
          <CardBody>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isSeeds ? "Buscar semilla por nombre…" : "Buscar planta por nombre…"}
                className="pl-9"
              />
              {results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg max-h-72 overflow-y-auto">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => (isSeeds ? addSeed(p) : openPlantStaging(p))}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-forest-50 border-b border-stone-100 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-forest-900 truncate">{p.commonName}</p>
                        <p className="text-xs text-stone-500 italic truncate">{p.scientificName}</p>
                      </div>
                      {isSeeds ? (
                        <span className="text-xs text-forest-700 font-medium shrink-0">{formatCurrency(p.unitPrice ?? 0)}/kg</span>
                      ) : (
                        <Plus size={16} className="text-forest-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {staging && (
              <div className="mt-4 rounded-xl border border-forest-200 bg-forest-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-forest-900">{staging.commonName}</p>
                  <button type="button" onClick={() => setStaging(null)} className="text-stone-400 hover:text-forest-800">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Bolsa" htmlFor="stagingBagSize">
                    <Select id="stagingBagSize" value={stagingBagSize} onChange={(e) => setStagingBagSize(e.target.value as BagSize)}>
                      {BAG_SIZES.map((b) => (
                        <option key={b} value={b}>
                          {b} cm
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Altura" htmlFor="stagingHeight">
                    <Select id="stagingHeight" value={stagingHeight} onChange={(e) => setStagingHeight(e.target.value as PlantHeight)}>
                      {PLANT_HEIGHTS.map((h) => (
                        <option key={h} value={h}>
                          {h} cm
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Precio unitario" htmlFor="stagingPrice">
                    <Input id="stagingPrice" type="number" min={0} step="0.01" value={stagingPrice} onChange={(e) => setStagingPrice(e.target.value)} />
                  </Field>
                  <Field label="Cantidad" htmlFor="stagingQty">
                    <Input id="stagingQty" type="number" min={1} step={1} value={stagingQty} onChange={(e) => setStagingQty(e.target.value)} />
                  </Field>
                </div>
                <Button type="button" size="sm" onClick={confirmAddPlant}>
                  <Plus size={15} /> Agregar a la cotización
                </Button>
              </div>
            )}

            <div className="mt-5">
              {items.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-8">Busca productos arriba para agregarlos a la cotización.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Producto</Th>
                      {isSeeds && <Th>Clasificación</Th>}
                      {!isSeeds && <Th>Bolsa / Altura</Th>}
                      <Th className="text-right">Precio</Th>
                      <Th className="text-right">Cantidad</Th>
                      <Th className="text-right">Subtotal</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.key}>
                        <Td>
                          <p className="font-medium text-forest-900">{item.commonName}</p>
                          {item.stockKg !== undefined && item.quantity > item.stockKg && (
                            <p className="flex items-center gap-1 text-xs text-clay-700 mt-0.5">
                              <AlertTriangle size={11} /> Solo hay {item.stockKg} kg en existencia
                            </p>
                          )}
                        </Td>
                        {isSeeds && (
                          <Td>
                            <Badge tone="neutral">{item.classification ? SEED_CLASSIFICATION_LABELS[item.classification] : "—"}</Badge>
                          </Td>
                        )}
                        {!isSeeds && (
                          <Td className="text-stone-600 text-xs">
                            {item.bagSize} cm · {item.height} cm
                          </Td>
                        )}
                        <Td className="text-right text-stone-700">{formatCurrency(item.unitPrice)}</Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Input
                              type="number"
                              min={isSeeds ? 0.01 : 1}
                              step={isSeeds ? "0.01" : "1"}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.key, Number(e.target.value) || 0)}
                              className="w-20 h-8 text-right"
                            />
                            <span className="text-xs text-stone-500">{isSeeds ? "kg" : "pza"}</span>
                          </div>
                        </Td>
                        <Td className="text-right font-medium text-forest-900">{formatCurrency(item.unitPrice * item.quantity)}</Td>
                        <Td>
                          <button type="button" onClick={() => removeItem(item.key)} className="text-stone-400 hover:text-red-600 p-1">
                            <Trash2 size={15} />
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Notas y condiciones</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Nota introductoria" htmlFor="notes">
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </Field>
            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1.5">Condiciones</label>
              <div className="space-y-2">
                {conditions.map((condition, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={condition} onChange={(e) => updateCondition(idx, e.target.value)} className="text-sm" />
                    <button type="button" onClick={() => removeCondition(idx)} className="text-stone-400 hover:text-red-600 px-2">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setConditions((prev) => [...prev, ""])}
                className="mt-2 text-sm text-forest-700 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Agregar condición
              </button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Detalles</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Fecha" htmlFor="quoteDate">
              <Input id="quoteDate" type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
            </Field>
            <Field label="Vigencia (días)" htmlFor="validityDays">
              <Input
                id="validityDays"
                type="number"
                min={1}
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value) || 1)}
              />
            </Field>
            <Field label="Ciudad para el membrete" htmlFor="quoteCity">
              <Input id="quoteCity" value={quoteCity} onChange={(e) => setQuoteCity(e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-forest-900">Totales</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Descuento" htmlFor="discountType">
                <Select id="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}>
                  <option value="none">Sin descuento</option>
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                </Select>
              </Field>
              <Field label={discountType === "percentage" ? "% descuento" : "Monto"} htmlFor="discountValue">
                <Input
                  id="discountValue"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={discountType === "none"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="IVA (%)" htmlFor="taxRate">
                <Input id="taxRate" type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Envío (MXN)" htmlFor="shippingCost">
                <Input
                  id="shippingCost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                />
              </Field>
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Descuento</span>
                  <span>−{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>IVA</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Envío</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg text-forest-900 pt-1.5 border-t border-stone-200">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Generando…" : "Generar cotización"}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
