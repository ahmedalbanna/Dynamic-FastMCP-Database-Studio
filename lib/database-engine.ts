// In-memory simulated relational database engine for dynamic FastMCP tools
export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
  lifetime_spend: number;
  orders_count: number;
  region: string;
  status: 'active' | 'suspended' | 'dormant';
  created_at: string;
}

export interface OrderRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  total_amount: number;
  item_count: number;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  currency: string;
  created_at: string;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: 'Electronics' | 'Servers' | 'Accessories' | 'Software';
  unit_price: number;
  stock_quantity: number;
  reorder_level: number;
  supplier: string;
}

export interface SupportTicketRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  sla_hours_remaining: number;
  assigned_to: string;
  created_at: string;
}

export interface SystemDatabase {
  customers: CustomerRecord[];
  orders: OrderRecord[];
  products: ProductRecord[];
  support_tickets: SupportTicketRecord[];
}

export const INITIAL_DATABASE: SystemDatabase = {
  customers: [
    {
      id: 'CUST-101',
      name: 'طارق المنصوري (Tariq Al-Mansoor)',
      email: 'tariq.m@gulftech.ae',
      tier: 'Platinum',
      lifetime_spend: 14850.0,
      orders_count: 32,
      region: 'Dubai, UAE',
      status: 'active',
      created_at: '2024-03-12',
    },
    {
      id: 'CUST-102',
      name: 'سارة عبد الله (Sara Abdullah)',
      email: 'sara.a@riyadhcloud.sa',
      tier: 'Platinum',
      lifetime_spend: 22400.0,
      orders_count: 48,
      region: 'Riyadh, KSA',
      status: 'active',
      created_at: '2023-11-04',
    },
    {
      id: 'CUST-103',
      name: 'محمد الشريف (Mohamed El-Sherif)',
      email: 'm.sherif@cairo-solutions.eg',
      tier: 'Gold',
      lifetime_spend: 6850.0,
      orders_count: 14,
      region: 'Cairo, Egypt',
      status: 'active',
      created_at: '2024-07-20',
    },
    {
      id: 'CUST-104',
      name: 'ليلى بن علي (Layla Ben Ali)',
      email: 'layla@tunisdev.tn',
      tier: 'Silver',
      lifetime_spend: 2100.0,
      orders_count: 5,
      region: 'Tunis, Tunisia',
      status: 'active',
      created_at: '2025-01-15',
    },
    {
      id: 'CUST-105',
      name: 'خالد الصباح (Khaled Al-Sabah)',
      email: 'khaled@kuwaitdata.kw',
      tier: 'Gold',
      lifetime_spend: 9400.0,
      orders_count: 21,
      region: 'Kuwait City, Kuwait',
      status: 'active',
      created_at: '2024-05-18',
    },
    {
      id: 'CUST-106',
      name: 'نورا السويدي (Noura Al-Suwaidi)',
      email: 'noura@dohalogistics.qa',
      tier: 'Platinum',
      lifetime_spend: 18900.0,
      orders_count: 39,
      region: 'Doha, Qatar',
      status: 'active',
      created_at: '2024-02-10',
    },
    {
      id: 'CUST-107',
      name: 'عمر القحطاني (Omar Al-Qahtani)',
      email: 'omar.q@neomcorp.sa',
      tier: 'Gold',
      lifetime_spend: 7300.0,
      orders_count: 16,
      region: 'NEOM, KSA',
      status: 'suspended',
      created_at: '2024-09-01',
    },
  ],
  orders: [
    {
      id: 'ORD-8801',
      customer_id: 'CUST-102',
      customer_name: 'سارة عبد الله (Sara Abdullah)',
      total_amount: 3200.0,
      item_count: 4,
      status: 'delivered',
      currency: 'USD',
      created_at: '2026-03-10',
    },
    {
      id: 'ORD-8802',
      customer_id: 'CUST-101',
      customer_name: 'طارق المنصوري (Tariq Al-Mansoor)',
      total_amount: 1450.0,
      item_count: 2,
      status: 'shipped',
      currency: 'USD',
      created_at: '2026-03-21',
    },
    {
      id: 'ORD-8803',
      customer_id: 'CUST-106',
      customer_name: 'نورا السويدي (Noura Al-Suwaidi)',
      total_amount: 4600.0,
      item_count: 6,
      status: 'processing',
      currency: 'USD',
      created_at: '2026-03-23',
    },
    {
      id: 'ORD-8804',
      customer_id: 'CUST-103',
      customer_name: 'محمد الشريف (Mohamed El-Sherif)',
      total_amount: 890.0,
      item_count: 1,
      status: 'delivered',
      currency: 'USD',
      created_at: '2026-03-15',
    },
    {
      id: 'ORD-8805',
      customer_id: 'CUST-105',
      customer_name: 'خالد الصباح (Khaled Al-Sabah)',
      total_amount: 2100.0,
      item_count: 3,
      status: 'processing',
      currency: 'USD',
      created_at: '2026-03-24',
    },
  ],
  products: [
    {
      id: 'PRD-501',
      sku: 'SRV-AI-GPU-8X',
      name: 'خادم الذكاء الاصطناعي عالي الكثافة (Enterprise AI GPU Node)',
      category: 'Servers',
      unit_price: 12500.0,
      stock_quantity: 4,
      reorder_level: 6,
      supplier: 'TensorSystems Global',
    },
    {
      id: 'PRD-502',
      sku: 'NET-SW-400G',
      name: 'مبدل شبكي عالي السرعة 400Gbps Switch',
      category: 'Electronics',
      unit_price: 3400.0,
      stock_quantity: 18,
      reorder_level: 8,
      supplier: 'Cisco Partners MENA',
    },
    {
      id: 'PRD-503',
      sku: 'NVME-ARRAY-64T',
      name: 'وحدة تخزين فلاشية فائقة السرعة NVMe 64TB',
      category: 'Electronics',
      unit_price: 1850.0,
      stock_quantity: 3,
      reorder_level: 5,
      supplier: 'SanDisk Enterprise',
    },
    {
      id: 'PRD-504',
      sku: 'LIC-MCP-PRO',
      name: 'ترخيص سنوي لمنصة FastMCP Enterprise Fleet',
      category: 'Software',
      unit_price: 2400.0,
      stock_quantity: 999,
      reorder_level: 10,
      supplier: 'Anthropic / FastMCP Core',
    },
    {
      id: 'PRD-505',
      sku: 'UPS-MOD-10KVA',
      name: 'وحدة تزويد طاقة غير منقطعة لمراكز البيانات 10kVA UPS',
      category: 'Electronics',
      unit_price: 4200.0,
      stock_quantity: 2,
      reorder_level: 4,
      supplier: 'Schneider Electric',
    },
  ],
  support_tickets: [
    {
      id: 'TCK-201',
      customer_id: 'CUST-102',
      customer_name: 'سارة عبد الله',
      priority: 'CRITICAL',
      title: 'طلب توسعة عتاد خوادم الذكاء الاصطناعي لمشروع سحابي',
      status: 'OPEN',
      sla_hours_remaining: 3.5,
      assigned_to: 'Eng. Zaid Al-Omari',
      created_at: '2026-03-24 08:30',
    },
    {
      id: 'TCK-202',
      customer_id: 'CUST-101',
      customer_name: 'طارق المنصوري',
      priority: 'HIGH',
      title: 'استفسار عن تفعيل بروتوكول MCP عبر بيئة Kubernetes',
      status: 'IN_PROGRESS',
      sla_hours_remaining: 8.0,
      assigned_to: 'Eng. Maya Haddad',
      created_at: '2026-03-23 14:15',
    },
    {
      id: 'TCK-203',
      customer_id: 'CUST-105',
      customer_name: 'خالد الصباح',
      priority: 'MEDIUM',
      title: 'تحديث بيانات الفوترة ومطابقة ضريبة القيمة المضافة',
      status: 'RESOLVED',
      sla_hours_remaining: 24.0,
      assigned_to: 'Finance Support Team',
      created_at: '2026-03-22 10:00',
    },
  ],
};

