import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;
type SalesSource = "ic_trans" | "pos_settle";

const tableColumnCache = new Map<string, Promise<Set<string>>>();

export type SalesPeriod = {
  as_of_date: string;
  start_date: string;
  end_date: string;
  end_exclusive: string;
};

export type SalesMenu = {
  id: string;
  label: string;
  erp_menu: string;
  flags: number[];
  cancel_flags?: number[];
  stage: "เสนอ/สั่งขาย" | "เงินล่วงหน้า" | "เงินมัดจำ" | "ขาย/ลดเพิ่มหนี้" | "POS" | "รวม";
  source?: SalesSource;
  pos_filter?: "pos" | "non_pos";
  pos_trans_type?: 1 | 2;
};

export type SalesStatusFields = {
  is_cancel_flag: boolean;
  last_status: number;
  approve_status: number;
  doc_success: number;
  used_status: number;
  on_hold: number;
  expire_status: number;
  not_approve_1: number;
  user_approve: string;
  user_cancel: string;
};

export type SalesDocument = SalesStatusFields & {
  source: SalesSource;
  trans_flag: number;
  pos_trans_type: number;
  menu_label: string;
  flag_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  customer_code: string;
  customer_name: string;
  sale_code: string;
  cashier_code: string;
  machine_code: string;
  branch_name: string;
  remark: string;
  total_amount: number;
  balance_amount: number;
  cash_amount: number;
  credit_card_amount: number;
  coupon_amount: number;
  transfer_amount: number;
  wallet_amount: number;
  line_count: number;
  item_qty: number;
  item_amount: number;
  item_cost: number;
  sample_item_code: string;
  sample_item_name: string;
};

type SalesDocumentRow = Omit<
  SalesDocument,
  "source" | "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type SalesDashboardData = {
  period: SalesPeriod;
  company_name: string;
  selected_menu: SalesMenu;
  documents: SalesDocument[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type SalesQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type SalesDocumentDetailInput = {
  menu?: string;
  flag?: string;
  posType?: string;
  docNo?: string;
  docDate?: string;
};

export type SalesDocumentHeader = SalesStatusFields & {
  source: SalesSource;
  trans_flag: number;
  pos_trans_type: number;
  menu_label: string;
  flag_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  doc_ref_date: string;
  doc_ref_trans: string;
  tax_doc_no: string;
  tax_doc_date: string;
  customer_code: string;
  customer_name: string;
  sale_code: string;
  cashier_code: string;
  machine_code: string;
  branch_code: string;
  branch_name: string;
  remark: string;
  remark_2: string;
  vat_type: number;
  inquiry_type: number;
  credit_day: number;
  due_date: string;
  deposit_day: number;
  deposit_date: string;
  currency_code: string;
  total_value: number;
  total_discount: number;
  total_before_vat: number;
  total_vat_value: number;
  total_after_vat: number;
  total_amount: number;
  balance_amount: number;
  total_cost: number;
  advance_amount: number;
  pay_deposit_buy: number;
  cash_amount: number;
  credit_card_amount: number;
  coupon_amount: number;
  cheque_amount: number;
  transfer_amount: number;
  wallet_amount: number;
  total_cash: number;
  total_credit_card: number;
  total_coupon: number;
  total_sum: number;
  sum_amount: number;
  total_diff: number;
};

type SalesDocumentHeaderRow = Omit<
  SalesDocumentHeader,
  "source" | "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type SalesItemLine = {
  line_number: number;
  item_code: string;
  item_name: string;
  qty: number;
  unit_code: string;
  stand_value: number;
  divide_value: number;
  base_qty: number;
  total_qty: number;
  price: number;
  discount: string;
  sum_amount: number;
  sum_of_cost: number;
  wh_code: string;
  shelf_code: string;
  ref_doc_no: string;
  ref_doc_date: string;
  remark: string;
  last_status: number;
};

type SalesItemLineRow = Omit<SalesItemLine, "base_qty">;

export type SalesDocumentDetailData = {
  company_name: string;
  selected_menu: SalesMenu;
  header: SalesDocumentHeader;
  item_lines: SalesItemLine[];
  totals: {
    item_line_count: number;
    item_qty: number;
    item_amount: number;
    item_cost: number;
  };
};

const SALES_FLAGS = [
  30, 32, 34, 38, 36, 52, 9040, 40, 42, 9110, 110, 112, 44, 48, 46, 144
];

const SALES_CANCEL_FLAGS = [31, 39, 37, 41, 43, 111, 113, 45, 49, 47];

