import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { userId, firstName, lastName, username, languageCode } = await request.json();

    // Get bot settings
    const [botSettings] = await sql`
      SELECT bot_token, admin_chat_id, welcome_message, notification_settings 
      FROM bot_settings 
      LIMIT 1
    `;

    if (!botSettings?.bot_token) {
      return Response.json({ error: 'Bot not configured' }, { status: 400 });
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT * FROM users WHERE telegram_id = ${userId}
    `;

    if (!existingUser) {
      // Create new user
      await sql`
        INSERT INTO users (telegram_id, first_name, last_name, username, language_code, created_at, updated_at)
        VALUES (${userId}, ${firstName}, ${lastName}, ${username}, ${languageCode}, NOW(), NOW())
      `;
    }

    // Send welcome message to user
    const welcomeMessage = botSettings.welcome_message || 
      `🎉 Welcome to Data Shop, ${firstName}!\n\n` +
      `We're excited to have you here. You can:\n` +
      `• Browse our data catalog\n` +
      `• Make secure purchases\n` +
      `• Track your orders\n` +
      `• Get instant notifications\n\n` +
      `Start exploring our marketplace! 🚀`;

    // Send to user
    await sendTelegramMessage(botSettings.bot_token, userId, welcomeMessage);

    // Send notification to admin about new user
    if (botSettings.admin_chat_id) {
      const adminMessage = `👤 New User Joined!\n\nName: ${firstName} ${lastName}\nUsername: @${username}\nUser ID: ${userId}\nLanguage: ${languageCode}\nTime: ${new Date().toLocaleString()}`;
      
      await sendTelegramMessage(botSettings.bot_token, botSettings.admin_chat_id, adminMessage);
    }

    // Log the welcome message
    await sql`
      INSERT INTO user_activity_logs (user_id, action, details, timestamp)
      VALUES (${userId}, 'welcome_message_sent', ${JSON.stringify({ firstName, lastName, username, languageCode })}, NOW())
    `;

    return Response.json({ 
      success: true, 
      message: 'Welcome message sent successfully',
      userNotified: true,
      adminNotified: !!botSettings.admin_chat_id,
      userCreated: !existingUser
    });

  } catch (error) {
    console.error('Error sending welcome message:', error);
    return Response.json({ error: 'Failed to send welcome message' }, { status: 500 });
  }
}

async function sendTelegramMessage(botToken, chatId, message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}
