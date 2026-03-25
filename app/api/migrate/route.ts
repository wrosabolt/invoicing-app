import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        company_name TEXT,
        address TEXT,
        email TEXT,
        phone TEXT,
        abn TEXT,
        acn TEXT,
        logo_url TEXT
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        client_name TEXT,
        client_company TEXT,
        client_address TEXT,
        client_email TEXT,
        items JSONB,
        subtotal REAL,
        gst_rate REAL,
        gst_amount REAL,
        total REAL,
        status TEXT DEFAULT 'draft',
        paid INTEGER DEFAULT 0,
        paid_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    return NextResponse.json({ success: true, message: 'Tables created' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
