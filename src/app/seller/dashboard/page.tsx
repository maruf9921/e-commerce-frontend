'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContextNew';

export default function SellerDashboard() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const { logout } = useAuth();
  const router = useRouter();

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

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.fullName || user.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Verification Status Alert */}
      {!user.isVerified && (
        <div className="bg-yellow-600 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-200">
                  <strong>Account Pending Verification:</strong> Your seller account is awaiting admin approval. 
                  You will be able to list products once your account is verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Info Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Seller Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Full Name:</strong> {user.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p><strong>Account Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p><strong>Verification Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  user.isVerified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                  {user.isVerified ? 'Verified' : 'Pending'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Products */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">My Products</h3>
            <p className="text-gray-400 mb-4">Manage your product listings</p>
            <button
              onClick={() => router.push('/seller/products')}
              disabled={!user.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user.isVerified
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user.isVerified ? 'Manage Products' : 'Verification Required'}
            </button>
          </div>

          {/* Add Product */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Add New Product</h3>
            <p className="text-gray-400 mb-4">List a new product for sale</p>
            <button
              onClick={() => router.push('/seller/products/new')}
              disabled={!user.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user.isVerified
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user.isVerified ? 'Add Product' : 'Verification Required'}
            </button>
          </div>

          {/* Sales & Orders */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Sales & Orders</h3>
            <p className="text-gray-400 mb-4">Track your sales and orders</p>
            <button
              onClick={() => router.push('/seller/orders')}
              disabled={!user.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user.isVerified
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user.isVerified ? 'View Sales' : 'Verification Required'}
            </button>
          </div>

          {/* Profile Settings */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Profile Settings</h3>
            <p className="text-gray-400 mb-4">Update your seller information</p>
            <button
              onClick={() => router.push('/seller/profile')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Analytics</h3>
            <p className="text-gray-400 mb-4">View your sales analytics</p>
            <button
              onClick={() => router.push('/seller/analytics')}
              disabled={!user.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user.isVerified
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user.isVerified ? 'View Analytics' : 'Verification Required'}
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Help & Support</h3>
            <p className="text-gray-400 mb-4">Get help with selling</p>
            <button
              onClick={() => router.push('/support')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Seller Overview</h2>
          {user.isVerified ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">0</div>
                <div className="text-gray-400">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">0</div>
                <div className="text-gray-400">Orders Received</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">$0</div>
                <div className="text-gray-400">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">0</div>
                <div className="text-gray-400">Product Views</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-yellow-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Account Verification Pending</h3>
              <p className="text-gray-400">
                Your seller account is being reviewed by our admin team. 
                You'll receive an email notification once your account is verified.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
