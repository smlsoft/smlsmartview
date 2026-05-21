import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;

export type InventoryPeriod = {
  as_of_date: string;
  start_date: string;
  end_date: string;
  end_exclusive: string;
};

export type InventoryMenu = {
  id: string;
  label: string;
  erp_menu: string;
  flags: number[];
  group: "สินค้า" | "คลัง/WMS" | "รวม";
  movement: "in" | "out" | "neutral" | "mixed";
};

export type InventorySummary = {
  total_items: number;
  stock_items: number;
  stock_qty: number;
  stock_value: number;
  negative_items: number;
  current_docs: number;
  qty_in: number;
  qty_out: number;
  open_requests: number;
  adjust_docs: number;
  transfer_docs: number;
};

export type InventoryDocument = {
  menu_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  cust_code: string;
  branch_name: string;
  remark: string;
  doc_success: number;
  total_amount: number;
  total_cost: number;
  line_count: number;
  item_qty: number;
  item_amount: number;
  item_cost: number;
  warehouses: string;
  sample_item_code: string;
  sample_item_name: string;
};

type InventoryDocumentRow = Omit<InventoryDocument, "menu_label"> & {
  trans_flag: number;
  doc_date: string;
};

export type InventoryDashboardData = {
  period: InventoryPeriod;
  company_name: string;
  selected_menu: InventoryMenu;
  menus: InventoryMenu[];
  summary: InventorySummary;
  documents: InventoryDocument[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type InventoryQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

type SummaryRow = {
  total_items: Numeric;
  stock_items: Numeric;
  stock_qty: Numeric;
  stock_value: Numeric;
  negative_items: Numeric;
  current_docs: Numeric;
  qty_in: Numeric;
  qty_out: Numeric;
  open_requests: Numeric;
  adjust_docs: Numeric;
  transfer_docs: Numeric;
};

const INTERNAL_DOCUMENT_FLAGS = [
  54, 56, 58, 60, 66, 68, 70, 72, 76, 122, 124, 270, 701, 501, 502, 503, 505,
  509, 521, 522, 523
];

export const inventoryMenus: InventoryMenu[] = [
  {
    id: "all",
    label: "เอกสารสินค้า/คลังทั้งหมด",
    erp_menu: "menu_ic + menu_wh",
    flags: INTERNAL_DOCUMENT_FLAGS,
    group: "รวม",
    movement: "mixed"
  },
  {
    id: "opening",
    label: "สินค้า/วัตถุดิบ คงเหลือยกมา",
    erp_menu: "menu_ic_stk_balance",
    flags: [54],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "finish-receive",
    label: "รับสินค้าสำเร็จรูป",
    erp_menu: "menu_ic_finish_receive",
    flags: [60],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "request-issue",
    label: "ขอเบิกสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_request_issue",
    flags: [122],
    group: "สินค้า",
    movement: "neutral"
  },
  {
    id: "issue",
    label: "เบิกสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_issue",
    flags: [56],
    group: "สินค้า",
    movement: "out"
  },
  {
    id: "return-receive",
    label: "รับคืนสินค้า/วัตถุดิบ จากการเบิก",
    erp_menu: "menu_ic_return_receive",
    flags: [58],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "request-transfer",
    label: "ขอโอนสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_request_transfer",
    flags: [124],
    group: "สินค้า",
    movement: "neutral"
  },
  {
    id: "transfer-out",
    label: "โอนสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_transfer_wh_out",
    flags: [72],
    group: "สินค้า",
    movement: "out"
  },
  {
    id: "transfer-in",
    label: "รับโอนเข้า",
    erp_menu: "สินค้า_โอนเข้า",
    flags: [70],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "stock-count",
    label: "ตรวจนับสินค้า",
    erp_menu: "menu_ic_stk_count",
    flags: [76],
    group: "สินค้า",
    movement: "neutral"
  },
  {
    id: "stock-check-result",
    label: "ผลต่างจากการตรวจนับ",
    erp_menu: "menu_ic_stock_result",
    flags: [270],
    group: "สินค้า",
    movement: "neutral"
  },
  {
    id: "adjust-plus",
    label: "ปรับปรุงสต็อกสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_stk_adjust",
    flags: [66],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "adjust-minus",
    label: "ปรับปรุงสต็อกสินค้า/วัตถุดิบ (ขาด)",
    erp_menu: "menu_ic_stk_adjust_subtract",
    flags: [68],
    group: "สินค้า",
    movement: "out"
  },
  {
    id: "shipment",
    label: "บันทึกการจัดส่ง",
    erp_menu: "menu_ic_shipping",
    flags: [701],
    group: "สินค้า",
    movement: "out"
  },
  {
    id: "wh-opening",
    label: "คลัง_ยอดคงเหลือยกมา",
    erp_menu: "menu_wh_balance",
    flags: [501],
    group: "คลัง/WMS",
    movement: "in"
  },
  {
    id: "wh-receive",
    label: "คลัง_รับสินค้าเข้า",
    erp_menu: "menu_wh_in_purchase",
    flags: [503],
    group: "คลัง/WMS",
    movement: "in"
  },
  {
    id: "wh-out",
    label: "คลัง_จ่ายสินค้าออก",
    erp_menu: "menu_wh_out",
    flags: [505],
    group: "คลัง/WMS",
    movement: "out"
  },
  {
    id: "wh-count",
    label: "คลัง_ตรวจนับสินค้า",
    erp_menu: "menu_wh_stk_count",
    flags: [502],
    group: "คลัง/WMS",
    movement: "neutral"
  },
  {
    id: "wh-adjust",
    label: "คลัง_ปรับปรุงเพิ่มลดสินค้า",
    erp_menu: "menu_wh_adj",
    flags: [509],
    group: "คลัง/WMS",
    movement: "mixed"
  },
  {
    id: "wh-deposit",
    label: "คลัง_รับฝาก",
    erp_menu: "menu_wh_deposits",
    flags: [521],
    group: "คลัง/WMS",
    movement: "in"
  },
  {
    id: "wh-issue",
    label: "คลัง_เบิกฝาก",
    erp_menu: "menu_wh_issue",
    flags: [522],
    group: "คลัง/WMS",
    movement: "out"
  },
  {
    id: "wh-issue-return",
    label: "คลัง_รับคืนฝาก",
    erp_menu: "menu_wh_issue_return",
    flags: [523],
    group: "คลัง/WMS",
    movement: "in"
  }
];

function numberValue(value: Numeric) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
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

function getPeriod(input: InventoryQueryInput): InventoryPeriod {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthStart = formatLocalDate(new Date(year, month, 1));
  const monthEnd = formatLocalDate(new Date(year, month + 1, 0));

  const start = parseInputDate(input.startDate) ?? monthStart;
  const end = parseInputDate(input.endDate) ?? monthEnd;
  const normalizedEnd = end < start ? start : end;

  return {
    as_of_date: formatLocalDate(today),
    start_date: start,
    end_date: normalizedEnd,
    end_exclusive: addDays(normalizedEnd, 1)
  };
}

function selectedMenu(menuId: string | undefined) {
  return inventoryMenus.find((menu) => menu.id === menuId) ?? inventoryMenus[0];
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
  period: InventoryPeriod
): Promise<InventorySummary> {
  const rows = await queryProviderDatabase<SummaryRow>(
    providerCode,
    databaseName,
    `
      WITH stock_summary AS (
        SELECT
          COUNT(*)::int AS total_items,
          COUNT(*) FILTER (WHERE COALESCE(balance_qty, 0) <> 0)::int AS stock_items,
          COALESCE(SUM(balance_qty), 0) AS stock_qty,
          COALESCE(SUM(COALESCE(balance_qty, 0) * COALESCE(average_cost, 0)), 0) AS stock_value,
          COUNT(*) FILTER (WHERE COALESCE(balance_qty, 0) < 0)::int AS negative_items
        FROM ic_inventory
      ),
      period_movement AS (
        SELECT
          COUNT(DISTINCT (t.trans_flag, t.doc_no, t.doc_date))::int AS current_docs,
          COALESCE(SUM(GREATEST(
            COALESCE(d.calc_flag, 0)
            * COALESCE(d.qty, 0)
            * (COALESCE(d.stand_value, 1) / COALESCE(NULLIF(d.divide_value, 0), 1)),
            0
          )), 0) AS qty_in,
          COALESCE(SUM(ABS(LEAST(
            COALESCE(d.calc_flag, 0)
            * COALESCE(d.qty, 0)
            * (COALESCE(d.stand_value, 1) / COALESCE(NULLIF(d.divide_value, 0), 1)),
            0
          ))), 0) AS qty_out
        FROM ic_trans t
        JOIN ic_trans_detail d
          ON d.trans_flag = t.trans_flag
          AND d.doc_no = t.doc_no
          AND d.doc_date = t.doc_date
        WHERE t.trans_flag = ANY($1::int[])
          AND t.last_status = 0
          AND COALESCE(d.last_status, 0) = 0
          AND COALESCE(d.item_type, 0) <> 5
          AND t.doc_date >= $2::date
          AND t.doc_date < $3::date
      ),
      open_requests AS (
        SELECT COUNT(*)::int AS open_requests
        FROM ic_trans
        WHERE trans_flag IN (122, 124)
          AND last_status = 0
          AND COALESCE(doc_success, 0) = 0
      ),
      period_docs AS (
        SELECT
          COUNT(*) FILTER (WHERE trans_flag IN (66, 68, 509))::int AS adjust_docs,
          COUNT(*) FILTER (WHERE trans_flag IN (70, 72, 124))::int AS transfer_docs
        FROM ic_trans
        WHERE trans_flag = ANY($4::int[])
          AND last_status = 0
          AND doc_date >= $2::date
          AND doc_date < $3::date
      )
      SELECT
        stock_summary.total_items,
        stock_summary.stock_items,
        stock_summary.stock_qty,
        stock_summary.stock_value,
        stock_summary.negative_items,
        COALESCE(period_movement.current_docs, 0) AS current_docs,
        COALESCE(period_movement.qty_in, 0) AS qty_in,
        COALESCE(period_movement.qty_out, 0) AS qty_out,
        COALESCE(open_requests.open_requests, 0) AS open_requests,
        COALESCE(period_docs.adjust_docs, 0) AS adjust_docs,
        COALESCE(period_docs.transfer_docs, 0) AS transfer_docs
      FROM stock_summary, period_movement, open_requests, period_docs
    `,
    [
      INTERNAL_DOCUMENT_FLAGS,
      period.start_date,
      period.end_exclusive,
      INTERNAL_DOCUMENT_FLAGS
    ]
  );

  const row = rows[0];
  return {
    total_items: numberValue(row?.total_items),
    stock_items: numberValue(row?.stock_items),
    stock_qty: numberValue(row?.stock_qty),
    stock_value: numberValue(row?.stock_value),
    negative_items: numberValue(row?.negative_items),
    current_docs: numberValue(row?.current_docs),
    qty_in: numberValue(row?.qty_in),
    qty_out: numberValue(row?.qty_out),
    open_requests: numberValue(row?.open_requests),
    adjust_docs: numberValue(row?.adjust_docs),
    transfer_docs: numberValue(row?.transfer_docs)
  };
}

function menuLabelByFlag(flag: number) {
  return (
    inventoryMenus.find((menu) => menu.id !== "all" && menu.flags.includes(flag))
      ?.label ?? "เอกสารสินค้า"
  );
}

async function getDocuments(
  providerCode: string,
  databaseName: string,
  period: InventoryPeriod,
  menu: InventoryMenu,
  search: string
): Promise<InventoryDocument[]> {
  const rows = await queryProviderDatabase<InventoryDocumentRow>(
    providerCode,
    databaseName,
    `
      WITH selected_docs AS (
        SELECT
          t.trans_flag,
          t.doc_no,
          t.doc_date,
          COALESCE(t.doc_time, '') AS doc_time,
          COALESCE(t.doc_ref, '') AS doc_ref,
          COALESCE(t.cust_code, '') AS cust_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          COALESCE(t.doc_success, 0) AS doc_success,
          COALESCE(t.total_amount, 0) AS total_amount,
          COALESCE(t.total_cost, 0) AS total_cost
        FROM ic_trans t
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = ANY($1::int[])
          AND t.last_status = 0
          AND t.doc_date >= $2::date
          AND t.doc_date < $3::date
          AND (
            $4::text = ''
            OR t.doc_no ILIKE '%' || $4::text || '%'
            OR COALESCE(t.doc_ref, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.cust_code, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.remark, '') ILIKE '%' || $4::text || '%'
            OR EXISTS (
              SELECT 1
              FROM ic_trans_detail dx
              WHERE dx.trans_flag = t.trans_flag
                AND dx.doc_no = t.doc_no
                AND dx.doc_date = t.doc_date
                AND COALESCE(dx.last_status, 0) = 0
                AND (
                  dx.item_code ILIKE '%' || $4::text || '%'
                  OR COALESCE(dx.item_name, '') ILIKE '%' || $4::text || '%'
                )
            )
          )
        ORDER BY t.doc_date DESC, COALESCE(t.doc_time, '') DESC, t.doc_no DESC
        LIMIT 150
      ),
      detail AS (
        SELECT
          d.trans_flag,
          d.doc_no,
          d.doc_date,
          COUNT(*)::int AS line_count,
          COALESCE(SUM(
            COALESCE(d.qty, 0)
            * (COALESCE(d.stand_value, 1) / COALESCE(NULLIF(d.divide_value, 0), 1))
          ), 0) AS item_qty,
          COALESCE(SUM(d.sum_amount), 0) AS item_amount,
          COALESCE(SUM(d.sum_of_cost), 0) AS item_cost,
          COALESCE(
            string_agg(DISTINCT NULLIF(d.wh_code, ''), ', ')
              FILTER (WHERE NULLIF(d.wh_code, '') IS NOT NULL),
            ''
          ) AS warehouses,
          COALESCE(MIN(NULLIF(d.item_code, '')), '') AS sample_item_code,
          COALESCE(MIN(NULLIF(d.item_name, '')), '') AS sample_item_name
        FROM ic_trans_detail d
        JOIN selected_docs s
          ON s.trans_flag = d.trans_flag
          AND s.doc_no = d.doc_no
          AND s.doc_date = d.doc_date
        WHERE d.trans_flag = ANY($1::int[])
          AND COALESCE(d.last_status, 0) = 0
        GROUP BY d.trans_flag, d.doc_no, d.doc_date
      )
      SELECT
        selected_docs.trans_flag,
        selected_docs.doc_no,
        selected_docs.doc_date::text,
        selected_docs.doc_time,
        selected_docs.doc_ref,
        selected_docs.cust_code,
        selected_docs.branch_name,
        selected_docs.remark,
        selected_docs.doc_success,
        selected_docs.total_amount,
        selected_docs.total_cost,
        COALESCE(detail.line_count, 0) AS line_count,
        COALESCE(detail.item_qty, 0) AS item_qty,
        COALESCE(detail.item_amount, 0) AS item_amount,
        COALESCE(detail.item_cost, 0) AS item_cost,
        COALESCE(detail.warehouses, '') AS warehouses,
        COALESCE(detail.sample_item_code, '') AS sample_item_code,
        COALESCE(detail.sample_item_name, '') AS sample_item_name
      FROM selected_docs
      LEFT JOIN detail
        ON detail.trans_flag = selected_docs.trans_flag
        AND detail.doc_no = selected_docs.doc_no
        AND detail.doc_date = selected_docs.doc_date
      ORDER BY selected_docs.doc_date DESC, selected_docs.doc_time DESC, selected_docs.doc_no DESC
    `,
    [menu.flags, period.start_date, period.end_exclusive, search]
  );

  return rows.map((row) => {
    const { trans_flag: documentType, ...document } = row;
    return {
      ...document,
      menu_label: menuLabelByFlag(documentType),
      doc_time: document.doc_time ?? "",
      doc_ref: document.doc_ref ?? "",
      cust_code: document.cust_code ?? "",
      branch_name: document.branch_name ?? "",
      remark: document.remark ?? "",
      doc_success: numberValue(document.doc_success),
      total_amount: numberValue(document.total_amount),
      total_cost: numberValue(document.total_cost),
      line_count: numberValue(document.line_count),
      item_qty: numberValue(document.item_qty),
      item_amount: numberValue(document.item_amount),
      item_cost: numberValue(document.item_cost),
      warehouses: document.warehouses ?? "",
      sample_item_code: document.sample_item_code ?? "",
      sample_item_name: document.sample_item_name ?? ""
    };
  });
}

export async function getInventoryDashboard(
  providerCode: string,
  databaseName: string,
  input: InventoryQueryInput
): Promise<InventoryDashboardData> {
  const period = getPeriod(input);
  const menu = selectedMenu(input.menu);
  const search = input.search?.trim() ?? "";

  const [
    companyName,
    summary,
    documents
  ] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getSummary(providerCode, databaseName, period),
    getDocuments(providerCode, databaseName, period, menu, search)
  ]);

  return {
    period,
    company_name: companyName,
    selected_menu: menu,
    menus: inventoryMenus,
    summary,
    documents,
    filters: {
      menu: menu.id,
      search,
      start_date: period.start_date,
      end_date: period.end_date
    }
  };
}
