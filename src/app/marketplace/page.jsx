'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, ShoppingCart, Eye, CreditCard, Bitcoin, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const [formatFilter, setFormatFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('invoice');
  const [userId, setUserId] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const queryClient = useQueryClient();

  // Generate a user ID on first load (simulating Telegram user ID)
  useEffect(() => {
    if (!userId) {
      setUserId(`user_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [userId]);

  // Fetch data entries
  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['marketplace-entries', searchTerm, statusFilter, formatFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (formatFilter) params.append('format', formatFilter);
      params.append('limit', '20');
      
      const response = await fetch(`/api/data-entries?${params}`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    }
  });

  // Fetch user orders
  const { data: ordersData } = useQuery({
    queryKey: ['user-orders', userId],
    queryFn: async () => {
      if (!userId) return { orders: [] };
      const response = await fetch(`/api/orders?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!userId
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace-entries']);
      queryClient.invalidateQueries(['user-orders']);
      setShowOrderModal(false);
      setSelectedEntry(null);
      setCart([]);
    }
  });

  const handleOrderNow = (entry) => {
    setSelectedEntry(entry);
    setShowOrderModal(true);
  };

  const handleAddToCart = (entry) => {
    if (!cart.find(item => item.id === entry.id)) {
      setCart([...cart, entry]);
    }
  };

  const handleRemoveFromCart = (entryId) => {
    setCart(cart.filter(item => item.id !== entryId));
  };

  const handleCreateOrder = () => {
    if (selectedEntry) {
      createOrderMutation.mutate({
        userId,
        dataEntryId: selectedEntry.id,
        paymentMethod
      });
    }
  };

  const handleBulkOrder = () => {
    cart.forEach(entry => {
      createOrderMutation.mutate({
        userId,
        dataEntryId: entry.id,
        paymentMethod
      });
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05151B] to-[#E9ECEF] dark:from-[#0A0A0A] dark:to-[#1E1E1E]">
      {/* Header */}
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-instrument font-medium text-white dark:text-gray-100">
              Data Marketplace
            </h1>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 dark:border-white/10">
                <span className="text-sm font-inter font-medium text-white/90 dark:text-gray-300">
                  User: {userId?.slice(0, 8)}...
                </span>
              </div>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] p-3 rounded-full hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] transition-all duration-200"
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search data entries..."
                className="pl-10 pr-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </select>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
            >
              <option value="">All Formats</option>
              <option value="format1">Full Data</option>
              <option value="format2">Basic Data</option>
            </select>
          </div>

          <div className="text-white/70 dark:text-gray-400 text-sm">
            {entriesData?.total || 0} entries available
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-white/10 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded"></div>
              </div>
            ))
          ) : entriesData?.entries?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-white/60 dark:text-gray-500 text-lg">No data entries found</div>
            </div>
          ) : (
            entriesData?.entries?.map((entry) => (
              <div key={entry.id} className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-white dark:text-gray-100 font-mono text-lg font-semibold mb-2">
                      {entry.card_number?.slice(0, 4)}****{entry.card_number?.slice(-4)}
                    </div>
                    <div className="text-white/80 dark:text-gray-300 text-sm mb-1">
                      {entry.cardholder_name || 'Unknown Cardholder'}
                    </div>
                    <div className="text-white/60 dark:text-gray-400 text-xs">
                      {entry.card_brand} • {entry.card_type || 'Unknown Type'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#D6FF57] dark:text-[#B8E845] font-bold text-xl">
                      ${entry.price}
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      entry.status === 'available' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {entry.status}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-white/70 dark:text-gray-400 text-xs">
                    <span className="font-medium">Bank:</span> {entry.bank_name?.slice(0, 40)}...
                  </div>
                  <div className="text-white/70 dark:text-gray-400 text-xs">
                    <span className="font-medium">Country:</span> {entry.country || 'Unknown'}
                  </div>
                  <div className="text-white/70 dark:text-gray-400 text-xs">
                    <span className="font-medium">Format:</span> {entry.data_format === 'format1' ? 'Full Data' : 'Basic Data'}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(entry)}
                    disabled={entry.status !== 'available' || cart.find(item => item.id === entry.id)}
                    className="flex-1 bg-white/10 dark:bg-white/5 text-white dark:text-gray-100 px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 dark:border-white/10"
                  >
                    {cart.find(item => item.id === entry.id) ? 'In Cart' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => handleOrderNow(entry)}
                    disabled={entry.status !== 'available'}
                    className="flex-1 bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-4 py-2 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* My Orders Section */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-6 md:p-8">
          <h2 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-6">
            My Orders
          </h2>

          {ordersData?.orders?.length === 0 ? (
            <div className="text-center py-8 text-white/60 dark:text-gray-500">
              No orders yet
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData?.orders?.map((order) => (
                <div key={order.id} className="bg-white/5 dark:bg-white/5 rounded-xl p-4 border border-white/10 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-white dark:text-gray-100 font-mono">
                        {order.card_number?.slice(0, 4)}****{order.card_number?.slice(-4)}
                      </div>
                      <div className="text-white/70 dark:text-gray-400 text-sm">
                        {order.payment_method === 'invoice' ? <FileText size={16} /> : <Bitcoin size={16} />}
                        {order.payment_method}
                      </div>
                      <div className="text-white dark:text-gray-100 font-semibold">
                        ${order.total_amount}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'completed' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : order.payment_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {order.payment_status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                        {order.payment_status === 'pending' && <Clock size={12} className="mr-1" />}
                        {order.payment_status === 'cancelled' && <XCircle size={12} className="mr-1" />}
                        {order.payment_status}
                      </span>
                      <div className="text-white/60 dark:text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-sm border-l border-white/20 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-instrument font-medium text-white dark:text-gray-100">
                Shopping Cart
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-white/70 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
              >
                <XCircle size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-white/60 dark:text-gray-500">
                Your cart is empty
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white/5 dark:bg-white/5 rounded-xl p-3 border border-white/10 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white dark:text-gray-100 font-mono text-sm">
                            {item.card_number?.slice(0, 4)}****{item.card_number?.slice(-4)}
                          </div>
                          <div className="text-white/70 dark:text-gray-400 text-xs">
                            {item.cardholder_name || 'Unknown'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold">
                            ${item.price}
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/20 dark:border-white/10 pt-4 mb-6">
                  <div className="flex items-center justify-between text-white dark:text-gray-100 font-semibold text-lg">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                    >
                      <option value="invoice">Invoice</option>
                      <option value="cryptocurrency">Cryptocurrency</option>
                    </select>
                  </div>

                  <button
                    onClick={handleBulkOrder}
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-6 py-4 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createOrderMutation.isPending ? 'Processing...' : `Order All (${cart.length} items)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-6 max-w-md w-full">
            <h3 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-4">
              Order Confirmation
            </h3>

            <div className="bg-white/5 dark:bg-white/5 rounded-xl p-4 border border-white/10 dark:border-white/5 mb-6">
              <div className="text-white dark:text-gray-100 font-mono text-lg font-semibold mb-2">
                {selectedEntry.card_number?.slice(0, 4)}****{selectedEntry.card_number?.slice(-4)}
              </div>
              <div className="text-white/80 dark:text-gray-300 text-sm mb-1">
                {selectedEntry.cardholder_name || 'Unknown Cardholder'}
              </div>
              <div className="text-white/60 dark:text-gray-400 text-xs mb-3">
                {selectedEntry.card_brand} • {selectedEntry.country}
              </div>
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-bold text-xl">
                ${selectedEntry.price}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                >
                  <option value="invoice">Invoice</option>
                  <option value="cryptocurrency">Cryptocurrency</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-white/10 dark:bg-white/5 text-white dark:text-gray-100 px-4 py-3 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending}
                className="flex-1 bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-4 py-3 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isPending ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        .font-instrument {
          font-family: 'Instrument Sans', sans-serif;
        }
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}