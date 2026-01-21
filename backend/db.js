// db.js
import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mynwap-nehSek-5wotse@db.nkeoxuyjshohgntfjeej.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  host: undefined
});

export default pool;