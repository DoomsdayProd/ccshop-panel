import sql from "@/app/api/utils/sql";
import { initializeDatabase } from "@/app/api/utils/init-db.js";

// Initialize default settings if they don't exist
async function initializeDefaultSettings() {
  try {
    // First ensure database is initialized
    await initializeDatabase();
    
    // Check if we have any settings, if not, insert defaults
    const existingCount = await sql`SELECT COUNT(*) as count FROM bot_settings`;
    
    if (existingCount[0]?.count === 0) {
      console.log('No bot settings found, inserting defaults...');
      // The schema.sql file will handle inserting default values
              await sql.unsafe(`
          INSERT INTO bot_settings (setting_key, setting_value, description, setting_type) 
          VALUES 
            ('bot_token', '8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU', 'Telegram Bot API Token from @BotFather (get from @BotFather)', 'text'),
            ('webhook_url', '', 'Webhook URL for receiving Telegram updates (https://yourdomain.com/api/webhook)', 'text'),
            ('admin_chat_id', '7890791560', 'Admin chat ID for notifications and control (use @userinfobot to get your ID)', 'text'),
            ('connected_channels', '', 'List of connected Telegram channels (one per line)', 'text'),
            ('connected_groups', '', 'List of connected Telegram groups (one per line)', 'text'),
          ('auto_approve_orders', 'false', 'Automatically approve orders without manual review', 'boolean'),
          ('payment_timeout_hours', '24', 'Payment timeout in hours before order cancellation', 'number'),
          ('max_cart_items', '10', 'Maximum number of items allowed in shopping cart', 'number'),
          ('currency', 'USD', 'Default currency for pricing and payments', 'text'),
          ('notification_enabled', 'true', 'Enable Telegram notifications for orders and updates', 'boolean'),
          ('maintenance_mode', 'false', 'Enable maintenance mode (bot responds with maintenance message)', 'boolean'),
          ('welcome_message', 'Welcome to Data Marketplace! Use /start to begin shopping.', 'Welcome message shown when users start the bot', 'text'),
          ('help_message', 'Available commands:\n/start - Start shopping\n/cart - View cart\n/orders - View orders\n/help - Show this help', 'Help message shown when users request help', 'text'),
          ('maintenance_message', 'Bot is currently under maintenance. Please try again later.', 'Message shown when bot is in maintenance mode', 'text'),
          ('order_notifications', 'true', 'Send notifications for new orders', 'boolean'),
          ('payment_notifications', 'true', 'Send notifications for payment status changes', 'boolean'),
          ('user_registration_notifications', 'true', 'Send notifications when new users register', 'boolean'),
          ('error_notifications', 'true', 'Send notifications for system errors and issues', 'boolean'),
          ('daily_summary', 'false', 'Send daily summary of marketplace activity', 'boolean'),
          ('weekly_report', 'false', 'Send weekly report of marketplace performance', 'boolean'),
          ('low_stock_alert', 'true', 'Send alerts when data entries are running low', 'boolean'),
          ('low_stock_threshold', '5', 'Minimum stock level before sending low stock alerts', 'number'),
          ('price_change_notifications', 'true', 'Notify admins of significant price changes', 'boolean'),
          ('price_change_threshold', '20', 'Percentage change threshold for price notifications', 'number'),
          ('suspicious_activity_alerts', 'true', 'Alert admins of suspicious user activity', 'boolean'),
          ('failed_payment_alerts', 'true', 'Alert admins of failed payment attempts', 'boolean'),
          ('bot_status_check_interval', '30', 'Interval in minutes to check bot health status', 'number'),
          ('emergency_contact', '', 'Emergency contact chat ID for critical system alerts', 'text'),
          ('alert_sound_enabled', 'true', 'Enable sound notifications for important alerts', 'boolean'),
          ('quiet_hours_start', '22:00', 'Start time for quiet hours (24h format)', 'text'),
          ('quiet_hours_end', '08:00', 'End time for quiet hours (24h format)', 'text'),
          ('quiet_hours_enabled', 'false', 'Enable quiet hours to reduce notifications during night', 'boolean'),
          ('bot_language', 'en', 'Bot language for responses and messages', 'text'),
          ('auto_delete_commands', 'true', 'Automatically delete bot commands after processing', 'boolean'),
          ('max_message_length', '4096', 'Maximum length for bot messages (Telegram limit)', 'number'),
          ('inline_keyboard_enabled', 'true', 'Enable inline keyboard buttons for better UX', 'boolean'),
          ('rate_limit_per_user', '10', 'Maximum requests per user per minute', 'number'),
          ('backup_enabled', 'true', 'Enable automatic backup of bot settings', 'boolean'),
          ('backup_interval_hours', '24', 'Backup interval in hours', 'number')
        ON CONFLICT (setting_key) DO NOTHING
      `);
    }
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
}

// Get all bot settings
export async function GET(request) {
  try {
    // Initialize default settings if needed
    await initializeDefaultSettings();
    
    const settings = await sql`
      SELECT setting_key, setting_value, description, setting_type, updated_at
      FROM bot_settings
      ORDER BY setting_key
    `;

    // Convert array to object for easier frontend consumption
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        type: setting.setting_type,
        updated_at: setting.updated_at
      };
    });

    return Response.json({
      settings: settingsObj,
      rawSettings: settings
    });
  } catch (error) {
    console.error('Error fetching bot settings:', error);
    return Response.json({ error: 'Failed to fetch bot settings' }, { status: 500 });
  }
}

// Update bot settings
export async function PUT(request) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return Response.json({ error: 'Settings object is required' }, { status: 400 });
    }

    const updatedSettings = [];

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const result = await sql`
        UPDATE bot_settings 
        SET setting_value = ${value}, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = ${key}
        RETURNING *
      `;

      if (result.length > 0) {
        updatedSettings.push(result[0]);
      }
    }

    return Response.json({
      message: `Updated ${updatedSettings.length} settings`,
      updatedSettings
    });
  } catch (error) {
    console.error('Error updating bot settings:', error);
    return Response.json({ error: 'Failed to update bot settings' }, { status: 500 });
  }
}

// Create new bot setting
export async function POST(request) {
  try {
    const body = await request.json();
    
    const result = await sql`
      INSERT INTO bot_settings (setting_key, setting_value, description, setting_type)
      VALUES (${body.setting_key}, ${body.setting_value}, ${body.description}, ${body.setting_type || 'string'})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating bot setting:', error);
    return Response.json({ error: 'Failed to create bot setting' }, { status: 500 });
  }
}