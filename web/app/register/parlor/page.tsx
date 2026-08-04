"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function ParlorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
    organizationSlug: "",
    organizationPhone: "",
    organizationEmail: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await authApi.registerParlor(formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Parlor registration failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Register Parlor</h1>
        <p className="mb-6 text-sm text-slate-600">Create a salon or parlor account as the owner/admin.</p>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input name="firstName" placeholder="First name" className="rounded border p-3" onChange={handleChange} required />
          <input name="lastName" placeholder="Last name" className="rounded border p-3" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" className="rounded border p-3 md:col-span-2" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="rounded border p-3 md:col-span-2" onChange={handleChange} required />

          <input name="organizationName" placeholder="Parlor name" className="rounded border p-3 md:col-span-2" onChange={handleChange} required />
          <input name="organizationSlug" placeholder="Parlor slug (for URL / internal id)" className="rounded border p-3 md:col-span-2" onChange={handleChange} required />
          <input name="organizationPhone" placeholder="Parlor phone" className="rounded border p-3" onChange={handleChange} />
          <input name="organizationEmail" type="email" placeholder="Parlor email" className="rounded border p-3" onChange={handleChange} />

          <button type="submit" className="md:col-span-2 rounded bg-black px-4 py-3 font-medium text-white hover:bg-gray-800">
            Create Parlor
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
