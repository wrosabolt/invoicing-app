"use client";

import { useState, useEffect } from "react";
import { Invoice, CompanySettings } from "@/lib/types";
import { formatCurrency, formatDate, calculateTotalHours } from "@/lib/calculations";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./pdf/InvoicePDF";
import { getCompanySettings } from "@/lib/storage";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  invoice: Invoice;
}

export function InvoiceModal({ isOpen, onClose, onBack, invoice }: InvoiceModalProps) {
  const [saved, setSaved] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    setCompanySettings(getCompanySettings());
  }, []);

  const totalHours = calculateTotalHours(invoice.items || []);

  const handleSave = () => {
    import("@/lib/storage").then(({ saveInvoice }) => {
      saveInvoice(invoice);
      setSaved(true);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Preview" size="lg">
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
            <p className="text-slate-500 mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold">{invoice.client?.companyName}</h2>
            <p className="text-sm text-slate-500">{invoice.client?.address}</p>
            <p className="text-sm text-slate-500">{invoice.client?.email}</p>
          </div>
        </div>

        {/* Bill To & Date */}
        <div className="flex justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Bill To
            </h3>
            <p className="font-medium">{invoice.client?.companyName}</p>
            <p className="text-sm text-slate-600">{invoice.client?.contactName}</p>
            <p className="text-sm text-slate-600">{invoice.client?.address}</p>
            <p className="text-sm text-slate-600">{invoice.client?.email}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Date
            </h3>
            <p className="font-medium">{formatDate(invoice.createdAt)}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">
                  Description
                </th>
                <th className="text-right p-3 text-xs font-semibold text-slate-500 uppercase">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="p-3 text-sm">{item.description}</td>
                  <td className="p-3 text-sm text-right">{item.hoursWorked.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600">Total Hours</span>
              <span className="font-medium">{totalHours.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600">GST ({invoice.gstRate}%)</span>
              <span className="font-medium">{formatCurrency(invoice.gstAmount)}</span>
            </div>
            <div className="flex justify-between py-3 bg-slate-900 text-white rounded-md px-4">
              <span className="font-semibold">Total Payable</span>
              <span className="font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            ← Back to Edit
          </Button>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setSaved(true)}
              disabled={saved}
            >
              {saved ? "✓ Saved" : "Save Invoice"}
            </Button>
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} companySettings={companySettings} />}
              fileName={`${invoice.invoiceNumber}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading}>
                  {loading ? "Generating..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>
    </Modal>
  );
}
