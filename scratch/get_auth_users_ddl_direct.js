const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT column_name, is_generated, generation_expression, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'auth';
    `);
    console.log("AUTH.USERS COLUMNS:\n", JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

main();