export const salesMenus: SalesMenu[] = [
  {
    id: "all",
    label: "เอกสารขายทั้งหมด",
    erp_menu: "menu_so",
    flags: SALES_FLAGS,
    cancel_flags: SALES_CANCEL_FLAGS,
    stage: "รวม"
  },
  {
    id: "quotation",
    label: "ใบเสนอราคา",
    erp_menu: "menu_so_quotation_order",
    flags: [30, 32],
    cancel_flags: [31],
    stage: "เสนอ/สั่งขาย"
  },
  {
    id: "reserve-order",
    label: "ใบสั่งซื้อ/สั่งจอง",
    erp_menu: "menu_so_inquiry_order",
    flags: [34, 38],
    cancel_flags: [39],
    stage: "เสนอ/สั่งขาย"
  },
  {
    id: "order",
    label: "ใบสั่งขาย",
    erp_menu: "menu_so_sale_order",
    flags: [36, 52],
    cancel_flags: [37],
    stage: "เสนอ/สั่งขาย"
  },
  {
    id: "advance-opening",
    label: "รับเงินล่วงหน้ายกมา",
    erp_menu: "menu_so_advance_money_balance",
    flags: [9040],
    stage: "เงินล่วงหน้า"
  },
  {
    id: "advance",
    label: "รับเงินล่วงหน้า",
    erp_menu: "menu_so_deposit_receive_1",
    flags: [40],
    cancel_flags: [41],
    stage: "เงินล่วงหน้า"
  },
  {
    id: "advance-return",
    label: "คืนเงินรับล่วงหน้า",
    erp_menu: "menu_so_deposit_return_1",
    flags: [42],
    cancel_flags: [43],
    stage: "เงินล่วงหน้า"
  },
  {
    id: "deposit-opening",
    label: "รับเงินมัดจำล่วงหน้า",
    erp_menu: "menu_so_deposit_money_balance",
    flags: [9110],
    stage: "เงินมัดจำ"
  },
  {
    id: "deposit",
    label: "รับเงินมัดจำ",
    erp_menu: "menu_so_deposit_receive_2",
    flags: [110],
    cancel_flags: [111],
    stage: "เงินมัดจำ"
  },
  {
    id: "deposit-return",
    label: "คืนเงินรับมัดจำ",
    erp_menu: "menu_so_deposit_return_2",
    flags: [112],
    cancel_flags: [113],
    stage: "เงินมัดจำ"
  },
  {
    id: "bill",
    label: "ขายสินค้า/บริการ",
    erp_menu: "menu_so_invoice",
    flags: [44],
    cancel_flags: [45],
    stage: "ขาย/ลดเพิ่มหนี้",
    pos_filter: "non_pos"
  },
  {
    id: "return",
    label: "รับคืนสินค้า/ลดหนี้",
    erp_menu: "menu_so_credit_note",
    flags: [48],
    cancel_flags: [49],
    stage: "ขาย/ลดเพิ่มหนี้"
  },
  {
    id: "debit-note",
    label: "เพิ่มหนี้",
    erp_menu: "menu_so_invoice_add",
    flags: [46],
    cancel_flags: [47],
    stage: "ขาย/ลดเพิ่มหนี้"
  },
  {
    id: "pos-tax-invoice-short",
    label: "รายการใบกำกับภาษีอย่างย่อ",
    erp_menu: "pos_invoice_list_pos",
    flags: [44],
    cancel_flags: [45],
    stage: "POS",
    pos_filter: "pos"
  },
  {
    id: "pos-tax-invoice-full",
    label: "รายการใบกำกับภาษีอย่างเต็มออกแทน",
    erp_menu: "pos_full_invoide_list_pos",
    flags: [144],
    stage: "POS"
  },
  {
    id: "change-money",
    label: "บันทึกรับเงิน (เงินทอน)",
    erp_menu: "menu_save_pos_receive_money",
    flags: [],
    stage: "POS",
    source: "pos_settle",
    pos_trans_type: 1
  },
  {
    id: "pos-shift-money",
    label: "บันทึกส่งเงิน POS",
    erp_menu: "menu_save_send_money_pos",
    flags: [],
    stage: "POS",
    source: "pos_settle",
    pos_trans_type: 2
  }
];

const salesFlagLabels = new Map<number, string>([
  [30, "ใบเสนอราคา"],
  [31, "ยกเลิกใบเสนอราคา"],
  [32, "อนุมัติใบเสนอราคา"],
  [34, "ใบสั่งซื้อ/สั่งจอง"],
  [38, "อนุมัติใบสั่งซื้อ/สั่งจอง"],
  [39, "ยกเลิกใบสั่งซื้อ/สั่งจอง"],
  [36, "ใบสั่งขาย"],
  [52, "อนุมัติใบสั่งขาย"],
  [37, "ยกเลิกใบสั่งขาย"],
  [9040, "รับเงินล่วงหน้ายกมา"],
  [40, "รับเงินล่วงหน้า"],
  [41, "ยกเลิกรับเงินล่วงหน้า"],
  [42, "คืนเงินรับล่วงหน้า"],
  [43, "ยกเลิกคืนเงินรับล่วงหน้า"],
  [9110, "รับเงินมัดจำล่วงหน้า"],
  [110, "รับเงินมัดจำ"],
  [111, "ยกเลิกรับเงินมัดจำ"],
  [112, "คืนเงินรับมัดจำ"],
  [113, "ยกเลิกคืนเงินรับมัดจำ"],
  [44, "ขายสินค้า/บริการ"],
  [45, "ยกเลิกขายสินค้า/บริการ"],
  [46, "เพิ่มหนี้"],
  [47, "ยกเลิกเพิ่มหนี้"],
  [48, "รับคืนสินค้า/ลดหนี้"],
  [49, "ยกเลิกรับคืนสินค้า/ลดหนี้"],
  [144, "ใบกำกับภาษีอย่างเต็มออกแทน"]
]);

