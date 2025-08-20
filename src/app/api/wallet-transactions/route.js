import sql from "@/app/api/utils/sql";

// Get wallet transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const transactionType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT wt.id, wt.transaction_type, wt.amount, wt.description, 
             wt.status, wt.created_at, wt.order_id,
             u.telegram_id, u.username, u.first_name, u.last_name
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      query += ` AND wt.user_id = $${paramCount}`;
      values.push(userId);
    }

    if (transactionType) {
      paramCount++;
      query += ` AND wt.transaction_type = $${paramCount}`;
      values.push(transactionType);
    }

    query += ` ORDER BY wt.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const transactions = await sql(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM wallet_transactions wt WHERE 1=1';
    const countValues = [];
    let countParamCount = 0;

    if (userId) {
      countParamCount++;
      countQuery += ` AND wt.user_id = $${countParamCount}`;
      countValues.push(userId);
    }

    if (transactionType) {
      countParamCount++;
      countQuery += ` AND wt.transaction_type = $${countParamCount}`;
      countValues.push(transactionType);
    }

    const [{ total }] = await sql(countQuery, countValues);

    return Response.json({
      transactions,
      total: parseInt(total),
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return Response.json({ error: 'Failed to fetch wallet transactions' }, { status: 500 });
  }
}

// Create wallet transaction
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Start transaction to update both wallet and create transaction record
    const [transaction, user] = await sql.transaction([
      sql`
        INSERT INTO wallet_transactions (user_id, transaction_type, amount, description, order_id, status)
        VALUES (${body.user_id}, ${body.transaction_type}, ${body.amount}, ${body.description}, ${body.order_id || null}, ${body.status || 'completed'})
        RETURNING *
      `,
      sql`
        UPDATE users 
        SET wallet_balance = wallet_balance + ${body.transaction_type === 'withdraw' || body.transaction_type === 'purchase' ? -Math.abs(body.amount) : Math.abs(body.amount)},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${body.user_id}
        RETURNING *
      `
    ]);

    return Response.json({
      transaction: transaction[0],
      updatedUser: user[0]
    });
  } catch (error) {
    console.error('Error creating wallet transaction:', error);
    return Response.json({ error: 'Failed to create wallet transaction' }, { status: 500 });
  }
}