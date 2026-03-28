import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT 
        company_name as "companyName",
        company_address as address,
        company_email as email,
        company_phone as phone,
        abn,
        hourly_rate::float as "hourlyRate",
        gst_rate::float as "gstRate",
        invoice_start_number as "invoiceStartNumber"
      FROM users WHERE id = $1`,
      [session.user.id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, address, email, phone, abn, hourlyRate, gstRate, invoiceStartNumber } = body;

    await pool.query(
      `UPDATE users SET
        company_name = $1,
        company_address = $2,
        company_email = $3,
        company_phone = $4,
        abn = $5,
        hourly_rate = $6,
        gst_rate = $7,
        invoice_start_number = $8
      WHERE id = $9`,
      [companyName, address, email, phone, abn, hourlyRate, gstRate, invoiceStartNumber || 1, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}