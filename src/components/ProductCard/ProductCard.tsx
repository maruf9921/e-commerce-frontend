import React from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-4 flex flex-col items-center">
      <Link href={`/products/${product.id}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
          className="rounded-lg object-cover cursor-pointer"
        />
      </Link>
      <h3 className="mt-4 text-lg font-semibold text-white">
        <Link href={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <p className="text-purple-400 font-medium">${product.price}</p>
      <Link
        href={`/products/${product.id}`}
        className="mt-3 w-full text-center bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition block"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;
