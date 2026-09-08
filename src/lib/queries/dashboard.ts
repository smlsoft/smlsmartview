import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;

export type DashboardPresetKey =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "this_quarter"
  | "this_year"
  | "custom";

export type PeriodInfo = {
  as_of_date: string;
  current_start: string;
  current_end: string;
  previous_start: string;
  previous_end: string;
  start_date: string;
  end_date: string;
  previous_start_date: string;
  previous_end_date: string;
  preset: DashboardPresetKey;
  preset_label: string;
};

export type DashboardQueryInput = {
  preset?: string;
  from?: string;
  to?: string;
};

export type SummaryMetric = {
  current: number;
  previous: number;
  delta_pct: number | null;
};

export type ExecutiveDashboardData = {
  period: PeriodInfo;
  company_name: string;
  sales: SummaryMetric;
  cost: SummaryMetric;
  gross_profit: SummaryMetric;
  gross_margin_pct: SummaryMetric;
  bills: SummaryMetric;
  avg_bill: SummaryMetric;
  discount: SummaryMetric;
  returns: SummaryMetric;
  purchases: SummaryMetric;
  ar_total: number;
  ar_overdue: number;
  ap_total: number;
  ap_due_soon: number;
  dso_days: number | null;
  stock_value: number;
  stock_qty: number;
  stock_items: number;
  trend: TrendPoint[];
  branch_mix: RankingRow[];
  top_products: ProductRow[];
  top_profit_products: ProductRow[];
  low_margin_products: ProductRow[];
  salespersons: RankingRow[];
  customers: RankingRow[];
  debtors: DebtorRow[];
  suppliers: DebtorRow[];
  low_stock: InventoryRiskRow[];
  slow_stock: InventoryRiskRow[];
  story: StoryLine[];
};

export type TrendPoint = {
  period: string;
  sales: number;
  gross_profit: number;
};

export type RankingRow = {
  code: string;
  name: string;
  amount: number;
  count: number;
  pct?: number;
};

export type ProductRow = {
  code: string;
  name: string;
  qty: number;
  sales: number;
  cost: number;
  gross_profit: number;
  gross_margin_pct: number | null;
};

export type DebtorRow = {
  code: string;
  name: string;
  amount: number;
  overdue_amount: number;
  count: number;
};

export type InventoryRiskRow = {
  code: string;
  name: string;
  qty: number;
  monthly_qty: number;
  unit: string;
};

export type StoryLine = {
  title: string;
  body: string;
  severity: "success" | "warning" | "danger" | "info" | "neutral";
};

type SummaryRow = {
  period_key: "current" | "previous";
  sales: Numeric;
  bills: Numeric;
  discount: Numeric;
  cost: Numeric;
  gross_profit: Numeric;
  purchases: Numeric;
  returns: Numeric;
  return_bills: Numeric;
};

function numberValue(value: Numeric) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function metric(current: number, previous: number): SummaryMetric {
  return {
    current,
    previous,
    delta_pct: previous === 0 ? null : ((current - previous) / previous) * 100
  };
}

