'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';

interface OrderItem {
  id: number;
  productNameSnapshot: string;
  quantity: number;
  unitPriceSnapshot: number;
  subtotal: number;
  productId: number;
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  placedAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderItems: OrderItem[];
  payment?: {
    status: string;
    provider: string;
    amount: number;
  };
}

export default function SellerOrders() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    if (user && isAuthorized) {
      fetchOrders();
    }
  }, [user, isAuthorized, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/seller/orders?${params}`, {
        method: 'GET',
        credentials: 'include', // Use cookie-based authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error('Failed to fetch seller orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string, trackingNumber?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include', // Use cookie-based authentication
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingNumber || undefined
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error('Failed to update order status');
      }

      // Refresh orders
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    let trackingNumber: string | undefined;
    
    if (newStatus === 'shipped') {
      trackingNumber = prompt('Enter tracking number (optional):') || undefined;
    }
    
    updateOrderStatus(orderId, newStatus, trackingNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="text-gray-400">Manage your orders and fulfillment</p>
            </div>
            <button
              onClick={() => router.push('/seller/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex-1"></div>
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="text-center py-8">
            <div className="text-white">Loading orders...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                      <p className="text-sm text-gray-400">
                        Placed on {new Date(order.placedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-bold text-white mt-1">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Items</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="text-gray-300">
                          <span className="font-medium">{item.productNameSnapshot}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <div className="text-white">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="px-6 py-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-400">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Actions */}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <div className="px-6 py-4 border-t border-gray-700 bg-gray-750">
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                              handleStatusUpdate(order.id, 'cancelled');
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}