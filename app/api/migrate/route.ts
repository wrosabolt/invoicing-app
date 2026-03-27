import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PG_URL });

export async function GET() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop tables in reverse order (remove foreign key constraints)
    await client.query('DROP TABLE IF EXISTS invoices');
    await client.query('DROP TABLE IF EXISTS clients');
    await client.query('DROP TABLE IF EXISTS users');
    
    // Create users table first
    await client.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        company_name TEXT,
        company_address TEXT,
        company_email TEXT,
        company_phone TEXT,
        company_abn TEXT,
        company_logo TEXT,
        hourly_rate NUMERIC DEFAULT 0,
        gst_rate NUMERIC DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create clients table
    await client.query(`
      CREATE TABLE clients (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create invoices table last
    await client.query(`
      CREATE TABLE invoices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        subtotal NUMERIC NOT NULL DEFAULT 0,
        gst_rate NUMERIC DEFAULT 10,
        gst_amount NUMERIC DEFAULT 0,
        total NUMERIC NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        paid BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    client.release();
    
    return NextResponse.json({ success: true, message: 'Tables migrated successfully!' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    client.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
