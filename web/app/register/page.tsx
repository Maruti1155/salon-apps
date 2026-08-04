"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    try {
      await authApi.register(formData);

      setMessage("Registration successful");

      setFormData({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        password: "",
      });
      router.replace("/login");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Server connection failed"
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="firstName"
            value={formData.firstName}
            placeholder="First Name"
            className="w-full rounded border p-3"
            onChange={handleChange}
          />

          <input
            name="lastName"
            value={formData.lastName}
            placeholder="Last Name"
            className="w-full rounded border p-3"
            onChange={handleChange}
          />

          <input
            name="mobile"
            value={formData.mobile}
            placeholder="Mobile Number"
            className="w-full rounded border p-3"
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            placeholder="Email"
            className="w-full rounded border p-3"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            value={formData.password}
            placeholder="Password"
            className="w-full rounded border p-3"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full rounded bg-black py-3 text-white hover:bg-gray-800"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}