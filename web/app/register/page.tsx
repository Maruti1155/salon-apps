import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Create Account
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Choose your registration type
          </h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/register/parlor"
            className="rounded-2xl border-2 border-black bg-black p-6 text-left text-white transition hover:bg-gray-800"
          >
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-300">
              Register as
            </div>
            <div className="text-2xl font-bold">Parlor Owner</div>
            <p className="mt-3 text-sm text-gray-200">
              Create your salon or parlor business and manage staff, customers, services, and appointments.
            </p>
          </Link>

          <Link
            href="/register/user"
            className="rounded-2xl border-2 border-slate-200 bg-white p-6 text-left text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-500">
              Register as
            </div>
            <div className="text-2xl font-bold">Normal User</div>
            <p className="mt-3 text-sm text-slate-600">
              Create a standard customer or staff account for an existing parlor organization.
            </p>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold underline">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}