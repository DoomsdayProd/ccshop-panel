import {
  Upload,
  Package,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

const tabs = [
  { id: "upload", label: "Upload Data", icon: Upload },
  { id: "manage", label: "Manage Listings", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "User Management", icon: Users },
  { id: "settings", label: "Bot Settings", icon: Settings },
];

export function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-1 mb-8 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/20 dark:border-white/10 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-inter font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A]"
              : "text-white/70 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <tab.icon size={18} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
