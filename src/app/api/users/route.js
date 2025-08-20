import sql from "@/app/api/utils/sql";

// Get all users with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT u.id, u.telegram_id, u.username, u.first_name, u.last_name,
             u.wallet_balance, u.total_spent, u.total_orders, u.status,
             u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(u.username) LIKE LOWER($${paramCount}) OR
        LOWER(u.first_name) LIKE LOWER($${paramCount}) OR
        LOWER(u.last_name) LIKE LOWER($${paramCount}) OR
        u.telegram_id LIKE $${paramCount}
      )`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND u.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const users = await sql(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(username) LIKE LOWER($${countParamCount}) OR
        LOWER(first_name) LIKE LOWER($${countParamCount}) OR
        LOWER(last_name) LIKE LOWER($${countParamCount}) OR
        telegram_id LIKE $${countParamCount}
      )`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countValues.push(status);
    }

    const [{ total }] = await sql(countQuery, countValues);

    return Response.json({
      users,
      total: parseInt(total),
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create new user
export async function POST(request) {
  try {
    const body = await request.json();
    
    const result = await sql`
      INSERT INTO users (
        telegram_id, username, first_name, last_name, wallet_balance, status
      ) VALUES (
        ${body.telegram_id}, ${body.username}, ${body.first_name}, 
        ${body.last_name}, ${body.wallet_balance || 0}, ${body.status || 'active'}
      ) RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// Update user
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const setClauses = [];
    const values = [];
    let paramCount = 0;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        paramCount++;
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (setClauses.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE users 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}