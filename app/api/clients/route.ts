import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClients, createClient } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clients = await getClients(session.user.id);
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const client = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      name: body.name,
      company: body.company || '',
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactRole: body.contactRole || null,
    };
    const created = await createClient(client);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
