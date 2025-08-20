-- Bot Settings Table
CREATE TABLE IF NOT EXISTS bot_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bot_settings_key ON bot_settings(setting_key);

-- Insert default settings if table is empty
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
ON CONFLICT (setting_key) DO NOTHING;
