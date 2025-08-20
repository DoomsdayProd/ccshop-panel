import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { action } = await request.json();
    
    // Get bot settings
    const [botSettings] = await sql`
      SELECT bot_token, admin_chat_id 
      FROM bot_settings 
      LIMIT 1
    `;

    if (!botSettings?.bot_token) {
      return Response.json({ error: 'Bot not configured. Please set bot token first.' }, { status: 400 });
    }

    switch (action) {
      case 'set_webhook':
        return await setWebhook(botSettings.bot_token);
      
      case 'delete_webhook':
        return await deleteWebhook(botSettings.bot_token);
      
      case 'set_commands':
        return await setCommands(botSettings.bot_token);
      
      case 'get_webhook_info':
        return await getWebhookInfo(botSettings.bot_token);
      
      case 'test_bot':
        return await testBot(botSettings.bot_token, botSettings.admin_chat_id);
      
      default:
        return Response.json({ error: 'Invalid action. Use: set_webhook, delete_webhook, set_commands, get_webhook_info, or test_bot' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in bot setup:', error);
    return Response.json({ error: 'Bot setup failed' }, { status: 500 });
  }
}

async function setWebhook(botToken) {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.netlify.app'}/api/bot/webhook`;
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    });

    const result = await response.json();

    if (result.ok) {
      return Response.json({ 
        success: true, 
        message: 'Webhook set successfully',
        webhookUrl,
        result 
      });
    } else {
      return Response.json({ 
        error: 'Failed to set webhook', 
        result 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error setting webhook:', error);
    return Response.json({ error: 'Failed to set webhook' }, { status: 500 });
  }
}

async function deleteWebhook(botToken) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
      method: 'POST'
    });

    const result = await response.json();

    if (result.ok) {
      return Response.json({ 
        success: true, 
        message: 'Webhook deleted successfully',
        result 
      });
    } else {
      return Response.json({ 
        error: 'Failed to delete webhook', 
        result 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error deleting webhook:', error);
    return Response.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}

async function setCommands(botToken) {
  try {
    const commands = [
      {
        command: 'start',
        description: 'Start the bot and get welcome message'
      },
      {
        command: 'shop',
        description: 'Open the data marketplace'
      },
      {
        command: 'orders',
        description: 'View your order history'
      },
      {
        command: 'help',
        description: 'Show help and available commands'
      },
      {
        command: 'status',
        description: 'Check bot status and health'
      }
    ];

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });

    const result = await response.json();

    if (result.ok) {
      return Response.json({ 
        success: true, 
        message: 'Bot commands set successfully',
        commands,
        result 
      });
    } else {
      return Response.json({ 
        error: 'Failed to set commands', 
        result 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error setting commands:', error);
    return Response.json({ error: 'Failed to set commands' }, { status: 500 });
  }
}

async function getWebhookInfo(botToken) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const result = await response.json();

    if (result.ok) {
      return Response.json({ 
        success: true, 
        webhookInfo: result.result 
      });
    } else {
      return Response.json({ 
        error: 'Failed to get webhook info', 
        result 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error getting webhook info:', error);
    return Response.json({ error: 'Failed to get webhook info' }, { status: 500 });
  }
}

async function testBot(botToken, adminChatId) {
  try {
    if (!adminChatId) {
      return Response.json({ error: 'Admin chat ID not configured' }, { status: 400 });
    }

    const testMessage = `🧪 **Bot Test Message**\n\n` +
      `✅ Bot is working correctly!\n` +
      `⏰ Test time: ${new Date().toLocaleString()}\n` +
      `🔗 Webhook: Active\n` +
      `📱 Commands: Configured\n\n` +
      `Your bot is ready to use! 🚀`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: testMessage,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (result.ok) {
      return Response.json({ 
        success: true, 
        message: 'Test message sent successfully to admin',
        result 
      });
    } else {
      return Response.json({ 
        error: 'Failed to send test message', 
        result 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing bot:', error);
    return Response.json({ error: 'Failed to test bot' }, { status: 500 });
  }
}
