import CursorTrail from "@/components/CursorTrail/CursorTrail";
import ProductCard from "@/components/ProductCard/ProductCard";
import Image from "next/image";

export default function Home() {

  const products = [
    { id: 1, name: "Wireless Headphones", price: 99, image: "/images/wireless_head_phone.jpg" },
    { id: 2, name: "Smart Watch", price: 149, image: "/images/smart_watch.jpg" },
    { id: 3, name: "Gaming Mouse", price: 59, image: "/images/Gaming-Mouse.jpg" },
    { id: 4, name: "Mechanical Keyboard", price: 129, image: "/images/Mechanical-Keyboard.jpeg" },
  ];

  return (
    <>
    <CursorTrail />
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-10 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <h1 className="text-6xl font-semibold animate-pulse">Welcome to Our E-Commerce Store</h1>
          <p>Discover a wide range of products at unbeatable prices.</p>
    </div>
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-white mb-4">Featured Products</h2>
      <p className="text-gray-400">Explore our top picks just for you</p>
    </div>
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
      
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </>
  );
}
