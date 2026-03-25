"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InvoiceModal from "@/components/InvoiceModal";
import type { Invoice, ClientInfo, LineItem } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      const parsed = data.map((inv: any) => ({
        ...inv,
        items: typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items
      }));
      setInvoices(parsed);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const handleRowClick = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    if (invoice.clientId) {
      try {
        const res = await fetch(`/api/clients/${invoice.clientId}`);
        if (res.ok) {
          const clientData = await res.json();
          setClient(clientData);
        }
      } catch (error) {
        console.error("Failed to fetch client:", error);
      }
    }
    setShowModal(true);
  };

  const handleSaveAndDownload = async () => {
    if (!selectedInvoice) return;
    setShowModal(false);
    window.print();
  };

  const handleEmail = () => {
    if (!selectedInvoice || !client) return;
    const subject = encodeURIComponent(`Invoice ${selectedInvoice.invoiceNumber}`);
    const body = encodeURIComponent(
      `Dear ${client.name},\n\nPlease find attached invoice ${selectedInvoice.invoiceNumber} for $${selectedInvoice.total.toFixed(2)}.\n\nDue: ${selectedInvoice.dueDate || "Upon receipt"}\n\nThank you for your business.\n\nRosa Plumbing`
    );
    const mailtoLink = `mailto:${client.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  const handleBack = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    setClient(null);
  };

  const togglePaid = async (id: string, currentPaid: boolean) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !currentPaid })
      });
      setInvoices(prev =>
        prev.map(inv => inv.id === id ? { ...inv, paid: !currentPaid } : inv)
      );
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(prev => prev ? { ...prev, paid: !currentPaid } : null);
      }
    } catch (error) {
      console.error("Failed to update paid status:", error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Invoices</h1>
        
        <button
          onClick={() => router.push("/create-invoice")}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Invoice
        </button>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No invoices yet. Create your first invoice to get started.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => handleRowClick(invoice)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{invoice.clientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">${invoice.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded ${
                        invoice.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {invoice.paid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={invoice.paid || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          togglePaid(invoice.id, invoice.paid || false);
                        }}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedInvoice && client && (
        <InvoiceModal
          invoice={selectedInvoice}
          client={client}
          onClose={handleBack}
          onSave={handleSaveAndDownload}
          onEmail={handleEmail}
        />
      )}
    </div>
  );
}