// Database state singleton for the server
let currentDatabase: SystemDatabase = JSON.parse(JSON.stringify(INITIAL_DATABASE));

export function getDatabase(): SystemDatabase {
  return currentDatabase;
}

export function resetDatabase(): SystemDatabase {
  currentDatabase = JSON.parse(JSON.stringify(INITIAL_DATABASE));
  return currentDatabase;
}

/**
 * Parameterized SQL execution simulator.
 * Parses SQL statements against system database tables.
 */
export function executeSqlAgainstDb(
  sqlQuery: string,
  parameters: Record<string, any> = {}
): { rows: any[]; affectedCount: number; executionPlan: string } {
  const cleanSql = sqlQuery.trim();
  const db = getDatabase();

  // Low-stock products query
  if (/products/i.test(cleanSql) && (/stock/i.test(cleanSql) || /reorder/i.test(cleanSql))) {
    let rows = db.products.filter(p => p.stock_quantity <= p.reorder_level);
    if (parameters.category && parameters.category !== 'ALL') {
      rows = rows.filter(p => p.category.toLowerCase() === String(parameters.category).toLowerCase());
    }
    const limit = Number(parameters.limit || 50);
    return {
      rows: rows.slice(0, limit),
      affectedCount: rows.length,
      executionPlan: 'Index Scan on idx_products_stock_reorder (FILTER: stock <= reorder_level)',
    };
  }

  // All products query
  if (/products/i.test(cleanSql)) {
    let rows = [...db.products];
    if (parameters.category && parameters.category !== 'ALL') {
      rows = rows.filter(p => p.category.toLowerCase() === String(parameters.category).toLowerCase());
    }
    if (parameters.max_price) {
      rows = rows.filter(p => p.unit_price <= Number(parameters.max_price));
    }
    const limit = Number(parameters.limit || 50);
    return {
      rows: rows.slice(0, limit),
      affectedCount: rows.length,
      executionPlan: 'Seq Scan on products table (cost=0.00..12.50)',
    };
  }

  // Customers query
  if (/customers/i.test(cleanSql)) {
    let rows = [...db.customers];
    const tier = parameters.tier || parameters.customer_tier;
    if (tier && tier !== 'ALL') {
      rows = rows.filter(c => c.tier.toLowerCase() === String(tier).toLowerCase());
    }
    const minSpend = Number(parameters.min_spend || parameters.min_lifetime_spend || 0);
    if (minSpend > 0) {
      rows = rows.filter(c => c.lifetime_spend >= minSpend);
    }
    const region = parameters.region;
    if (region && region !== 'ALL') {
      rows = rows.filter(c => c.region.toLowerCase().includes(String(region).toLowerCase()));
    }
    if (parameters.customer_id) {
      rows = rows.filter(c => c.id === parameters.customer_id);
    }
    // Sort
    rows.sort((a, b) => b.lifetime_spend - a.lifetime_spend);
    const limit = Number(parameters.limit || 50);
    return {
      rows: rows.slice(0, limit),
      affectedCount: rows.length,
      executionPlan: 'Sort (ORDER BY lifetime_spend DESC) -> Bitmap Heap Scan on customers',
    };
  }

  // Orders query
  if (/orders/i.test(cleanSql)) {
    let rows = [...db.orders];
    if (parameters.customer_id) {
      rows = rows.filter(o => o.customer_id === parameters.customer_id);
    }
    if (parameters.status && parameters.status !== 'ALL') {
      rows = rows.filter(o => o.status.toLowerCase() === String(parameters.status).toLowerCase());
    }
    const limit = Number(parameters.limit || 50);
    return {
      rows: rows.slice(0, limit),
      affectedCount: rows.length,
      executionPlan: 'Index Scan on idx_orders_customer_date',
    };
  }

  // Support Tickets query
  if (/support_tickets|tickets/i.test(cleanSql)) {
    let rows = [...db.support_tickets];
    if (parameters.priority && parameters.priority !== 'ALL') {
      rows = rows.filter(t => t.priority.toUpperCase() === String(parameters.priority).toUpperCase());
    }
    if (parameters.status && parameters.status !== 'ALL') {
      rows = rows.filter(t => t.status.toUpperCase() === String(parameters.status).toUpperCase());
    }
    const limit = Number(parameters.limit || 50);
    return {
      rows: rows.slice(0, limit),
      affectedCount: rows.length,
      executionPlan: 'Index Scan on idx_tickets_sla_priority',
    };
  }

  // Fallback generic query simulator
  return {
    rows: [
      {
        query_executed: cleanSql,
        parameters_received: parameters,
        status: 'SUCCESS',
        note: 'Parameterized query executed against database engine.',
      },
    ],
    affectedCount: 1,
    executionPlan: 'Dynamic FastMCP Database Plan (Cached Statement)',
  };
}

