import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get current timestamp and calculate time ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total sales and orders
    const [totalSalesResult] = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(amount), 0) as total_sales
      FROM orders 
      WHERE payment_status = 'completed'
    `;
    const totalOrders = parseInt(totalSalesResult.total_orders);
    const totalSales = parseFloat(totalSalesResult.total_sales);

    // Get today's sales
    const [todaySalesResult] = await sql`
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(amount), 0) as sales
      FROM orders 
      WHERE payment_status = 'completed' AND created_at >= ${today.toISOString()}
    `;
    const todayOrders = parseInt(todaySalesResult.orders);
    const todaySales = parseFloat(todaySalesResult.sales);

    // Get this week's sales
    const [weekSalesResult] = await sql`
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(amount), 0) as sales
      FROM orders 
      WHERE payment_status = 'completed' AND created_at >= ${weekAgo.toISOString()}
    `;
    const weekOrders = parseInt(weekSalesResult.orders);
    const weekSales = parseFloat(weekSalesResult.sales);

    // Get this month's sales
    const [monthSalesResult] = await sql`
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(amount), 0) as sales
      FROM orders 
      WHERE payment_status = 'completed' AND created_at >= ${monthAgo.toISOString()}
    `;
    const monthOrders = parseInt(monthSalesResult.orders);
    const monthSales = parseFloat(monthSalesResult.sales);

    // Get pending orders
    const [pendingOrdersResult] = await sql`
      SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'
    `;
    const pendingOrders = parseInt(pendingOrdersResult.count);

    // Get failed orders
    const [failedOrdersResult] = await sql`
      SELECT COUNT(*) as count FROM orders WHERE payment_status = 'failed'
    `;
    const failedOrders = parseInt(failedOrdersResult.count);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get conversion rate (completed orders vs total attempts)
    const [totalAttemptsResult] = await sql`
      SELECT COUNT(*) as count FROM orders
    `;
    const totalAttempts = parseInt(totalAttemptsResult.count);
    const conversionRate = totalAttempts > 0 ? (totalOrders / totalAttempts) * 100 : 0;

    // Get sales by payment method
    const salesByPaymentMethod = await sql`
      SELECT 
        payment_method,
        COUNT(*) as orders,
        COALESCE(SUM(amount), 0) as total_amount
      FROM orders 
      WHERE payment_status = 'completed'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;

    // Get top selling items
    const topSellingItems = await sql`
      SELECT 
        de.title,
        de.id,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.amount), 0) as total_revenue
      FROM orders o
      JOIN data_entries de ON o.data_entry_id = de.id
      WHERE o.payment_status = 'completed'
      GROUP BY de.id, de.title
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    // Get hourly sales for today (for chart data)
    const hourlySales = await sql`
      SELECT 
        EXTRACT(HOUR FROM o.created_at) as hour,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.amount), 0) as sales
      FROM orders o
      WHERE o.payment_status = 'completed' AND o.created_at >= ${today.toISOString()}
      GROUP BY EXTRACT(HOUR FROM o.created_at)
      ORDER BY hour
    `;

    // Get daily sales for the last 30 days
    const dailySales = await sql`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.amount), 0) as sales
      FROM orders o
      WHERE o.payment_status = 'completed' AND o.created_at >= ${monthAgo.toISOString()}
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `;

    // Calculate growth rates
    const lastWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(weekAgo.getTime());
    
    const [lastWeekSalesResult] = await sql`
      SELECT COALESCE(SUM(amount), 0) as sales
      FROM orders 
      WHERE payment_status = 'completed' AND created_at >= ${lastWeekStart.toISOString()} AND created_at <= ${lastWeekEnd.toISOString()}
    `;
    const lastWeekSales = parseFloat(lastWeekSalesResult.sales);
    
    const weekGrowth = lastWeekSales > 0 ? ((weekSales - lastWeekSales) / lastWeekSales) * 100 : 0;

    return Response.json({
      totalSales,
      totalOrders,
      todaySales,
      todayOrders,
      weekSales,
      weekOrders,
      monthSales,
      monthOrders,
      pendingOrders,
      failedOrders,
      averageOrderValue,
      conversionRate,
      weekGrowth,
      salesByPaymentMethod,
      topSellingItems,
      hourlySales,
      dailySales,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return Response.json({ error: 'Failed to fetch sales statistics' }, { status: 500 });
  }
}
