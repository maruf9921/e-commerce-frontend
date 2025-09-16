import React from 'react';
import axios from 'axios';
import ProductsClient from './products-client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stockQuantity: number;
  category: string;
  isActive: boolean;
  images?: Array<{
    id: number;
    imageUrl: string;
    altText: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    productId: number;
  }>;
  createdAt: string;
  userId: number;
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
}

interface ProductsResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Server-side data fetching
async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002';
    
    // Use different endpoint for SSR to get products with images and seller info
    const response = await axios.get<ProductsResponse>(`${apiUrl}/products/with-images`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📦 SSR: Fetched ${response.data.products?.length || 0} products`);
    return response.data.products || [];
  } catch (error) {
    console.error('❌ SSR: Failed to fetch products:', error);
    
    // Fallback: try the basic products endpoint
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002';
      const fallbackResponse = await axios.get<Product[]>(`${apiUrl}/products`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📦 SSR Fallback: Fetched ${fallbackResponse.data?.length || 0} products`);
      return fallbackResponse.data || [];
    } catch (fallbackError) {
      console.error('❌ SSR Fallback: Failed to fetch products:', fallbackError);
      return [];
    }
  }
}

export default async function ProductsPage() {
  // Fetch products on the server
  const products = await getProducts();

  return (
    <div>
      {/* Pass the server-fetched data to the client component */}
      <ProductsClient initialProducts={products} />
    </div>
  );
}

// Enable static generation for better performance
export const revalidate = 60; // Revalidate every 60 seconds