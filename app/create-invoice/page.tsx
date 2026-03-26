"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

interface InvoiceItem {
  description: string;
  hoursWorked: number;
  hourlyRate: number;
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
    name: "",
    company: "",
    address: "",
    email: "",
    phone: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", hoursWorked: 0, hourlyRate: 85 }
  ]);
  const [gstRate, setGstRate] = useState(10);
  const [showPreview, setShowPreview] = useState(false);

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
    setItems(prev => [...prev, { description: "", hoursWorked: 0, hourlyRate: 85 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoice Preview</h1>
                <p className="text-gray-500 mt-1">{generateInvoiceNumber()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Back</button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Download</button>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Hours</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{item.description || "Services"}</td>
                    <td className="text-right">{item.hoursWorked}</td>
                    <td className="text-right">${item.hourlyRate.toFixed(2)}</td>
                    <td className="text-right">${(item.hoursWorked * item.hourlyRate).toFixed(2)}</td>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <button onClick={() => router.push("/")} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Bill To</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Contact Name"
              value={client.name}
              onChange={e => setClient({ ...client, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
            />
            <input
              type="text"
              placeholder="Company"
              value={client.company}
              onChange={e => setClient({ ...client, company: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Line Items</h2>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={e => updateItem(index, "description", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              />
              <input
                type="number"
                min="0"
                step="0.5"
                value={item.hoursWorked}
                onChange={e => updateItem(index, "hoursWorked", parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-right"
              />
              <button onClick={() => removeItem(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded" disabled={items.length === 1}>Remove</button>
            </div>
          ))}
          <button onClick={addItem} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Item</button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-medium text-gray-700">GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={e => setGstRate(Number(e.target.value))}
                className="ml-2 w-20 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              />
            </div>
            <div className="text-right">
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>GST: ${gstAmount.toFixed(2)}</p>
              <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={() => setShowPreview(true)} className="mt-4 w-full px-4 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700">Create Invoice</button>
        </div>
      </div>
    </div>
  );
}
