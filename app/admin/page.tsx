"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  abn: string;
  hourly_rate: number;
  gst_rate: number;
  invoice_start_number: number;
  created_at: string;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  companyName: "",
  address: "",
  companyEmail: "",
  phone: "",
  abn: "",
  hourlyRate: 0,
  gstRate: 10,
  invoiceStartNumber: 1,
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null); // null = adding new
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      if (!(session?.user as any)?.isAdmin) {
        router.replace("/");
        return;
      }
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      } else {
        setError("Failed to load users");
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "", // leave blank = don't change
      companyName: user.company_name || "",
      address: user.company_address || "",
      companyEmail: user.company_email || "",
      phone: user.company_phone || "",
      abn: user.abn || "",
      hourlyRate: user.hourly_rate || 0,
      gstRate: user.gst_rate || 10,
      invoiceStartNumber: user.invoice_start_number || 1,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setFormError("Name and email are required");
      return;
    }
    if (!editUser && !form.password) {
      setFormError("Password is required for new users");
      return;
    }
    setSaving(true);
    setFormError("");

    try {
      const res = editUser
        ? await fetch(`/api/admin/users/${editUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save");
      } else {
        setShowModal(false);
        fetchUsers();
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete user");
        setDeleteId(null);
      }
    } catch {
      setError("Failed to delete user");
      setDeleteId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">User Management</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex justify-between">
            {error}
            <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              All Users <span className="text-sm font-normal text-gray-500 ml-2">({users.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ABN</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                      {user.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "") && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.company_name || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.abn || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">${user.hourly_rate}/hr</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {new Date(user.created_at).toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteId === user.id ? (
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-red-600">Confirm?</span>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(user.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editUser ? `Edit: ${editUser.name}` : "Add New User"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">{formError}</div>
              )}

              {/* Account */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editUser && <span className="font-normal text-gray-400">(leave blank to keep current)</span>}
                      {!editUser && <span className="text-red-500"> *</span>}
                    </label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder={editUser ? "••••••••" : ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                    <input type="email" value={form.companyEmail} onChange={e => setForm({ ...form, companyEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ABN</label>
                    <input type="text" value={form.abn} onChange={e => setForm({ ...form, abn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Start Number</label>
                    <input type="number" value={form.invoiceStartNumber} onChange={e => setForm({ ...form, invoiceStartNumber: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                    <input type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                    <input type="number" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: parseFloat(e.target.value) || 10 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900" />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
