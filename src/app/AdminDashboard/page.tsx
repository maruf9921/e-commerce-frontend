"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


interface JwtPayload {
  id: number;
  email: string;
  role?: string; 
}

export default function AdminDashboard() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // no user in storage → redirect
      router.push("/Login");
      return;
    }

    try {
      const parsedUser: JwtPayload = JSON.parse(storedUser);

      if (!parsedUser.id || !parsedUser.email) {
        // invalid payload → redirect
        router.push("/Login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data", error);
      router.push("/Login");
    }
  }, [router]);

  if (!user) {
    return <p className="text-center mt-10">Loading admin info...</p>;
  }

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex-1 space-y-4">
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">
            Dashboard
          </a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">
            Users
          </a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">
            Products
          </a>
          <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">
            Settings
          </a>
        </nav>
        <button
          // onClick={handleLogout}
          className="mt-auto py-2 px-3 rounded bg-red-600 hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.email}</h1>
        <p className="mb-8 text-gray-300">Your Admin ID: {user.id}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Total Users</h2>
            <p className="mt-2 text-2xl font-bold text-purple-400">150</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Active Orders</h2>
            <p className="mt-2 text-2xl font-bold text-green-400">45</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Revenue</h2>
            <p className="mt-2 text-2xl font-bold text-blue-400">$12,300</p>
          </div>
        </div>
      </main>
    </div>  
  
  );
}
