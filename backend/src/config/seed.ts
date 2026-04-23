import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

async function seed() {
  console.log('[Seed] Starting database seeding...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Create Admin User
    const adminEmail = 'admin@recruitment.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    let adminId;
    if (adminCheck.rowCount === 0) {
      console.log('[Seed] Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const userRes = await client.query(
        'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['System Admin', adminEmail, hashedPassword, 'admin']
      );
      adminId = userRes.rows[0].id;
    } else {
      adminId = adminCheck.rows[0].id;
      console.log('[Seed] Admin user already exists.');
    }

    // 2. Create Sample Jobs
    const jobsCheck = await client.query('SELECT id FROM jobs LIMIT 1');
    if (jobsCheck.rowCount === 0) {
      console.log('[Seed] Creating sample jobs...');
      const jobs = [
        {
          title: 'Senior Node.js Engineer',
          description: 'We are looking for a backend expert to build high-scale AWS infrastructure.',
          company: 'TechNexus Solutions',
          location: 'Ho Chi Minh City / Remote',
          salary: '2,500 - 4,500 USD',
          level: 'Senior',
          type: 'Full-time',
          is_hot: true,
          deadline: '2026-05-01'
        },
        {
          title: 'Frontend Developer (React/Next.js)',
          description: 'Join our creative team to build stunning Apple-inspired user interfaces.',
          company: 'DesignFlow Inc',
          location: 'Da Nang / Remote',
          salary: '1,500 - 2,800 USD',
          level: 'Middle',
          type: 'Full-time',
          is_hot: false,
          deadline: '2026-04-30'
        },
        {
          title: 'DevOps Cloud Architect',
          description: 'Master VPC, Fargate, and Zero-Trust networking on AWS.',
          company: 'CloudNative Systems',
          location: 'Hanoi / Remote',
          salary: '3,000 - 5,500 USD',
          level: 'Lead',
          type: 'Full-time',
          is_hot: true,
          deadline: '2026-06-15'
        }
      ];

      for (const job of jobs) {
        await client.query(
          `INSERT INTO jobs (title, description, location, type, company, salary, level, is_hot, deadline, created_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [job.title, job.description, job.location, job.type, job.company, job.salary, job.level, job.is_hot, job.deadline, adminId]
        );
      }
      console.log(`[Seed] Created ${jobs.length} sample jobs.`);
    } else {
      console.log('[Seed] Jobs already exist, skipping.');
    }

    await client.query('COMMIT');
    console.log('[Seed] Seeding completed successfully! 🚀');
    console.log('--- Credentials ---');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: admin123');
    console.log('-------------------');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Seed] Error seeding database:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
