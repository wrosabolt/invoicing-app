import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoices, createInvoice, getNextInvoiceNumber, getLastInvoiceForClient } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    if (clientId) {
      const last = await getLastInvoiceForClient(session.user.id, clientId);
      return NextResponse.json(last);
    }
    const invoices = await getInvoices(session.user.id);
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const invoice = await request.json();
    invoice.id = crypto.randomUUID();
    invoice.userId = session.user.id;
    invoice.invoiceNumber = await getNextInvoiceNumber(session.user.id);
    const created = await createInvoice(invoice);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
