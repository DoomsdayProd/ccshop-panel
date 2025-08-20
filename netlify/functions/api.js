const { neon } = require('@netlify/neon');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    // Parse the path to determine which API endpoint is being called
    const path = event.path.replace('/.netlify/functions/api', '');
    
    if (path === '/bot-settings' && event.httpMethod === 'GET') {
      // Get bot settings
      const settings = await sql`SELECT * FROM bot_settings ORDER BY setting_key`;
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      };
    }
    
    if (path === '/bot-settings' && event.httpMethod === 'POST') {
      // Update bot settings
      const body = JSON.parse(event.body);
      const { setting_key, setting_value } = body;
      
      await sql`
        UPDATE bot_settings 
        SET setting_value = ${setting_value}, updated_at = CURRENT_TIMESTAMP 
        WHERE setting_key = ${setting_key}
      `;
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Setting updated' })
      };
    }
    
    if (path === '/bot-settings/test-connection' && event.httpMethod === 'POST') {
      // Test bot connection
      const body = JSON.parse(event.body);
      const { bot_token, webhook_url, admin_chat_id } = body;
      
      // Basic validation
      const results = {
        bot_token: { status: 'success', message: 'Bot token format is valid' },
        webhook: { status: 'warning', message: 'Webhook URL validation passed' },
        admin_chat: { status: 'success', message: 'Admin chat ID format is valid' }
      };
      
      if (!bot_token || !bot_token.includes(':')) {
        results.bot_token = { status: 'error', message: 'Invalid bot token format' };
      }
      
      if (webhook_url && !webhook_url.startsWith('https://')) {
        results.webhook.status = 'warning';
        results.webhook.message = 'Webhook should use HTTPS for production';
      }
      
      if (!admin_chat_id || isNaN(admin_chat_id)) {
        results.admin_chat = { status: 'warning', message: 'Admin chat ID should be numeric' };
      }
      
      const overallStatus = Object.values(results).every(r => r.status === 'success') ? 'success' : 
                           Object.values(results).some(r => r.status === 'error') ? 'error' : 'warning';
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: overallStatus,
          results,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Default response for unknown endpoints
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API endpoint not found' })
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
