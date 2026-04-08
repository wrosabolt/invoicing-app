"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  contactName: string;
  contactEmail: string;
  contactRole: string;
}

interface InvoiceItem {
  description: string;
  hoursWorked: number;
  hourlyRate: number;
}

interface SavedClient {
  id: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  contact_name?: string;
  contact_email?: string;
  contact_role?: string;
}

function toInputDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const twoWeeksAgo = new Date(today);
twoWeeksAgo.setDate(today.getDate() - 14);

const DEFAULT_ITEM: InvoiceItem = { description: "", hoursWorked: 0, hourlyRate: 0 };

function CreateInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const [clients, setClients] = useState<SavedClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("new");
  const [client, setClient] = useState<ClientInfo>({ name: "", company: "", address: "", email: "", phone: "", contactName: "", contactEmail: "", contactRole: "" });
  const [items, setItems] = useState<InvoiceItem[]>([DEFAULT_ITEM]);
  const [settings, setSettings] = useState<any>(null);
  const [gstRate, setGstRate] = useState(10);
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [startDate, setStartDate] = useState(toInputDate(twoWeeksAgo));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingClient, setLoadingClient] = useState(false);
  const [editInvoiceData, setEditInvoiceData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const [settingsRes, clientsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/clients"),
      ]);

      const settingsData = settingsRes.ok ? await settingsRes.json() : null;
      const clientsData = clientsRes.ok ? await clientsRes.json() : [];

      if (settingsData) {
        setSettings(settingsData);
        setGstRate(settingsData.gstRate || 10);
      }

      if (Array.isArray(clientsData)) setClients(clientsData);

      // --- EDIT MODE: load the existing invoice ---
      if (editId) {
        const invRes = await fetch(`/api/invoices/${editId}`);
        if (invRes.ok) {
          const inv = await invRes.json();
          setEditInvoiceData(inv);

          // Pre-fill items (keep hours as-is for editing)
          const parsedItems = typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items;
          if (Array.isArray(parsedItems)) {
            setItems(parsedItems.map((item: any) => ({
              description: item.description || "",
              hoursWorked: parseFloat(String(item.hoursWorked || 0)),
              hourlyRate: parseFloat(String(item.hourlyRate || 0)),
            })));
          }

          if (inv.gst_rate) setGstRate(parseFloat(String(inv.gst_rate)));

          // Dates — inv uses snake_case from direct DB query
          if (inv.start_date) setStartDate(inv.start_date.substring(0, 10));
          if (inv.end_date) setEndDate(inv.end_date.substring(0, 10));

          // Pre-select client
          const clientId = inv.client_id;
          if (clientId && Array.isArray(clientsData)) {
            const matched = clientsData.find((c: SavedClient) => c.id === clientId);
            if (matched) {
              setSelectedClientId(matched.id);
              setClient({
                name: matched.name || matched.company || "",
                company: matched.company || "",
                address: matched.address || "",
                email: matched.email || "",
                phone: matched.phone || "",
                contactName: matched.contact_name || "",
                contactEmail: matched.contact_email || "",
                contactRole: matched.contact_role || "",
              });
            }
          }
        }
        return; // skip the "pre-fill from last invoice" logic below
      }

      // --- CREATE MODE: pre-fill from most recent invoice ---
      const invoicesRes = await fetch("/api/invoices");
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : [];

      if (Array.isArray(invoicesData) && invoicesData.length > 0) {
        const last = invoicesData[0];
        const defaultRate = settingsData?.hourlyRate || 85;

        if (last.items && Array.isArray(last.items)) {
          setItems(last.items.map((item: any) => ({
            description: item.description || "",
            hoursWorked: 0,
            hourlyRate: parseFloat(String(item.hourlyRate)) || defaultRate,
          })));
        }

        if (last.gstRate) setGstRate(parseFloat(String(last.gstRate)));

        if (last.clientId && Array.isArray(clientsData)) {
          const matched = clientsData.find((c: SavedClient) => c.id === last.clientId);
          if (matched) {
            setSelectedClientId(matched.id);
            setClient({
              name: matched.name || matched.company || "",
              company: matched.company || "",
              address: matched.address || "",
              email: matched.email || "",
              phone: matched.phone || "",
              contactName: matched.contact_name || "",
              contactEmail: matched.contact_email || "",
              contactRole: matched.contact_role || "",
            });
          }
        }
      } else {
        const defaultRate = settingsData?.hourlyRate || 85;
        setItems([{ description: "", hoursWorked: 0, hourlyRate: defaultRate }]);
      }
    };

    load().catch(console.error);
  }, [editId]);

  const handleClientSelect = async (clientId: string) => {
    setSelectedClientId(clientId);

    if (clientId === "new") {
      setClient({ name: "", company: "", address: "", email: "", phone: "", contactName: "", contactEmail: "", contactRole: "" });
      const defaultRate = settings?.hourlyRate || 85;
      setItems([{ description: "", hoursWorked: 0, hourlyRate: defaultRate }]);
      return;
    }

    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setClient({
        name: selected.name || selected.company || "",
        company: selected.company || "",
        address: selected.address || "",
        email: selected.email || "",
        phone: selected.phone || "",
        contactName: selected.contact_name || "",
        contactEmail: selected.contact_email || "",
        contactRole: selected.contact_role || "",
      });
    }

    if (!isEditMode) {
      // Only auto-fill items from last invoice when creating, not editing
      setLoadingClient(true);
      try {
        const res = await fetch(`/api/invoices?clientId=${clientId}`);
        if (res.ok) {
          const last = await res.json();
          if (last?.items && Array.isArray(last.items)) {
            const defaultRate = settings?.hourlyRate || 85;
            setItems(last.items.map((item: any) => ({
              description: item.description || "",
              hoursWorked: 0,
              hourlyRate: parseFloat(String(item.hourlyRate)) || defaultRate,
            })));
            if (last.gstRate) setGstRate(parseFloat(String(last.gstRate)));
          }
        }
      } catch (e) {
        console.error("Failed to load last invoice for client", e);
      } finally {
        setLoadingClient(false);
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.hoursWorked * item.hourlyRate), 0);
  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const addItem = () => {
    const rate = settings?.hourlyRate || 85;
    setItems(prev => [...prev, { description: "", hoursWorked: 0, hourlyRate: rate }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (selectedClientId === "new" && !client.company) {
      setError("Client company name is required");
      return;
    }
    if (items.some(i => !i.description)) {
      setError("All line items need a description");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let clientId = selectedClientId;

      if (selectedClientId === "new") {
        const clientRes = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...client, name: client.company, contactName: client.contactName, contactEmail: client.contactEmail, contactRole: client.contactRole }),
        });
        if (!clientRes.ok) throw new Error("Failed to save client");
        const savedClient = await clientRes.json();
        clientId = savedClient.id;
      } else {
        // Update contact details on existing client
        const stored = clients.find(c => c.id === selectedClientId);
        if (stored && (
          client.email !== stored.email ||
          client.contactName !== (stored.contact_name || "") ||
          client.contactEmail !== (stored.contact_email || "") ||
          client.contactRole !== (stored.contact_role || "")
        )) {
          await fetch(`/api/clients/${selectedClientId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: client.email, contactName: client.contactName, contactEmail: client.contactEmail, contactRole: client.contactRole }),
          });
        }
      }

      const selectedClient = selectedClientId === "new" ? client : clients.find(c => c.id === selectedClientId);
      const payload = {
        clientId,
        clientName: selectedClient?.company || selectedClient?.name || client.company,
        clientCompany: selectedClient?.company || client.company,
        clientAddress: selectedClient?.address || client.address,
        clientEmail: selectedClient?.email || client.email,
        clientPhone: selectedClient?.phone || client.phone,
        items,
        subtotal,
        gstRate,
        gstAmount,
        total,
        status: "draft",
        paid: isEditMode ? (editInvoiceData?.paid ?? false) : false,
        startDate,
        endDate,
      };

      if (isEditMode) {
        // Update existing invoice via PUT
        const res = await fetch(`/api/invoices/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update invoice");
      } else {
        // Create new invoice via POST
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to save invoice");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <button onClick={() => router.push("/")} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
        </div>

        {isEditMode && editInvoiceData && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
            Editing invoice <strong>{editInvoiceData.invoice_number}</strong> — changes will overwrite the existing invoice.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">{error}</div>
        )}

        {/* Client Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Bill To</h2>

          {clients.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
              <select
                value={selectedClientId}
                onChange={e => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              >
                <option value="new">+ New client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company || c.name}</option>
                ))}
              </select>
              {loadingClient && <p className="text-xs text-gray-400 mt-1">Loading last invoice…</p>}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name {selectedClientId === "new" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                placeholder="Acme Pty Ltd"
                value={client.company}
                onChange={e => setClient({ ...client, company: e.target.value })}
                disabled={selectedClientId !== "new"}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                placeholder="123 Main St, Melbourne VIC 3000"
                value={client.address}
                onChange={e => setClient({ ...client, address: e.target.value })}
                disabled={selectedClientId !== "new"}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address to send invoices to
              </label>
              <input
                type="email"
                placeholder="accounts@acme.com.au"
                value={client.email}
                onChange={e => setClient({ ...client, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              />
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Contact Person</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={client.contactName}
                    onChange={e => setClient({ ...client, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="john.smith@acme.com.au"
                    value={client.contactEmail}
                    onChange={e => setClient({ ...client, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Role</label>
                  <input
                    type="text"
                    placeholder="Project Manager"
                    value={client.contactRole}
                    onChange={e => setClient({ ...client, contactRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Period */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Work Period</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Line Items</h2>

          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_90px_110px_80px] gap-2 mb-1">
            <span className="text-sm font-medium text-gray-600 px-3">Description</span>
            <span className="text-sm font-medium text-gray-600 px-3">Hours</span>
            <span className="text-sm font-medium text-gray-600 px-3">Rate ($/hr)</span>
            <span></span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="mb-3">
              {/* Mobile: card layout */}
              <div className="sm:hidden border border-gray-200 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Description of work"
                  value={item.description}
                  onChange={e => updateItem(index, "description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hours</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={item.hoursWorked === 0 ? "" : item.hoursWorked}
                      onChange={e => updateItem(index, "hoursWorked", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-right text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rate ($/hr)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.hourlyRate === 0 ? "" : item.hourlyRate}
                      onChange={e => updateItem(index, "hourlyRate", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-right text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
              {/* Desktop: grid layout */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_90px_110px_80px] gap-2">
                <input
                  type="text"
                  placeholder="Description of work"
                  value={item.description}
                  onChange={e => updateItem(index, "description", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder=""
                  value={item.hoursWorked === 0 ? "" : item.hoursWorked}
                  onChange={e => updateItem(index, "hoursWorked", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-right"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.hourlyRate === 0 ? "" : item.hourlyRate}
                  onChange={e => updateItem(index, "hourlyRate", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-right"
                />
                <button
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            + Add Item
          </button>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">GST Rate (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={gstRate}
                onChange={e => setGstRate(Number(e.target.value) || 10)}
                className="w-16 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-right"
              />
            </div>
            <div className="text-right space-y-1">
              <p className="text-gray-600">Subtotal: <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span></p>
              <p className="text-gray-600">GST ({gstRate}%): <span className="font-medium text-gray-900">${gstAmount.toFixed(2)}</span></p>
              <p className="text-xl font-bold text-gray-900">Total: ${total.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? (isEditMode ? "Updating..." : "Saving...")
              : (isEditMode ? "Update Invoice" : "Save Invoice")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateInvoice() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-gray-500">Loading…</p></div>}>
      <CreateInvoiceForm />
    </Suspense>
  );
}
