import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, executeSqlAgainstDb } from '@/lib/database-engine';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      success: true,
      tables: {
        customers: {
          count: db.customers.length,
          sample: db.customers,
          columns: ['id', 'name', 'email', 'tier', 'lifetime_spend', 'orders_count', 'region', 'status', 'created_at'],
        },
        orders: {
          count: db.orders.length,
          sample: db.orders,
          columns: ['id', 'customer_id', 'customer_name', 'total_amount', 'item_count', 'status', 'currency', 'created_at'],
        },
        products: {
          count: db.products.length,
          sample: db.products,
          columns: ['id', 'sku', 'name', 'category', 'unit_price', 'stock_quantity', 'reorder_level', 'supplier'],
        },
        support_tickets: {
          count: db.support_tickets.length,
          sample: db.support_tickets,
          columns: ['id', 'customer_id', 'customer_name', 'priority', 'title', 'status', 'sla_hours_remaining', 'assigned_to', 'created_at'],
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || 'SELECT * FROM customers;';
    const params = body.params || {};

    const result = executeSqlAgainstDb(query, params);
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