function numberValue(value: Numeric) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

async function tableColumns(
  providerCode: string,
  databaseName: string,
  tableName: string
) {
  const key = `${providerCode.trim().toUpperCase()}:${databaseName.trim().toLowerCase()}:${tableName.toLowerCase()}`;
  const cached = tableColumnCache.get(key);
  if (cached) return cached;

  const next = queryProviderDatabase<{ column_name: string }>(
    providerCode,
    databaseName,
    `
      SELECT lower(column_name) AS column_name
      FROM information_schema.columns
      WHERE lower(table_name) = lower($1::text)
    `,
    [tableName]
  ).then((rows) => new Set(rows.map((row) => row.column_name)));

  tableColumnCache.set(key, next);
  return next;
}

function hasColumn(columns: Set<string>, column: string) {
  return columns.has(column.toLowerCase());
}

function optionalTextColumn(
  alias: string,
  column: string,
  columns: Set<string>,
  expression = `${alias}.${column}`
) {
  if (!hasColumn(columns, column)) return `'' AS ${column}`;
  return `COALESCE(${expression}, '') AS ${column}`;
}

function optionalNumberColumn(
  alias: string,
  column: string,
  columns: Set<string>,
  expression = `${alias}.${column}`
) {
  if (!hasColumn(columns, column)) return `0 AS ${column}`;
  return `
    CASE
      WHEN NULLIF(TRIM(${expression}::text), '') ~ '^-?[0-9]+(\\.[0-9]+)?$'
      THEN ${expression}::numeric
      ELSE 0
    END AS ${column}
  `;
}

