import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { orderId, userId, dataEntryId, paymentMethod, amount, timestamp } = await request.json();

    // Get bot settings
    const [botSettings] = await sql`
      SELECT bot_token, admin_chat_id, notification_settings 
      FROM bot_settings 
      LIMIT 1
    `;

    if (!botSettings?.bot_token) {
      return Response.json({ error: 'Bot not configured' }, { status: 400 });
    }

    // Send notification to admin
    const adminMessage = `🛒 New Purchase!\n\nOrder ID: ${orderId}\nUser ID: ${userId}\nData Entry ID: ${dataEntryId}\nPayment Method: ${paymentMethod}\nAmount: $${amount}\nTime: ${new Date(timestamp).toLocaleString()}`;

    // Send to admin chat
    if (botSettings.admin_chat_id) {
      await sendTelegramMessage(botSettings.bot_token, botSettings.admin_chat_id, adminMessage);
    }

    // Send confirmation to user
    const userMessage = `✅ Purchase Confirmed!\n\nYour order #${orderId} has been received.\nYou will receive the data shortly.\n\nThank you for your purchase!`;

    // Send to user if we have their chat ID
    if (userId) {
      await sendTelegramMessage(botSettings.bot_token, userId, userMessage);
    }

    // Log the purchase
    await sql`
      INSERT INTO purchase_logs (order_id, user_id, data_entry_id, payment_method, amount, timestamp, notification_sent)
      VALUES (${orderId}, ${userId}, ${dataEntryId}, ${paymentMethod}, ${amount}, ${timestamp}, true)
    `;

    return Response.json({ 
      success: true, 
      message: 'Purchase notification sent successfully',
      adminNotified: !!botSettings.admin_chat_id,
      userNotified: !!userId
    });

  } catch (error) {
    console.error('Error sending purchase notification:', error);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
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
