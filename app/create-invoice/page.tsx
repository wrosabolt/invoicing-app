"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Hash, Save } from "lucide-react";

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
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gstRate, setGstRate] = useState(10);
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber] = useState(generateInvoiceNumber());

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setGstRate(data.gstRate || 10);
        const rate = data.hourlyRate || 85;
        setItems([{ description: "", hoursWorked: 0, hourlyRate: rate }]);
      })
      .catch(() => {
        setItems([{ description: "", hoursWorked: 0, hourlyRate: 85 }]);
      })
      .finally(() => setLoading(false));
  }, []);

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
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Create Invoice - {invoiceNumber}</h1>
        <p className="text-sm text-gray-500">Subtotal: ${subtotal.toFixed(2)} | GST: ${gstAmount.toFixed(2)} | Total: ${total.toFixed(2)}</p>
      </div>
    </div>
  );
}
