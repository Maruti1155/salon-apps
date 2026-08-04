import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Salon Management System
        </h1>

        <p className="text-gray-600 mb-8">
          Manage appointments, customers, services, staff, billing and reports
          from one platform.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="border border-black text-black py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Roles Supported</p>

          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <span className="px-3 py-1 bg-gray-200 rounded-full">
              Super Admin
            </span>

            <span className="px-3 py-1 bg-gray-200 rounded-full">
              Admin
            </span>

            <span className="px-3 py-1 bg-gray-200 rounded-full">
              Staff
            </span>

            <span className="px-3 py-1 bg-gray-200 rounded-full">
              Customer
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}