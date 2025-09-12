import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CursorTrail from "@/components/CursorTrail/CursorTrail";
import { AuthProvider } from "@/contexts/AuthContextNew";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "E-Commerce App",
  description: "Your one-stop e-commerce destination for quality products",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Log environment variables in development
  if (process.env.NODE_ENV === "development") {
    console.log("Frontend connected to:", process.env.NEXT_PUBLIC_API_URL);
  }

  return (
    <>
    <CursorTrail />
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning={true}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
    </>
  );
}