function optionalDateTextColumn(
  alias: string,
  column: string,
  columns: Set<string>,
  expression = `${alias}.${column}`
) {
  if (!hasColumn(columns, column)) return `'' AS ${column}`;
  return `COALESCE(${expression}::text, '') AS ${column}`;
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

function getPeriod(input: SalesQueryInput): SalesPeriod {
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
  return salesMenus.find((menu) => menu.id === menuId) ?? salesMenus[0];
}

export function salesDocumentFlags(menu: SalesMenu) {
  return Array.from(new Set([...menu.flags, ...(menu.cancel_flags ?? [])]));
}

export function isSalesCancelFlag(flag: number) {
  return SALES_CANCEL_FLAGS.includes(flag);
}

function salesFlagLabel(flag: number, menu?: SalesMenu) {
  if (menu?.source === "pos_settle") return menu.pos_trans_type === 1 ? "รับเงินทอน POS" : "ส่งเงิน POS";
  return salesFlagLabels.get(flag) ?? `trans_flag ${flag}`;
}

function salesMenuLabelByFlag(flag: number) {
  return (
    salesMenus.find(
      (menu) =>
        menu.id !== "all" &&
        menu.source !== "pos_settle" &&
        (menu.flags.includes(flag) || menu.cancel_flags?.includes(flag))
    )
      ?.label ?? "เอกสารขาย"
  );
}

async function getCompanyName(providerCode: string, databaseName: string) {
  const rows = await queryProviderDatabase<{ company_name_1: string | null }>(
    providerCode,
    databaseName,
    "SELECT company_name_1 FROM erp_company_profile LIMIT 1"
  );
  return rows[0]?.company_name_1?.trim() || databaseName.toUpperCase();
}

function parseDetailFlag(value: string | undefined) {
  const flag = Number(value);
  if (!Number.isInteger(flag)) return null;
  return flag;
}

function parsePosType(value: string | undefined) {
  const posType = Number(value);
  return posType === 1 || posType === 2 ? posType : null;
}

function normalizeDocNo(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function normalizeDetailDate(value: string | undefined) {
  return parseInputDate(value);
}

function mapDocument(row: SalesDocumentRow, source: SalesSource, menu?: SalesMenu): SalesDocument {
  const transFlag = numberValue(row.trans_flag);
  return {
    ...row,
    source,
    trans_flag: transFlag,
    pos_trans_type: numberValue(row.pos_trans_type),
    menu_label: source === "pos_settle" && menu ? menu.label : salesMenuLabelByFlag(transFlag),
    flag_label: salesFlagLabel(transFlag, menu),
    is_cancel_flag: source === "ic_trans" ? isSalesCancelFlag(transFlag) : false,
    doc_time: row.doc_time ?? "",
    doc_ref: row.doc_ref ?? "",
    customer_code: row.customer_code ?? "",
    customer_name: row.customer_name ?? "",
    sale_code: row.sale_code ?? "",
    cashier_code: row.cashier_code ?? "",
    machine_code: row.machine_code ?? "",
    branch_name: row.branch_name ?? "",
    remark: row.remark ?? "",
    last_status: numberValue(row.last_status),
    approve_status: numberValue(row.approve_status),
    doc_success: numberValue(row.doc_success),
    used_status: numberValue(row.used_status),
    on_hold: numberValue(row.on_hold),
    expire_status: numberValue(row.expire_status),
    not_approve_1: numberValue(row.not_approve_1),
    user_approve: row.user_approve ?? "",
    user_cancel: row.user_cancel ?? "",
    total_amount: numberValue(row.total_amount),
    balance_amount: numberValue(row.balance_amount),
    cash_amount: numberValue(row.cash_amount),
    credit_card_amount: numberValue(row.credit_card_amount),
    coupon_amount: numberValue(row.coupon_amount),
    transfer_amount: numberValue(row.transfer_amount),
    wallet_amount: numberValue(row.wallet_amount),
    line_count: numberValue(row.line_count),
    item_qty: numberValue(row.item_qty),
    item_amount: numberValue(row.item_amount),
    item_cost: numberValue(row.item_cost),
    sample_item_code: row.sample_item_code ?? "",
    sample_item_name: row.sample_item_name ?? ""
  };
}

function mapItemLine(row: SalesItemLineRow): SalesItemLine {
  const qty = numberValue(row.qty);
  const standValue = numberValue(row.stand_value) || 1;
  const divideValue = numberValue(row.divide_value) || 1;
  return {
    line_number: numberValue(row.line_number),
    item_code: row.item_code ?? "",
    item_name: row.item_name ?? "",
    qty,
    unit_code: row.unit_code ?? "",
    stand_value: standValue,
    divide_value: divideValue,
    base_qty: qty * (standValue / divideValue),
    total_qty: numberValue(row.total_qty),
    price: numberValue(row.price),
    discount: row.discount ?? "",
    sum_amount: numberValue(row.sum_amount),
    sum_of_cost: numberValue(row.sum_of_cost),
    wh_code: row.wh_code ?? "",
    shelf_code: row.shelf_code ?? "",
    ref_doc_no: row.ref_doc_no ?? "",
    ref_doc_date: row.ref_doc_date ?? "",
    remark: row.remark ?? "",
    last_status: numberValue(row.last_status)
  };
}

function posFilterCondition(menu: SalesMenu) {
  if (menu.pos_filter === "pos") return "AND COALESCE(t.is_pos, 0) = 1";
  if (menu.pos_filter === "non_pos") return "AND COALESCE(t.is_pos, 0) = 0";
  return "";
}

async function getIcDocuments(
  providerCode: string,
  databaseName: string,
  period: SalesPeriod,
  menu: SalesMenu,
  search: string
): Promise<SalesDocument[]> {
  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");

  const rows = await queryProviderDatabase<SalesDocumentRow>(
    providerCode,
    databaseName,
    `
      WITH selected_docs AS (
        SELECT
          t.trans_flag,
          0 AS pos_trans_type,
          t.doc_no,
          t.doc_date,
          COALESCE(t.doc_time, '') AS doc_time,
          COALESCE(t.doc_ref, '') AS doc_ref,
          COALESCE(t.cust_code, '') AS customer_code,
          COALESCE(NULLIF(c.name_1, ''), NULLIF(t.cust_code, ''), '') AS customer_name,
          ${optionalTextColumn("t", "sale_code", transColumns)},
          '' AS cashier_code,
          '' AS machine_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          COALESCE(t.last_status, 0) AS last_status,
          COALESCE(t.approve_status, 0) AS approve_status,
          COALESCE(t.doc_success, 0) AS doc_success,
          COALESCE(t.used_status, 0) AS used_status,
          COALESCE(t.on_hold, 0) AS on_hold,
          COALESCE(t.expire_status, 0) AS expire_status,
          COALESCE(t.not_approve_1, 0) AS not_approve_1,
          ${optionalTextColumn("t", "user_approve", transColumns)},
          ${optionalTextColumn("t", "user_cancel", transColumns)},
          COALESCE(t.total_amount, 0) AS total_amount,
          COALESCE(t.balance_amount, 0) AS balance_amount,
          0 AS cash_amount,
          0 AS credit_card_amount,
          0 AS coupon_amount,
          0 AS transfer_amount,
          0 AS wallet_amount
        FROM ic_trans t
        LEFT JOIN ar_customer c ON c.code = t.cust_code
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = ANY($1::int[])
          -- Document browser intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_date >= $2::date
          AND t.doc_date < $3::date
          ${posFilterCondition(menu)}
          AND (
            $4::text = ''
            OR t.doc_no ILIKE '%' || $4::text || '%'
            OR COALESCE(t.doc_ref, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.cust_code, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(c.name_1, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.remark, '') ILIKE '%' || $4::text || '%'
            OR EXISTS (
              SELECT 1
              FROM ic_trans_detail dx
              WHERE dx.trans_flag = t.trans_flag
                AND dx.doc_no = t.doc_no
                AND dx.doc_date = t.doc_date
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
          COALESCE(MIN(NULLIF(d.item_code, '')), '') AS sample_item_code,
          COALESCE(MIN(NULLIF(d.item_name, '')), '') AS sample_item_name
        FROM ic_trans_detail d
        JOIN selected_docs s
          ON s.trans_flag = d.trans_flag
          AND s.doc_no = d.doc_no
          AND s.doc_date = d.doc_date
        WHERE d.trans_flag = ANY($1::int[])
        GROUP BY d.trans_flag, d.doc_no, d.doc_date
      )
      SELECT
        selected_docs.trans_flag,
        selected_docs.pos_trans_type,
        selected_docs.doc_no,
        selected_docs.doc_date::text,
        selected_docs.doc_time,
        selected_docs.doc_ref,
        selected_docs.customer_code,
        selected_docs.customer_name,
        selected_docs.sale_code,
        selected_docs.cashier_code,
        selected_docs.machine_code,
        selected_docs.branch_name,
        selected_docs.remark,
        selected_docs.last_status,
        selected_docs.approve_status,
        selected_docs.doc_success,
        selected_docs.used_status,
        selected_docs.on_hold,
        selected_docs.expire_status,
        selected_docs.not_approve_1,
        selected_docs.user_approve,
        selected_docs.user_cancel,
        selected_docs.total_amount,
        selected_docs.balance_amount,
        selected_docs.cash_amount,
        selected_docs.credit_card_amount,
        selected_docs.coupon_amount,
        selected_docs.transfer_amount,
        selected_docs.wallet_amount,
        COALESCE(detail.line_count, 0) AS line_count,
        COALESCE(detail.item_qty, 0) AS item_qty,
        COALESCE(detail.item_amount, 0) AS item_amount,
        COALESCE(detail.item_cost, 0) AS item_cost,
        COALESCE(detail.sample_item_code, '') AS sample_item_code,
        COALESCE(detail.sample_item_name, '') AS sample_item_name
      FROM selected_docs
      LEFT JOIN detail
        ON detail.trans_flag = selected_docs.trans_flag
        AND detail.doc_no = selected_docs.doc_no
        AND detail.doc_date = selected_docs.doc_date
      ORDER BY selected_docs.doc_date DESC, selected_docs.doc_time DESC, selected_docs.doc_no DESC
    `,
    [salesDocumentFlags(menu), period.start_date, period.end_exclusive, search]
  );

  return rows.map((row) => mapDocument(row, "ic_trans", menu));
}

async function getPosSettleDocuments(
  providerCode: string,
  databaseName: string,
  period: SalesPeriod,
  menu: SalesMenu,
  search: string
): Promise<SalesDocument[]> {
  const posType = menu.pos_trans_type ?? 1;
  const rows = await queryProviderDatabase<SalesDocumentRow>(
    providerCode,
    databaseName,
    `
      SELECT
        0 AS trans_flag,
        COALESCE(p.trans_type, 0) AS pos_trans_type,
        COALESCE(p.DocNo, '') AS doc_no,
        COALESCE(p.DocDate::text, '') AS doc_date,
        COALESCE(p.doc_time, '') AS doc_time,
        '' AS doc_ref,
        '' AS customer_code,
        '' AS customer_name,
        '' AS sale_code,
        COALESCE(p.CashierCode, '') AS cashier_code,
        COALESCE(p.MACHINECODE, '') AS machine_code,
        COALESCE(p.POS_ID, '') AS branch_name,
        COALESCE(p.remark, '') AS remark,
        0 AS last_status,
        0 AS approve_status,
        0 AS doc_success,
        0 AS used_status,
        0 AS on_hold,
        0 AS expire_status,
        0 AS not_approve_1,
        '' AS user_approve,
        '' AS user_cancel,
        COALESCE(NULLIF(p.sum_amount, 0), p.CashAmount + p.CreditCardAmount + p.CoupongAmount, p.CashAmount, 0) AS total_amount,
        COALESCE(p.total_balance, 0) AS balance_amount,
        COALESCE(p.CashAmount, 0) AS cash_amount,
        COALESCE(p.CreditCardAmount, 0) AS credit_card_amount,
        COALESCE(p.CoupongAmount, 0) AS coupon_amount,
        COALESCE(p.transfer_amount, 0) AS transfer_amount,
        COALESCE(p.wallet_amount, 0) AS wallet_amount,
        0 AS line_count,
        0 AS item_qty,
        0 AS item_amount,
        0 AS item_cost,
        '' AS sample_item_code,
        '' AS sample_item_name
      FROM POSCashierSettle p
      WHERE p.trans_type = $1::int
        AND p.DocDate >= $2::date
        AND p.DocDate < $3::date
        AND (
          $4::text = ''
          OR COALESCE(p.DocNo, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(p.CashierCode, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(p.MACHINECODE, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(p.POS_ID, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(p.remark, '') ILIKE '%' || $4::text || '%'
        )
      ORDER BY p.DocDate DESC, COALESCE(p.doc_time, '') DESC, p.DocNo DESC
      LIMIT 150
    `,
    [posType, period.start_date, period.end_exclusive, search]
  );

  return rows.map((row) => mapDocument(row, "pos_settle", menu));
}

export async function getSalesDashboard(
  providerCode: string,
  databaseName: string,
  input: SalesQueryInput
): Promise<SalesDashboardData> {
  const period = getPeriod(input);
  const menu = selectedMenu(input.menu);
  const search = input.search?.trim() ?? "";
  const documentsPromise =
    menu.source === "pos_settle"
      ? getPosSettleDocuments(providerCode, databaseName, period, menu, search)
      : getIcDocuments(providerCode, databaseName, period, menu, search);

  const [companyName, documents] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    documentsPromise
  ]);

  return {
    period,
    company_name: companyName,
    selected_menu: menu,
    documents,
    filters: {
      menu: menu.id,
      search,
      start_date: period.start_date,
      end_date: period.end_date
    }
  };
}

