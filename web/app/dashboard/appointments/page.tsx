"use client";

import { useEffect, useState } from "react";
import { salonApi } from "@/lib/salon-api";

interface CustomerItem {
  id: number;
  name: string;
}

interface ServiceItem {
  id: number;
  name: string;
  price: number;
}

interface AppointmentItem {
  id: number;
  appointmentDate: string;
  status: string;
  amount: number;
  customer: CustomerItem;
  service: ServiceItem;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState({
    customerId: "",
    serviceId: "",
    appointmentDate: "",
    status: "PENDING",
    amount: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [appointmentsRes, customersRes, servicesRes] = await Promise.all([
        salonApi.getAppointments(),
        salonApi.getCustomers(),
        salonApi.getServices(),
      ]);

      setAppointments(appointmentsRes.data || []);
      setCustomers(customersRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load appointment data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        customerId: Number(form.customerId),
        serviceId: Number(form.serviceId),
        appointmentDate: form.appointmentDate,
        status: form.status,
        amount: form.amount ? Number(form.amount) : undefined,
      };

      if (editingId) {
        await salonApi.updateAppointment(editingId, payload);
        setMessage("Appointment updated successfully");
      } else {
        await salonApi.createAppointment(payload);
        setMessage("Appointment created successfully");
      }

      setForm({
        customerId: "",
        serviceId: "",
        appointmentDate: "",
        status: "PENDING",
        amount: "",
      });
      setEditingId(null);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: AppointmentItem) => {
    setEditingId(appointment.id);
    setForm({
      customerId: String(appointment.customer.id),
      serviceId: String(appointment.service.id),
      appointmentDate: new Date(appointment.appointmentDate).toISOString().slice(0, 16),
      status: appointment.status,
      amount: String(appointment.amount),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await salonApi.deleteAppointment(id);
      setMessage("Appointment deleted successfully");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <a href="/dashboard" className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50">
            Back to Dashboard
          </a>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="rounded border p-3" required>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>

            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="rounded border p-3" required>
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              className="rounded border p-3"
              required
            />

            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded border p-3">
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount"
              className="rounded border p-3 md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={loading} className="rounded bg-black px-5 py-3 text-white disabled:opacity-60">
              {loading ? "Saving..." : editingId ? "Update Appointment" : "Create Appointment"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ customerId: "", serviceId: "", appointmentDate: "", status: "PENDING", amount: "" });
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
          <h2 className="mb-4 text-xl font-semibold">Appointment List</h2>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found.</p>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between rounded border p-4">
                  <div>
                    <h3 className="font-semibold">{appointment.customer?.name}</h3>
                    <p className="text-sm text-gray-600">{appointment.service?.name}</p>
                    <p className="text-sm text-gray-600">{new Date(appointment.appointmentDate).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Status: {appointment.status} • Amount: ₹{appointment.amount}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(appointment)} className="rounded bg-yellow-500 px-3 py-2 text-white">Edit</button>
                    <button onClick={() => handleDelete(appointment.id)} className="rounded bg-red-600 px-3 py-2 text-white">Delete</button>
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
