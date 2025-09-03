import CursorTrail from "@/components/CursorTrail/CursorTrail";
import React from "react";
import Link from "next/link";

export default function LoginPage() {
  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Header Section (above the card) */}
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

      {/* Login Card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
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
              id="password"
              type="password"
              className="w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            Log In
          </button>
        </form>
        {/* Login Link */}
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
