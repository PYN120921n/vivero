import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { COMPANY, SIGNATURES, SEED_CLASSIFICATION_LABELS } from "@/lib/constants";
import { formatCurrency, formatQuoteDateLine, formatShortDate } from "@/lib/utils";
import type { Quotation, QuotationItem } from "@/lib/types";
import path from "path";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");
const ESR_LOGO_PATH = path.join(process.cwd(), "public", "logo-esr.png");

const COLORS = {
  forest900: "#1b342a",
  forest700: "#264f3c",
  forest600: "#2e6349",
  stone500: "#78716c",
  stone300: "#d6d3d1",
  stone200: "#e7e5e4",
  stone100: "#f5f5f4",
  red: "#b91c1c",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: COLORS.forest900,
    paddingTop: 32,
    paddingBottom: 56,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 14,
  },
  logo: { width: 52, height: 40, objectFit: "contain" },
  companyBlock: { flex: 1 },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 13, color: COLORS.forest900 },
  companyLine: { fontSize: 8, color: COLORS.stone500, marginTop: 1.5 },
  titleBar: {
    marginTop: 6,
    marginBottom: 14,
    paddingVertical: 8,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: COLORS.forest700,
    alignItems: "center",
  },
  titleText: { fontFamily: "Helvetica-Bold", fontSize: 13, letterSpacing: 0.5, color: COLORS.forest900 },
  folioText: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: COLORS.red, marginTop: 3 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  metaText: { fontSize: 9, color: COLORS.forest900 },
  clientBlock: { marginBottom: 10, gap: 2 },
  clientLabel: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  introText: { fontSize: 9.5, marginBottom: 12, color: COLORS.forest900, lineHeight: 1.4 },
  table: { borderTopWidth: 1, borderColor: COLORS.stone300 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.forest900,
    paddingVertical: 6,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#ffffff",
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.stone200,
    paddingVertical: 5.5,
  },
  tableRowAlt: { backgroundColor: COLORS.stone100 },
  tableCell: { fontSize: 8.5, paddingHorizontal: 4, color: COLORS.forest900 },
  tableCellMuted: { fontSize: 7.5, color: COLORS.stone500, fontStyle: "italic", marginTop: 1 },
  totalsBlock: { alignSelf: "flex-end", width: 220, marginTop: 12 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  totalsLabel: { fontSize: 9, color: COLORS.stone500 },
  totalsValue: { fontSize: 9, color: COLORS.forest900 },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 3,
    borderTopWidth: 1.5,
    borderColor: COLORS.forest700,
  },
  totalsFinalLabel: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: COLORS.forest900 },
  totalsFinalValue: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: COLORS.forest900 },
  conditionsBlock: { marginTop: 18 },
  conditionsTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, marginBottom: 5 },
  conditionRow: { flexDirection: "row", marginBottom: 3 },
  conditionIndex: { width: 14, fontSize: 8.5 },
  conditionText: { flex: 1, fontSize: 8.5, lineHeight: 1.35, color: COLORS.forest900 },
  signaturesBlock: { marginTop: 30, flexDirection: "row", justifyContent: "space-between" },
  signatureItem: { width: "45%" },
  signatureLine: { borderTopWidth: 1, borderColor: COLORS.forest900, paddingTop: 4 },
  signatureName: { fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  signatureTitle: { fontSize: 7.5, color: COLORS.stone500, marginTop: 1 },
  attentively: { fontSize: 9, marginTop: 22, marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderColor: COLORS.stone300,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7, color: COLORS.stone500 },
  footerLogo: { width: 56, height: 22, objectFit: "contain" },
  pageNumber: { position: "absolute", bottom: 8, left: 40, right: 40, textAlign: "center", fontSize: 7, color: COLORS.stone500 },
});

function ProductTypeLabel({ type }: { type: Quotation["product_type"] }) {
  return <Text style={styles.titleText}>COTIZACIÓN DE {type === "semillas" ? "SEMILLAS" : "PLANTAS"}</Text>;
}

