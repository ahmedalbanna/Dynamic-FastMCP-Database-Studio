import { DynamicMCPTool } from './mcp-types';

export const DEFAULT_MCP_TOOLS: DynamicMCPTool[] = [
  {
    id: 'tool-query-customers',
    name: 'query_customers',
    titleAr: 'استعلام بيانات العملاء والإنفاق',
    titleEn: 'Query Enterprise Customers & Spend',
    descriptionAr: 'البحث في قاعدة بيانات العملاء حسب الفئة (Platinum, Gold, Silver) أو الحد الأدنى لإجمالي الإنفاق أو المنطقة الجغرافية.',
    descriptionEn: 'Search customers in the enterprise database by membership tier (Platinum, Gold, Silver), minimum lifetime spend, or region.',
    category: 'DATABASE_SQL',
    executionType: 'sql',
    isActive: true,
    version: '1.4.0',
    tags: ['database', 'crm', 'sql', 'customers'],
    inputSchema: {
      type: 'object',
      properties: {
        tier: {
          type: 'string',
          description: 'فئة العميل (Platinum, Gold, Silver, ALL)',
          enum: ['ALL', 'Platinum', 'Gold', 'Silver'],
          default: 'ALL',
        },
        min_spend: {
          type: 'number',
          description: 'الحد الأدنى لإجمالي إنفاق العميل بالدولار (Lifetime Spend in USD)',
          default: 0,
        },
        region: {
          type: 'string',
          description: 'تصفية حسب المنطقة أو الدولة (مثل Riyadh, Dubai, Cairo)',
        },
        limit: {
          type: 'integer',
          description: 'الحد الأقصى لعدد السجلات المعادة (افتراضي 10)',
          default: 10,
        },
      },
      required: [],
      additionalProperties: false,
    },
    executionConfig: {
      sql: {
        query: `SELECT id, name, email, tier, lifetime_spend, orders_count, region, status
FROM customers
WHERE (:tier = 'ALL' OR tier = :tier)
  AND lifetime_spend >= :min_spend
ORDER BY lifetime_spend DESC
LIMIT :limit;`,
        databaseTable: 'customers',
        readOnly: true,
      },
    },
    stats: {
      totalCalls: 142,
      successCount: 140,
      failCount: 2,
      avgLatencyMs: 14,
      lastCalledAt: '2026-03-24T10:15:00Z',
    },
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-03-20T12:00:00Z',
  },
  {
    id: 'tool-inventory-restock',
    name: 'check_inventory_restock',
    titleAr: 'فحص نواقص المخزون وإعادة الطلب',
    titleEn: 'Check Low-Stock Inventory & Reorders',
    descriptionAr: 'استخراج المنتجات التي اقتربت من النفاد (الكمية الحالية أقل من أو تساوي حد إعادة الطلب) وحساب تكلفة إعادة التوريد.',
    descriptionEn: 'Query products needing replenishment where stock_quantity <= reorder_level and calculate estimated reorder budget.',
    category: 'DATABASE_SQL',
    executionType: 'sql',
    isActive: true,
    version: '2.1.0',
    tags: ['inventory', 'supply_chain', 'warehouse', 'sql'],
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'تصنيف المنتجات (Electronics, Servers, Accessories, Software, ALL)',
          enum: ['ALL', 'Electronics', 'Servers', 'Accessories', 'Software'],
          default: 'ALL',
        },
        limit: {
          type: 'integer',
          description: 'العدد الأقصى للعناصر المطلوب فحصها',
          default: 20,
        },
      },
      required: [],
      additionalProperties: false,
    },
    executionConfig: {
      sql: {
        query: `SELECT id, sku, name, category, unit_price, stock_quantity, reorder_level, supplier
FROM products
WHERE stock_quantity <= reorder_level
  AND (:category = 'ALL' OR category = :category)
ORDER BY (reorder_level - stock_quantity) DESC
LIMIT :limit;`,
        databaseTable: 'products',
        readOnly: true,
      },
    },
    stats: {
      totalCalls: 98,
      successCount: 97,
      failCount: 1,
      avgLatencyMs: 18,
      lastCalledAt: '2026-03-24T09:40:00Z',
    },
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-03-18T16:20:00Z',
  },
  {
    id: 'tool-customer-orders',
    name: 'get_customer_orders',
    titleAr: 'استعلام طلبات العميل الأخيرة',
    titleEn: 'Get Customer Recent Orders',
    descriptionAr: 'جلب قائمة الطلبات المرتبطة برقم عميل محدد مع تفاصيل المبالغ وحالة الشحن.',
    descriptionEn: 'Retrieve list of orders for a specific customer ID including amounts and delivery status.',
    category: 'DATABASE_SQL',
    executionType: 'sql',
    isActive: true,
    version: '1.2.0',
    tags: ['orders', 'ecommerce', 'sql'],
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'معرف العميل (مثل CUST-101 أو CUST-102)',
        },
        status: {
          type: 'string',
          description: 'حالة الطلب (delivered, shipped, processing, cancelled, ALL)',
          enum: ['ALL', 'delivered', 'shipped', 'processing', 'cancelled'],
          default: 'ALL',
        },
        limit: {
          type: 'integer',
          description: 'عدد الطلبات',
          default: 5,
        },
      },
      required: ['customer_id'],
      additionalProperties: false,
    },
    executionConfig: {
      sql: {
        query: `SELECT id, customer_id, customer_name, total_amount, item_count, status, currency, created_at
FROM orders
WHERE customer_id = :customer_id
  AND (:status = 'ALL' OR status = :status)
ORDER BY created_at DESC
LIMIT :limit;`,
        databaseTable: 'orders',
        readOnly: true,
      },
    },
    stats: {
      totalCalls: 85,
      successCount: 84,
      failCount: 1,
      avgLatencyMs: 12,
      lastCalledAt: '2026-03-24T11:05:00Z',
    },
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-03-12T14:10:00Z',
  },
  {
    id: 'tool-calculate-discount',
    name: 'calculate_tier_discount',
    titleAr: 'حساب نسبة الخصم الديناميكية للعميل',
    titleEn: 'Calculate Dynamic Tier Loyalty Discount',
    descriptionAr: 'معادلة برمجية ديناميكية تحسب نسبة الخصم المستحق ومبلغ الوفر بناءً على فئة العميل وقيمة السلة التقديرية وسجل المشتريات.',
    descriptionEn: 'Dynamic business script calculating custom loyalty discount percentage and dollar savings based on cart value and customer tier.',
    category: 'BUSINESS_LOGIC',
    executionType: 'script',
    isActive: true,
    version: '1.5.0',
    tags: ['pricing', 'discounts', 'logic', 'script'],
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'معرف العميل في النظام (e.g. CUST-101)',
        },
        cart_total_usd: {
          type: 'number',
          description: 'إجمالي قيمة المشتريات الحالية بالدولار',
        },
        seasonal_promo_code: {
          type: 'string',
          description: 'رمز ترويجي إضافي اختياري (مثل RAMADAN2026 أو SPRING)',
        },
      },
      required: ['customer_id', 'cart_total_usd'],
      additionalProperties: false,
    },
    executionConfig: {
      script: {
        code: `// Dynamic business rule script executed without server restart
const customer = db.customers.find(c => c.id === args.customer_id);
const cart = Number(args.cart_total_usd || 0);

if (!customer) {
  return {
    error: "Customer ID not found in database",
    customer_id: args.customer_id
  };
}

let baseDiscountPercent = 5;
if (customer.tier === 'Platinum') {
  baseDiscountPercent = 20;
} else if (customer.tier === 'Gold') {
  baseDiscountPercent = 12;
} else if (customer.tier === 'Silver') {
  baseDiscountPercent = 8;
}

// Volume bonus
let volumeBonus = 0;
if (cart >= 5000) {
  volumeBonus = 5;
} else if (cart >= 2000) {
  volumeBonus = 3;
}

// Promo code bonus
let promoBonus = 0;
if (args.seasonal_promo_code && args.seasonal_promo_code.toUpperCase().includes('RAMADAN')) {
  promoBonus = 7;
}

const totalDiscountPercent = Math.min(35, baseDiscountPercent + volumeBonus + promoBonus);
const discountAmount = Number(((cart * totalDiscountPercent) / 100).toFixed(2));
const finalPayable = Number((cart - discountAmount).toFixed(2));

return {
  customer_id: customer.id,
  customer_name: customer.name,
  tier: customer.tier,
  cart_total_usd: cart,
  breakdown: {
    tier_base_percent: baseDiscountPercent,
    volume_bonus_percent: volumeBonus,
    seasonal_promo_percent: promoBonus,
    total_discount_percent: totalDiscountPercent
  },
  discount_amount_usd: discountAmount,
  final_payable_usd: finalPayable,
  loyalty_points_earned: Math.floor(finalPayable / 10)
};`,
        runtime: 'javascript',
      },
    },
    stats: {
      totalCalls: 63,
      successCount: 63,
      failCount: 0,
      avgLatencyMs: 4,
      lastCalledAt: '2026-03-24T11:22:00Z',
    },
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-03-22T08:00:00Z',
  },
  {
    id: 'tool-convert-fx',
    name: 'convert_currency_fx',
    titleAr: 'تحويل العملات وأسعار الصرف اللحظية',
    titleEn: 'Real-Time FX Currency Conversion',
    descriptionAr: 'استدعاء واجهة REST API ديناميكية لتحويل المبالغ المالية بين العملات (USD, SAR, AED, EUR) بأسعار الصرف المعتمدة.',
    descriptionEn: 'Dynamic REST API tool fetching real-time foreign exchange rates and converting amounts between USD, SAR, AED, and EUR.',
    category: 'REST_API',
    executionType: 'http',
    isActive: true,
    version: '1.1.0',
    tags: ['finance', 'fx', 'rest_api', 'currency'],
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'المبلغ المراد تحويله',
          default: 100,
        },
        from_currency: {
          type: 'string',
          description: 'عملة المصدر (USD, SAR, AED, EUR)',
          enum: ['USD', 'SAR', 'AED', 'EUR'],
          default: 'USD',
        },
        to_currency: {
          type: 'string',
          description: 'عملة الهدف (USD, SAR, AED, EUR)',
          enum: ['USD', 'SAR', 'AED', 'EUR'],
          default: 'AED',
        },
      },
      required: ['amount', 'from_currency', 'to_currency'],
      additionalProperties: false,
    },
    executionConfig: {
      http: {
        url: 'https://api.fastmcp-finance.internal/v1/fx/exchange?from={from_currency}&to={to_currency}',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Client': 'FastMCP-Dynamic-Dispatcher',
        },
      },
    },
    stats: {
      totalCalls: 110,
      successCount: 109,
      failCount: 1,
      avgLatencyMs: 45,
      lastCalledAt: '2026-03-24T11:40:00Z',
    },
    createdAt: '2026-01-22T15:00:00Z',
    updatedAt: '2026-03-15T19:00:00Z',
  },
  {
    id: 'tool-support-tickets',
    name: 'manage_support_tickets',
    titleAr: 'استعلام تذاكر الدعم الفني والحالات الحرجة',
    titleEn: 'Query Support Tickets & SLA Breaches',
    descriptionAr: 'استعلام قاعدة بيانات الدعم الفني لمتابعة التذاكر المفتوحة حسب درجة الأهمية (CRITICAL, HIGH) وساعات اتفاقية مستوى الخدمة المتبقية.',
    descriptionEn: 'Query support tickets to identify critical customer issues and tickets nearing SLA breach limits.',
    category: 'DATABASE_SQL',
    executionType: 'sql',
    isActive: true,
    version: '1.0.0',
    tags: ['support', 'tickets', 'sla', 'sql'],
    inputSchema: {
      type: 'object',
      properties: {
        priority: {
          type: 'string',
          description: 'مستوى الأهمية (CRITICAL, HIGH, MEDIUM, LOW, ALL)',
          enum: ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          default: 'ALL',
        },
        status: {
          type: 'string',
          description: 'حالة التذكرة (OPEN, IN_PROGRESS, RESOLVED, ALL)',
          enum: ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'],
          default: 'OPEN',
        },
        limit: {
          type: 'integer',
          description: 'الحد الأقصى لعدد التذاكر',
          default: 10,
        },
      },
      required: [],
      additionalProperties: false,
    },
    executionConfig: {
      sql: {
        query: `SELECT id, customer_id, customer_name, priority, title, status, sla_hours_remaining, assigned_to, created_at
FROM support_tickets
WHERE (:priority = 'ALL' OR priority = :priority)
  AND (:status = 'ALL' OR status = :status)
ORDER BY sla_hours_remaining ASC
LIMIT :limit;`,
        databaseTable: 'support_tickets',
        readOnly: true,
      },
    },
    stats: {
      totalCalls: 47,
      successCount: 46,
      failCount: 1,
      avgLatencyMs: 11,
      lastCalledAt: '2026-03-24T08:12:00Z',
    },
    createdAt: '2026-02-28T14:00:00Z',
    updatedAt: '2026-03-23T11:00:00Z',
  },
];
