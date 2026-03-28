"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Hash, DollarSign, Percent, Building, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [abn, setAbn] = useState("");
  const [hourlyRate, setHourlyRate] = useState("85");
  const [gstRate, setGstRate] = useState("10");
  const [invoiceStartNumber, setInvoiceStartNumber] = useState("1");

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setCompanyName(data.companyName || "");
        setAddress(data.address || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAbn(data.abn || "");
        setHourlyRate(String(data.hourlyRate || 85));
        setGstRate(String(data.gstRate || 10));
        setInvoiceStartNumber(String(data.invoiceStartNumber || 1));
      }
    } finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, address, email, phone, abn, hourlyRate: parseFloat(hourlyRate) || 0, gstRate: parseFloat(gstRate) || 10, invoiceStartNumber: parseInt(invoiceStartNumber) || 1 }),
      });
      setMessage(res.ok ? "Settings saved successfully!" : "Failed to save settings");
    } catch { setMessage("An error occurred"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 max-w-2xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Company Settings</h1>
            <p className="text-purple-200">Manage your business details</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-lg border ${message.includes("success") ? "bg-green-500/20 border-green-400/30 text-green-100" : "bg-red-500/20 border-red-400/30 text-red-100"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Company Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="Your Company Pty Ltd" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Business Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="123 Main St, Melbourne VIC 3000" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="info@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="0412 345 678" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">ABN</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input type="text" value={abn} onChange={(e) => setAbn(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="12 345 678 901" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Hourly Rate ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" min="0" step="0.01" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">GST Rate (%)</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" min="0" max="100" step="0.1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Invoice Starting Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input type="number" value={invoiceStartNumber} onChange={(e) => setInvoiceStartNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-400" min="1" />
            </div>
            <p className="text-xs text-purple-300 mt-1">Invoices will be numbered sequentially from this number</p>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Settings</>}
          </button>
        </form>
      </div>
    </div>
  );
}