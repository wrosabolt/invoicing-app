"use client";

import { useRef } from "react";
import type { Invoice, ClientInfo } from "@/lib/types";

interface Props {
  invoice: Invoice;
  client: ClientInfo | null | undefined;
  onClose: () => void;
  onSave: () => void;
  onEmail: () => void;
}

export default function InvoiceModal({ invoice, client, onClose, onSave, onEmail }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={onEmail}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Email
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save & Download
            </button>
          </div>
        </div>

        <div ref={printRef} className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
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

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">From</h3>
              <p className="font-medium text-gray-900">Rosa Plumbing</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">14 Emily Street
Somerton
VIC 3062</p>
              <p className="text-sm text-gray-600">ABN: 86 659 791 662</p>
              <p className="text-sm text-gray-600">rosaplumbing@outlook.com</p>
              <p className="text-sm text-gray-600">0419 140 793</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Bill To</h3>
              <p className="font-medium text-gray-900">{client?.name || "Unknown"}</p>
              {client?.company && <p className="text-sm text-gray-600">{client.company}</p>}
              <p className="text-sm text-gray-600 whitespace-pre-line">{client?.address}</p>
              {client?.email && <p className="text-sm text-gray-600">{client.email}</p>}
              {client?.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-medium text-gray-700">Description</th>
                <th className="text-right py-3 text-sm font-medium text-gray-700">Hours</th>
                <th className="text-right py-3 text-sm font-medium text-gray-700">Rate</th>
                <th className="text-right py-3 text-sm font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-gray-900">{item.description || "Professional services"}</td>
                  <td className="py-3 text-right text-gray-900">{item.hoursWorked}</td>
                  <td className="py-3 text-right text-gray-900">${item.hourlyRate?.toFixed(2)}</td>
                  <td className="py-3 text-right text-gray-900">
                    ${(item.hoursWorked * (item.hourlyRate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">GST ({invoice.gstRate}%)</span>
                <span className="text-gray-900">${invoice.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${invoice.total.toFixed(2)}</span>
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
