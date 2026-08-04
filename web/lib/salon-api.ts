import { apiFetch } from "./api";

export const salonApi = {
  getServices: () => apiFetch("/services").then((res) => res.json()),
  createService: (payload: unknown) =>
    apiFetch("/services", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
  updateService: (id: number, payload: unknown) =>
    apiFetch(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
  deleteService: (id: number) =>
    apiFetch(`/services/${id}`, {
      method: "DELETE",
    }).then((res) => res.json()),

  getCustomers: () => apiFetch("/customers").then((res) => res.json()),
  createCustomer: (payload: unknown) =>
    apiFetch("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
  updateCustomer: (id: number, payload: unknown) =>
    apiFetch(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
  deleteCustomer: (id: number) =>
    apiFetch(`/customers/${id}`, {
      method: "DELETE",
    }).then((res) => res.json()),

  getAppointments: () => apiFetch("/appointments").then((res) => res.json()),
  createAppointment: (payload: unknown) =>
    apiFetch("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
  updateAppointment: (id: number, payload: unknown) =>
    apiFetch(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
  deleteAppointment: (id: number) =>
    apiFetch(`/appointments/${id}`, {
      method: "DELETE",
    }).then((res) => res.json()),

  getDashboardStats: () => apiFetch("/dashboard/stats").then((res) => res.json()),
};
