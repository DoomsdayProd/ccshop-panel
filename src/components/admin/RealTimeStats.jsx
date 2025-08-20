import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Package, DollarSign, Activity, Eye, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const RealTimeStats = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Real-time queries with automatic refetching
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats/users');
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchIntervalInBackground: true,
  });

  const { data: salesStats, isLoading: salesStatsLoading } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats/sales');
      if (!response.ok) throw new Error('Failed to fetch sales stats');
      return response.json();
    },
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchIntervalInBackground: true,
  });

  const { data: stockStats, isLoading: stockStatsLoading } = useQuery({
    queryKey: ['stock-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats/stock');
      if (!response.ok) throw new Error('Failed to fetch stock stats');
      return response.json();
    },
    refetchInterval: 20000, // Refetch every 20 seconds
    refetchIntervalInBackground: true,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats/activity');
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json();
    },
    refetchInterval: 8000, // Refetch every 8 seconds
    refetchIntervalInBackground: true,
  });

  // Update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-green-400" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'completed': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  if (userStatsLoading || salesStatsLoading || stockStatsLoading) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-instrument font-medium text-white dark:text-gray-100">
            📊 Real-Time Dashboard
          </h2>
          <p className="text-sm text-white/60 dark:text-gray-400 mt-1">
            Live statistics and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/60">LIVE</span>
          </div>
          <div className="text-xs text-white/50">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">
                {formatNumber(userStats?.totalUsers || 0)}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                +{formatNumber(userStats?.newUsersToday || 0)} today
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-white">
                {formatNumber(userStats?.activeUsers || 0)}
              </p>
              <p className="text-xs text-green-200 mt-1">
                {userStats?.activePercentage || 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-300" />
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300 font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(salesStats?.totalSales || 0)}
              </p>
              <p className="text-xs text-purple-200 mt-1">
                {formatNumber(salesStats?.totalOrders || 0)} orders
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-300" />
            </div>
          </div>
        </div>

        {/* Stock Items */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-300 font-medium">Stock Items</p>
              <p className="text-3xl font-bold text-white">
                {formatNumber(stockStats?.totalItems || 0)}
              </p>
              <p className="text-xs text-orange-200 mt-1">
                {formatNumber(stockStats?.lowStockItems || 0)} low stock
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/30 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Analytics */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span>Sales Analytics</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Today's Sales</span>
              <span className="text-white font-semibold">
                {formatCurrency(salesStats?.todaySales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">This Week</span>
              <span className="text-white font-semibold">
                {formatCurrency(salesStats?.weekSales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">This Month</span>
              <span className="text-white font-semibold">
                {formatCurrency(salesStats?.monthSales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Average Order Value</span>
              <span className="text-white font-semibold">
                {formatCurrency(salesStats?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Conversion Rate</span>
              <span className="text-white font-semibold">
                {(salesStats?.conversionRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* User Analytics */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>User Analytics</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">New Users Today</span>
              <span className="text-white font-semibold">
                {formatNumber(userStats?.newUsersToday || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">New Users This Week</span>
              <span className="text-white font-semibold">
                {formatNumber(userStats?.newUsersWeek || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Online Now</span>
              <span className="text-white font-semibold">
                {formatNumber(userStats?.onlineNow || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Premium Users</span>
              <span className="text-white font-semibold">
                {formatNumber(userStats?.premiumUsers || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">User Growth</span>
              <span className={`font-semibold ${userStats?.userGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {userStats?.userGrowth >= 0 ? '+' : ''}{(userStats?.userGrowth || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4 flex items-center space-x-2">
          <Package className="w-5 h-5 text-orange-400" />
          <span>Stock Overview</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatNumber(stockStats?.inStockItems || 0)}
            </div>
            <div className="text-sm text-white/70">In Stock</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {formatNumber(stockStats?.lowStockItems || 0)}
            </div>
            <div className="text-sm text-white/70">Low Stock</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {formatNumber(stockStats?.outOfStockItems || 0)}
            </div>
            <div className="text-sm text-white/70">Out of Stock</div>
          </div>
        </div>

        {stockStats?.lowStockItems > 0 && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 font-medium">
                {stockStats.lowStockItems} items are running low on stock
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>Recent Activity</span>
        </h3>
        
        {activityLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity?.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)} bg-white/10`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeStats;
