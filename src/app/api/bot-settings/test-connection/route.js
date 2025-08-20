import sql from "@/app/api/utils/sql";

// Test bot connection and webhook
export async function POST(request) {
  try {
    const body = await request.json();
    const { bot_token, webhook_url, admin_chat_id } = body;

    const results = {
      bot_token: { status: 'pending', message: 'Testing bot token...' },
      webhook: { status: 'pending', message: 'Testing webhook...' },
      admin_chat: { status: 'pending', message: 'Testing admin chat...' }
    };

    // Test bot token
    if (bot_token) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            results.bot_token = { 
              status: 'success', 
              message: `Bot connected successfully: @${data.result.username}`,
              data: data.result
            };
          } else {
            results.bot_token = { 
              status: 'error', 
              message: `Bot API error: ${data.description}` 
            };
          }
        } else {
          results.bot_token = { 
            status: 'error', 
            message: `HTTP error: ${response.status}` 
          };
        }
      } catch (error) {
        results.bot_token = { 
          status: 'error', 
          message: `Connection error: ${error.message}` 
        };
      }
    } else {
      results.bot_token = { 
        status: 'error', 
        message: 'Bot token is required' 
      };
    }

    // Test webhook URL
    if (webhook_url) {
      try {
        // Test if webhook URL is accessible
        if (!webhook_url.startsWith('https://')) {
          results.webhook = { 
            status: 'warning', 
            message: 'Webhook should use HTTPS for production' 
          };
        } else {
          results.webhook = { 
            status: 'success', 
            message: 'Webhook URL format is valid' 
          };
        }
      } catch (error) {
        results.webhook = { 
          status: 'error', 
          message: `Webhook error: ${error.message}` 
        };
      }
    } else {
      results.webhook = { 
        status: 'warning', 
        message: 'Webhook URL not set' 
      };
    }

    // Test admin chat ID
    if (admin_chat_id) {
      try {
        if (bot_token) {
          const response = await fetch(`https://api.telegram.org/bot${bot_token}/getChat?chat_id=${admin_chat_id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.ok) {
              results.admin_chat = { 
                status: 'success', 
                message: `Admin chat verified: ${data.result.title || data.result.first_name}`,
                data: data.result
              };
            } else {
              results.admin_chat = { 
                status: 'error', 
                message: `Chat error: ${data.description}` 
              };
            }
          } else {
            results.admin_chat = { 
              status: 'error', 
              message: `HTTP error: ${response.status}` 
            };
          }
        } else {
          results.admin_chat = { 
            status: 'warning', 
            message: 'Bot token required to test admin chat' 
          };
        }
      } catch (error) {
        results.admin_chat = { 
          status: 'error', 
          message: `Admin chat error: ${error.message}` 
        };
      }
    } else {
      results.admin_chat = { 
        status: 'warning', 
        message: 'Admin chat ID not set' 
      };
    }

    // Overall status
    const overallStatus = Object.values(results).every(r => r.status === 'success') ? 'success' : 
                         Object.values(results).some(r => r.status === 'error') ? 'error' : 'warning';

    return Response.json({
      status: overallStatus,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing bot connection:', error);
    return Response.json({ 
      error: 'Failed to test bot connection',
      details: error.message 
    }, { status: 500 });
  }
}
