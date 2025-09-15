import React from "react";
import Link from "next/link";

export default function SellerAnalyticsPage() {
  // Mock analytics data
  const analyticsData = {
    revenue: {
      today: 1250,
      thisWeek: 8500,
      thisMonth: 28750,
      lastMonth: 24500
    },
    orders: {
      today: 15,
      thisWeek: 89,
      thisMonth: 324,
      lastMonth: 298
    },
    visitors: {
      today: 245,
      thisWeek: 1678,
      thisMonth: 5890,
      lastMonth: 5234
    },
    topProducts: [
      { name: "Wireless Headphones", sales: 45, revenue: 4455 },
      { name: "Gaming Mouse", sales: 38, revenue: 2242 },
      { name: "Smart Watch", sales: 32, revenue: 4768 },
      { name: "Mechanical Keyboard", sales: 28, revenue: 3612 }
    ],
    salesData: [
      { month: "Jan", sales: 18500 },
      { month: "Feb", sales: 22300 },
      { month: "Mar", sales: 19800 },
      { month: "Apr", sales: 25600 },
      { month: "May", sales: 28900 },
      { month: "Jun", sales: 31200 },
    ]
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your sales performance and growth</p>
        </div>
        <Link href="/seller" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
          Back to Dashboard
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Monthly Revenue</h3>
            <span className="text-green-400 text-sm">
              +{getGrowthPercentage(analyticsData.revenue.thisMonth, analyticsData.revenue.lastMonth)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">${analyticsData.revenue.thisMonth.toLocaleString()}</div>
          <div className="text-sm text-gray-400">vs ${analyticsData.revenue.lastMonth.toLocaleString()} last month</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Monthly Orders</h3>
            <span className="text-green-400 text-sm">
              +{getGrowthPercentage(analyticsData.orders.thisMonth, analyticsData.orders.lastMonth)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{analyticsData.orders.thisMonth}</div>
          <div className="text-sm text-gray-400">vs {analyticsData.orders.lastMonth} last month</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Store Visitors</h3>
            <span className="text-green-400 text-sm">
              +{getGrowthPercentage(analyticsData.visitors.thisMonth, analyticsData.visitors.lastMonth)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{analyticsData.visitors.thisMonth.toLocaleString()}</div>
          <div className="text-sm text-gray-400">vs {analyticsData.visitors.lastMonth.toLocaleString()} last month</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Avg. Order Value</h3>
            <span className="text-blue-400 text-sm">
              ${(analyticsData.revenue.thisMonth / analyticsData.orders.thisMonth).toFixed(2)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${(analyticsData.revenue.thisMonth / analyticsData.orders.thisMonth).toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">per order this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue Trend</h2>
          <div className="space-y-4">
            {analyticsData.salesData.map((data, index) => (
              <div key={data.month} className="flex items-center">
                <div className="w-12 text-gray-400 text-sm">{data.month}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-full h-6 relative">
                    <div 
                      className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(data.sales / 35000) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        ${(data.sales / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{product.name}</div>
                    <div className="text-gray-400 text-sm">{product.sales} sales</div>
                  </div>
                </div>
                <div className="text-green-400 font-semibold">
                  ${product.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Today's Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">${analyticsData.revenue.today}</div>
            <div className="text-gray-400">Revenue Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{analyticsData.orders.today}</div>
            <div className="text-gray-400">Orders Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{analyticsData.visitors.today}</div>
            <div className="text-gray-400">Visitors Today</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link href="/seller/analytics/detailed" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
          View Detailed Report
        </Link>
        <Link href="/seller/analytics/export" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Export Data
        </Link>
        <Link href="/seller/analytics/settings" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
          Analytics Settings
        </Link>
      </div>
    </div>
  );
}
