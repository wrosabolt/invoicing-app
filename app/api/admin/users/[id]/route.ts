import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

function isAdmin(session: any) {
  return session?.user?.isAdmin === true;
}

// PATCH /api/admin/users/[id] — update user details (and optionally password)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, email, password, companyName, address, companyEmail, phone, abn, hourlyRate, gstRate, invoiceStartNumber } = body;

  try {
    if (password && password.trim()) {
      // Update with new password
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET
          name = $1, email = $2, password = $3,
          company_name = $4, company_address = $5, company_email = $6,
          company_phone = $7, abn = $8, hourly_rate = $9, gst_rate = $10,
          invoice_start_number = $11
         WHERE id = $12`,
        [name, email?.toLowerCase(), hashed, companyName, address, companyEmail,
         phone, abn, hourlyRate || 0, gstRate || 10, invoiceStartNumber || 1, id]
      );
    } else {
      // Update without touching password
      await pool.query(
        `UPDATE users SET
          name = $1, email = $2,
          company_name = $3, company_address = $4, company_email = $5,
          company_phone = $6, abn = $7, hourly_rate = $8, gst_rate = $9,
          invoice_start_number = $10
         WHERE id = $11`,
        [name, email?.toLowerCase(), companyName, address, companyEmail,
         phone, abn, hourlyRate || 0, gstRate || 10, invoiceStartNumber || 1, id]
      );
    }

    const result = await pool.query(
      `SELECT id, name, email, company_name, company_address, company_email,
              company_phone, abn, hourly_rate::float, gst_rate::float,
              invoice_start_number, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — delete a user (cannot delete yourself)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  if (id === (session as any).user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
