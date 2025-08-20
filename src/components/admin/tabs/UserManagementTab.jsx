import { Search, Edit2 } from "lucide-react";

export function UserManagementTab({
  userSearchTerm,
  setUserSearchTerm,
  userStatusFilter,
  setUserStatusFilter,
  usersData,
  usersLoading,
  setEditingUser,
}) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-4 md:mb-0">
          User Management
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 dark:text-gray-500" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent text-sm"
            />
          </div>
          <select
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20 dark:border-white/10">
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">User</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Telegram ID</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Wallet Balance</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Total Spent</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Orders</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-white/60 dark:text-gray-500">Loading users...</td></tr>
            ) : usersData?.users?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-white/60 dark:text-gray-500">No users found</td></tr>
            ) : (
              usersData?.users?.map((user) => (
                <tr key={user.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/5 dark:hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm text-white dark:text-gray-100">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-white/60 dark:text-gray-500">@{user.username || "No username"}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100 font-mono">{user.telegram_id}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">${parseFloat(user.wallet_balance || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">${parseFloat(user.total_spent || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">{user.total_orders || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active" ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : user.status === "banned" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setEditingUser(user)} className="text-[#D6FF57] dark:text-[#B8E845] hover:text-[#C4F94E] dark:hover:text-[#A6D93A] transition-colors">
                      <Edit2 size={16} />
                    </button>
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
