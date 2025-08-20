import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { orderId, userId, status, message, timestamp } = await request.json();

    // Get bot settings
    const [botSettings] = await sql`
      SELECT bot_token, admin_chat_id, notification_settings 
      FROM bot_settings 
      LIMIT 1
    `;

    if (!botSettings?.bot_token) {
      return Response.json({ error: 'Bot not configured' }, { status: 400 });
    }

    // Get order details
    const [order] = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send status update to user
    const statusEmoji = {
      'processing': '⏳',
      'completed': '✅',
      'cancelled': '❌',
      'failed': '⚠️',
      'pending': '⏳'
    };

    const userMessage = `${statusEmoji[status] || '📋'} Order Status Update\n\nOrder #${orderId}\nStatus: ${status.charAt(0).toUpperCase() + status.slice(1)}\n${message ? `\nMessage: ${message}` : ''}\n\nTime: ${new Date(timestamp).toLocaleString()}`;

    // Send to user
    if (userId) {
      await sendTelegramMessage(botSettings.bot_token, userId, userMessage);
    }

    // Send to admin if status is important
    if (botSettings.admin_chat_id && ['failed', 'cancelled'].includes(status)) {
      const adminMessage = `⚠️ Order Status Alert!\n\nOrder ID: ${orderId}\nUser ID: ${userId}\nStatus: ${status}\n${message ? `Message: ${message}` : ''}\nTime: ${new Date(timestamp).toLocaleString()}`;
      
      await sendTelegramMessage(botSettings.bot_token, botSettings.admin_chat_id, adminMessage);
    }

    // Update order status in database
    await sql`
      UPDATE orders 
      SET payment_status = ${status}, updated_at = ${timestamp}
      WHERE id = ${orderId}
    `;

    // Log the status update
    await sql`
      INSERT INTO order_status_logs (order_id, user_id, status, message, timestamp)
      VALUES (${orderId}, ${userId}, ${status}, ${message}, ${timestamp})
    `;

    return Response.json({ 
      success: true, 
      message: 'Order status update sent successfully',
      userNotified: !!userId,
      adminNotified: ['failed', 'cancelled'].includes(status) && !!botSettings.admin_chat_id
    });

  } catch (error) {
    console.error('Error sending order status update:', error);
    return Response.json({ error: 'Failed to send status update' }, { status: 500 });
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
