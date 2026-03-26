"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Invoice, ClientInfo, InvoiceItem } from "@/lib/types";

function generateId() {
  return crypto.randomUUID();
}

function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${year}${month}${day}-${random}`;
}

export default function CreateInvoice() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo>({
    id: generateId(),
    name: "",
    company: "",
    address: "",
    email: "",
    phone: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), description: "", hoursWorked: 0, hourlyRate: 85 }
  ]);
  const [gstRate, setGstRate] = useState(10);
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber] = useState(generateInvoiceNumber());
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState({
    companyName: "",
    address: "",
    email: "",
    phone: "",
    abn: "",
    hourlyRate: 85,
    gstRate: 10
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setGstRate(data.gstRate || 10);
        setItems([{ id: generateId(), description: "", hoursWorked: 0, hourlyRate: data.hourlyRate || 85 }]);
      });
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.hoursWorked * (item.hourlyRate || 0)), 0);
  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  const updateItem = (id: string, field: string, value: string | number | null | undefined) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value === null ? "" : value as string | number } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: generateId(),
      description: "",
      hoursWorked: 0,
      hourlyRate: settings.hourlyRate || 85
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const isFormValid = client.name.trim() !== "" && items.every(item => item.hoursWorked > 0);

  const handleCreateInvoice = async () => {
    if (!isFormValid) return;

    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber,
      clientId: client.id || generateId(),
      clientName: client.name,
      clientCompany: client.company,
      clientAddress: client.address,
      clientEmail: client.email,
      clientPhone: client.phone,
      items,
      subtotal,
      gstRate,
      gstAmount,
      total,
      status: "pending",
      paid: false,
      dueDate,
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice)
      });
      setCreatedInvoice(invoice);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      setCreatedInvoice(invoice);
    }
  };

  const handleBack = () => {
    setCreatedInvoice(null);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!client.email) return;
    const subject = encodeURIComponent(`Invoice ${invoiceNumber}`);
    const body = encodeURIComponent(
      `Dear ${client.name},\n\nPlease find attached invoice ${invoiceNumber} for $${total.toFixed(2)}.\n\nDue: ${dueDate || "Upon receipt"}\n\nThank you for your business.\n\n${settings.companyName}`
    );
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`);
  };

  if (createdInvoice) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoice {invoiceNumber}</h1>
                <p className="text-gray-500 mt-1">Created successfully!</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Email Invoice
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From</h3>
                  <p className="font-medium">{settings.companyName}</p>
                  <p className="whitespace-pre-line text-sm text-gray-600">{settings.address}</p>
                  <p className="text-sm text-gray-600">ABN: {settings.abn}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bill To</h3>
                  <p className="font-medium">{client.name}</p>
                  {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
                  <p className="whitespace-pre-line text-sm text-gray-600">{client.address}</p>
                </div>
              </div>

              <table className="w-full mt-6">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Hours</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description || "Professional services"}</td>
                      <td className="text-right">{item.hoursWorked}</td>
                      <td className="text-right">${(item.hourlyRate || 0).toFixed(2)}</td>
                      <td className="text-right">${(item.hoursWorked * (item.hourlyRate || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 text-right">
                <p>Subtotal: ${subtotal.toFixed(2)}</p>
                <p>GST ({gstRate}%): ${gstAmount.toFixed(2)}</p>
                <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Bill To</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={client.name}
                  onChange={e => setClient({ ...client, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={client.company}
                  onChange={e => setClient({ ...client, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  placeholder="Acme Pty Ltd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={client.address}
                  onChange={e => setClient({ ...client, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  rows={3}
                  placeholder="123 Main Street&#10;Melbourne VIC 3000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={client.email}
                  onChange={e => setClient({ ...client, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={client.phone}
                  onChange={e => setClient({ ...client, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  placeholder="0412 345 678"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Invoice Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={e => setGstRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Line Items</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-gray-700">Description</th>
                <th className="text-right py-2 w-24 text-sm font-medium text-gray-700">Hours</th>
                <th className="text-right py-2 w-28 text-sm font-medium text-gray-700">Hourly Rate</th>
                <th className="text-right py-2 w-28 text-sm font-medium text-gray-700">Amount</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={e => updateItem(item.id, "description", e.target.value as string ?? "")}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                      placeholder="Plumbing services"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.hoursWorked}
                      onChange={e => updateItem(item.id, "hoursWorked", parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-right"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.hourlyRate}
                      onChange={e => updateItem(item.id, "hourlyRate", parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-right"
                    />
                  </td>
                  <td className="py-2 text-right">
                    ${(item.hoursWorked * (item.hourlyRate || 0)).toFixed(2)}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={items.length === 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addItem}
            className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            + Add Item
          </button>

          <div className="mt-6 text-right space-y-1">
            <p className="text-gray-600">Subtotal: <span className="text-gray-900">${subtotal.toFixed(2)}</span></p>
            <p className="text-gray-600">GST ({gstRate}%): <span className="text-gray-900">${gstAmount.toFixed(2)}</span></p>
            <p className="text-xl font-bold text-gray-900">Total: ${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreateInvoice}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded font-medium ${
              isFormValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

