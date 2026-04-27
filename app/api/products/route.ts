import { NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, price, stock, unit } = body;
    
    db.prepare(`
      INSERT OR REPLACE INTO products (id, name, description, price, stock, unit) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, description || '', price || 0, stock || 0, unit || 'unidad');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar producto' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}