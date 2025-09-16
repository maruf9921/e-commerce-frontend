"use client";

import CursorTrail from "@/components/CursorTrail/CursorTrail";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import

interface JwtPayload {
  id: number; // userId
  email: string;
}

interface LoginResponse {
  access_token: string;
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
  const res = await axios.post<string>("http://localhost:4000/auth/login", form);

  const access_token: string = res.data;
  const decoded: JwtPayload = jwtDecode(access_token);

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("user", JSON.stringify(decoded));

  router.push("/AdminDashboard");
} catch (err: any) {
  console.error("Login error:", err.response?.data || err.message);
  setError(err.response?.data?.message || "Login failed. Please try again.");
} finally {
  setLoading(false);
}

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <CursorTrail />
      <div className="text-center mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <h2 className="text-xl text-purple-400 font-semibold">
          Sign In your account
        </h2>
        <p className="text-gray-400 text-sm">
          Please enter your details to sign in.
        </p>
      </div>

      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-gray-400">
          Don’t have an account?{" "}
          <Link href="/Singup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