function pct(numerator: number, denominator: number) {
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return null;
  return value;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00+07:00`);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

function shiftYear(dateStr: string, years: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const targetYear = y + years;
  const date = new Date(targetYear, m - 1, d);
  if (date.getMonth() !== m - 1) {
    return formatLocalDate(new Date(targetYear, m, 0));
  }
  return formatLocalDate(date);
}

export const DASHBOARD_PRESET_LABELS: Record<DashboardPresetKey, string> = {
  this_month: "เดือนนี้",
  last_month: "เดือนที่แล้ว",
  last_3_months: "3 เดือนล่าสุด",
  this_quarter: "ไตรมาสนี้",
  this_year: "ปีนี้",
  custom: "กำหนดเอง"
};

export function getPeriod(input: DashboardQueryInput = {}): PeriodInfo {
  const now = new Date();
  const thaiDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
  const [year, monthNum] = thaiDateStr.split("-").map(Number);
  const month = monthNum - 1;

  const presetRanges: Record<
    Exclude<DashboardPresetKey, "custom">,
    { start: string; end: string }
  > = {
    this_month: {
      start: formatLocalDate(new Date(year, month, 1)),
      end: formatLocalDate(new Date(year, month + 1, 0))
    },
    last_month: {
      start: formatLocalDate(new Date(year, month - 1, 1)),
      end: formatLocalDate(new Date(year, month, 0))
    },
    last_3_months: {
      start: formatLocalDate(new Date(year, month - 2, 1)),
      end: formatLocalDate(new Date(year, month + 1, 0))
    },
    this_quarter: {
      start: formatLocalDate(new Date(year, Math.floor(month / 3) * 3, 1)),
      end: formatLocalDate(new Date(year, Math.floor(month / 3) * 3 + 3, 0))
    },
    this_year: {
      start: formatLocalDate(new Date(year, 0, 1)),
      end: formatLocalDate(new Date(year, 12, 0))
    }
  };

  let preset: DashboardPresetKey | undefined =
    input.preset && input.preset in DASHBOARD_PRESET_LABELS
      ? (input.preset as DashboardPresetKey)
      : undefined;

  let startDate: string | null = null;
  let endDate: string | null = null;

  if (preset && preset !== "custom" && preset in presetRanges) {
    startDate = presetRanges[preset].start;
    endDate = presetRanges[preset].end;
  } else {
    const parsedFrom = parseInputDate(input.from);
    const parsedTo = parseInputDate(input.to);

    if (parsedFrom && parsedTo) {
      if (parsedFrom > parsedTo) {
        startDate = parsedTo;
        endDate = parsedFrom;
      } else {
        startDate = parsedFrom;
        endDate = parsedTo;
      }
    } else if (parsedFrom) {
      startDate = parsedFrom;
      endDate = parsedFrom;
    } else if (parsedTo) {
      startDate = parsedTo;
      endDate = parsedTo;
    } else {
      preset = "this_month";
      startDate = presetRanges.this_month.start;
      endDate = presetRanges.this_month.end;
    }

    if (!preset) {
      for (const [key, range] of Object.entries(presetRanges)) {
        if (range.start === startDate && range.end === endDate) {
          preset = key as DashboardPresetKey;
          break;
        }
      }
      if (!preset) {
        preset = "custom";
      }
    }
  }

  const prevStart = shiftYear(startDate, -1);
  const prevEnd = shiftYear(endDate, -1);

  return {
    as_of_date: thaiDateStr,
    start_date: startDate,
    end_date: endDate,
    current_start: startDate,
    current_end: addDays(endDate, 1),
    previous_start_date: prevStart,
    previous_end_date: prevEnd,
    previous_start: prevStart,
    previous_end: addDays(prevEnd, 1),
    preset,
    preset_label: DASHBOARD_PRESET_LABELS[preset] || "กำหนดเอง"
  };
}

async function getCompanyName(providerCode: string, databaseName: string) {
  const rows = await queryProviderDatabase<{ company_name_1: string | null }>(
    providerCode,
    databaseName,
    "SELECT company_name_1 FROM erp_company_profile LIMIT 1"
  );
  return rows[0]?.company_name_1?.trim() || databaseName.toUpperCase();
}

async function getSummary(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo
) {
  const rows = await queryProviderDatabase<SummaryRow>(
    providerCode,
    databaseName,
    `
      WITH sales_header AS (
        SELECT
          'current' AS period_key,
          COUNT(*)::int AS bills,
          COALESCE(SUM(total_amount), 0) AS sales,
          COALESCE(SUM(total_discount), 0) AS discount
        FROM ic_trans
        WHERE trans_flag = 44
          AND last_status = 0
          AND doc_date >= $1::date
          AND doc_date < $2::date
        UNION ALL
        SELECT
          'previous' AS period_key,
          COUNT(*)::int AS bills,
          COALESCE(SUM(total_amount), 0) AS sales,
          COALESCE(SUM(total_discount), 0) AS discount
        FROM ic_trans
        WHERE trans_flag = 44
          AND last_status = 0
          AND doc_date >= $3::date
          AND doc_date < $4::date
      ),
      sales_detail AS (
        SELECT
          'current' AS period_key,
          COALESCE(SUM(d.sum_of_cost), 0) AS cost,
          COALESCE(SUM(d.sum_amount - d.sum_of_cost), 0) AS gross_profit
        FROM ic_trans_detail d
        JOIN ic_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        WHERE d.trans_flag = 44
          AND d.doc_date >= $1::date
          AND d.doc_date < $2::date
          AND COALESCE(d.last_status, 0) = 0
          AND COALESCE(d.item_type, 0) NOT IN (3, 5)
          AND t.last_status = 0
        UNION ALL
        SELECT
          'previous' AS period_key,
          COALESCE(SUM(d.sum_of_cost), 0) AS cost,
          COALESCE(SUM(d.sum_amount - d.sum_of_cost), 0) AS gross_profit
        FROM ic_trans_detail d
        JOIN ic_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        WHERE d.trans_flag = 44
          AND d.doc_date >= $3::date
          AND d.doc_date < $4::date
          AND COALESCE(d.last_status, 0) = 0
          AND COALESCE(d.item_type, 0) NOT IN (3, 5)
          AND t.last_status = 0
      ),
      purchases AS (
        SELECT
          'current' AS period_key,
          COALESCE(SUM(total_amount), 0) AS purchases
        FROM ic_trans
        WHERE trans_flag = 12
          AND last_status = 0
          AND doc_date >= $1::date
          AND doc_date < $2::date
        UNION ALL
        SELECT
          'previous' AS period_key,
          COALESCE(SUM(total_amount), 0) AS purchases
        FROM ic_trans
        WHERE trans_flag = 12
          AND last_status = 0
          AND doc_date >= $3::date
          AND doc_date < $4::date
      ),
      returns AS (
        SELECT
          'current' AS period_key,
          COUNT(*)::int AS return_bills,
          COALESCE(SUM(total_amount), 0) AS returns
        FROM ic_trans
        WHERE trans_flag = 48
          AND last_status = 0
          AND doc_date >= $1::date
          AND doc_date < $2::date
        UNION ALL
        SELECT
          'previous' AS period_key,
          COUNT(*)::int AS return_bills,
          COALESCE(SUM(total_amount), 0) AS returns
        FROM ic_trans
        WHERE trans_flag = 48
          AND last_status = 0
          AND doc_date >= $3::date
          AND doc_date < $4::date
      ),
      keys AS (
        SELECT 'current' AS period_key
        UNION ALL
        SELECT 'previous' AS period_key
      )
      SELECT
        keys.period_key,
        COALESCE(sales_header.sales, 0) AS sales,
        COALESCE(sales_header.bills, 0) AS bills,
        COALESCE(sales_header.discount, 0) AS discount,
        COALESCE(sales_detail.cost, 0) AS cost,
        COALESCE(sales_detail.gross_profit, 0) AS gross_profit,
        COALESCE(purchases.purchases, 0) AS purchases,
        COALESCE(returns.returns, 0) AS returns,
        COALESCE(returns.return_bills, 0) AS return_bills
      FROM keys
      LEFT JOIN sales_header USING (period_key)
      LEFT JOIN sales_detail USING (period_key)
      LEFT JOIN purchases USING (period_key)
      LEFT JOIN returns USING (period_key)
    `,
    [
      period.current_start,
      period.current_end,
      period.previous_start,
      period.previous_end
    ]
  );

  const byPeriod = Object.fromEntries(rows.map((row) => [row.period_key, row]));
  const current = byPeriod.current;
  const previous = byPeriod.previous;
  const sales = metric(numberValue(current.sales), numberValue(previous.sales));
  const cost = metric(numberValue(current.cost), numberValue(previous.cost));
  const grossProfit = metric(
    numberValue(current.gross_profit),
    numberValue(previous.gross_profit)
  );
  const bills = metric(numberValue(current.bills), numberValue(previous.bills));
  const avgBill = metric(
    bills.current === 0 ? 0 : sales.current / bills.current,
    bills.previous === 0 ? 0 : sales.previous / bills.previous
  );
  const marginCurrent = pct(grossProfit.current, sales.current) ?? 0;
  const marginPrevious = pct(grossProfit.previous, sales.previous) ?? 0;

  return {
    sales,
    cost,
    gross_profit: grossProfit,
    gross_margin_pct: metric(marginCurrent, marginPrevious),
    bills,
    avg_bill: avgBill,
    discount: metric(numberValue(current.discount), numberValue(previous.discount)),
    returns: metric(numberValue(current.returns), numberValue(previous.returns)),
    purchases: metric(
      numberValue(current.purchases),
      numberValue(previous.purchases)
    ),
    return_bills: metric(
      numberValue(current.return_bills),
      numberValue(previous.return_bills)
    )
  };
}

async function getTrend(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo
) {
  const rows = await queryProviderDatabase<{
    period: string;
    sales: Numeric;
    gross_profit: Numeric;
  }>(
    providerCode,
    databaseName,
    `
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', $1::date) - interval '11 months',
          date_trunc('month', $1::date),
          interval '1 month'
        )::date AS month_start
      ),
      sales AS (
        SELECT
          date_trunc('month', doc_date)::date AS month_start,
          COALESCE(SUM(total_amount), 0) AS sales
        FROM ic_trans
        WHERE trans_flag = 44
          AND last_status = 0
          AND doc_date >= date_trunc('month', $1::date) - interval '11 months'
          AND doc_date < date_trunc('month', $1::date) + interval '1 month'
        GROUP BY 1
      ),
      profit AS (
        SELECT
          date_trunc('month', d.doc_date)::date AS month_start,
          COALESCE(SUM(d.sum_amount - d.sum_of_cost), 0) AS gross_profit
        FROM ic_trans_detail d
        JOIN ic_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        WHERE d.trans_flag = 44
          AND d.doc_date >= date_trunc('month', $1::date) - interval '11 months'
          AND d.doc_date < date_trunc('month', $1::date) + interval '1 month'
          AND COALESCE(d.last_status, 0) = 0
          AND COALESCE(d.item_type, 0) NOT IN (3, 5)
          AND t.last_status = 0
        GROUP BY 1
      )
      SELECT
        TO_CHAR(months.month_start, 'YYYY-MM') AS period,
        COALESCE(sales.sales, 0) AS sales,
        COALESCE(profit.gross_profit, 0) AS gross_profit
      FROM months
      LEFT JOIN sales USING (month_start)
      LEFT JOIN profit USING (month_start)
      ORDER BY months.month_start
    `,
    [period.end_date]
  );

  return rows.map((row) => ({
    period: row.period,
    sales: numberValue(row.sales),
    gross_profit: numberValue(row.gross_profit)
  }));
}

async function getBranchMix(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo
) {
  const rows = await queryProviderDatabase<{
    code: string | null;
    name: string | null;
    amount: Numeric;
    count: Numeric;
  }>(
    providerCode,
    databaseName,
    `
      SELECT
        COALESCE(NULLIF(t.branch_code, ''), 'ไม่ระบุ') AS code,
        COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), 'ไม่ระบุ') AS name,
        COALESCE(SUM(t.total_amount), 0) AS amount,
        COUNT(*)::int AS count
      FROM ic_trans t
      LEFT JOIN erp_branch_list b ON b.code = t.branch_code
      WHERE t.trans_flag = 44
        AND t.last_status = 0
        AND t.doc_date >= $1::date
        AND t.doc_date < $2::date
      GROUP BY 1, 2
      ORDER BY amount DESC
      LIMIT 5
    `,
    [period.current_start, period.current_end]
  );
  const total = rows.reduce((sum, row) => sum + numberValue(row.amount), 0);
  return rows.map((row) => ({
    code: row.code ?? "",
    name: row.name ?? "ไม่ระบุ",
    amount: numberValue(row.amount),
    count: numberValue(row.count),
    pct: pct(numberValue(row.amount), total) ?? 0
  }));
}

async function getProducts(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo,
  orderBy: "sales" | "gross_profit" | "low_margin"
) {
  const orderSql =
    orderBy === "gross_profit"
      ? "gross_profit DESC"
      : orderBy === "low_margin"
        ? "gross_margin_pct ASC NULLS LAST, sales DESC"
        : "sales DESC";
  const rows = await queryProviderDatabase<{
    code: string;
    name: string;
    qty: Numeric;
    sales: Numeric;
    cost: Numeric;
    gross_profit: Numeric;
    gross_margin_pct: Numeric;
  }>(
    providerCode,
    databaseName,
    `
      SELECT *
      FROM (
        SELECT
          d.item_code AS code,
          COALESCE(NULLIF(i.name_1, ''), MAX(NULLIF(d.item_name, '')), d.item_code) AS name,
          COALESCE(SUM(d.qty), 0) AS qty,
          COALESCE(SUM(d.sum_amount), 0) AS sales,
          COALESCE(SUM(d.sum_of_cost), 0) AS cost,
          COALESCE(SUM(d.sum_amount - d.sum_of_cost), 0) AS gross_profit,
          CASE
            WHEN COALESCE(SUM(d.sum_amount), 0) > 0
            THEN ROUND((SUM(d.sum_amount - d.sum_of_cost) * 100.0 / SUM(d.sum_amount))::numeric, 2)
            ELSE NULL
          END AS gross_margin_pct
        FROM ic_trans_detail d
        JOIN ic_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        LEFT JOIN ic_inventory i ON i.code = d.item_code
        WHERE d.trans_flag = 44
          AND d.doc_date >= $1::date
          AND d.doc_date < $2::date
          AND COALESCE(d.last_status, 0) = 0
          AND COALESCE(d.item_type, 0) NOT IN (3, 5)
          AND t.last_status = 0
        GROUP BY d.item_code, i.name_1
        HAVING COALESCE(SUM(d.sum_amount), 0) > 0
      ) product_sales
      ORDER BY ${orderSql}
      LIMIT 5
    `,
    [period.current_start, period.current_end]
  );

  return rows.map((row) => ({
    code: row.code,
    name: row.name,
    qty: numberValue(row.qty),
    sales: numberValue(row.sales),
    cost: numberValue(row.cost),
    gross_profit: numberValue(row.gross_profit),
    gross_margin_pct:
      row.gross_margin_pct === null ? null : numberValue(row.gross_margin_pct)
  }));
}

async function getRankings(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo
) {
  const [salespersons, customers] = await Promise.all([
    queryProviderDatabase<RankingRow>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(NULLIF(t.sale_code, ''), 'ไม่ระบุ') AS code,
          COALESCE(NULLIF(u.name_1, ''), NULLIF(t.sale_code, ''), 'ไม่ระบุ') AS name,
          COALESCE(SUM(t.total_amount), 0) AS amount,
          COUNT(*)::int AS count
        FROM ic_trans t
        LEFT JOIN erp_user u ON u.code = t.sale_code
        WHERE t.trans_flag = 44
          AND t.last_status = 0
          AND t.doc_date >= $1::date
          AND t.doc_date < $2::date
        GROUP BY 1, 2
        ORDER BY amount DESC
        LIMIT 5
      `,
      [period.current_start, period.current_end]
    ),
    queryProviderDatabase<RankingRow>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(NULLIF(t.cust_code, ''), 'ไม่ระบุ') AS code,
          COALESCE(NULLIF(c.name_1, ''), NULLIF(t.cust_code, ''), 'ไม่ระบุ') AS name,
          COALESCE(SUM(t.total_amount), 0) AS amount,
          COUNT(*)::int AS count
        FROM ic_trans t
        LEFT JOIN ar_customer c ON c.code = t.cust_code
        WHERE t.trans_flag = 44
          AND t.last_status = 0
          AND t.doc_date >= $1::date
          AND t.doc_date < $2::date
        GROUP BY 1, 2
        ORDER BY amount DESC
        LIMIT 5
      `,
      [period.current_start, period.current_end]
    )
  ]);

  return {
    salespersons: salespersons.map((row) => ({
      ...row,
      amount: numberValue(row.amount),
      count: numberValue(row.count)
    })),
    customers: customers.map((row) => ({
      ...row,
      amount: numberValue(row.amount),
      count: numberValue(row.count)
    }))
  };
}

async function getDebt(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo,
  salesAmount: number
) {
  const [arSummary, apSummary, debtors, suppliers] = await Promise.all([
    queryProviderDatabase<{
      total: Numeric;
      overdue: Numeric;
      invoices: Numeric;
    }>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(SUM(balance_amount), 0) AS total,
          COALESCE(SUM(CASE WHEN due_date < $1::date THEN balance_amount ELSE 0 END), 0) AS overdue,
          COUNT(*)::int AS invoices
        FROM ic_trans
        WHERE trans_flag IN (44, 46, 93, 95, 99)
          AND last_status = 0
          AND balance_amount > 0
          AND inquiry_type IN (0, 2)
      `,
      [period.as_of_date]
    ),
    queryProviderDatabase<{
      total: Numeric;
      due_soon: Numeric;
      invoices: Numeric;
    }>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(SUM(balance_amount), 0) AS total,
          COALESCE(SUM(CASE WHEN due_date <= $1::date + interval '7 days' THEN balance_amount ELSE 0 END), 0) AS due_soon,
          COUNT(*)::int AS invoices
        FROM ic_trans
        WHERE trans_flag IN (12, 14, 81, 83, 87, 89)
          AND last_status = 0
          AND balance_amount > 0
      `,
      [period.as_of_date]
    ),
    queryProviderDatabase<{
      code: string;
      name: string;
      amount: Numeric;
      overdue_amount: Numeric;
      count: Numeric;
    }>(
      providerCode,
      databaseName,
      `
        SELECT
          c.code,
          COALESCE(NULLIF(c.name_1, ''), c.code) AS name,
          COALESCE(SUM(t.balance_amount), 0) AS amount,
          COALESCE(SUM(CASE WHEN t.due_date < $1::date THEN t.balance_amount ELSE 0 END), 0) AS overdue_amount,
          COUNT(*)::int AS count
        FROM ic_trans t
        JOIN ar_customer c ON c.code = t.cust_code
        WHERE t.trans_flag IN (44, 46, 93, 95, 99)
          AND t.last_status = 0
          AND t.balance_amount > 0
          AND t.inquiry_type IN (0, 2)
        GROUP BY c.code, c.name_1
        ORDER BY amount DESC
        LIMIT 5
      `,
      [period.as_of_date]
    ),
    queryProviderDatabase<{
      code: string;
      name: string;
      amount: Numeric;
      overdue_amount: Numeric;
      count: Numeric;
    }>(
      providerCode,
      databaseName,
      `
        SELECT
          s.code,
          COALESCE(NULLIF(s.name_1, ''), s.code) AS name,
          COALESCE(SUM(t.balance_amount), 0) AS amount,
          COALESCE(SUM(CASE WHEN t.due_date <= $1::date + interval '7 days' THEN t.balance_amount ELSE 0 END), 0) AS overdue_amount,
          COUNT(*)::int AS count
        FROM ic_trans t
        JOIN ap_supplier s ON s.code = t.cust_code
        WHERE t.trans_flag IN (12, 14, 81, 83, 87, 89)
          AND t.last_status = 0
          AND t.balance_amount > 0
        GROUP BY s.code, s.name_1
        ORDER BY amount DESC
        LIMIT 5
      `,
      [period.as_of_date]
    )
  ]);

  const arTotal = numberValue(arSummary[0]?.total);
  return {
    ar_total: arTotal,
    ar_overdue: numberValue(arSummary[0]?.overdue),
    ap_total: numberValue(apSummary[0]?.total),
    ap_due_soon: numberValue(apSummary[0]?.due_soon),
    dso_days: salesAmount === 0 ? null : (arTotal / salesAmount) * 30,
    debtors: debtors.map((row) => ({
      code: row.code,
      name: row.name,
      amount: numberValue(row.amount),
      overdue_amount: numberValue(row.overdue_amount),
      count: numberValue(row.count)
    })),
    suppliers: suppliers.map((row) => ({
      code: row.code,
      name: row.name,
      amount: numberValue(row.amount),
      overdue_amount: numberValue(row.overdue_amount),
      count: numberValue(row.count)
    }))
  };
}

async function getInventory(
  providerCode: string,
  databaseName: string,
  period: PeriodInfo
) {
  const [stockSummary, lowStock, slowStock] = await Promise.all([
    queryProviderDatabase<{
      stock_items: Numeric;
      stock_qty: Numeric;
      stock_value: Numeric;
    }>(
      providerCode,
      databaseName,
      `
        SELECT
          COUNT(*)::int AS stock_items,
          COALESCE(SUM(balance_qty), 0) AS stock_qty,
          COALESCE(SUM(balance_amount), 0) AS stock_value
        FROM (
          SELECT
            item_code,
            COALESCE(SUM((qty * calc_flag) * (stand_value / NULLIF(divide_value, 0))), 0) AS balance_qty,
            COALESCE(SUM(calc_flag * sum_of_cost), 0) AS balance_amount
          FROM ic_trans_detail
          WHERE COALESCE(last_status, 0) = 0
            AND COALESCE(item_type, 0) <> 5
            AND trans_flag IN (66, 68, 70, 54, 60, 58, 310, 12, 14, 48, 56, 72, 44, 46, 16, 311)
          GROUP BY item_code
        ) balance
        WHERE balance_qty <> 0 OR balance_amount <> 0
      `
    ),
    queryProviderDatabase<{
      code: string;
      name: string;
      qty: Numeric;
      monthly_qty: Numeric;
      unit: string | null;
    }>(
      providerCode,
      databaseName,
      `
        WITH sold AS (
          SELECT
            d.item_code,
            COALESCE(SUM(d.qty), 0) AS monthly_qty,
            COALESCE(SUM(d.sum_amount), 0) AS sales
          FROM ic_trans_detail d
          JOIN ic_trans t
            ON t.trans_flag = d.trans_flag
            AND t.doc_no = d.doc_no
            AND t.doc_date = d.doc_date
          WHERE d.trans_flag = 44
            AND d.doc_date >= $1::date
            AND d.doc_date < $2::date
            AND COALESCE(d.last_status, 0) = 0
            AND COALESCE(d.item_type, 0) NOT IN (3, 5)
            AND t.last_status = 0
          GROUP BY d.item_code
        )
        SELECT
          i.code,
          COALESCE(NULLIF(i.name_1, ''), i.code) AS name,
          COALESCE(i.balance_qty, 0) AS qty,
          sold.monthly_qty,
          i.unit_standard AS unit
        FROM sold
        JOIN ic_inventory i ON i.code = sold.item_code
        WHERE COALESCE(i.balance_qty, 0) <= GREATEST(5, sold.monthly_qty * 0.2)
        ORDER BY sold.sales DESC
        LIMIT 5
      `,
      [period.current_start, period.current_end]
    ),
    queryProviderDatabase<{
      code: string;
      name: string;
      qty: Numeric;
      monthly_qty: Numeric;
      unit: string | null;
    }>(
      providerCode,
      databaseName,
      `
        WITH sold AS (
          SELECT d.item_code
          FROM ic_trans_detail d
          JOIN ic_trans t
            ON t.trans_flag = d.trans_flag
            AND t.doc_no = d.doc_no
            AND t.doc_date = d.doc_date
          WHERE d.trans_flag = 44
            AND d.doc_date >= $1::date
            AND d.doc_date < $2::date
            AND COALESCE(d.last_status, 0) = 0
            AND COALESCE(d.item_type, 0) NOT IN (3, 5)
            AND t.last_status = 0
          GROUP BY d.item_code
        )
        SELECT
          i.code,
          COALESCE(NULLIF(i.name_1, ''), i.code) AS name,
          COALESCE(i.balance_qty, 0) AS qty,
          0 AS monthly_qty,
          i.unit_standard AS unit
        FROM ic_inventory i
        LEFT JOIN sold ON sold.item_code = i.code
        WHERE COALESCE(i.balance_qty, 0) > 0
          AND sold.item_code IS NULL
        ORDER BY i.balance_qty DESC
        LIMIT 5
      `,
      [period.current_start, period.current_end]
    )
  ]);

  const mapInventory = (rows: typeof lowStock): InventoryRiskRow[] =>
    rows.map((row) => ({
      code: row.code,
      name: row.name,
      qty: numberValue(row.qty),
      monthly_qty: numberValue(row.monthly_qty),
      unit: row.unit ?? ""
    }));

  return {
    stock_value: numberValue(stockSummary[0]?.stock_value),
    stock_qty: numberValue(stockSummary[0]?.stock_qty),
    stock_items: numberValue(stockSummary[0]?.stock_items),
    low_stock: mapInventory(lowStock),
    slow_stock: mapInventory(slowStock)
  };
}

function buildStory(data: {
  sales: SummaryMetric;
  gross_profit: SummaryMetric;
  gross_margin_pct: SummaryMetric;
  bills: SummaryMetric;
  avg_bill: SummaryMetric;
  cost: SummaryMetric;
  discount: SummaryMetric;
  returns: SummaryMetric;
}) {
  const lines: StoryLine[] = [];
  const salesPhrase = comparisonPhrase(data.sales);
  const gpPhrase = comparisonPhrase(data.gross_profit);
  const hasComparison =
    data.sales.previous !== 0 || data.gross_profit.previous !== 0;
  const marginDelta =
    data.gross_margin_pct.current - data.gross_margin_pct.previous;

  lines.push({
    title: "ธุรกิจช่วงเวลาที่เลือก",
    body: `ยอดขาย${salesPhrase} และกำไรขั้นต้น${gpPhrase} เทียบช่วงเดียวกันของปีก่อน`,
    severity: !hasComparison
      ? "info"
      : data.sales.current >= data.sales.previous &&
          data.gross_profit.current >= data.gross_profit.previous
        ? "success"
        : "warning"
  });

  if (!hasComparison) {
    lines.push({
      title: "สิ่งที่ทำให้กำไรเปลี่ยน",
      body: "ไม่มีข้อมูลช่วงเดียวกันของปีก่อน จึงยังสรุปตัวขับการเปลี่ยนแปลงไม่ได้",
      severity: "info"
    });
    lines.push({
      title: "มุมมองผู้บริหาร",
      body: "ยังไม่มีข้อมูลเปรียบเทียบปีก่อน โปรดเลือกช่วงเวลาที่มีข้อมูลย้อนหลังครบหนึ่งปี",
      severity: "info"
    });
    return lines;
  }

  const causes: string[] = [];
  if (data.bills.current < data.bills.previous) {
    causes.push("จำนวนบิลลด");
  }
  if (data.avg_bill.current < data.avg_bill.previous) {
    causes.push("ยอดเฉลี่ยต่อบิลลด");
  }
  if (data.cost.current / Math.max(data.sales.current, 1) > data.cost.previous / Math.max(data.sales.previous, 1)) {
    causes.push("สัดส่วนต้นทุนสูงขึ้น");
  }
  if (data.discount.current / Math.max(data.sales.current, 1) > data.discount.previous / Math.max(data.sales.previous, 1)) {
    causes.push("ส่วนลดสูงขึ้น");
  }
  if (data.returns.current > data.returns.previous) {
    causes.push("ใบลดหนี้ขายเพิ่มขึ้น");
  }

  lines.push({
    title: "สิ่งที่ทำให้กำไรเปลี่ยน",
    body:
      causes.length > 0
        ? `กำไรเปลี่ยนจาก ${causes.slice(0, 3).join(", ")}`
        : "ยังไม่พบตัวขับหลักจากจำนวนบิล ต้นทุน ส่วนลด หรือใบลดหนี้",
    severity: marginDelta < 0 ? "warning" : "info"
  });

  lines.push({
    title: "มุมมองผู้บริหาร",
    body:
      marginDelta < 0
        ? `ควรเจาะสินค้า/พนักงาน/ลูกค้ากำไรต่ำ เพราะ margin ลด ${Math.abs(marginDelta).toFixed(1)} จุด`
        : `margin ดีขึ้น ${Math.abs(marginDelta).toFixed(1)} จุด ควรดูว่าสินค้าหรือสาขาใดเป็นตัวขับ`,
    severity: marginDelta < 0 ? "danger" : "success"
  });

  return lines;
}

function comparisonPhrase(metric: SummaryMetric) {
  if (metric.previous === 0) return "ไม่มีข้อมูลช่วงเดียวกันของปีก่อนให้เปรียบเทียบ";
  const delta = metric.delta_pct;
  if (delta === null) return "ไม่มีข้อมูลช่วงเดียวกันของปีก่อนให้เปรียบเทียบ";
  const direction = metric.current >= metric.previous ? "เพิ่ม" : "ลด";
  const sign = delta >= 0 ? "+" : "";
  return `${direction} ${sign}${delta.toFixed(1)}%`;
}

export async function getExecutiveDashboard(
  providerCode: string,
  databaseName: string,
  input?: DashboardQueryInput
): Promise<ExecutiveDashboardData> {
  const period = getPeriod(input);
  const [companyName, summary] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getSummary(providerCode, databaseName, period)
  ]);

  const [
    trend,
    branchMix,
    topProducts,
    topProfitProducts,
    lowMarginProducts,
    rankings,
    debt,
    inventory
  ] = await Promise.all([
    getTrend(providerCode, databaseName, period),
    getBranchMix(providerCode, databaseName, period),
    getProducts(providerCode, databaseName, period, "sales"),
    getProducts(providerCode, databaseName, period, "gross_profit"),
    getProducts(providerCode, databaseName, period, "low_margin"),
    getRankings(providerCode, databaseName, period),
    getDebt(providerCode, databaseName, period, summary.sales.current),
    getInventory(providerCode, databaseName, period)
  ]);

  return {
    period,
    company_name: companyName,
    ...summary,
    ...debt,
    ...inventory,
    trend,
    branch_mix: branchMix,
    top_products: topProducts,
    top_profit_products: topProfitProducts,
    low_margin_products: lowMarginProducts,
    salespersons: rankings.salespersons,
    customers: rankings.customers,
    story: buildStory(summary)
  };
}
