import { NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET() {
  try {
    const invoices = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, data } = body;
    
    db.prepare('INSERT OR REPLACE INTO invoices (id, data) VALUES (?, ?)')
      .run(id, JSON.stringify(data));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar factura' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 });
  }
}