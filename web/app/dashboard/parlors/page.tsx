"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { salonApi } from "@/lib/salon-api";

interface OrganizationItem {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  users?: Array<{ id: number; email: string; role: string }>;
  customers?: Array<{ id: number; name: string }>;
  services?: Array<{ id: number; name: string }>;
  appointments?: Array<{ id: number; status: string }>;
}

export default function ParlorsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    address: "",
    phone: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadOrganizations = async () => {
    try {
      const res = await salonApi.getOrganizations();
      setOrganizations(res.data || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load parlors");
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        address: form.address,
        phone: form.phone,
        email: form.email,
      };

      if (editingId) {
        await salonApi.updateOrganization(editingId, payload);
        setMessage("Parlor updated successfully");
      } else {
        await salonApi.createOrganization(payload);
        setMessage("Parlor created successfully");
      }

      setForm({ name: "", slug: "", address: "", phone: "", email: "" });
      setEditingId(null);
      await loadOrganizations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org: OrganizationItem) => {
    setEditingId(org.id);
    setForm({
      name: org.name,
      slug: org.slug,
      address: org.address || "",
      phone: org.phone || "",
      email: org.email || "",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await salonApi.deleteOrganization(id);
      setMessage("Parlor deleted successfully");
      await loadOrganizations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Parlor Management</h1>
            <p className="text-sm text-gray-600">Super admin: view and manage all salons / parlors</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Parlor name"
              className="rounded border p-3"
              required
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Slug"
              className="rounded border p-3"
              required
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="rounded border p-3"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="rounded border p-3"
            />
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Parlor address"
              className="min-h-24 rounded border p-3 md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={loading} className="rounded bg-black px-5 py-3 text-white disabled:opacity-60">
              {loading ? "Saving..." : editingId ? "Update Parlor" : "Create Parlor"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", slug: "", address: "", phone: "", email: "" });
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
          <h2 className="mb-4 text-xl font-semibold">Parlor List</h2>

          <div className="space-y-3">
            {organizations.length === 0 ? (
              <p className="text-gray-500">No parlors found.</p>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="rounded border p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{org.name}</h3>
                      <p className="text-sm text-gray-600">Slug: {org.slug}</p>
                      <p className="text-sm text-gray-600">Address: {org.address || "No address"}</p>
                      <p className="text-sm text-gray-600">Phone: {org.phone || "No phone"}</p>
                      <p className="text-sm text-gray-600">Email: {org.email || "No email"}</p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(org)} className="rounded bg-yellow-500 px-3 py-2 text-white">Edit</button>
                      <button onClick={() => handleDelete(org.id)} className="rounded bg-red-600 px-3 py-2 text-white">Delete</button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                    <span>Users: {org.users?.length ?? 0}</span>
                    <span>Customers: {org.customers?.length ?? 0}</span>
                    <span>Services: {org.services?.length ?? 0}</span>
                    <span className="md:col-span-3">Appointments: {org.appointments?.length ?? 0}</span>
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
