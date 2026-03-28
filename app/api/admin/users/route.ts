import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, createUser } from '@/lib/auth';
import { pool } from '@/lib/db';

function isAdmin(session: any) {
  return session?.user?.isAdmin === true;
}

// GET /api/admin/users — list all users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await pool.query(
    `SELECT id, name, email, company_name, company_address, company_email,
            company_phone, abn, hourly_rate::float, gst_rate::float,
            invoice_start_number, created_at
     FROM users
     ORDER BY created_at ASC`
  );
  return NextResponse.json(result.rows);
}

// POST /api/admin/users — create a new user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, companyName, address, companyEmail, phone, abn, hourlyRate, gstRate, invoiceStartNumber } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const user = await createUser(name, email, password, {
      companyName, address, email: companyEmail, phone, abn,
      hourlyRate: hourlyRate || 0,
      gstRate: gstRate || 10,
      invoiceStartNumber: invoiceStartNumber || 1,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
