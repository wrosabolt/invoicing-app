import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        company_name TEXT DEFAULT '',
        company_address TEXT DEFAULT '',
        company_email TEXT DEFAULT '',
        company_phone TEXT DEFAULT '',
        abn TEXT DEFAULT '',
        hourly_rate DECIMAL(10,2) DEFAULT 85.00,
        gst_rate DECIMAL(5,2) DEFAULT 10.00,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add user_id to invoices table if not exists
    await query(`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)
    `);

    // Add user_id to clients table if not exists
    await query(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)
    `);

    return NextResponse.json({ success: true, message: "Users table created" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}