"use client";

import { useEffect, useState } from "react";
import { salonApi } from "@/lib/salon-api";

interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadServices = async () => {
    try {
      const res = await salonApi.getServices();
      setServices(res.data || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load services");
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        description: form.description,
        duration: Number(form.duration),
        price: Number(form.price),
        isActive: form.isActive,
      };

      if (editingId) {
        await salonApi.updateService(editingId, payload);
        setMessage("Service updated successfully");
      } else {
        await salonApi.createService(payload);
        setMessage("Service created successfully");
      }

      setForm({
        name: "",
        description: "",
        duration: "",
        price: "",
        isActive: true,
      });
      setEditingId(null);
      await loadServices();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || "",
      duration: String(service.duration),
      price: String(service.price),
      isActive: service.isActive,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await salonApi.deleteService(id);
      setMessage("Service deleted successfully");
      await loadServices();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Services</h1>
          <a href="/dashboard" className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50">
            Back to Dashboard
          </a>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Service name"
              className="rounded border p-3"
              required
            />
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="Duration (minutes)"
              className="rounded border p-3"
              required
            />
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price"
              className="rounded border p-3"
              required
            />
            <label className="flex items-center gap-3 rounded border p-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="mt-4 min-h-24 w-full rounded border p-3"
          />

          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={loading} className="rounded bg-black px-5 py-3 text-white disabled:opacity-60">
              {loading ? "Saving..." : editingId ? "Update Service" : "Create Service"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", description: "", duration: "", price: "", isActive: true });
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
          <h2 className="mb-4 text-xl font-semibold">Service List</h2>

          <div className="space-y-3">
            {services.length === 0 ? (
              <p className="text-gray-500">No services found.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded border p-4">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description || "No description"}</p>
                    <p className="text-sm text-gray-600">
                      {service.duration} min • ₹{service.price} • {service.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(service)} className="rounded bg-yellow-500 px-3 py-2 text-white">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="rounded bg-red-600 px-3 py-2 text-white">
                      Delete
                    </button>
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
