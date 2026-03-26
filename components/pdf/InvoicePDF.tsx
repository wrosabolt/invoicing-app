"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Invoice, CompanySettings } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/calculations";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 20,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  companyDetails: {
    textAlign: "right",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailRow: {
    fontSize: 9,
    marginBottom: 2,
    color: "#555",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  billTo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billToDetails: {
    flex: 1,
  },
  dateDetails: {
    textAlign: "right",
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    padding: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    padding: 12,
  },
  colDescription: {
    flex: 2,
    fontSize: 10,
  },
  colHours: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
  },
  headerCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsTable: {
    width: 250,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  totalsRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  totalsLabel: {
    fontSize: 10,
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  companySettings?: CompanySettings | null;
}

export function InvoicePDF({ invoice, companySettings }: InvoicePDFProps) {
  const companyName = companySettings?.companyName || "Your Company";
  const companyAddress = companySettings?.address || "Company Address";
  const companyEmail = companySettings?.email || "company@email.com";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.detailRow}>{companyAddress}</Text>
            <Text style={styles.detailRow}>{companyEmail}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.billTo}>
            <View style={styles.billToDetails}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 4 }}>
                {invoice.clientCompany}
              </Text>
              <Text style={styles.detailRow}>{invoice.clientName}</Text>
              <Text style={styles.detailRow}>{invoice.clientAddress}</Text>
              <Text style={styles.detailRow}>{invoice.clientEmail}</Text>
            </View>
            <View style={styles.dateDetails}>
              <Text style={styles.sectionTitle}>Date</Text>
              <Text style={{ fontSize: 11 }}>{formatDate(invoice.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[styles.headerCell, styles.colHours]}>Hours</Text>
          </View>
          {invoice.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colHours}>{item.hoursWorked.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST ({invoice.gstRate}%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.gstAmount)}</Text>
            </View>
            <View style={styles.totalsRowTotal}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business</Text>
        </View>
      </Page>
    </Document>
  );
}
