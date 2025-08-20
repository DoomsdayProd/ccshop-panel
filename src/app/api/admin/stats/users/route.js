import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get current timestamp and calculate time ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users
    const [totalUsersResult] = await sql`
      SELECT COUNT(*) as total FROM users
    `;
    const totalUsers = parseInt(totalUsersResult.total);

    // Get new users today
    const [newUsersTodayResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ${today.toISOString()}
    `;
    const newUsersToday = parseInt(newUsersTodayResult.count);

    // Get new users this week
    const [newUsersWeekResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ${weekAgo.toISOString()}
    `;
    const newUsersWeek = parseInt(newUsersWeekResult.count);

    // Get new users this month
    const [newUsersMonthResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ${monthAgo.toISOString()}
    `;
    const newUsersMonth = parseInt(newUsersMonthResult.count);

    // Get active users (users who have been active in the last 24 hours)
    const [activeUsersResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE updated_at >= ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}
    `;
    const activeUsers = parseInt(activeUsersResult.count);

    // Get online users (users active in the last 5 minutes)
    const [onlineNowResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE updated_at >= ${new Date(now.getTime() - 5 * 60 * 1000).toISOString()}
    `;
    const onlineNow = parseInt(onlineNowResult.count);

    // Get premium users (users with premium status)
    const [premiumUsersResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE is_premium = true
    `;
    const premiumUsers = parseInt(premiumUsersResult.count);

    // Calculate user growth percentage (comparing this month to last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [lastMonthUsersResult] = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ${lastMonthStart.toISOString()} AND created_at <= ${lastMonthEnd.toISOString()}
    `;
    const lastMonthUsers = parseInt(lastMonthUsersResult.count);
    
    const userGrowth = lastMonthUsers > 0 
      ? ((newUsersMonth - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;

    // Calculate active percentage
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // Get user activity by hour (for chart data)
    const hourlyActivity = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= ${today.toISOString()}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `;

    // Get top countries/languages
    const topLanguages = await sql`
      SELECT 
        language_code,
        COUNT(*) as count
      FROM users 
      GROUP BY language_code 
      ORDER BY count DESC 
      LIMIT 5
    `;

    return Response.json({
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      activeUsers,
      onlineNow,
      premiumUsers,
      userGrowth,
      activePercentage,
      hourlyActivity,
      topLanguages,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return Response.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
  }
}
