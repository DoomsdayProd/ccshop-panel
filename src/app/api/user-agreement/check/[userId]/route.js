import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists and has agreed to terms
    const [user] = await sql`
      SELECT 
        id,
        has_agreed_to_terms,
        username,
        agreed_at,
        created_at
      FROM users 
      WHERE telegram_id = ${userId}
    `;

    if (!user) {
      // User doesn't exist
      return Response.json({
        hasAgreed: false,
        userExists: false,
        message: 'User not found'
      });
    }

    if (user.has_agreed_to_terms) {
      // User has agreed to terms
      return Response.json({
        hasAgreed: true,
        userExists: true,
        credentials: {
          username: user.username
        },
        agreedAt: user.agreed_at,
        message: 'User has already agreed to terms'
      });
    } else {
      // User exists but hasn't agreed to terms
      return Response.json({
        hasAgreed: false,
        userExists: true,
        message: 'User exists but has not agreed to terms'
      });
    }

  } catch (error) {
    console.error('Error checking user agreement:', error);
    return Response.json({ error: 'Failed to check user agreement' }, { status: 500 });
  }
}
