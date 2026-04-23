import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

// Add error listener to pool for better debugging
pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client:', err.message);
});

/**
 * Initializes the database schema for Week 3.
 */
export async function initDB(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('[DB] Initializing Database Schema...');

    await client.query('BEGIN');

    // 0. Ensure extensions
    console.log('[DB] Enabling pgcrypto extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // 1. Create Users
    console.log('[DB] Ensuring users table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Create Jobs
    console.log('[DB] Ensuring jobs table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        location VARCHAR(100) DEFAULT 'Remote',
        type VARCHAR(50) DEFAULT 'Full-time',
        company VARCHAR(200),
        salary VARCHAR(100),
        level VARCHAR(50),
        is_hot BOOLEAN DEFAULT false,
        deadline DATE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Create Applications
    console.log('[DB] Ensuring applications table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        experience_summary TEXT,
        cv_s3_key VARCHAR(500) NOT NULL,
        ai_analysis JSONB,
        status VARCHAR(50) DEFAULT 'Pending',
        submitted_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('[DB] Database schema check complete.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[DB] Critical Initialization Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}
