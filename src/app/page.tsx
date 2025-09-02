import CursorTrail from "@/components/CursorTrail/CursorTrail";
import Image from "next/image";

export default function Home() {
  return (
    <>
    <CursorTrail />
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-10 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <h1 className="text-6xl font-semibold animate-pulse">Welcome to Our E-Commerce Store</h1>
          <p>Discover a wide range of products at unbeatable prices.</p>
    </div>
    <div className="flex justify-center items-center mb-10">

    </div>

    </>
  );
}
