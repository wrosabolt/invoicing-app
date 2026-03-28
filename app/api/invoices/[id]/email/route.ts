import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'invoices@yourdomain.com';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get invoice + client data
    const invoiceResult = await pool.query(
      `SELECT i.*, c.name as client_name, c.company as client_company,
              c.address as client_address, c.email as client_email, c.phone as client_phone
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, session.user.id]
    );

    if (!invoiceResult.rows[0]) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const row = invoiceResult.rows[0];

    if (!row.client_email) {
      return NextResponse.json(
        { error: 'This client has no email address on file.' },
        { status: 400 }
      );
    }

    // Get user's company settings
    const userResult = await pool.query(
      `SELECT company_name, company_email, company_address, company_phone, abn
       FROM users WHERE id = $1`,
      [session.user.id]
    );
    const user = userResult.rows[0];

    // Build invoice object for PDF
    const invoice = {
      id: row.id,
      invoiceNumber: row.invoice_number,
      createdAt: row.created_at,
      clientId: row.client_id,
      clientName: row.client_company || row.client_name || '',
      clientCompany: row.client_company || '',
      clientAddress: row.client_address || '',
      clientEmail: row.client_email || '',
      clientPhone: row.client_phone || '',
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      subtotal: parseFloat(row.subtotal),
      gstRate: parseFloat(row.gst_rate),
      gstAmount: parseFloat(row.gst_amount),
      total: parseFloat(row.total),
      status: row.status,
      paid: row.paid,
      dueDate: row.due_date,
      startDate: row.start_date,
      endDate: row.end_date,
    };

    const companySettings = {
      companyName: user.company_name || '',
      address: user.company_address || '',
      email: user.company_email || '',
      phone: user.company_phone || '',
      abn: user.abn || '',
      hourlyRate: 0,
      gstRate: 10,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      createElement(InvoicePDF, { invoice: invoice as any, companySettings })
    );

    const clientName = row.client_company || row.client_name || 'Client';
    const filename = `${clientName} - ${row.invoice_number}.pdf`;

    // Send via Resend
    const { error } = await resend.emails.send({
      from: `${user.company_name} <${FROM_EMAIL}>`,
      to: row.client_email,
      replyTo: user.company_email,
      subject: `Tax Invoice ${row.invoice_number} from ${user.company_name}`,
      text: `Please find attached Tax Invoice ${row.invoice_number}.\n\nThank you for your business.\n\n${user.company_name}`,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentTo: row.client_email });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
