import Link from "next/link";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between w-full max-w-6xl px-4 py-2 mx-auto">
      <div className="flex items-center p-4">
        <Link href="/">
          <img
            src="/images/logo.png" // 👈 served from public folder
            alt="Almas Logo"
            className="h-8 w-auto" // 👈 adjust size as needed
          />
        </Link>
      </div>
      <div className="hidden md:flex space-x-4 p-4">
        <a
          href="/About"
          className="text-white text-lg font-medium hover:border-b-2 hover:border-purple-500 hover:text-neutral-300"
        >
          About
        </a>
        <a
          href="/Contact"
          className="text-white text-lg font-medium hover:border-b-2 hover:border-purple-500 hover:text-neutral-300"
        >
          Contact
        </a>
        <Link href="/seller">
          <span className="text-white text-lg font-medium hover:border-b-2 hover:border-purple-500 hover:text-neutral-300 cursor-pointer">
            Seller Dashboard
          </span>
        </Link>

        <Link href="/login">
            <button className="bg-purple-500 text-white text-lg font-medium px-6 py-2 rounded-md hover:bg-purple-600 transition duration-200">
            Log In
            </button>
        </Link>
        
      </div>
    </nav>
  );
};

export default Navbar;
