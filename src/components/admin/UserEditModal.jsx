import { X } from "lucide-react";

export function UserEditModal({
  editingUser,
  setEditingUser,
  handleUpdateUser,
  updateUserMutation,
}) {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-instrument font-medium text-white dark:text-gray-100">
            Edit User
          </h3>
          <button
            onClick={() => setEditingUser(null)}
            className="text-white/70 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
              Wallet Balance
            </label>
            <input
              type="number"
              step="0.01"
              value={editingUser.wallet_balance}
              onChange={(e) =>
                setEditingUser({ ...editingUser, wallet_balance: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={editingUser.status}
              onChange={(e) =>
                setEditingUser({ ...editingUser, status: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setEditingUser(null)}
              className="flex-1 bg-white/10 dark:bg-white/5 text-white dark:text-gray-100 px-4 py-3 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdateUser(editingUser)}
              disabled={updateUserMutation.isPending}
              className="flex-1 bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-4 py-3 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
