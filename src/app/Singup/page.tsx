"use client";
<<<<<<< HEAD

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
=======
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { getUsersApiUrl } from "@/config/api";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert frontend role values to backend enum values
      const backendFormData = {
        ...formData,
        role: formData.role === "USER" ? "USER" : formData.role === "SELLER" ? "SELLER" : "ADMIN"
      };

      console.log("Sending data to backend:", backendFormData);

      const res = await axios.post(`${getUsersApiUrl()}/create`, backendFormData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const result = res.data as { username: string };
      
      // Show different messages based on role
      if (formData.role === "SELLER") {
        alert("Seller account created successfully! ✅\n\n" +
              "⚠️ IMPORTANT NOTICE: Your account requires admin approval before you can login.\n\n" +
              "📝 What happens next:\n" +
              "1. Admin will review your seller application\n" +
              "2. You'll be notified once approved\n" +
              "3. After approval, you can login to access your seller dashboard\n\n" +
              "💡 If you try to login before approval, you'll see an admin verification message.\n\n" +
              "Thank you for joining us, " + result.username + "!");
      } else {
        alert("Account created successfully! Welcome " + result.username);
      }

      // Reset form
      setFormData({
        username: "",
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      
      if (err.response) {
        // Backend responded with error status
        const errorData = err.response.data;
        console.log("Backend error response:", errorData);
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
        
        if (errorData.message && Array.isArray(errorData.message)) {
          setError("Validation errors: " + errorData.message.join(", "));
        } else {
          setError(errorData.message || `Error: ${err.response.status}`);
        }
      } else if (err.request) {
        // Network error - no response received
        setError("Cannot connect to server. Please check if the backend is running");
      } else {
        // Other error
        setError(err.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">Sign up to get started with our store</p>
        </div>

<<<<<<< HEAD
        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
=======
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
<<<<<<< HEAD
              value={name}
              onChange={(e) => setName(e.target.value)}
=======
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
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
<<<<<<< HEAD
              value={email}
              onChange={(e) => setEmail(e.target.value)}
=======
              id="email"
              value={formData.email}
              onChange={handleChange}
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
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
<<<<<<< HEAD
              value={password}
              onChange={(e) => setPassword(e.target.value)}
=======
              id="password"
              value={formData.password}
              onChange={handleChange}
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
              placeholder="Enter your password"
              minLength={10}
              title="Password must be at least 10 characters long and contain at least one lowercase letter"
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 10 characters with at least one lowercase letter</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
              Phone
            </label>
            <input
<<<<<<< HEAD
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
=======
              type="text"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number (must start with 01)"
              pattern="^01\d+"
              title="Phone number must start with 01"
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            />
            <p className="text-xs text-gray-400 mt-1">Phone must start with 01</p>
          </div>


          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
<<<<<<< HEAD
              value={role}
              onChange={(e) => setRole(e.target.value)}
=======
              id="role"
              value={formData.role}
              onChange={handleChange}
>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              
            >
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
<<<<<<< HEAD
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          {/* Submit Button */}
=======

          {/* Seller Verification Notice */}
          {formData.role === "SELLER" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">⚠️ Seller Account Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Admin approval required:</strong> Your account needs verification before login</li>
                      <li><strong>Cannot login immediately:</strong> Wait for admin approval notification</li>
                      <li><strong>Verification process:</strong> Admin reviews and approves seller applications</li>
                      <li><strong>After approval:</strong> You'll be able to access your seller dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

>>>>>>> d8fd6274d7144cdcfcaade2fc311c26893ef5ab6
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

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
