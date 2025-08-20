import { Search } from "lucide-react";

export function ManageListingsTab({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  formatFilter,
  setFormatFilter,
  entriesData,
  isLoading,
}) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-4 md:mb-0">
          Manage Data Listings
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries..."
              className="pl-10 pr-4 py-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent text-sm"
          >
            <option value="">All Formats</option>
            <option value="format1">Format 1 (Full)</option>
            <option value="format2">Format 2 (Simple)</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20 dark:border-white/10">
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Card Number</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Cardholder</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Bank</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Brand</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Price</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-white/60 dark:text-gray-500">Loading entries...</td></tr>
            ) : entriesData?.entries?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-white/60 dark:text-gray-500">No entries found</td></tr>
            ) : (
              entriesData?.entries?.map((entry) => (
                <tr key={entry.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/5 dark:hover:bg-white/5">
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100 font-mono">{entry.card_number?.slice(0, 4)}****{entry.card_number?.slice(-4)}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">{entry.cardholder_name || "Unknown"}</td>
                  <td className="py-3 px-4 text-sm text-white/80 dark:text-gray-300">{entry.bank_name?.slice(0, 30)}...</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">{entry.card_brand}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">${entry.price}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === "available" ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : entry.status === "reserved" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
