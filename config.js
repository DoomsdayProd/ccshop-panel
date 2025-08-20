// Configuration example file
// Copy this to config.js and fill in your values

export const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:xupqbfnlkgsonilmnhwj@db.xupqbfnlkgsonilmnhwj.supabase.co:5432/postgres'
  },
  
  // Bot Configuration
  bot: {
    token: process.env.BOT_TOKEN || '8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU',
    webhookUrl: process.env.WEBHOOK_URL || 'https://yourdomain.com/api/webhook',
    adminChatId: process.env.ADMIN_CHAT_ID || '7890791560'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // App Configuration
  app: {
    projectGroupId: process.env.NEXT_PUBLIC_PROJECT_GROUP_ID || 'xupqbfnlkgsonilmnhwj',
    baseUrl: process.env.NEXT_PUBLIC_CREATE_BASE_URL || 'https://www.create.xyz'
  }
};
