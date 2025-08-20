import sql from './sql.js';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'src/app/api/utils/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement);
      }
    }
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
