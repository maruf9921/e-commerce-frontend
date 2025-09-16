"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";


export default function SignUpPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--; // not yet had birthday this year
  }

  return age;
};


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const age = calculateAge(dob);

    // Regex checks
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(name)) {
      setError("Full name must only contain letters.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
      return;
    }


    if (password.length < 8 || password.length > 16) {
      setError("Password must be between 8 and 16 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (age < 18) {
    setError("You must be 18 years or older to register.");
    return;
  }

    try {
      const res = await axios.post("http://localhost:4000/auth/register", {
        name,
        email,
        password,
        age,  // 👈 send age instead of dob
        role,
      });
      console.log(res.data);
      setSuccess("Account created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDob("");
      setRole("");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Something went wrong.");
      } else {
        setError("Server error. Please try again later.");
      }
    }

    
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">
            Sign up to get started with our store
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-300">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
          </div>


          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            >
              <option value="">Select your role</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            Sign Up
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
