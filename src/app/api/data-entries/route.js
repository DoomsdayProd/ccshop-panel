import sql from "@/app/api/utils/sql";

// Get all data entries with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const format = searchParams.get('format');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT id, card_number, expiry_month, expiry_year, cvv, cardholder_name, 
             bank_name, card_brand, card_type, card_level, address_line1, 
             address_line2, city, state, zip_code, country, phone, email,
             data_format, price, status, created_at
      FROM data_entries 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(cardholder_name) LIKE LOWER($${paramCount}) OR
        LOWER(bank_name) LIKE LOWER($${paramCount}) OR
        LOWER(card_brand) LIKE LOWER($${paramCount}) OR
        LOWER(country) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(status);
    }

    if (format) {
      paramCount++;
      query += ` AND data_format = $${paramCount}`;
      values.push(format);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const entries = await sql(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM data_entries WHERE 1=1';
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(cardholder_name) LIKE LOWER($${countParamCount}) OR
        LOWER(bank_name) LIKE LOWER($${countParamCount}) OR
        LOWER(card_brand) LIKE LOWER($${countParamCount}) OR
        LOWER(country) LIKE LOWER($${countParamCount})
      )`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countValues.push(status);
    }

    if (format) {
      countParamCount++;
      countQuery += ` AND data_format = $${countParamCount}`;
      countValues.push(format);
    }

    const [{ total }] = await sql(countQuery, countValues);

    return Response.json({
      entries,
      total: parseInt(total),
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching data entries:', error);
    return Response.json({ error: 'Failed to fetch data entries' }, { status: 500 });
  }
}

// Create new data entry
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (body.bulkData) {
      // Handle bulk upload
      const entries = [];
      const lines = body.bulkData.trim().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const parts = line.split('|');
        let entry;
        
        if (parts.length >= 17) {
          // Format 1: Full format
          entry = {
            card_number: parts[0]?.trim(),
            expiry_month: parts[1]?.trim(),
            expiry_year: parts[2]?.trim(),
            cvv: parts[3]?.trim(),
            cardholder_name: parts[4]?.trim(),
            bank_name: parts[5]?.trim(),
            card_brand: parts[6]?.trim(),
            card_level: parts[7]?.trim(),
            card_type: parts[8]?.trim(),
            address_line1: parts[9]?.trim(),
            address_line2: parts[10]?.trim(),
            city: parts[11]?.trim(),
            state: parts[12]?.trim(),
            country: parts[13]?.trim(),
            zip_code: parts[14]?.trim(),
            phone: parts[15]?.trim(),
            email: parts[16]?.trim(),
            additional_info: parts[17]?.trim(),
            data_format: 'format1',
            price: body.defaultPrice || 15.00
          };
        } else if (parts.length >= 8) {
          // Format 2: Simplified format
          entry = {
            card_number: parts[0]?.trim(),
            expiry_month: parts[1]?.trim(),
            expiry_year: parts[2]?.trim(),
            cvv: parts[3]?.trim(),
            address_line1: parts[4]?.trim(),
            city: parts[5]?.trim(),
            state: parts[6]?.trim(),
            zip_code: parts[7]?.trim(),
            card_brand: parts[8]?.trim() || 'Unknown',
            cardholder_name: 'Unknown',
            bank_name: 'Unknown Bank',
            country: 'UNITED STATES',
            data_format: 'format2',
            price: body.defaultPrice || 12.00
          };
        } else {
          continue; // Skip invalid lines
        }

        // Clean up "None" values
        Object.keys(entry).forEach(key => {
          if (entry[key] === 'None' || entry[key] === '') {
            entry[key] = null;
          }
        });

        entries.push(entry);
      }

      // Insert all entries
      const insertedEntries = [];
      for (const entry of entries) {
        const result = await sql`
          INSERT INTO data_entries (
            card_number, expiry_month, expiry_year, cvv, cardholder_name,
            bank_name, card_brand, card_type, card_level, address_line1,
            address_line2, city, state, zip_code, country, phone, email,
            additional_info, data_format, price
          ) VALUES (
            ${entry.card_number}, ${entry.expiry_month}, ${entry.expiry_year},
            ${entry.cvv}, ${entry.cardholder_name}, ${entry.bank_name},
            ${entry.card_brand}, ${entry.card_type}, ${entry.card_level},
            ${entry.address_line1}, ${entry.address_line2}, ${entry.city},
            ${entry.state}, ${entry.zip_code}, ${entry.country}, ${entry.phone},
            ${entry.email}, ${entry.additional_info}, ${entry.data_format}, ${entry.price}
          ) RETURNING *
        `;
        insertedEntries.push(result[0]);
      }

      return Response.json({ 
        message: `Successfully uploaded ${insertedEntries.length} entries`,
        entries: insertedEntries 
      });
    } else {
      // Handle single entry
      const result = await sql`
        INSERT INTO data_entries (
          card_number, expiry_month, expiry_year, cvv, cardholder_name,
          bank_name, card_brand, card_type, card_level, address_line1,
          address_line2, city, state, zip_code, country, phone, email,
          additional_info, data_format, price
        ) VALUES (
          ${body.card_number}, ${body.expiry_month}, ${body.expiry_year},
          ${body.cvv}, ${body.cardholder_name}, ${body.bank_name},
          ${body.card_brand}, ${body.card_type}, ${body.card_level},
          ${body.address_line1}, ${body.address_line2}, ${body.city},
          ${body.state}, ${body.zip_code}, ${body.country}, ${body.phone},
          ${body.email}, ${body.additional_info}, ${body.data_format || 'format1'}, 
          ${body.price || 15.00}
        ) RETURNING *
      `;

      return Response.json(result[0]);
    }
  } catch (error) {
    console.error('Error creating data entry:', error);
    return Response.json({ error: 'Failed to create data entry' }, { status: 500 });
  }
}