async function getIcDetail(
  providerCode: string,
  databaseName: string,
  menu: SalesMenu,
  flag: number,
  docNo: string,
  docDate: string
): Promise<Pick<SalesDocumentDetailData, "header" | "item_lines" | "totals"> | null> {
  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");
  const [headerRows, itemRows] = await Promise.all([
    queryProviderDatabase<SalesDocumentHeaderRow>(
      providerCode,
      databaseName,
      `
        SELECT
          t.trans_flag,
          0 AS pos_trans_type,
          t.doc_no,
          t.doc_date::text,
          COALESCE(t.doc_time, '') AS doc_time,
          COALESCE(t.doc_ref, '') AS doc_ref,
          COALESCE(t.doc_ref_date::text, '') AS doc_ref_date,
          COALESCE(t.doc_ref_trans, '') AS doc_ref_trans,
          COALESCE(t.tax_doc_no, '') AS tax_doc_no,
          COALESCE(t.tax_doc_date::text, '') AS tax_doc_date,
          COALESCE(t.cust_code, '') AS customer_code,
          COALESCE(NULLIF(c.name_1, ''), NULLIF(t.cust_code, ''), '') AS customer_name,
          ${optionalTextColumn("t", "sale_code", transColumns)},
          '' AS cashier_code,
          '' AS machine_code,
          COALESCE(t.branch_code, '') AS branch_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          ${optionalTextColumn("t", "remark_2", transColumns)},
          COALESCE(t.vat_type, 0) AS vat_type,
          COALESCE(t.inquiry_type, 0) AS inquiry_type,
          COALESCE(t.credit_day, 0) AS credit_day,
          COALESCE(t.due_date::text, '') AS due_date,
          ${optionalNumberColumn("t", "deposit_day", transColumns)},
          ${optionalDateTextColumn("t", "deposit_date", transColumns)},
          COALESCE(t.currency_code, '') AS currency_code,
          COALESCE(t.total_value, 0) AS total_value,
          COALESCE(t.total_discount, 0) AS total_discount,
          COALESCE(t.total_before_vat, 0) AS total_before_vat,
          COALESCE(t.total_vat_value, 0) AS total_vat_value,
          COALESCE(t.total_after_vat, 0) AS total_after_vat,
          COALESCE(t.total_amount, 0) AS total_amount,
          COALESCE(t.balance_amount, 0) AS balance_amount,
          COALESCE(t.total_cost, 0) AS total_cost,
          ${optionalNumberColumn("t", "advance_amount", transColumns)},
          ${optionalNumberColumn("t", "pay_deposit_buy", transColumns)},
          0 AS cash_amount,
          0 AS credit_card_amount,
          0 AS coupon_amount,
          0 AS cheque_amount,
          0 AS transfer_amount,
          0 AS wallet_amount,
          0 AS total_cash,
          0 AS total_credit_card,
          0 AS total_coupon,
          0 AS total_sum,
          0 AS sum_amount,
          0 AS total_diff,
          COALESCE(t.last_status, 0) AS last_status,
          COALESCE(t.approve_status, 0) AS approve_status,
          COALESCE(t.doc_success, 0) AS doc_success,
          COALESCE(t.used_status, 0) AS used_status,
          COALESCE(t.on_hold, 0) AS on_hold,
          COALESCE(t.expire_status, 0) AS expire_status,
          COALESCE(t.not_approve_1, 0) AS not_approve_1,
          ${optionalTextColumn("t", "user_approve", transColumns)},
          ${optionalTextColumn("t", "user_cancel", transColumns)}
        FROM ic_trans t
        LEFT JOIN ar_customer c ON c.code = t.cust_code
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
          ${posFilterCondition(menu)}
        LIMIT 1
      `,
      [flag, docNo, docDate]
    ),
    queryProviderDatabase<SalesItemLineRow>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(d.line_number, 0) AS line_number,
          COALESCE(d.item_code, '') AS item_code,
          COALESCE(d.item_name, '') AS item_name,
          COALESCE(d.qty, 0) AS qty,
          COALESCE(d.unit_code, '') AS unit_code,
          COALESCE(d.stand_value, 1) AS stand_value,
          COALESCE(NULLIF(d.divide_value, 0), 1) AS divide_value,
          COALESCE(d.total_qty, 0) AS total_qty,
          COALESCE(d.price, 0) AS price,
          COALESCE(d.discount, '') AS discount,
          COALESCE(d.sum_amount, 0) AS sum_amount,
          COALESCE(d.sum_of_cost, 0) AS sum_of_cost,
          COALESCE(d.wh_code, '') AS wh_code,
          COALESCE(d.shelf_code, '') AS shelf_code,
          COALESCE(d.ref_doc_no, '') AS ref_doc_no,
          COALESCE(d.ref_doc_date::text, '') AS ref_doc_date,
          COALESCE(d.remark, '') AS remark,
          COALESCE(d.last_status, 0) AS last_status
        FROM ic_trans_detail d
        JOIN ic_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
        ORDER BY d.line_number, d.item_code
      `,
      [flag, docNo, docDate]
    )
  ]);

  const header = headerRows[0];
  if (!header) return null;

  const transFlag = numberValue(header.trans_flag);
  const itemLines = itemRows.map(mapItemLine);
  return {
    header: {
      ...header,
      source: "ic_trans",
      trans_flag: transFlag,
      pos_trans_type: 0,
      menu_label: salesMenuLabelByFlag(transFlag),
      flag_label: salesFlagLabel(transFlag, menu),
      is_cancel_flag: isSalesCancelFlag(transFlag),
      doc_time: header.doc_time ?? "",
      doc_ref: header.doc_ref ?? "",
      doc_ref_date: header.doc_ref_date ?? "",
      doc_ref_trans: header.doc_ref_trans ?? "",
      tax_doc_no: header.tax_doc_no ?? "",
      tax_doc_date: header.tax_doc_date ?? "",
      customer_code: header.customer_code ?? "",
      customer_name: header.customer_name ?? "",
      sale_code: header.sale_code ?? "",
      cashier_code: "",
      machine_code: "",
      branch_code: header.branch_code ?? "",
      branch_name: header.branch_name ?? "",
      remark: header.remark ?? "",
      remark_2: header.remark_2 ?? "",
      vat_type: numberValue(header.vat_type),
      inquiry_type: numberValue(header.inquiry_type),
      credit_day: numberValue(header.credit_day),
      due_date: header.due_date ?? "",
      deposit_day: numberValue(header.deposit_day),
      deposit_date: header.deposit_date ?? "",
      currency_code: header.currency_code ?? "",
      total_value: numberValue(header.total_value),
      total_discount: numberValue(header.total_discount),
      total_before_vat: numberValue(header.total_before_vat),
      total_vat_value: numberValue(header.total_vat_value),
      total_after_vat: numberValue(header.total_after_vat),
      total_amount: numberValue(header.total_amount),
      balance_amount: numberValue(header.balance_amount),
      total_cost: numberValue(header.total_cost),
      advance_amount: numberValue(header.advance_amount),
      pay_deposit_buy: numberValue(header.pay_deposit_buy),
      cash_amount: 0,
      credit_card_amount: 0,
      coupon_amount: 0,
      cheque_amount: 0,
      transfer_amount: 0,
      wallet_amount: 0,
      total_cash: 0,
      total_credit_card: 0,
      total_coupon: 0,
      total_sum: 0,
      sum_amount: 0,
      total_diff: 0,
      last_status: numberValue(header.last_status),
      approve_status: numberValue(header.approve_status),
      doc_success: numberValue(header.doc_success),
      used_status: numberValue(header.used_status),
      on_hold: numberValue(header.on_hold),
      expire_status: numberValue(header.expire_status),
      not_approve_1: numberValue(header.not_approve_1),
      user_approve: header.user_approve ?? "",
      user_cancel: header.user_cancel ?? ""
    },
    item_lines: itemLines,
    totals: {
      item_line_count: itemLines.length,
      item_qty: itemLines.reduce((sum, line) => sum + line.base_qty, 0),
      item_amount: itemLines.reduce((sum, line) => sum + line.sum_amount, 0),
      item_cost: itemLines.reduce((sum, line) => sum + line.sum_of_cost, 0)
    }
  };
}

async function getPosDetail(
  providerCode: string,
  databaseName: string,
  menu: SalesMenu,
  posType: 1 | 2,
  docNo: string,
  docDate: string
): Promise<Pick<SalesDocumentDetailData, "header" | "item_lines" | "totals"> | null> {
  const rows = await queryProviderDatabase<SalesDocumentHeaderRow>(
    providerCode,
    databaseName,
    `
      SELECT
        0 AS trans_flag,
        COALESCE(p.trans_type, 0) AS pos_trans_type,
        COALESCE(p.DocNo, '') AS doc_no,
        COALESCE(p.DocDate::text, '') AS doc_date,
        COALESCE(p.doc_time, '') AS doc_time,
        '' AS doc_ref,
        '' AS doc_ref_date,
        '' AS doc_ref_trans,
        '' AS tax_doc_no,
        '' AS tax_doc_date,
        '' AS customer_code,
        '' AS customer_name,
        '' AS sale_code,
        COALESCE(p.CashierCode, '') AS cashier_code,
        COALESCE(p.MACHINECODE, '') AS machine_code,
        '' AS branch_code,
        COALESCE(p.POS_ID, '') AS branch_name,
        COALESCE(p.remark, '') AS remark,
        '' AS remark_2,
        0 AS vat_type,
        0 AS inquiry_type,
        0 AS credit_day,
        '' AS due_date,
        0 AS deposit_day,
        '' AS deposit_date,
        '' AS currency_code,
        0 AS total_value,
        0 AS total_discount,
        0 AS total_before_vat,
        0 AS total_vat_value,
        0 AS total_after_vat,
        COALESCE(NULLIF(p.sum_amount, 0), p.CashAmount + p.CreditCardAmount + p.CoupongAmount, p.CashAmount, 0) AS total_amount,
        COALESCE(p.total_balance, 0) AS balance_amount,
        0 AS total_cost,
        0 AS advance_amount,
        0 AS pay_deposit_buy,
        COALESCE(p.CashAmount, 0) AS cash_amount,
        COALESCE(p.CreditCardAmount, 0) AS credit_card_amount,
        COALESCE(p.CoupongAmount, 0) AS coupon_amount,
        COALESCE(p.ChqAmount, 0) AS cheque_amount,
        COALESCE(p.transfer_amount, 0) AS transfer_amount,
        COALESCE(p.wallet_amount, 0) AS wallet_amount,
        COALESCE(p.total_cash, 0) AS total_cash,
        COALESCE(p.total_credit_card, 0) AS total_credit_card,
        COALESCE(p.total_coupon, 0) AS total_coupon,
        COALESCE(p.total_sum, 0) AS total_sum,
        COALESCE(p.sum_amount, 0) AS sum_amount,
        COALESCE(p.total_diff, 0) AS total_diff,
        0 AS last_status,
        0 AS approve_status,
        0 AS doc_success,
        0 AS used_status,
        0 AS on_hold,
        0 AS expire_status,
        0 AS not_approve_1,
        '' AS user_approve,
        '' AS user_cancel
      FROM POSCashierSettle p
      WHERE p.trans_type = $1::int
        AND p.DocNo = $2::text
        AND p.DocDate = $3::date
      LIMIT 1
    `,
    [posType, docNo, docDate]
  );

  const header = rows[0];
  if (!header) return null;

  return {
    header: {
      ...header,
      source: "pos_settle",
      trans_flag: 0,
      pos_trans_type: posType,
      menu_label: menu.label,
      flag_label: salesFlagLabel(0, menu),
      is_cancel_flag: false,
      doc_time: header.doc_time ?? "",
      doc_ref: "",
      doc_ref_date: "",
      doc_ref_trans: "",
      tax_doc_no: "",
      tax_doc_date: "",
      customer_code: "",
      customer_name: "",
      sale_code: "",
      cashier_code: header.cashier_code ?? "",
      machine_code: header.machine_code ?? "",
      branch_code: "",
      branch_name: header.branch_name ?? "",
      remark: header.remark ?? "",
      remark_2: "",
      vat_type: 0,
      inquiry_type: 0,
      credit_day: 0,
      due_date: "",
      deposit_day: 0,
      deposit_date: "",
      currency_code: "",
      total_value: 0,
      total_discount: 0,
      total_before_vat: 0,
      total_vat_value: 0,
      total_after_vat: 0,
      total_amount: numberValue(header.total_amount),
      balance_amount: numberValue(header.balance_amount),
      total_cost: 0,
      advance_amount: 0,
      pay_deposit_buy: 0,
      cash_amount: numberValue(header.cash_amount),
      credit_card_amount: numberValue(header.credit_card_amount),
      coupon_amount: numberValue(header.coupon_amount),
      cheque_amount: numberValue(header.cheque_amount),
      transfer_amount: numberValue(header.transfer_amount),
      wallet_amount: numberValue(header.wallet_amount),
      total_cash: numberValue(header.total_cash),
      total_credit_card: numberValue(header.total_credit_card),
      total_coupon: numberValue(header.total_coupon),
      total_sum: numberValue(header.total_sum),
      sum_amount: numberValue(header.sum_amount),
      total_diff: numberValue(header.total_diff),
      last_status: 0,
      approve_status: 0,
      doc_success: 0,
      used_status: 0,
      on_hold: 0,
      expire_status: 0,
      not_approve_1: 0,
      user_approve: "",
      user_cancel: ""
    },
    item_lines: [],
    totals: {
      item_line_count: 0,
      item_qty: 0,
      item_amount: 0,
      item_cost: 0
    }
  };
}

export async function getSalesDocumentDetail(
  providerCode: string,
  databaseName: string,
  input: SalesDocumentDetailInput
): Promise<SalesDocumentDetailData | null> {
  const menu = selectedMenu(input.menu);
  const docNo = normalizeDocNo(input.docNo);
  const docDate = normalizeDetailDate(input.docDate);
  if (!docNo || !docDate) return null;

  const companyName = await getCompanyName(providerCode, databaseName);
  const detail =
    menu.source === "pos_settle"
      ? await getPosDetail(
          providerCode,
          databaseName,
          menu,
          (parsePosType(input.posType) ?? menu.pos_trans_type ?? 1) as 1 | 2,
          docNo,
          docDate
        )
      : await (async () => {
          const flag = parseDetailFlag(input.flag);
          if (flag === null || !salesDocumentFlags(menu).includes(flag)) return null;
          return getIcDetail(providerCode, databaseName, menu, flag, docNo, docDate);
        })();

  if (!detail) return null;

  return {
    company_name: companyName,
    selected_menu: menu,
    ...detail
  };
}
