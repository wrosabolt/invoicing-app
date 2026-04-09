import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Invoice, CompanySettings } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/calculations";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatLongDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: "#666",
    marginTop: 3,
  },
  paidBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  // From / Bill To
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  partyBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  partyName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  // Work period
  workPeriod: {
    marginBottom: 16,
    fontSize: 10,
    color: "#333",
    lineHeight: 1.4,
  },
  workPeriodBold: {
    fontWeight: "bold",
  },
  // Table
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },
  colDescription: { flex: 3, fontSize: 10, paddingRight: 8 },
  colHours: { flex: 1, fontSize: 10, textAlign: "left" },
  colRate: { flex: 1, fontSize: 10, textAlign: "left" },
  colAmount: { flex: 1, fontSize: 10, textAlign: "right" },
  // Totals
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  totalsTable: {
    width: 230,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  totalsLabel: { fontSize: 10, color: "#555" },
  totalsValue: { fontSize: 10 },
  totalsRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  totalLabel: { fontSize: 11, fontWeight: "bold", color: "white" },
  totalSubLabel: { fontSize: 8, color: "#aaaaaa", marginTop: 2 },
  totalValue: { fontSize: 11, fontWeight: "bold", color: "white" },
  // Footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  companySettings?: CompanySettings | null;
  client?: { contactName?: string; contactEmail?: string; contactRole?: string; contact_name?: string; contact_email?: string; contact_role?: string } | null;
}

export function InvoicePDF({ invoice, companySettings, client }: InvoicePDFProps) {
  const companyName = companySettings?.companyName || "Your Company";
  const companyAddress = companySettings?.address || "";
  const companyEmail = companySettings?.email || "";
  const companyPhone = companySettings?.phone || "";
  const companyAbn = companySettings?.abn || "";
  const bankName = companySettings?.bankName || "";
  const bsbNumber = companySettings?.bsbNumber || "";
  const accountNumber = companySettings?.accountNumber || "";
  const contactName = client?.contactName || client?.contact_name || "";
  const contactEmail = client?.contactEmail || client?.contact_email || "";
  const contactRole = client?.contactRole || client?.contact_role || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(new Date(invoice.createdAt))}
            </Text>
            {invoice.dueDate && (
              <Text style={styles.invoiceDate}>
                Due: {formatDate(new Date(invoice.dueDate))}
              </Text>
            )}
          </View>
          {invoice.paid && (
            <Text style={styles.paidBadge}>PAID</Text>
          )}
        </View>

        {/* From / Bill To */}
        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.partyName}>{companyName}</Text>
            {companyAddress ? <Text style={styles.partyDetail}>{companyAddress}</Text> : null}
            {companyAbn ? <Text style={styles.partyDetail}>ABN: {companyAbn}</Text> : null}
            {companyEmail ? <Text style={styles.partyDetail}>{companyEmail}</Text> : null}
            {companyPhone ? <Text style={styles.partyDetail}>{companyPhone}</Text> : null}

            {(bankName || bsbNumber || accountNumber) ? (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionTitle}>Please remit payment to the following bank account</Text>
                {bankName ? <Text style={styles.partyDetail}>{bankName}</Text> : null}
                {bsbNumber ? <Text style={styles.partyDetail}>BSB: {bsbNumber}</Text> : null}
                {accountNumber ? <Text style={styles.partyDetail}>Account: {accountNumber}</Text> : null}
              </View>
            ) : null}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.sectionTitle}>Invoice to:</Text>
            <Text style={styles.partyName}>
              {invoice.clientCompany || invoice.clientName || ""}
            </Text>
            {invoice.clientAddress ? <Text style={styles.partyDetail}>{invoice.clientAddress}</Text> : null}
            {invoice.clientPhone ? <Text style={styles.partyDetail}>{invoice.clientPhone}</Text> : null}
            {contactName ? (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 3 }]}>Attention:</Text>
                <Text style={styles.partyName}>{contactName}</Text>
                {contactRole ? <Text style={styles.partyDetail}>{contactRole}</Text> : null}
                {contactEmail ? <Text style={styles.partyDetail}>{contactEmail}</Text> : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* Work period */}
        {(invoice.startDate || invoice.endDate) && (
          <View style={styles.workPeriod}>
            <Text>Tax Invoice for Work Performed</Text>
            <Text>
              <Text style={styles.workPeriodBold}>{formatLongDate(invoice.startDate)}</Text>
              {" to "}
              <Text style={styles.workPeriodBold}>{formatLongDate(invoice.endDate)}</Text>
              {"."}
            </Text>
          </View>
        )}

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.headerCell, styles.colHours]}>Hours</Text>
            <Text style={[styles.headerCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.headerCell, styles.colAmount]}>Amount</Text>
          </View>
          {invoice.items?.map((item, index) => {
            const hours = parseFloat(String(item.hoursWorked || 0));
            const rate = parseFloat(String(item.hourlyRate || 0));
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colDescription}>{item.description || "Professional services"}</Text>
                <Text style={styles.colHours}>{hours.toFixed(2)}</Text>
                <Text style={styles.colRate}>${rate.toFixed(2)}</Text>
                <Text style={styles.colAmount}>${(hours * rate).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(parseFloat(String(invoice.subtotal)))}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST ({invoice.gstRate}%)</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(parseFloat(String(invoice.gstAmount)))}
              </Text>
            </View>
            <View style={styles.totalsRowTotal}>
              <View>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalSubLabel}>(Inc.GST - Terms - Strictly 14 Days)</Text>
              </View>
              <Text style={styles.totalValue}>
                {formatCurrency(parseFloat(String(invoice.total)))}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}
