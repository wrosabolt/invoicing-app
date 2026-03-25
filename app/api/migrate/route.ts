import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PG_URL });

export async function GET() {
  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        client_id TEXT,
        invoice_number TEXT UNIQUE NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        subtotal NUMERIC NOT NULL DEFAULT 0,
        gst_rate NUMERIC DEFAULT 10,
        gst_amount NUMERIC DEFAULT 0,
        total NUMERIC NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        paid BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    client.release();
    return NextResponse.json({ success: true, message: 'Tables created!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
