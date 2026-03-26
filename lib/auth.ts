import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.PG_URL });

export async function createUser(name: string, email: string, password: string, companyData: any) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, company_name, company_address, company_email, company_phone, abn, hourly_rate, gst_rate, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING id, name, email, company_name, hourly_rate, gst_rate`,
    [name, email.toLowerCase(), hashedPassword, companyData.companyName, companyData.address, 
     companyData.email, companyData.phone, companyData.abn, companyData.hourlyRate, companyData.gstRate]
  );
  
  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0];
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}