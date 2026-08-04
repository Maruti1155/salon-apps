"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

interface DashboardResponse {
  success: boolean;
  data: {
    customers: number;
    appointments: number;
    services: number;
    revenue: number;
  };
}

const initialStats = {
  customers: 0,
  appointments: 0,
  services: 0,
  revenue: 0,
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const userData = localStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    }

    async function loadDashboardStats() {
      try {
        const res = await apiFetch("/dashboard/stats");

        const data: DashboardResponse = await res.json();

        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    }

    loadDashboardStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white px-8 py-4 shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Salon Management System</h1>
            <p className="text-sm text-gray-500">Welcome to your dashboard</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/services")}
              className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              Services
            </button>
            <button
              onClick={() => router.push("/dashboard/customers")}
              className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              Customers
            </button>
            <button
              onClick={() => router.push("/dashboard/appointments")}
              className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              Appointments
            </button>
            <button
              onClick={handleLogout}
              className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-8">
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">User Information</h2>

          <div className="space-y-2">
            <p>
              <strong>Name:</strong>{" "}
              {user ? `${user.firstName ?? ""} ${user.lastName ?? ""}` : ""}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>

            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Customers" value={stats.customers.toString()} />

          <DashboardCard
            title="Appointments"
            value={stats.appointments.toString()}
          />

          <DashboardCard title="Services" value={stats.services.toString()} />

          <DashboardCard title="Revenue" value={`₹${stats.revenue}`} />
        </div>
      </section>
    </main>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
}

function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg">
      <h3 className="text-gray-500">{title}</h3>

      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
