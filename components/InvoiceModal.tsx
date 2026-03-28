"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Invoice, ClientInfo } from "@/lib/types";

interface Props {
  invoice: Invoice;
  client: ClientInfo | null | undefined;
  companySettings: {
    companyName: string;
    address: string;
    email: string;
    phone: string;
    abn: string;
  };
  onClose: () => void;
  onSaveAndDownload: () => void | Promise<void>;
}

export default function InvoiceModal({ invoice, client, companySettings, onClose, onSaveAndDownload }: Props) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const handleEmail = async () => {
    setEmailStatus("sending");
    setEmailMessage("");
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/email`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus("sent");
        setEmailMessage(`Sent to ${data.sentTo}`);
      } else {
        setEmailStatus("error");
        setEmailMessage(data.error || "Failed to send");
      }
    } catch {
      setEmailStatus("error");
      setEmailMessage("Failed to send email");
    }
  };

  const handlePrint = () => {
    const clientName = invoice.clientCompany || invoice.clientName || "Client";
    const originalTitle = document.title;
    document.title = `${clientName} - ${invoice.invoiceNumber}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
          <div className="flex justify-between items-center mb-2 sm:mb-0">
            <h2 className="text-xl font-bold">Invoice Preview</h2>
            <button
              onClick={onClose}
              className="sm:hidden px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Back
            </button>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap sm:justify-end">
            <button
              onClick={onClose}
              className="hidden sm:inline-flex px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Back
            </button>
            <button
              onClick={() => { onClose(); router.push(`/create-invoice?edit=${invoice.id}`); }}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm"
            >
              Edit Invoice
            </button>
            <button
              onClick={handleEmail}
              disabled={emailStatus === "sending"}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {emailStatus === "sending" ? "Sending…" : emailStatus === "sent" ? "Sent ✓" : "Email To Client"}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Save & Download
            </button>
          </div>
        </div>

        {emailMessage && (
          <div className={`px-6 py-2 text-sm ${emailStatus === "sent" ? "text-green-600" : "text-red-600"}`}>
            {emailMessage}
          </div>
        )}

        <div ref={printRef} id="print-area" className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TAX INVOICE</h1>
              <p className="text-xl font-semibold mt-1">{invoice.invoiceNumber}</p>
              <p className="text-gray-500 mt-1">
                Date: {new Date(invoice.createdAt).toLocaleDateString("en-AU")}
              </p>
              {invoice.dueDate && (
                <p className="text-gray-500">
                  Due: {new Date(invoice.dueDate).toLocaleDateString("en-AU")}
                </p>
              )}
            </div>
            {invoice.paid && (
              <span className="px-4 py-2 bg-green-100 text-green-800 text-lg font-bold rounded">
                PAID
              </span>
            )}
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">From</h3>
              <p className="font-medium text-gray-900">{companySettings.companyName}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{companySettings.address}</p>
              {companySettings.abn && <p className="text-sm text-gray-600">ABN: {companySettings.abn}</p>}
              {companySettings.email && <p className="text-sm text-gray-600">{companySettings.email}</p>}
              {companySettings.phone && <p className="text-sm text-gray-600">{companySettings.phone}</p>}
            </div>
            <div className="w-[304px] text-left">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Bill To</h3>
              <p className="font-medium text-gray-900">{client?.company || client?.name || "Unknown"}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{client?.address}</p>
              {client?.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
            </div>
          </div>

          {(invoice.startDate || invoice.endDate) && (
            <div className="mb-6 text-gray-800">
              <p>Tax Invoice for Work Performed</p>
              <p>
                <span className="font-medium">
                  {invoice.startDate ? new Date(invoice.startDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : ""}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {invoice.endDate ? new Date(invoice.endDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : ""}
                </span>.
              </p>
            </div>
          )}

          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <colgroup>
                <col className="w-auto" />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-28" />
              </colgroup>
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 pr-6 text-sm font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rate</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => {
                  const hours = parseFloat(String(item.hoursWorked)) || 0;
                  const rate = parseFloat(String(item.hourlyRate)) || 0;
                  return (
                    <tr key={item.id ?? i} className="border-b border-gray-200">
                      <td className="py-3 pr-6 text-gray-900 align-top break-words">{item.description || "Professional services"}</td>
                      <td className="py-3 px-4 text-gray-900 align-top whitespace-nowrap">{hours}</td>
                      <td className="py-3 px-4 text-gray-900 align-top whitespace-nowrap">${rate.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-900 align-top whitespace-nowrap">${(hours * rate).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${parseFloat(String(invoice.subtotal)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">GST ({invoice.gstRate}%)</span>
                <span className="text-gray-900">${parseFloat(String(invoice.gstAmount)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                <div>
                  <p className="text-gray-900">Total Payable</p>
                  <p className="text-sm font-normal text-gray-400">(Inc.GST - Terms - Strictly 7 Days)</p>
                </div>
                <span className="text-gray-900">${parseFloat(String(invoice.total)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
