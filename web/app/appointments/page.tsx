import Link from "next/link";

export default function AppointmentsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-4 text-3xl font-bold">Appointments</h1>
        <p className="mb-6 text-gray-600">
          Schedule and manage appointments from the dashboard.
        </p>
        <Link
          href="/dashboard/appointments"
          className="rounded bg-black px-5 py-3 text-white hover:bg-gray-800"
        >
          Open appointment manager
        </Link>
      </div>
    </main>
  );
}
