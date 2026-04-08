"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import InvoiceModal from "@/components/InvoiceModal";
import type { Invoice, ClientInfo, InvoiceItem } from "@/lib/types";
import { Plus, Settings, LogOut, FileText, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState({ companyName: "", address: "", email: "", phone: "", abn: "", bankName: "", bsbNumber: "", accountNumber: "" });

  useEffect(() => {
    if (status === "authenticated") {
      fetchInvoices();
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      const parsed = data.map((inv: any) => ({
        ...inv,
        items: typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items,
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
    window.print();
  };

  const handleEmail = () => {
    if (!selectedInvoice?.clientEmail) return;
    const subject = encodeURIComponent(`Invoice ${selectedInvoice.invoiceNumber}`);
    const body = encodeURIComponent(`Please find invoice ${selectedInvoice.invoiceNumber} attached.`);
    window.open(`mailto:${selectedInvoice.clientEmail}?subject=${subject}&body=${body}`);
  };

  const handlePaidChange = async (invoice: Invoice, paid: boolean) => {
    try {
      await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid }),
      });
      fetchInvoices();
      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice({ ...selectedInvoice, paid });
      }
    } catch (error) {
      console.error("Failed to update paid status:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              {(session?.user as any)?.companyName && (
                <span className="text-sm text-gray-500">| {(session?.user as any).companyName}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="hidden sm:inline text-sm text-gray-600">
                Welcome, {session?.user?.name}
              </span>
              {(session?.user as any)?.isAdmin && (
                <button
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <button
                onClick={() => router.push("/settings")}
                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">All Invoices</h2>
              <p className="text-sm text-gray-500 mt-1">
                {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <button
              onClick={() => router.push("/create-invoice")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Invoice</span>
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No invoices yet</p>
              <button
                onClick={() => router.push("/create-invoice")}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => handleRowClick(invoice)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.clientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(invoice.createdAt).toLocaleDateString("en-AU")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={invoice.paid}
                          onChange={(e) => handlePaidChange(invoice, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && selectedInvoice && (
        <InvoiceModal
          companySettings={settings}
          invoice={selectedInvoice}
          client={client}
          onClose={() => setShowModal(false)}
          onSaveAndDownload={handleSaveAndDownload}
        />
      )}
    </div>
  );
}
