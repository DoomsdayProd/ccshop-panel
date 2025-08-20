import sql from "@/app/api/utils/sql";

// Get orders with user information
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const telegramUserId = searchParams.get("telegramUserId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    let query = `
      SELECT o.id, o.user_id, o.telegram_user_id, o.data_entry_id, o.payment_method,
             o.payment_status, o.total_amount, o.crypto_address, o.invoice_id,
             o.created_at, o.updated_at,
             de.card_number, de.cardholder_name, de.card_brand, de.price,
             u.username, u.first_name, u.last_name, u.telegram_id
      FROM orders o
      LEFT JOIN data_entries de ON o.data_entry_id = de.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      query += ` AND o.user_id = $${paramCount}`;
      values.push(userId);
    }

    if (telegramUserId) {
      paramCount++;
      query += ` AND (o.telegram_user_id = $${paramCount} OR u.telegram_id = $${paramCount})`;
      values.push(telegramUserId);
    }

    if (status) {
      paramCount++;
      query += ` AND o.payment_status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const orders = await sql(query, values);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM orders o WHERE 1=1";
    const countValues = [];
    let countParamCount = 0;

    if (userId) {
      countParamCount++;
      countQuery += ` AND o.user_id = $${countParamCount}`;
      countValues.push(userId);
    }

    if (telegramUserId) {
      countParamCount++;
      countQuery += ` AND (o.telegram_user_id = $${countParamCount} OR EXISTS (SELECT 1 FROM users WHERE telegram_id = $${countParamCount} AND id = o.user_id))`;
      countValues.push(telegramUserId);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND o.payment_status = $${countParamCount}`;
      countValues.push(status);
    }

    const [{ total }] = await sql(countQuery, countValues);

    return Response.json({
      orders,
      total: parseInt(total),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// Create new order
export async function POST(request) {
  try {
    const body = await request.json();

    // Get data entry details
    const [dataEntry] = await sql`
      SELECT * FROM data_entries WHERE id = ${body.dataEntryId} AND status = 'available'
    `;

    if (!dataEntry) {
      return Response.json(
        { error: "Data entry not found or not available" },
        { status: 404 },
      );
    }

    // Find or create user if telegram_id is provided
    let userId = body.userId;
    if (body.telegramUserId && !userId) {
      let [user] = await sql`
        SELECT id FROM users WHERE telegram_id = ${body.telegramUserId}
      `;

      if (!user) {
        // Create user if doesn't exist
        const [newUser] = await sql`
          INSERT INTO users (telegram_id, username, first_name, status)
          VALUES (${body.telegramUserId}, ${body.username || null}, ${body.firstName || null}, 'active')
          RETURNING id
        `;
        userId = newUser.id;
      } else {
        userId = user.id;
      }
    }

    // Create order and update data entry status in transaction
    const [order, updatedEntry] = await sql.transaction([
      sql`
        INSERT INTO orders (
          user_id, telegram_user_id, data_entry_id, payment_method, 
          payment_status, total_amount, crypto_address, invoice_id
        ) VALUES (
          ${userId}, ${body.telegramUserId || null}, ${body.dataEntryId}, 
          ${body.paymentMethod}, 'pending', ${dataEntry.price}, 
          ${body.cryptoAddress || null}, ${body.invoiceId || null}
        ) RETURNING *
      `,
      sql`
        UPDATE data_entries 
        SET status = 'reserved', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${body.dataEntryId}
        RETURNING *
      `,
    ]);

    // Update user order count
    if (userId) {
      await sql`
        UPDATE users 
        SET total_orders = total_orders + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
    }

    return Response.json({
      order: order[0],
      dataEntry: updatedEntry[0],
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// Update order status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, payment_status, ...updates } = body;

    if (!id) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get current order
    const [currentOrder] = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `;

    if (!currentOrder) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const setClauses = [];
    const values = [];
    let paramCount = 0;

    // Handle payment status changes
    if (payment_status && payment_status !== currentOrder.payment_status) {
      paramCount++;
      setClauses.push(`payment_status = $${paramCount}`);
      values.push(payment_status);

      // Update data entry status based on payment status
      let dataEntryStatus = "available";
      if (payment_status === "completed") {
        dataEntryStatus = "sold";

        // Update user's total spent if payment completed
        if (currentOrder.user_id) {
          await sql`
            UPDATE users 
            SET total_spent = total_spent + ${currentOrder.total_amount},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${currentOrder.user_id}
          `;
        }
      } else if (payment_status === "pending") {
        dataEntryStatus = "reserved";
      } else if (
        payment_status === "cancelled" ||
        payment_status === "failed"
      ) {
        dataEntryStatus = "available";
      }

      // Update data entry status
      await sql`
        UPDATE data_entries 
        SET status = ${dataEntryStatus}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${currentOrder.data_entry_id}
      `;
    }

    // Handle other updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "id") {
        paramCount++;
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE orders 
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
