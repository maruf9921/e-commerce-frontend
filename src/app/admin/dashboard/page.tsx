'use client';
import { useAdminGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContextNew';
import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';

interface Seller {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading, isAuthorized } = useAdminGuard();
  const { logout } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [pendingSellers, setPendingSellers] = useState<Seller[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAuthorized && !loading) {
      fetchSellers();
    }
  }, [isAuthorized, loading]);

  const fetchSellers = async () => {
    try {
      setLoadingData(true);
      
      // Fetch pending sellers for verification
      const pendingResponse = await api.get<Seller[]>('/admin/sellers/pending');
      setPendingSellers(pendingResponse.data);
      
      // Fetch verified sellers
      const verifiedResponse = await api.get<Seller[]>('/admin/sellers/verified');
      setSellers(verifiedResponse.data);    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const verifySeller = async (sellerId: number) => {
    try {
      await api.post(`/admin/sellers/${sellerId}/verify`, {});
      
      // Refresh data
      fetchSellers();
      alert('Seller verified successfully!');
    } catch (error) {
      console.error('Error verifying seller:', error);
      alert('Error verifying seller');
    }
  };

  const rejectSeller = async (sellerId: number) => {
    try {
      await api.post(`/admin/sellers/${sellerId}/reject`, {});
      
      // Refresh data
      fetchSellers();
      alert('Seller rejected successfully!');
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Error rejecting seller');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading admin dashboard...</p>
        </div>
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-400">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.fullName || user?.username}!</p>
        </div>

        {/* Pending Sellers Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
            Pending Seller Verifications ({pendingSellers.length})
          </h2>
          
          {pendingSellers.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No pending seller verifications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingSellers.map((seller) => (
                <div key={seller.id} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{seller.fullName}</h3>
                  <p className="text-gray-400 mb-1">@{seller.username}</p>
                  <p className="text-gray-400 mb-1">{seller.email}</p>
                  <p className="text-gray-400 mb-4">
                    Applied: {new Date(seller.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => verifySeller(seller.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => rejectSeller(seller.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Sellers Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            Verified Sellers ({sellers.length})
          </h2>
          
          {sellers.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No verified sellers yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sellers.map((seller) => (
                <div key={seller.id} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{seller.fullName}</h3>
                  <p className="text-gray-400 mb-1">@{seller.username}</p>
                  <p className="text-gray-400 mb-1">{seller.email}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                      Verified
                    </span>
                    {seller.isActive ? (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-sm">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => logout()}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
