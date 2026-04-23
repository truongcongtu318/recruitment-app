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

/**
 * Initializes the database schema for Week 3.
 */
export async function initDB(): Promise<void> {
  try {
    console.log('[DB] Initializing Database Schema...');
    
    await pool.query(`
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
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );

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

    const { rowCount } = await pool.query('SELECT 1 FROM jobs LIMIT 1');
    if (rowCount === 0) {
      console.log('[DB] Seeding initial recruitment data...');
      await pool.query(`
        INSERT INTO jobs (title, description, location, type, company, salary, level, is_hot, deadline) VALUES
          ('Senior Cloud Architect', 'Lead our AWS migration strategy and define best practices for the G12 platform.', 'Remote', 'Full-time', 'G12 Tech Solutions', '$3,500 - $5,000', 'Senior', true, '2026-05-30'),
          ('AI/ML Engineer', 'Work on Amazon Bedrock and Textract integration for automated CV analysis.', 'Ho Chi Minh City', 'Full-time', 'XBrain AI', '$2,000 - $3,500', 'Mid', true, '2026-05-30'),
          ('Frontend Lead (Next.js)', 'Build premium UIs and mentor junior developers in modern React patterns.', 'Da Nang', 'Full-time', 'InnoLab VN', '$1,800 - $2,800', 'Senior', false, '2026-06-15');
      `);
      console.log('[DB] Seed data successfully inserted.');
    }
  } catch (err: any) {
    console.error('[DB] Critical Initialization Error:', err.message);
    throw err;
  }
}
