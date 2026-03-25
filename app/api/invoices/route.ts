import { NextResponse } from 'next/server';
import { getInvoices, createInvoice } from '@/lib/db';

export async function GET() {
  try {
    const userId = 'default-user'; // TODO: Add auth
    const invoices = await getInvoices(userId);
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const invoice = await request.json();
    invoice.id = crypto.randomUUID();
    invoice.userId = 'default-user'; // TODO: Add auth
    const created = await createInvoice(invoice);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