export function QuotePDF({ quotation, items }: { quotation: Quotation; items: QuotationItem[] }) {
  const isSeeds = quotation.product_type === "semillas";

  return (
    <Document title={`Cotización ${quotation.folio} — ${quotation.client_name}`} author={COMPANY.name}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={LOGO_PATH} style={styles.logo} />
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{COMPANY.name}</Text>
            <Text style={styles.companyLine}>{COMPANY.activities}</Text>
            <Text style={styles.companyLine}>{COMPANY.shortAddress}</Text>
            <Text style={styles.companyLine}>
              RFC: {COMPANY.rfc} · Tel. {COMPANY.phone}
            </Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <ProductTypeLabel type={quotation.product_type} />
          <Text style={styles.folioText}>COTIZACIÓN No. {quotation.folio}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatQuoteDateLine(quotation.quote_date, quotation.quote_city)}</Text>
          <Text style={styles.metaText}>Válido hasta: {formatShortDate(quotation.valid_until)}</Text>
        </View>

        <View style={styles.clientBlock}>
          <Text style={styles.clientLabel}>Cliente: {quotation.client_name}</Text>
          {quotation.client_address && <Text style={styles.metaText}>{quotation.client_address}</Text>}
        </View>

        <Text style={styles.introText}>{quotation.notes}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { width: "5%" }]}>No.</Text>
            <Text style={[styles.tableHeaderCell, { width: isSeeds ? "27%" : "32%" }]}>Producto</Text>
            {isSeeds ? (
              <>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>Clasificación</Text>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>Meses</Text>
                <Text style={[styles.tableHeaderCell, { width: "10%", textAlign: "right" }]}>Sem./kg</Text>
              </>
            ) : (
              <>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>Bolsa</Text>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>Altura</Text>
              </>
            )}
            <Text style={[styles.tableHeaderCell, { width: "12%", textAlign: "right" }]}>Precio</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%", textAlign: "right" }]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%", textAlign: "right" }]}>Subtotal</Text>
          </View>

          {items.map((item, idx) => (
            <View key={item.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
              <Text style={[styles.tableCell, { width: "5%" }]}>{idx + 1}</Text>
              <View style={{ width: isSeeds ? "27%" : "32%" }}>
                <Text style={styles.tableCell}>{item.common_name}</Text>
                {item.scientific_name && <Text style={[styles.tableCellMuted, { paddingHorizontal: 4 }]}>{item.scientific_name}</Text>}
              </View>
              {isSeeds ? (
                <>
                  <Text style={[styles.tableCell, { width: "13%" }]}>
                    {item.classification ? SEED_CLASSIFICATION_LABELS[item.classification] : "—"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "13%" }]}>{item.available_months || "—"}</Text>
                  <Text style={[styles.tableCell, { width: "10%", textAlign: "right" }]}>{item.seeds_per_kilo ?? "—"}</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.tableCell, { width: "13%" }]}>{item.bag_size} cm</Text>
                  <Text style={[styles.tableCell, { width: "13%" }]}>{item.height} cm</Text>
                </>
              )}
              <Text style={[styles.tableCell, { width: "12%", textAlign: "right" }]}>{formatCurrency(item.unit_price)}</Text>
              <Text style={[styles.tableCell, { width: "10%", textAlign: "right" }]}>
                {item.quantity} {isSeeds ? "kg" : "pza"}
              </Text>
              <Text style={[styles.tableCell, { width: "10%", textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock} wrap={false}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(quotation.subtotal)}</Text>
          </View>
          {quotation.discount_amount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Descuento</Text>
              <Text style={styles.totalsValue}>−{formatCurrency(quotation.discount_amount)}</Text>
            </View>
          )}
          {quotation.tax_amount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>IVA ({quotation.tax_rate}%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(quotation.tax_amount)}</Text>
            </View>
          )}
          {quotation.shipping_cost > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Envío</Text>
              <Text style={styles.totalsValue}>{formatCurrency(quotation.shipping_cost)}</Text>
            </View>
          )}
          <View style={styles.totalsFinalRow}>
            <Text style={styles.totalsFinalLabel}>Total</Text>
            <Text style={styles.totalsFinalValue}>{formatCurrency(quotation.total)}</Text>
          </View>
        </View>

        {quotation.conditions.length > 0 && (
          <View style={styles.conditionsBlock} wrap={false}>
            <Text style={styles.conditionsTitle}>Condiciones</Text>
            {quotation.conditions.map((condition, idx) => (
              <View key={idx} style={styles.conditionRow}>
                <Text style={styles.conditionIndex}>{idx + 1}.</Text>
                <Text style={styles.conditionText}>{condition}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.attentively}>ATENTAMENTE</Text>
        <View style={styles.signaturesBlock} wrap={false}>
          {SIGNATURES.map((signature) => (
            <View key={signature.name} style={styles.signatureItem}>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureName}>{signature.name}</Text>
                <Text style={styles.signatureTitle}>{signature.title}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerText}>{COMPANY.fullAddress}</Text>
            <Text style={styles.footerText}>
              Tel. {COMPANY.phone} · {COMPANY.email}
            </Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={ESR_LOGO_PATH} style={styles.footerLogo} />
        </View>
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
