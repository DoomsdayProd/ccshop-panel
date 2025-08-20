import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get current timestamp
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent user activity
    const userActivity = await sql`
      SELECT 
        'user_login' as type,
        'User logged in' as description,
        'active' as status,
        u.first_name || ' ' || u.last_name as user_name,
        ua.timestamp,
        ua.details
      FROM user_activity_logs ua
      JOIN users u ON ua.user_id = u.telegram_id
      WHERE ua.action = 'login' AND ua.timestamp >= ${last24Hours.toISOString()}
      ORDER BY ua.timestamp DESC
      LIMIT 10
    `;

    // Get recent purchases
    const purchaseActivity = await sql`
      SELECT 
        'purchase' as type,
        'New purchase completed' as description,
        'completed' as status,
        u.first_name || ' ' || u.last_name as user_name,
        o.created_at as timestamp,
        json_build_object(
          'order_id', o.id,
          'amount', o.amount,
          'payment_method', o.payment_method
        ) as details
      FROM orders o
      JOIN users u ON o.user_id = u.telegram_id
      WHERE o.payment_status = 'completed' AND o.created_at >= ${last24Hours.toISOString()}
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    // Get recent bot interactions
    const botActivity = await sql`
      SELECT 
        'bot_interaction' as type,
        'Bot command executed' as description,
        'active' as status,
        u.first_name || ' ' || u.last_name as user_name,
        ua.timestamp,
        json_build_object(
          'command', ua.action,
          'details', ua.details
        ) as details
      FROM user_activity_logs ua
      JOIN users u ON ua.user_id = u.telegram_id
      WHERE ua.action IN ('bot_command', 'webhook_received') AND ua.timestamp >= ${last24Hours.toISOString()}
      ORDER BY ua.timestamp DESC
      LIMIT 10
    `;

    // Get recent admin actions
    const adminActivity = await sql`
      SELECT 
        'admin_action' as type,
        'Admin action performed' as description,
        'completed' as status,
        'Admin' as user_name,
        ua.timestamp,
        json_build_object(
          'action', ua.action,
          'details', ua.details
        ) as details
      FROM user_activity_logs ua
      WHERE ua.action LIKE 'admin_%' AND ua.timestamp >= ${last7Days.toISOString()}
      ORDER BY ua.timestamp DESC
      LIMIT 10
    `;

    // Get system events
    const systemActivity = await sql`
      SELECT 
        'system_event' as type,
        'System event occurred' as description,
        'active' as status,
        'System' as user_name,
        ua.timestamp,
        json_build_object(
          'event', ua.action,
          'details', ua.details
        ) as details
      FROM user_activity_logs ua
      WHERE ua.action IN ('system_startup', 'database_backup', 'error_logged') AND ua.timestamp >= ${last7Days.toISOString()}
      ORDER BY ua.timestamp DESC
      LIMIT 5
    `;

    // Get failed transactions
    const failedActivity = await sql`
      SELECT 
        'failed_transaction' as type,
        'Transaction failed' as description,
        'failed' as status,
        COALESCE(u.first_name || ' ' || u.last_name, 'Unknown User') as user_name,
        o.created_at as timestamp,
        json_build_object(
          'order_id', o.id,
          'amount', o.amount,
          'payment_method', o.payment_method,
          'error', o.payment_status
        ) as details
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.telegram_id
      WHERE o.payment_status = 'failed' AND o.created_at >= ${last24Hours.toISOString()}
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    // Get new user registrations
    const newUserActivity = await sql`
      SELECT 
        'new_user' as type,
        'New user registered' as description,
        'completed' as status,
        u.first_name || ' ' || u.last_name as user_name,
        u.created_at as timestamp,
        json_build_object(
          'username', u.username,
          'language', u.language_code
        ) as details
      FROM users u
      WHERE u.created_at >= ${last24Hours.toISOString()}
      ORDER BY u.created_at DESC
      LIMIT 10
    `;

    // Get stock updates
    const stockActivity = await sql`
      SELECT 
        'stock_update' as type,
        'Stock quantity updated' as description,
        'active' as status,
        'Admin' as user_name,
        de.updated_at as timestamp,
        json_build_object(
          'item_title', de.title,
          'new_quantity', de.quantity,
          'category', de.category
        ) as details
      FROM data_entries de
      WHERE de.updated_at >= ${last24Hours.toISOString()}
      ORDER BY de.updated_at DESC
      LIMIT 10
    `;

    // Combine all activities and sort by timestamp
    const allActivities = [
      ...userActivity,
      ...purchaseActivity,
      ...botActivity,
      ...adminActivity,
      ...systemActivity,
      ...failedActivity,
      ...newUserActivity,
      ...stockActivity
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get activity summary
    const activitySummary = {
      totalActivities: allActivities.length,
      userLogins: userActivity.length,
      purchases: purchaseActivity.length,
      botInteractions: botActivity.length,
      adminActions: adminActivity.length,
      systemEvents: systemActivity.length,
      failedTransactions: failedActivity.length,
      newUsers: newUserActivity.length,
      stockUpdates: stockActivity.length
    };

    // Get activity by hour for today
    const hourlyActivity = await sql`
      SELECT 
        EXTRACT(HOUR FROM ua.timestamp) as hour,
        COUNT(*) as count,
        ua.action
      FROM user_activity_logs ua
      WHERE ua.timestamp >= ${new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()}
      GROUP BY EXTRACT(HOUR FROM ua.timestamp), ua.action
      ORDER BY hour, count DESC
    `;

    // Get top active users
    const topActiveUsers = await sql`
      SELECT 
        u.first_name || ' ' || u.last_name as user_name,
        u.username,
        COUNT(ua.id) as activity_count,
        MAX(ua.timestamp) as last_activity
      FROM user_activity_logs ua
      JOIN users u ON ua.user_id = u.telegram_id
      WHERE ua.timestamp >= ${last7Days.toISOString()}
      GROUP BY u.telegram_id, u.first_name, u.last_name, u.username
      ORDER BY activity_count DESC
      LIMIT 10
    `;

    return Response.json({
      activities: allActivities.slice(0, 50), // Limit to 50 most recent
      activitySummary,
      hourlyActivity,
      topActiveUsers,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return Response.json({ error: 'Failed to fetch activity statistics' }, { status: 500 });
  }
}
