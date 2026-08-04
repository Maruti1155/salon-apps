"use client";

import { useEffect, useState } from "react";
import { salonApi } from "@/lib/salon-api";

interface CustomerItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      const res = await salonApi.getCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load customers");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
      };

      if (editingId) {
        await salonApi.updateCustomer(editingId, payload);
        setMessage("Customer updated successfully");
      } else {
        await salonApi.createCustomer(payload);
        setMessage("Customer created successfully");
      }

      setForm({ name: "", phone: "", email: "", address: "" });
      setEditingId(null);
      await loadCustomers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: CustomerItem) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await salonApi.deleteCustomer(id);
      setMessage("Customer deleted successfully");
      await loadCustomers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <a href="/dashboard" className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50">
            Back to Dashboard
          </a>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" className="rounded border p-3" required />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded border p-3" required />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded border p-3" />
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="rounded border p-3" />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={loading} className="rounded bg-black px-5 py-3 text-white disabled:opacity-60">
              {loading ? "Saving..." : editingId ? "Update Customer" : "Create Customer"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", phone: "", email: "", address: "" });
                }}
                className="rounded border border-gray-300 bg-white px-5 py-3"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Customer List</h2>

          <div className="space-y-3">
            {customers.length === 0 ? (
              <p className="text-gray-500">No customers found.</p>
            ) : (
              customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between rounded border p-4">
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.email || "No email"}</p>
                    <p className="text-sm text-gray-600">{customer.address || "No address"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(customer)} className="rounded bg-yellow-500 px-3 py-2 text-white">Edit</button>
                    <button onClick={() => handleDelete(customer.id)} className="rounded bg-red-600 px-3 py-2 text-white">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