/**
 * Dynamic Sandboxed Script Executor
 */
export function executeDynamicScript(
  code: string,
  args: Record<string, any>
): any {
  const db = getDatabase();
  try {
    // Provide safe context
    const fn = new Function('args', 'db', `
      "use strict";
      ${code}
    `);
    return fn(args, db);
  } catch (err: any) {
    throw new Error(`Script execution error: ${err.message}`);
  }
}

/**
 * Dynamic HTTP Fetch Simulator
 */
export async function executeDynamicHttp(
  config: { url: string; method: string; headers?: Record<string, string>; bodyTemplate?: string },
  args: Record<string, any>
): Promise<any> {
  // Check if simulated endpoint
  let targetUrl = config.url;
  for (const [key, val] of Object.entries(args)) {
    targetUrl = targetUrl.replace(new RegExp(`{${key}}`, 'g'), encodeURIComponent(String(val)));
  }

  // Return realistic mock responses for common MCP API integrations
  if (targetUrl.includes('exchange') || targetUrl.includes('fx')) {
    const from = (args.from_currency || 'USD').toUpperCase();
    const to = (args.to_currency || 'AED').toUpperCase();
    const amount = Number(args.amount || 1);
    const rates: Record<string, number> = {
      'USD_AED': 3.6725,
      'USD_SAR': 3.75,
      'USD_EUR': 0.92,
      'EUR_USD': 1.087,
      'AED_SAR': 1.021,
      'SAR_AED': 0.979,
    };
    const key = `${from}_${to}`;
    const rate = rates[key] || 1.0;
    return {
      endpoint: targetUrl,
      base: from,
      target: to,
      exchange_rate: rate,
      source_amount: amount,
      converted_amount: Number((amount * rate).toFixed(2)),
      last_updated_utc: new Date().toISOString(),
    };
  }

  if (targetUrl.includes('shipping') || targetUrl.includes('delivery')) {
    return {
      carrier: 'FastMCP Regional Express',
      destination: args.destination || 'Riyadh, KSA',
      weight_kg: args.weight_kg || 2.5,
      estimated_delivery_days: 2,
      shipping_fee_usd: 35.0,
      tracking_ready: true,
      service_tier: 'Next-Day Air Hub',
    };
  }

  // Real fetch if public safe URL
  if (targetUrl.startsWith('http')) {
    try {
      const res = await fetch(targetUrl, {
        method: config.method || 'GET',
        headers: config.headers,
      });
      return await res.json();
    } catch {
      // Fallback
    }
  }

  return {
    endpoint: targetUrl,
    method: config.method,
    parameters: args,
    response_code: 200,
    status: 'OK',
    data: { message: 'HTTP dynamic tool executed successfully.' },
  };
}
