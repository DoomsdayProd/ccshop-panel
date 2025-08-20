import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const {
      userId,
      firstName,
      lastName,
      username,
      languageCode,
      agreedAt,
      ipAddress,
      userAgent
    } = await request.json();

    // Validate required fields
    if (!userId || !firstName) {
      return Response.json({ error: 'Missing required user information' }, { status: 400 });
    }

    // Check if user already exists and has agreed to terms
    const [existingUser] = await sql`
      SELECT id, has_agreed_to_terms, username as db_username, password_hash
      FROM users 
      WHERE telegram_id = ${userId}
    `;

    if (existingUser && existingUser.has_agreed_to_terms) {
      // User already agreed, return existing credentials
      return Response.json({
        success: true,
        message: 'User already agreed to terms',
        credentials: {
          username: existingUser.db_username,
          password: '***' // Don't return actual password
        },
        userExists: true
      });
    }

    // Generate unique username and password
    const baseUsername = username || firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    let generatedUsername = `${baseUsername}_${timestamp}`;
    
    // Generate secure password
    const password = crypto.randomBytes(8).toString('hex');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Check if username is unique
    const [usernameExists] = await sql`
      SELECT id FROM users WHERE username = ${generatedUsername}
    `;

    if (usernameExists) {
      // If username exists, generate a different one
      const newTimestamp = Date.now().toString().slice(-8);
      generatedUsername = `${baseUsername}_${newTimestamp}`;
    }

    if (existingUser) {
      // Update existing user with agreement and credentials
      await sql`
        UPDATE users 
        SET 
          has_agreed_to_terms = true,
          agreed_at = ${agreedAt},
          username = ${generatedUsername},
          password_hash = ${passwordHash},
          updated_at = NOW()
        WHERE telegram_id = ${userId}
      `;
    } else {
      // Create new user with agreement and credentials
      await sql`
        INSERT INTO users (
          telegram_id,
          first_name,
          last_name,
          username,
          language_code,
          has_agreed_to_terms,
          agreed_at,
          password_hash,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${firstName},
          ${lastName || ''},
          ${generatedUsername},
          ${languageCode || 'en'},
          true,
          ${agreedAt},
          ${passwordHash},
          NOW(),
          NOW()
        )
      `;
    }

    // Log the agreement
    await sql`
      INSERT INTO user_activity_logs (
        user_id,
        action,
        details,
        timestamp
      ) VALUES (
        ${userId},
        'terms_accepted',
        ${JSON.stringify({
          agreedAt,
          ipAddress,
          userAgent,
          generatedUsername
        })},
        NOW()
      )
    `;

    // Send welcome message via bot if configured
    try {
      const [botSettings] = await sql`
        SELECT bot_token, admin_chat_id, welcome_message 
        FROM bot_settings 
        LIMIT 1
      `;

      if (botSettings?.bot_token) {
        const welcomeMessage = botSettings.welcome_message || 
          `🎉 Welcome to Data Shop, ${firstName}!\n\n` +
          `Your account has been created successfully.\n` +
          `Username: ${generatedUsername}\n\n` +
          `You can now access our marketplace and start shopping! 🚀`;

        // Send to user
        await fetch(`https://api.telegram.org/bot${botSettings.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: welcomeMessage,
            parse_mode: 'HTML'
          })
        });

        // Notify admin about new user
        if (botSettings.admin_chat_id) {
          const adminMessage = `👤 New User Agreement!\n\nName: ${firstName} ${lastName}\nUsername: @${username}\nUser ID: ${userId}\nGenerated Username: ${generatedUsername}\nTime: ${new Date(agreedAt).toLocaleString()}`;
          
          await fetch(`https://api.telegram.org/bot${botSettings.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: botSettings.admin_chat_id,
              text: adminMessage,
              parse_mode: 'HTML'
            })
          });
        }
      }
    } catch (botError) {
      console.error('Failed to send bot notifications:', botError);
      // Don't fail the agreement process if bot notifications fail
    }

    // Create user session or authentication token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql`
      INSERT INTO user_sessions (
        user_id,
        session_token,
        expires_at,
        created_at
      ) VALUES (
        ${userId},
        ${sessionToken},
        ${sessionExpiry.toISOString()},
        NOW()
      )
    `;

    return Response.json({
      success: true,
      message: 'User agreement accepted successfully',
      credentials: {
        username: generatedUsername,
        password: password
      },
      sessionToken,
      sessionExpiry: sessionExpiry.toISOString(),
      userExists: !!existingUser
    });

  } catch (error) {
    console.error('Error processing user agreement:', error);
    return Response.json({ error: 'Failed to process user agreement' }, { status: 500 });
  }
}
