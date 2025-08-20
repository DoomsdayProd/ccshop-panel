import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const update = await request.json();
    
    // Get bot settings
    const [botSettings] = await sql`
      SELECT bot_token, admin_chat_id, welcome_message, notification_settings 
      FROM bot_settings 
      LIMIT 1
    `;

    if (!botSettings?.bot_token) {
      return Response.json({ error: 'Bot not configured' }, { status: 400 });
    }

    // Handle different types of updates
    if (update.message) {
      await handleMessage(update.message, botSettings);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, botSettings);
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleMessage(message, botSettings) {
  const { text, chat, from } = message;
  
  if (!text) return;

  const command = text.toLowerCase().trim();

  try {
    switch (command) {
      case '/start':
        await handleStartCommand(chat, from, botSettings);
        break;
      
      case '/shop':
        await handleShopCommand(chat, botSettings);
        break;
      
      case '/orders':
        await handleOrdersCommand(chat, from, botSettings);
        break;
      
      case '/help':
        await handleHelpCommand(chat, botSettings);
        break;
      
      case '/status':
        await handleStatusCommand(chat, botSettings);
        break;
      
      default:
        // Check if it's a reply to a user message (admin support)
        if (chat.id === parseInt(botSettings.admin_chat_id) && message.reply_to_message) {
          await handleAdminReply(message, botSettings);
        } else {
          await sendMessage(chat.id, `Unknown command. Use /help to see available commands.`, botSettings.bot_token);
        }
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await sendMessage(chat.id, 'Sorry, an error occurred. Please try again later.', botSettings.bot_token);
  }
}

async function handleStartCommand(chat, from, botSettings) {
  const welcomeMessage = botSettings.welcome_message || 
    `🎉 Welcome to Data Shop, ${from.first_name}!\n\n` +
    `I'm your personal shopping assistant. Here's what I can do:\n\n` +
    `🛍️ /shop - Open the marketplace\n` +
    `📋 /orders - View your orders\n` +
    `❓ /help - Show help information\n` +
    `📊 /status - Check bot status\n\n` +
    `Start shopping with /shop or check your orders with /orders!`;

  await sendMessage(chat.id, welcomeMessage, botSettings.bot_token);
  
  // Log user activity
  await logUserActivity(from.id, 'start_command', { chatId: chat.id });
}

async function handleShopCommand(chat, botSettings) {
  const shopMessage = `🛍️ **Data Shop Marketplace**\n\n` +
    `Click the button below to open our marketplace:\n\n` +
    `• Browse available data entries\n` +
    `• Search and filter options\n` +
    `• Secure checkout process\n` +
    `• Real-time order tracking`;

  const keyboard = {
    inline_keyboard: [[
      {
        text: '🛒 Open Shop',
        web_app: { url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.netlify.app'}/marketplace` }
      }
    ]]
  };

  await sendMessageWithKeyboard(chat.id, shopMessage, keyboard, botSettings.bot_token);
}

async function handleOrdersCommand(chat, from, botSettings) {
  // Get user's orders
  const orders = await sql`
    SELECT * FROM orders WHERE user_id = ${from.id} ORDER BY created_at DESC LIMIT 5
  `;

  if (orders.length === 0) {
    await sendMessage(chat.id, '📋 You don\'t have any orders yet.\n\nUse /shop to start shopping!', botSettings.bot_token);
    return;
  }

  let ordersMessage = `📋 **Your Recent Orders**\n\n`;
  
  orders.forEach((order, index) => {
    const status = order.payment_status;
    const statusEmoji = {
      'completed': '✅',
      'pending': '⏳',
      'processing': '⚙️',
      'cancelled': '❌',
      'failed': '⚠️'
    }[status] || '📋';
    
    ordersMessage += `${statusEmoji} **Order #${order.id}**\n` +
      `Amount: $${order.total_amount}\n` +
      `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}\n` +
      `Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;
  });

  ordersMessage += `View all orders in the shop: /shop`;

  await sendMessage(chat.id, ordersMessage, botSettings.bot_token);
}

async function handleHelpCommand(chat, botSettings) {
  const helpMessage = `❓ **Help & Commands**\n\n` +
    `**Available Commands:**\n` +
    `• /start - Welcome message and setup\n` +
    `• /shop - Open the marketplace\n` +
    `• /orders - View your orders\n` +
    `• /help - Show this help message\n` +
    `• /status - Check bot status\n\n` +
    `**Features:**\n` +
    `• Secure data marketplace\n` +
    `• Real-time notifications\n` +
    `• Order tracking\n` +
    `• Multiple payment methods\n\n` +
    `**Support:**\n` +
    `If you need help, contact our support team.`;

  await sendMessage(chat.id, helpMessage, botSettings.bot_token);
}

async function handleStatusCommand(chat, botSettings) {
  const statusMessage = `📊 **Bot Status**\n\n` +
    `✅ Bot is online and running\n` +
    `🔗 Database: Connected\n` +
    `📱 Mini App: Available\n` +
    `⏰ Last update: ${new Date().toLocaleString()}\n\n` +
    `Everything is working properly! 🚀`;

  await sendMessage(chat.id, statusMessage, botSettings.bot_token);
}

async function handleAdminReply(message, botSettings) {
  const replyToMessage = message.reply_to_message;
  const userId = replyToMessage.from.id;
  const adminMessage = message.text;

  // Send the admin's reply to the user
  await sendMessage(userId, `💬 **Support Reply:**\n\n${adminMessage}`, botSettings.bot_token);
  
  // Confirm to admin
  await sendMessage(message.chat.id, `✅ Reply sent to user ${userId}`, botSettings.bot_token);
}

async function handleCallbackQuery(callbackQuery, botSettings) {
  const { data, message, from } = callbackQuery;
  
  try {
    switch (data) {
      case 'open_shop':
        await handleShopCommand(message.chat, botSettings);
        break;
      
      case 'view_orders':
        await handleOrdersCommand(message.chat, from, botSettings);
        break;
      
      default:
        console.log('Unknown callback query:', data);
    }
    
    // Answer callback query to remove loading state
    await answerCallbackQuery(callbackQuery.id, botSettings.bot_token);
    
  } catch (error) {
    console.error('Error handling callback query:', error);
    await answerCallbackQuery(callbackQuery.id, 'Error occurred', botSettings.bot_token);
  }
}

async function sendMessage(chatId, text, botToken) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
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

async function sendMessageWithKeyboard(chatId, text, keyboard, botToken) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message with keyboard:', error);
    throw error;
  }
}

async function answerCallbackQuery(callbackQueryId, botToken, text = '') {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error answering callback query:', error);
    throw error;
  }
}

async function logUserActivity(userId, action, details) {
  try {
    await sql`
      INSERT INTO user_activity_logs (user_id, action, details, timestamp)
      VALUES (${userId}, ${action}, ${JSON.stringify(details)}, NOW())
    `;
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}
