import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get current timestamp
    const now = new Date();

    // Get total stock items
    const [totalItemsResult] = await sql`
      SELECT COUNT(*) as total FROM data_entries
    `;
    const totalItems = parseInt(totalItemsResult.total);

    // Get items in stock (quantity > 0)
    const [inStockResult] = await sql`
      SELECT COUNT(*) as count FROM data_entries WHERE quantity > 0
    `;
    const inStockItems = parseInt(inStockResult.count);

    // Get items with low stock (quantity <= 10)
    const [lowStockResult] = await sql`
      SELECT COUNT(*) as count FROM data_entries WHERE quantity > 0 AND quantity <= 10
    `;
    const lowStockItems = parseInt(lowStockResult.count);

    // Get items out of stock (quantity = 0)
    const [outOfStockResult] = await sql`
      SELECT COUNT(*) as count FROM data_entries WHERE quantity = 0
    `;
    const outOfStockItems = parseInt(outOfStockResult.count);

    // Get total stock value
    const [totalValueResult] = await sql`
      SELECT COALESCE(SUM(price * quantity), 0) as total_value FROM data_entries
    `;
    const totalStockValue = parseFloat(totalValueResult.total_value);

    // Get low stock alerts (items with quantity <= 5)
    const lowStockAlerts = await sql`
      SELECT 
        id,
        title,
        quantity,
        price,
        category
      FROM data_entries 
      WHERE quantity > 0 AND quantity <= 5
      ORDER BY quantity ASC
      LIMIT 10
    `;

    // Get out of stock items
    const outOfStockItemsList = await sql`
      SELECT 
        id,
        title,
        price,
        category,
        last_restocked
      FROM data_entries 
      WHERE quantity = 0
      ORDER BY last_restocked DESC
      LIMIT 10
    `;

    // Get stock movement (recent additions/removals)
    const stockMovement = await sql`
      SELECT 
        de.title,
        de.quantity,
        de.updated_at,
        CASE 
          WHEN de.quantity > 0 THEN 'in_stock'
          ELSE 'out_of_stock'
        END as status
      FROM data_entries de
      WHERE de.updated_at >= ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}
      ORDER BY de.updated_at DESC
      LIMIT 20
    `;

    // Get stock by category
    const stockByCategory = await sql`
      SELECT 
        category,
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        COALESCE(SUM(price * quantity), 0) as total_value
      FROM data_entries
      GROUP BY category
      ORDER BY total_value DESC
    `;

    // Get items that need restocking (out of stock for more than 7 days)
    const needsRestocking = await sql`
      SELECT 
        id,
        title,
        price,
        category,
        last_restocked,
        EXTRACT(DAYS FROM NOW() - last_restocked) as days_out_of_stock
      FROM data_entries 
      WHERE quantity = 0 
        AND last_restocked < ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}
      ORDER BY last_restocked ASC
      LIMIT 10
    `;

    // Get stock turnover (items sold in last 30 days)
    const stockTurnover = await sql`
      SELECT 
        de.id,
        de.title,
        de.quantity as current_stock,
        COUNT(o.id) as orders_last_30_days,
        COALESCE(SUM(o.amount), 0) as revenue_last_30_days
      FROM data_entries de
      LEFT JOIN orders o ON de.id = o.data_entry_id 
        AND o.payment_status = 'completed' 
        AND o.created_at >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()}
      GROUP BY de.id, de.title, de.quantity
      ORDER BY orders_last_30_days DESC
      LIMIT 15
    `;

    // Calculate stock health score
    const stockHealthScore = totalItems > 0 
      ? Math.round(((inStockItems / totalItems) * 100) - (lowStockItems * 2) - (outOfStockItems * 5))
      : 0;

    // Get stock alerts summary
    const stockAlerts = {
      lowStock: lowStockItems,
      outOfStock: outOfStockItems,
      needsRestocking: needsRestocking.length,
      totalAlerts: lowStockItems + outOfStockItems + needsRestocking.length
    };

    return Response.json({
      totalItems,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalStockValue,
      stockHealthScore,
      lowStockAlerts,
      outOfStockItemsList,
      stockMovement,
      stockByCategory,
      needsRestocking,
      stockTurnover,
      stockAlerts,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching stock stats:', error);
    return Response.json({ error: 'Failed to fetch stock statistics' }, { status: 500 });
  }
}
