import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;

const tableColumnCache = new Map<string, Promise<Set<string>>>();

export type PurchasePeriod = {
  as_of_date: string;
  start_date: string;
  end_date: string;
  end_exclusive: string;
};

export type PurchaseMenu = {
  id: string;
  label: string;
  erp_menu: string;
  flags: number[];
  cancel_flags?: number[];
  stage: "ขอซื้อ" | "สั่งซื้อ" | "เงินล่วงหน้า" | "เงินมัดจำ" | "ซื้อ/ตั้งหนี้" | "พาเชียล" | "รวม";
};

export type PurchaseStatusFields = {
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

export type PurchaseDocument = PurchaseStatusFields & {
  trans_flag: number;
  menu_label: string;
  flag_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  supplier_code: string;
  supplier_name: string;
  branch_name: string;
  remark: string;
  total_amount: number;
  balance_amount: number;
  line_count: number;
  item_qty: number;
  item_amount: number;
  item_cost: number;
  debt_line_count: number;
  debt_amount: number;
  sample_item_code: string;
  sample_item_name: string;
};

type PurchaseDocumentRow = Omit<
  PurchaseDocument,
  "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type PurchaseDashboardData = {
  period: PurchasePeriod;
  company_name: string;
  selected_menu: PurchaseMenu;
  documents: PurchaseDocument[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type PurchaseQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type PurchaseDocumentDetailInput = {
  menu?: string;
  flag?: string;
  docNo?: string;
  docDate?: string;
};

export type PurchaseDocumentHeader = PurchaseStatusFields & {
  trans_flag: number;
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
  supplier_code: string;
  supplier_name: string;
  branch_code: string;
  branch_name: string;
  remark: string;
  remark_2: string;
  vat_type: number;
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
};

type PurchaseDocumentHeaderRow = Omit<
  PurchaseDocumentHeader,
  "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type PurchaseItemLine = {
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

type PurchaseItemLineRow = Omit<PurchaseItemLine, "base_qty">;

export type PurchaseDebtLine = {
  line_number: number;
  billing_no: string;
  billing_date: string;
  due_date: string;
  sum_debt_value: number;
  sum_tax_value: number;
  sum_debt_amount: number;
  sum_discount: number;
  sum_pay_money: number;
  remark: string;
  last_status: number;
};

type PurchaseDebtLineRow = PurchaseDebtLine;

export type PurchaseDocumentDetailData = {
  company_name: string;
  selected_menu: PurchaseMenu;
  header: PurchaseDocumentHeader;
  item_lines: PurchaseItemLine[];
  debt_lines: PurchaseDebtLine[];
  totals: {
    item_line_count: number;
    debt_line_count: number;
    item_qty: number;
    item_amount: number;
    item_cost: number;
    debt_amount: number;
  };
};

const PURCHASE_FLAGS = [
  2, 4, 6, 8, 9010, 10, 20, 9011, 11, 25, 12, 14, 16, 310, 311, 315, 316,
  317
];

const PURCHASE_CANCEL_FLAGS = [
  3, 7, 150, 161, 151, 152, 13, 15, 17, 330, 331, 335, 336, 337
];

export const purchaseMenus: PurchaseMenu[] = [
  {
    id: "all",
    label: "เอกสารซื้อทั้งหมด",
    erp_menu: "menu_po",
    flags: PURCHASE_FLAGS,
    cancel_flags: PURCHASE_CANCEL_FLAGS,
    stage: "รวม"
  },
  {
    id: "quote",
    label: "ใบเสนอซื้อ",
    erp_menu: "menu_purchase_requisition",
    flags: [2, 4],
    cancel_flags: [3],
    stage: "ขอซื้อ"
  },
  {
    id: "order",
    label: "ใบสั่งซื้อ",
    erp_menu: "menu_po_purchase_order",
    flags: [6, 8],
    cancel_flags: [7],
    stage: "สั่งซื้อ"
  },
  {
    id: "advance-opening",
    label: "จ่ายเงินล่วงหน้ายกมา",
    erp_menu: "menu_po_advance_payment_balance",
    flags: [9010],
    stage: "เงินล่วงหน้า"
  },
  {
    id: "advance",
    label: "จ่ายเงินล่วงหน้า",
    erp_menu: "menu_po_deposit_payment_1",
    flags: [10],
    cancel_flags: [150],
    stage: "เงินล่วงหน้า"
  },
  {
    id: "advance-return",
    label: "รับคืนจ่ายเงินล่วงหน้า",
    erp_menu: "menu_po_deposit_return_1",
    flags: [20],
    cancel_flags: [161],
    stage: "เงินล่วงหน้า"
  },
  {
    id: "deposit-opening",
    label: "จ่ายเงินมัดจำยกมา",
    erp_menu: "menu_po_deposit_money_balance",
    flags: [9011],
    stage: "เงินมัดจำ"
  },
  {
    id: "deposit",
    label: "จ่ายเงินมัดจำ",
    erp_menu: "menu_po_deposit_payment_2",
    flags: [11],
    cancel_flags: [151],
    stage: "เงินมัดจำ"
  },
  {
    id: "deposit-return",
    label: "รับคืนจ่ายเงินมัดจำ",
    erp_menu: "menu_po_deposit_return_2",
    flags: [25],
    cancel_flags: [152],
    stage: "เงินมัดจำ"
  },
  {
    id: "bill",
    label: "ซื้อสินค้า/ตั้งหนี้",
    erp_menu: "menu_po_purchase_billing",
    flags: [12],
    cancel_flags: [13],
    stage: "ซื้อ/ตั้งหนี้"
  },
  {
    id: "debit-note",
    label: "เพิ่มหนี้/ราคาผิด",
    erp_menu: "menu_po_addition_debt",
    flags: [14],
    cancel_flags: [15],
    stage: "ซื้อ/ตั้งหนี้"
  },
  {
    id: "return",
    label: "ส่งคืนสินค้า/ราคาผิด",
    erp_menu: "menu_po_credit_note",
    flags: [16],
    cancel_flags: [17],
    stage: "ซื้อ/ตั้งหนี้"
  },
  {
    id: "partial-receive",
    label: "รับสินค้าแบบทะยอยรับ",
    erp_menu: "menu_po_purchase_partial_item",
    flags: [310],
    cancel_flags: [330],
    stage: "พาเชียล"
  },
  {
    id: "partial-return",
    label: "ส่งคืนสินค้าแบบทะยอยรับ",
    erp_menu: "menu_po_purchase_partial_item_debit",
    flags: [311],
    cancel_flags: [331],
    stage: "พาเชียล"
  },
  {
    id: "bill-from-receive",
    label: "ตั้งหนี้จากการรับสินค้า",
    erp_menu: "menu_po_purchase_partial_1",
    flags: [315],
    cancel_flags: [335],
    stage: "พาเชียล"
  },
  {
    id: "debit-from-bill",
    label: "เพิ่มหนี้จากใบตั้งหนี้",
    erp_menu: "menu_po_purchase_partial_3",
    flags: [316],
    cancel_flags: [336],
    stage: "พาเชียล"
  },
  {
    id: "credit-from-bill",
    label: "ลดหนี้จากใบตั้งหนี้",
    erp_menu: "menu_po_purchase_partial_2",
    flags: [317],
    cancel_flags: [337],
    stage: "พาเชียล"
  }
];

const purchaseFlagLabels = new Map<number, string>([
  [2, "ใบเสนอซื้อ"],
  [3, "ยกเลิกใบเสนอซื้อ"],
  [4, "อนุมัติใบเสนอซื้อ"],
  [6, "ใบสั่งซื้อ"],
  [7, "ยกเลิกใบสั่งซื้อ"],
  [8, "อนุมัติใบสั่งซื้อ"],
  [9010, "จ่ายเงินล่วงหน้ายกมา"],
  [10, "จ่ายเงินล่วงหน้า"],
  [150, "ยกเลิกจ่ายเงินล่วงหน้า"],
  [20, "รับคืนจ่ายเงินล่วงหน้า"],
  [161, "ยกเลิกรับคืนจ่ายเงินล่วงหน้า"],
  [9011, "จ่ายเงินมัดจำยกมา"],
  [11, "จ่ายเงินมัดจำ"],
  [151, "ยกเลิกจ่ายเงินมัดจำ"],
  [25, "รับคืนจ่ายเงินมัดจำ"],
  [152, "ยกเลิกรับคืนจ่ายเงินมัดจำ"],
  [12, "ซื้อสินค้า/ตั้งหนี้"],
  [13, "ยกเลิกซื้อสินค้า/ตั้งหนี้"],
  [14, "เพิ่มหนี้/ราคาผิด"],
  [15, "ยกเลิกเพิ่มหนี้/ราคาผิด"],
  [16, "ส่งคืนสินค้า/ราคาผิด"],
  [17, "ยกเลิกส่งคืนสินค้า/ราคาผิด"],
  [310, "รับสินค้าแบบทะยอยรับ"],
  [330, "ยกเลิกรับสินค้าแบบทะยอยรับ"],
  [311, "ส่งคืนสินค้าแบบทะยอยรับ"],
  [331, "ยกเลิกส่งคืนสินค้าแบบทะยอยรับ"],
  [315, "ตั้งหนี้จากการรับสินค้า"],
  [335, "ยกเลิกตั้งหนี้จากการรับสินค้า"],
  [316, "เพิ่มหนี้จากใบตั้งหนี้"],
  [336, "ยกเลิกเพิ่มหนี้จากใบตั้งหนี้"],
  [317, "ลดหนี้จากใบตั้งหนี้"],
  [337, "ยกเลิกลดหนี้จากใบตั้งหนี้"]
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
  const key = `${providerCode.trim().toUpperCase()}:${databaseName.trim().toLowerCase()}:${tableName}`;
  const cached = tableColumnCache.get(key);
  if (cached) return cached;

  const next = queryProviderDatabase<{ column_name: string }>(
    providerCode,
    databaseName,
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1::text
    `,
    [tableName]
  ).then((rows) => new Set(rows.map((row) => row.column_name)));

  tableColumnCache.set(key, next);
  return next;
}

function optionalColumnSelect(
  alias: string,
  column: string,
  columns: Set<string>,
  fallback: string,
  expression = `${alias}.${column}`
) {
  if (!columns.has(column)) return `${fallback} AS ${column}`;
  return `COALESCE(${expression}, ${fallback}) AS ${column}`;
}

function optionalTextColumn(
  alias: string,
  column: string,
  columns: Set<string>,
  expression?: string
) {
  return optionalColumnSelect(alias, column, columns, "''", expression);
}

function optionalNumberColumn(
  alias: string,
  column: string,
  columns: Set<string>,
  expression = `${alias}.${column}`
) {
  if (!columns.has(column)) return `0 AS ${column}`;
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
  if (!columns.has(column)) return `'' AS ${column}`;
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

function getPeriod(input: PurchaseQueryInput): PurchasePeriod {
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
  return purchaseMenus.find((menu) => menu.id === menuId) ?? purchaseMenus[0];
}

export function purchaseDocumentFlags(menu: PurchaseMenu) {
  return Array.from(new Set([...menu.flags, ...(menu.cancel_flags ?? [])]));
}

export function isPurchaseCancelFlag(flag: number) {
  return PURCHASE_CANCEL_FLAGS.includes(flag);
}

function purchaseFlagLabel(flag: number) {
  return purchaseFlagLabels.get(flag) ?? `trans_flag ${flag}`;
}

function purchaseMenuLabelByFlag(flag: number) {
  return (
    purchaseMenus.find(
      (menu) =>
        menu.id !== "all" &&
        (menu.flags.includes(flag) || menu.cancel_flags?.includes(flag))
    )
      ?.label ?? "เอกสารซื้อ"
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

function normalizeDocNo(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function normalizeDetailDate(value: string | undefined) {
  return parseInputDate(value);
}

function mapDocument(row: PurchaseDocumentRow): PurchaseDocument {
  const transFlag = numberValue(row.trans_flag);
  return {
    ...row,
    trans_flag: transFlag,
    menu_label: purchaseMenuLabelByFlag(transFlag),
    flag_label: purchaseFlagLabel(transFlag),
    is_cancel_flag: isPurchaseCancelFlag(transFlag),
    doc_time: row.doc_time ?? "",
    doc_ref: row.doc_ref ?? "",
    supplier_code: row.supplier_code ?? "",
    supplier_name: row.supplier_name ?? "",
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
    line_count: numberValue(row.line_count),
    item_qty: numberValue(row.item_qty),
    item_amount: numberValue(row.item_amount),
    item_cost: numberValue(row.item_cost),
    debt_line_count: numberValue(row.debt_line_count),
    debt_amount: numberValue(row.debt_amount),
    sample_item_code: row.sample_item_code ?? "",
    sample_item_name: row.sample_item_name ?? ""
  };
}

function mapItemLine(row: PurchaseItemLineRow): PurchaseItemLine {
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

function mapDebtLine(row: PurchaseDebtLineRow): PurchaseDebtLine {
  return {
    line_number: numberValue(row.line_number),
    billing_no: row.billing_no ?? "",
    billing_date: row.billing_date ?? "",
    due_date: row.due_date ?? "",
    sum_debt_value: numberValue(row.sum_debt_value),
    sum_tax_value: numberValue(row.sum_tax_value),
    sum_debt_amount: numberValue(row.sum_debt_amount),
    sum_discount: numberValue(row.sum_discount),
    sum_pay_money: numberValue(row.sum_pay_money),
    remark: row.remark ?? "",
    last_status: numberValue(row.last_status)
  };
}

async function getDocuments(
  providerCode: string,
  databaseName: string,
  period: PurchasePeriod,
  menu: PurchaseMenu,
  search: string
): Promise<PurchaseDocument[]> {
  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");

  const rows = await queryProviderDatabase<PurchaseDocumentRow>(
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
          COALESCE(t.cust_code, '') AS supplier_code,
          COALESCE(NULLIF(s.name_1, ''), NULLIF(t.cust_code, ''), '') AS supplier_name,
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
          COALESCE(t.balance_amount, 0) AS balance_amount
        FROM ic_trans t
        LEFT JOIN ap_supplier s ON s.code = t.cust_code
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = ANY($1::int[])
          -- Document browser intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_date >= $2::date
          AND t.doc_date < $3::date
          AND (
            $4::text = ''
            OR t.doc_no ILIKE '%' || $4::text || '%'
            OR COALESCE(t.doc_ref, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.cust_code, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(s.name_1, '') ILIKE '%' || $4::text || '%'
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
            OR EXISTS (
              SELECT 1
              FROM ap_ar_trans_detail ax
              WHERE ax.trans_flag = t.trans_flag
                AND ax.doc_no = t.doc_no
                AND ax.doc_date = t.doc_date
                AND (
                  COALESCE(ax.billing_no, '') ILIKE '%' || $4::text || '%'
                  OR COALESCE(ax.remark, '') ILIKE '%' || $4::text || '%'
                )
            )
          )
        ORDER BY t.doc_date DESC, COALESCE(t.doc_time, '') DESC, t.doc_no DESC
        LIMIT 150
      ),
      item_detail AS (
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
      ),
      debt_detail AS (
        SELECT
          d.trans_flag,
          d.doc_no,
          d.doc_date,
          COUNT(*)::int AS debt_line_count,
          COALESCE(SUM(d.sum_debt_amount), 0) AS debt_amount
        FROM ap_ar_trans_detail d
        JOIN selected_docs s
          ON s.trans_flag = d.trans_flag
          AND s.doc_no = d.doc_no
          AND s.doc_date = d.doc_date
        WHERE d.trans_flag = ANY($1::int[])
        GROUP BY d.trans_flag, d.doc_no, d.doc_date
      )
      SELECT
        selected_docs.trans_flag,
        selected_docs.doc_no,
        selected_docs.doc_date::text,
        selected_docs.doc_time,
        selected_docs.doc_ref,
        selected_docs.supplier_code,
        selected_docs.supplier_name,
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
        COALESCE(item_detail.line_count, 0) AS line_count,
        COALESCE(item_detail.item_qty, 0) AS item_qty,
        COALESCE(item_detail.item_amount, 0) AS item_amount,
        COALESCE(item_detail.item_cost, 0) AS item_cost,
        COALESCE(debt_detail.debt_line_count, 0) AS debt_line_count,
        COALESCE(debt_detail.debt_amount, 0) AS debt_amount,
        COALESCE(item_detail.sample_item_code, '') AS sample_item_code,
        COALESCE(item_detail.sample_item_name, '') AS sample_item_name
      FROM selected_docs
      LEFT JOIN item_detail
        ON item_detail.trans_flag = selected_docs.trans_flag
        AND item_detail.doc_no = selected_docs.doc_no
        AND item_detail.doc_date = selected_docs.doc_date
      LEFT JOIN debt_detail
        ON debt_detail.trans_flag = selected_docs.trans_flag
        AND debt_detail.doc_no = selected_docs.doc_no
        AND debt_detail.doc_date = selected_docs.doc_date
      ORDER BY selected_docs.doc_date DESC, selected_docs.doc_time DESC, selected_docs.doc_no DESC
    `,
    [purchaseDocumentFlags(menu), period.start_date, period.end_exclusive, search]
  );

  return rows.map(mapDocument);
}

export async function getPurchaseDashboard(
  providerCode: string,
  databaseName: string,
  input: PurchaseQueryInput
): Promise<PurchaseDashboardData> {
  const period = getPeriod(input);
  const menu = selectedMenu(input.menu);
  const search = input.search?.trim() ?? "";

  const [companyName, documents] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getDocuments(providerCode, databaseName, period, menu, search)
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

export async function getPurchaseDocumentDetail(
  providerCode: string,
  databaseName: string,
  input: PurchaseDocumentDetailInput
): Promise<PurchaseDocumentDetailData | null> {
  const menu = selectedMenu(input.menu);
  const flag = parseDetailFlag(input.flag);
  const docNo = normalizeDocNo(input.docNo);
  const docDate = normalizeDetailDate(input.docDate);

  if (flag === null || !docNo || !docDate) return null;
  if (!purchaseDocumentFlags(menu).includes(flag)) return null;

  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");

  const [companyName, headerRows, itemRows, debtRows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<PurchaseDocumentHeaderRow>(
      providerCode,
      databaseName,
      `
        SELECT
          t.trans_flag,
          t.doc_no,
          t.doc_date::text,
          COALESCE(t.doc_time, '') AS doc_time,
          COALESCE(t.doc_ref, '') AS doc_ref,
          COALESCE(t.doc_ref_date::text, '') AS doc_ref_date,
          COALESCE(t.doc_ref_trans, '') AS doc_ref_trans,
          COALESCE(t.tax_doc_no, '') AS tax_doc_no,
          COALESCE(t.tax_doc_date::text, '') AS tax_doc_date,
          COALESCE(t.cust_code, '') AS supplier_code,
          COALESCE(NULLIF(s.name_1, ''), NULLIF(t.cust_code, ''), '') AS supplier_name,
          COALESCE(t.branch_code, '') AS branch_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          ${optionalTextColumn("t", "remark_2", transColumns)},
          COALESCE(t.vat_type, 0) AS vat_type,
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
        LEFT JOIN ap_supplier s ON s.code = t.cust_code
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
        LIMIT 1
      `,
      [flag, docNo, docDate]
    ),
    queryProviderDatabase<PurchaseItemLineRow>(
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
    ),
    queryProviderDatabase<PurchaseDebtLineRow>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(d.line_number, 0) AS line_number,
          COALESCE(d.billing_no, '') AS billing_no,
          COALESCE(d.billing_date::text, '') AS billing_date,
          COALESCE(d.due_date::text, '') AS due_date,
          COALESCE(d.sum_debt_value, 0) AS sum_debt_value,
          COALESCE(d.sum_tax_value, 0) AS sum_tax_value,
          COALESCE(d.sum_debt_amount, 0) AS sum_debt_amount,
          COALESCE(d.sum_discount, 0) AS sum_discount,
          COALESCE(d.sum_pay_money, 0) AS sum_pay_money,
          COALESCE(d.remark, '') AS remark,
          COALESCE(d.last_status, 0) AS last_status
        FROM ap_ar_trans_detail d
        JOIN ic_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
        ORDER BY d.line_number, d.billing_no
      `,
      [flag, docNo, docDate]
    )
  ]);

  const header = headerRows[0];
  if (!header) return null;

  const transFlag = numberValue(header.trans_flag);
  const itemLines = itemRows.map(mapItemLine);
  const debtLines = debtRows.map(mapDebtLine);

  return {
    company_name: companyName,
    selected_menu: menu,
    header: {
      ...header,
      trans_flag: transFlag,
      menu_label: purchaseMenuLabelByFlag(transFlag),
      flag_label: purchaseFlagLabel(transFlag),
      is_cancel_flag: isPurchaseCancelFlag(transFlag),
      doc_time: header.doc_time ?? "",
      doc_ref: header.doc_ref ?? "",
      doc_ref_date: header.doc_ref_date ?? "",
      doc_ref_trans: header.doc_ref_trans ?? "",
      tax_doc_no: header.tax_doc_no ?? "",
      tax_doc_date: header.tax_doc_date ?? "",
      supplier_code: header.supplier_code ?? "",
      supplier_name: header.supplier_name ?? "",
      branch_code: header.branch_code ?? "",
      branch_name: header.branch_name ?? "",
      remark: header.remark ?? "",
      remark_2: header.remark_2 ?? "",
      vat_type: numberValue(header.vat_type),
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
    debt_lines: debtLines,
    totals: {
      item_line_count: itemLines.length,
      debt_line_count: debtLines.length,
      item_qty: itemLines.reduce((sum, line) => sum + line.base_qty, 0),
      item_amount: itemLines.reduce((sum, line) => sum + line.sum_amount, 0),
      item_cost: itemLines.reduce((sum, line) => sum + line.sum_of_cost, 0),
      debt_amount: debtLines.reduce((sum, line) => sum + line.sum_debt_amount, 0)
    }
  };
}
