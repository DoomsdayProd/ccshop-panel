// Configuration example file
// Copy this to config.js and fill in your values

export const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database_name'
  },
  
  // Bot Configuration
  bot: {
    token: process.env.BOT_TOKEN || 'your_telegram_bot_token',
    webhookUrl: process.env.WEBHOOK_URL || 'https://yourdomain.com/api/webhook',
    adminChatId: process.env.ADMIN_CHAT_ID || 'your_admin_chat_id'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // App Configuration
  app: {
    projectGroupId: process.env.NEXT_PUBLIC_PROJECT_GROUP_ID || 'your_project_group_id',
    baseUrl: process.env.NEXT_PUBLIC_CREATE_BASE_URL || 'https://www.create.xyz'
  }
};
