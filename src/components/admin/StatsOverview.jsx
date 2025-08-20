import {
  Package,
  Eye,
  DollarSign,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

const StatCard = ({ icon: Icon, value, label, colorClass }) => (
  <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-white/10">
    <div className="flex items-center space-x-3">
      {Icon ? (
        <Icon className={`w-8 h-8 ${colorClass}`} />
      ) : (
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
      )}
      <div>
        <div className="text-2xl font-bold text-white dark:text-gray-100">
          {value}
        </div>
        <div className="text-xs text-white/70 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  </div>
);

export function StatsOverview({ stats }) {
  const statItems = [
    { icon: Package, value: stats.totalEntries, label: "Total Entries", colorClass: "text-[#D6FF57] dark:text-[#B8E845]" },
    { icon: Eye, value: stats.availableEntries, label: "Available", colorClass: "text-green-400" },
    { icon: DollarSign, value: stats.soldEntries, label: "Sold", colorClass: "text-blue-400" },
    { icon: ShoppingCart, value: stats.totalOrders, label: "Total Orders", colorClass: "text-purple-400" },
    { icon: Users, value: stats.totalUsers, label: "Total Users", colorClass: "text-cyan-400" },
    { icon: null, value: stats.activeUsers, label: "Active Users" },
    { icon: Wallet, value: `$${stats.totalWalletBalance.toFixed(2)}`, label: "Total Wallets", colorClass: "text-yellow-400" },
    { icon: null, value: stats.completedOrders, label: "Completed" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 mb-8">
      {statItems.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
}
