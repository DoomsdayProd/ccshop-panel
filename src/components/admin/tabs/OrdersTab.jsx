export function OrdersTab({ ordersData }) {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-6">
        Order Management
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20 dark:border-white/10">
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Order ID</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">User ID</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Card Number</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Payment Method</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-inter font-medium text-white/90 dark:text-gray-300">Date</th>
            </tr>
          </thead>
          <tbody>
            {ordersData?.orders?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-white/60 dark:text-gray-500">No orders found</td></tr>
            ) : (
              ordersData?.orders?.map((order) => (
                <tr key={order.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/5 dark:hover:bg-white/5">
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100 font-mono">#{order.id}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">{order.user_id?.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100 font-mono">{order.card_number?.slice(0, 4)}****{order.card_number?.slice(-4)}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">{order.payment_method}</td>
                  <td className="py-3 px-4 text-sm text-white dark:text-gray-100">${order.total_amount}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === "completed" ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : order.payment_status === "pending" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/80 dark:text-gray-300">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
