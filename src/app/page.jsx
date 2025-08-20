import { Shield, ShoppingBag, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05151B] to-[#E9ECEF] dark:from-[#0A0A0A] dark:to-[#1E1E1E]">
      {/* Header */}
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-instrument font-medium text-white dark:text-gray-100">
              Data Marketplace
            </h1>
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 dark:border-white/10">
              <span className="text-sm font-inter font-medium text-white/90 dark:text-gray-300">
                Telegram Mini App
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-12 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-instrument font-medium text-white dark:text-gray-100 leading-tight mb-6">
            Secure Data Trading Platform
          </h2>
          <p className="text-xl text-white/80 dark:text-gray-300 font-inter leading-relaxed max-w-2xl mx-auto">
            Upload, manage, and trade data entries with cryptocurrency and
            invoice payment options. Built for Telegram bot integration.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Panel Card */}
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-8 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-[#D6FF57] dark:bg-[#B8E845] rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200">
              <Shield className="w-8 h-8 text-[#001826] dark:text-[#0A0A0A]" />
            </div>

            <h3 className="text-2xl font-instrument font-medium text-white dark:text-gray-100 mb-4">
              Admin Panel
            </h3>

            <p className="text-white/70 dark:text-gray-400 font-inter mb-6 leading-relaxed">
              Upload bulk data entries, manage listings, track orders, and
              monitor marketplace analytics. Full administrative control over
              your data marketplace.
            </p>

            <a
              href="/admin"
              className="inline-flex items-center space-x-2 bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-6 py-3 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] active:bg-[#B8E845] dark:active:bg-[#94C92D] group-hover:translate-x-1"
            >
              <span>Access Admin Panel</span>
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Marketplace Card */}
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-8 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-[#D6FF57] dark:bg-[#B8E845] rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200">
              <ShoppingBag className="w-8 h-8 text-[#001826] dark:text-[#0A0A0A]" />
            </div>

            <h3 className="text-2xl font-instrument font-medium text-white dark:text-gray-100 mb-4">
              Marketplace
            </h3>

            <p className="text-white/70 dark:text-gray-400 font-inter mb-6 leading-relaxed">
              Browse available data entries, add items to cart, place orders
              with invoice or cryptocurrency payment. Perfect for Telegram bot
              subscribers.
            </p>

            <a
              href="/marketplace"
              className="inline-flex items-center space-x-2 bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-6 py-3 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] active:bg-[#B8E845] dark:active:bg-[#94C92D] group-hover:translate-x-1"
            >
              <span>Browse Marketplace</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-16 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-8">
          <h3 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-6 text-center">
            Platform Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold mb-2">
                Bulk Upload
              </div>
              <div className="text-white/70 dark:text-gray-400 text-sm">
                Support for both full and simplified data formats
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold mb-2">
                Payment Options
              </div>
              <div className="text-white/70 dark:text-gray-400 text-sm">
                Invoice and cryptocurrency payment methods
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold mb-2">
                Real-time Updates
              </div>
              <div className="text-white/70 dark:text-gray-400 text-sm">
                Live inventory and order status tracking
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold mb-2">
                Shopping Cart
              </div>
              <div className="text-white/70 dark:text-gray-400 text-sm">
                Add multiple items and bulk order processing
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold mb-2">
                Search & Filter
              </div>
              <div className="text-white/70 dark:text-gray-400 text-sm">
                Advanced filtering by status, format, and keywords
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#D6FF57] dark:text-[#B8E845] font-semibold mb-2">
                Order Management
              </div>
              <div className="text-white/70 dark:text-gray-400 text-sm">
                Complete order lifecycle tracking and management
              </div>
            </div>
          </div>
        </div>
      </div>

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
