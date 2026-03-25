"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Plus, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/SettingsModal";
import { getCompanySettings, getInvoices, deleteInvoice } from "@/lib/storage";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { CompanySettings } from "@/lib/types";

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSettings(getCompanySettings());
  }, [refreshKey]);

  const handleSettingsSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(id);
      setRefreshKey((k) => k + 1);
    }
  };

  const invoices = getInvoices();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoicing</h1>
            {settings?.companyName && (
              <p className="text-sm text-slate-500">{settings.companyName}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Invoice</h2>
          <p className="text-slate-600 mb-4">
            Create a new invoice for your client. Make sure to set up your
            company details in Settings first.
          </p>
          <Link href="/create-invoice">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Invoice History</h2>
            <p className="text-sm text-slate-500">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices yet</p>
              <p className="text-sm text-slate-400">
                Create your first invoice to get started
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {invoice.client?.companyName || "Unknown Client"}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-slate-500">
                        {invoice.invoiceNumber}
                      </span>
                      <span className="text-sm text-slate-400">•</span>
                      <span className="text-sm text-slate-500">
                        {formatDate(invoice.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(invoice.total)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSaved}
      />
    </div>
  );
}
