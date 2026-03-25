import { NextResponse } from 'next/server';

const defaultSettings = {
  companyName: 'Rosa Plumbing',
  address: '14 Emily Street\nSomerton\nVIC 3062',
  email: 'rosaplumbing@outlook.com',
  phone: '0419 140 793',
  abn: '86 659 791 662',
  acn: '',
  hourlyRate: 85,
  gstRate: 10
};

// In-memory storage (replace with DB table later)
let settings = { ...defaultSettings };

export async function GET() {
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const newSettings = await request.json();
    settings = { ...settings, ...newSettings };
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
