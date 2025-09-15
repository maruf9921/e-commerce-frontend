'use client';
import CursorTrail from "@/components/CursorTrail/CursorTrail";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "user" as "user" | "seller"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  });

  const { register, user, redirectToDashboard } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectToDashboard();
    }
  }, [user, redirectToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    // Clear validation errors when user starts typing
    if (validationErrors[id as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [id]: "" });
    }
    
    // Clear general error
    if (error) {
      setError("");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors = { username: "", email: "", password: "", role: "" };
    let isValid = true;

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters long";
      isValid = false;
    } else if (formData.username.length > 100) {
      errors.username = "Username cannot exceed 100 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    // Role validation
    if (!formData.role || !["user", "seller"].includes(formData.role)) {
      errors.role = "Please select a valid role";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        // The redirectToDashboard will be called automatically when user state updates
        setTimeout(() => {
          redirectToDashboard();
        }, 100);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Header Section (above the card) */}
      <CursorTrail />
      <div className="text-center mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <h2 className="text-xl text-purple-400 font-semibold">
          Join Our E-commerce Platform
        </h2>
        <p className="text-gray-400 text-sm">
          Please fill in your details to create an account.
        </p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm text-gray-300 mb-2">
              Account Type <span className="text-red-400">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.role
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-purple-500'
              }`}
            >
              <option value="user">Customer Account</option>
              <option value="seller">Seller Account (Requires Verification)</option>
            </select>
            {validationErrors.role && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.role}</p>
            )}
            {formData.role === "seller" && (
              <p className="text-yellow-400 text-sm mt-1">
                ⚠️ Seller accounts require admin verification before you can list products.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm text-gray-300">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.username
                    ? 'border-red-500 focus:ring-red-500'
                    : 'focus:ring-purple-500'
                }`}
                placeholder="Enter username"
              />
              {validationErrors.username && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-300">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-purple-500'
              }`}
              placeholder="Enter your email"
            />
            {validationErrors.email && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-purple-500'
              }`}
              placeholder="Enter password (min 6 characters)"
            />
            {validationErrors.password && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm text-gray-300">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter phone number"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        {/* Login Link */}
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
