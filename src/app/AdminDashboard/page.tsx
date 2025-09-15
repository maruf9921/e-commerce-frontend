"use client";
import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch user info from backend using JWT
    axios.get("http://localhost:4000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-800">
        Loading user data...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-800">
        No user data found. Please login again.
      </div>
    );}
    
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome {user.name}</p>

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold">📦 Products</h2>
            <p className="text-gray-500">Manage all products</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold">👥 Users</h2>
            <p className="text-gray-500">View and manage users</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold">📊 Orders</h2>
            <p className="text-gray-500">Track and update orders</p>
          </div>
        </div>
      </main>
    </div>
  );
}
