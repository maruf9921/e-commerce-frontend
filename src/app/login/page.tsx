'use client';
import CursorTrail from "@/components/CursorTrail/CursorTrail";
import { SessionNotification } from "@/components/SessionNotification";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContextNew";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: ""
  });

  const { login, user, redirectToDashboard } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for session expiration or other URL parameters
  useEffect(() => {
    const expired = searchParams.get('expired');
    const redirect = searchParams.get('redirect');
    
    if (expired === 'true') {
      setError("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  // Redirect if already logged in (with delay to avoid conflicts)
  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => {
        redirectToDashboard();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, redirectToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
    const errors = { email: "", password: "" };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email or username is required";
      isValid = false;
    } else if (formData.email.length < 3) {
      errors.email = "Email or username must be at least 3 characters";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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
      console.log("🔐 Attempting login...");
      const result = await login(formData.email, formData.password);
      console.log("📝 Login result:", result);
      
      if (result.success) {
        console.log("✅ Login successful");
        // Check if there's a redirect URL from the search params
        const redirectUrl = searchParams.get('redirect');
        
        // The redirectToDashboard will be called automatically when user state updates
        // But we can also call it explicitly here for immediate redirect
        setTimeout(() => {
          redirectToDashboard();
        }, 100);
      } else {
        console.log("❌ Login failed:", result.message);
        
        // Handle seller verification messages specially
        if (result.needsVerification) {
          // Store the email for verification page
          sessionStorage.setItem('verificationEmail', formData.email);
          
          // Redirect to verification pending page
          router.push('/seller/verification-pending');
          return;
        } else {
          setError(result.message);
        }
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Session Notification */}
      <SessionNotification />
      
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
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 mt-1 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-purple-500'
              }`}
              placeholder="Enter your email or username"
            />
            {validationErrors.email && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              Password
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
              placeholder="Enter your password"
            />
            {validationErrors.password && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Log In"}
          </button>
        </form>
        
        {/* Signup Link */}
        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/Singup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
