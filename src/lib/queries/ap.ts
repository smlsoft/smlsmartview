import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;
type ApSource = "supplier" | "ic_trans" | "ap_ar_trans";

const tableColumnCache = new Map<string, Promise<Set<string>>>();

export type ApPeriod = {
  as_of_date: string;
  start_date: string;
  end_date: string;
  end_exclusive: string;
};

export type ApMenu = {
  id: string;
  label: string;
  erp_menu: string;
  flags: number[];
  cancel_flags?: number[];
  stage: "ข้อมูลหลัก" | "ยกมา" | "อื่นๆ" | "วางบิล/ชำระ" | "รวม";
  source: ApSource;
};

export type ApStatusFields = {
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

export type ApSupplier = {
  code: string;
  name_1: string;
  name_2: string;
  address: string;
  telephone: string;
  email: string;
  website: string;
  ap_type: string;
  status: number;
  ap_status: number;
  debt_balance: number;
  chq_balance: number;
  bill_balance: number;
  remark: string;
  create_datetime: string;
  last_update_date_time: string;
};

export type ApDocument = ApStatusFields & {
  source: Exclude<ApSource, "supplier">;
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
  debt_line_count: number;
  debt_amount: number;
  paid_amount: number;
  sample_item_code: string;
  sample_item_name: string;
  sample_ref_doc_no: string;
};

type ApDocumentRow = Omit<
  ApDocument,
  "source" | "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type ApDashboardData = {
  period: ApPeriod;
  company_name: string;
  selected_menu: ApMenu;
  suppliers: ApSupplier[];
  documents: ApDocument[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type ApQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type ApDocumentDetailInput = {
  menu?: string;
  flag?: string;
  docNo?: string;
  docDate?: string;
};

export type ApSupplierDetailInput = {
  code?: string;
};

export type ApDocumentHeader = ApStatusFields & {
  source: Exclude<ApSource, "supplier">;
  trans_flag: number;
  menu_label: string;
  flag_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  doc_ref_date: string;
  tax_doc_no: string;
  tax_doc_date: string;
  supplier_code: string;
  supplier_name: string;
  branch_code: string;
  branch_name: string;
  remark: string;
  vat_type: number;
  credit_day: number;
  due_date: string;
  currency_code: string;
  total_value: number;
  total_discount: number;
  total_before_vat: number;
  total_vat_value: number;
  total_after_vat: number;
  total_amount: number;
  balance_amount: number;
  total_pay_money: number;
  total_pay_tax: number;
  total_debt_value: number;
  total_debt_balance: number;
  sum_pay_money_cash: number;
  sum_pay_money_chq: number;
  sum_pay_money_credit: number;
  sum_pay_money_transfer: number;
};

type ApDocumentHeaderRow = Omit<
  ApDocumentHeader,
  "source" | "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type ApItemLine = {
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
  wh_code: string;
  shelf_code: string;
  ref_doc_no: string;
  ref_doc_date: string;
  remark: string;
  last_status: number;
};

type ApItemLineRow = Omit<ApItemLine, "base_qty">;

export type ApDebtLine = {
  line_number: number;
  billing_no: string;
  billing_date: string;
  ref_doc_no: string;
  ref_doc_date: string;
  due_date: string;
  sum_debt_value: number;
  sum_tax_value: number;
  sum_debt_amount: number;
  sum_discount: number;
  sum_pay_money: number;
  sum_debt_balance: number;
  remark: string;
  last_status: number;
};

type ApDebtLineRow = ApDebtLine;

export type ApDocumentDetailData = {
  company_name: string;
  selected_menu: ApMenu;
  header: ApDocumentHeader;
  item_lines: ApItemLine[];
  debt_lines: ApDebtLine[];
  totals: {
    item_line_count: number;
    debt_line_count: number;
    item_qty: number;
    item_amount: number;
    debt_amount: number;
    paid_amount: number;
  };
};

export type ApSupplierDetailData = {
  company_name: string;
  supplier: ApSupplier;
};

const AP_FLAGS = [81, 83, 85, 87, 89, 91, 213, 19];
const AP_CANCEL_FLAGS = [82, 84, 86, 88, 90, 92, 214, 23];

export const apMenus: ApMenu[] = [
  {
    id: "supplier",
    label: "ข้อมูลเจ้าหนี้",
    erp_menu: "menu_ap_detail",
    flags: [],
    stage: "ข้อมูลหลัก",
    source: "supplier"
  },
  {
    id: "opening-debt",
    label: "ตั้งหนี้ยกมา (เจ้าหนี้)",
    erp_menu: "menu_ap_debt_balance",
    flags: [81],
    cancel_flags: [82],
    stage: "ยกมา",
    source: "ic_trans"
  },
  {
    id: "opening-credit",
    label: "ลดหนี้ยกมา (เจ้าหนี้)",
    erp_menu: "menu_ap_cn_balance",
    flags: [85],
    cancel_flags: [86],
    stage: "ยกมา",
    source: "ic_trans"
  },
  {
    id: "opening-debit",
    label: "เพิ่มหนี้ยกมา (เจ้าหนี้)",
    erp_menu: "menu_ap_increase_debt",
    flags: [83],
    cancel_flags: [84],
    stage: "ยกมา",
    source: "ic_trans"
  },
  {
    id: "other-debt",
    label: "ตั้งหนี้อื่นๆ (เจ้าหนี้)",
    erp_menu: "menu_ap_debt_other",
    flags: [87],
    cancel_flags: [88],
    stage: "อื่นๆ",
    source: "ic_trans"
  },
  {
    id: "other-credit",
    label: "ลดหนี้อื่นๆ (เจ้าหนี้)",
    erp_menu: "menu_ap_cn_debt_other",
    flags: [91],
    cancel_flags: [92],
    stage: "อื่นๆ",
    source: "ic_trans"
  },
  {
    id: "other-debit",
    label: "เพิ่มหนี้อื่นๆ (เจ้าหนี้)",
    erp_menu: "menu_ap_increase_debt_other",
    flags: [89],
    cancel_flags: [90],
    stage: "อื่นๆ",
    source: "ic_trans"
  },
  {
    id: "billing",
    label: "ใบรับวางบิล (เจ้าหนี้)",
    erp_menu: "menu_ap_pay_bill",
    flags: [213],
    cancel_flags: [214],
    stage: "วางบิล/ชำระ",
    source: "ap_ar_trans"
  },
  {
    id: "payment",
    label: "จ่ายชำระหนี้ (เจ้าหนี้)",
    erp_menu: "menu_ap_debt_billing",
    flags: [19],
    cancel_flags: [23],
    stage: "วางบิล/ชำระ",
    source: "ap_ar_trans"
  },
  {
    id: "all",
    label: "เอกสารเจ้าหนี้ทั้งหมด",
    erp_menu: "menu_ap",
    flags: AP_FLAGS,
    cancel_flags: AP_CANCEL_FLAGS,
    stage: "รวม",
    source: "ic_trans"
  }
];

const apFlagLabels = new Map<number, string>([
  [81, "ตั้งหนี้ยกมา (เจ้าหนี้)"],
  [82, "ยกเลิกตั้งหนี้ยกมา (เจ้าหนี้)"],
  [83, "เพิ่มหนี้ยกมา (เจ้าหนี้)"],
  [84, "ยกเลิกเพิ่มหนี้ยกมา (เจ้าหนี้)"],
  [85, "ลดหนี้ยกมา (เจ้าหนี้)"],
  [86, "ยกเลิกลดหนี้ยกมา (เจ้าหนี้)"],
  [87, "ตั้งหนี้อื่นๆ (เจ้าหนี้)"],
  [88, "ยกเลิกตั้งหนี้อื่นๆ (เจ้าหนี้)"],
  [89, "เพิ่มหนี้อื่นๆ (เจ้าหนี้)"],
  [90, "ยกเลิกเพิ่มหนี้อื่นๆ (เจ้าหนี้)"],
  [91, "ลดหนี้อื่นๆ (เจ้าหนี้)"],
  [92, "ยกเลิกลดหนี้อื่นๆ (เจ้าหนี้)"],
  [213, "ใบรับวางบิล (เจ้าหนี้)"],
  [214, "ยกเลิกใบรับวางบิล (เจ้าหนี้)"],
  [19, "จ่ายชำระหนี้ (เจ้าหนี้)"],
  [23, "ยกเลิกจ่ายชำระหนี้ (เจ้าหนี้)"]
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

function optionalUserCancel(alias: string, columns: Set<string>) {
  if (hasColumn(columns, "user_cancel")) return `COALESCE(${alias}.user_cancel, '') AS user_cancel`;
  if (hasColumn(columns, "cancel_code")) return `COALESCE(${alias}.cancel_code, '') AS user_cancel`;
  return "'' AS user_cancel";
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

function getPeriod(input: ApQueryInput): ApPeriod {
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
  return apMenus.find((menu) => menu.id === menuId) ?? apMenus[0];
}

export function apDocumentFlags(menu: ApMenu) {
  if (menu.id === "all") return Array.from(new Set([...AP_FLAGS, ...AP_CANCEL_FLAGS]));
  return Array.from(new Set([...menu.flags, ...(menu.cancel_flags ?? [])]));
}

export function isApCancelFlag(flag: number) {
  return AP_CANCEL_FLAGS.includes(flag);
}

function apFlagLabel(flag: number) {
  return apFlagLabels.get(flag) ?? `trans_flag ${flag}`;
}

function apMenuLabelByFlag(flag: number) {
  return (
    apMenus.find(
      (menu) =>
        menu.id !== "all" &&
        menu.source !== "supplier" &&
        (menu.flags.includes(flag) || menu.cancel_flags?.includes(flag))
    )
      ?.label ?? "เอกสารเจ้าหนี้"
  );
}

function documentSourceByFlag(flag: number): Exclude<ApSource, "supplier"> {
  return flag === 19 || flag === 23 || flag === 213 || flag === 214
    ? "ap_ar_trans"
    : "ic_trans";
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

function normalizeSupplierCode(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function mapSupplier(row: ApSupplier): ApSupplier {
  return {
    code: row.code ?? "",
    name_1: row.name_1 ?? "",
    name_2: row.name_2 ?? "",
    address: row.address ?? "",
    telephone: row.telephone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    ap_type: row.ap_type ?? "",
    status: numberValue(row.status),
    ap_status: numberValue(row.ap_status),
    debt_balance: numberValue(row.debt_balance),
    chq_balance: numberValue(row.chq_balance),
    bill_balance: numberValue(row.bill_balance),
    remark: row.remark ?? "",
    create_datetime: row.create_datetime ?? "",
    last_update_date_time: row.last_update_date_time ?? ""
  };
}

function mapDocument(
  row: ApDocumentRow,
  source: Exclude<ApSource, "supplier">
): ApDocument {
  const transFlag = numberValue(row.trans_flag);
  return {
    ...row,
    source,
    trans_flag: transFlag,
    menu_label: apMenuLabelByFlag(transFlag),
    flag_label: apFlagLabel(transFlag),
    is_cancel_flag: isApCancelFlag(transFlag),
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
    debt_line_count: numberValue(row.debt_line_count),
    debt_amount: numberValue(row.debt_amount),
    paid_amount: numberValue(row.paid_amount),
    sample_item_code: row.sample_item_code ?? "",
    sample_item_name: row.sample_item_name ?? "",
    sample_ref_doc_no: row.sample_ref_doc_no ?? ""
  };
}

function mapItemLine(row: ApItemLineRow): ApItemLine {
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
    wh_code: row.wh_code ?? "",
    shelf_code: row.shelf_code ?? "",
    ref_doc_no: row.ref_doc_no ?? "",
    ref_doc_date: row.ref_doc_date ?? "",
    remark: row.remark ?? "",
    last_status: numberValue(row.last_status)
  };
}

function mapDebtLine(row: ApDebtLineRow): ApDebtLine {
  return {
    line_number: numberValue(row.line_number),
    billing_no: row.billing_no ?? "",
    billing_date: row.billing_date ?? "",
    ref_doc_no: row.ref_doc_no ?? "",
    ref_doc_date: row.ref_doc_date ?? "",
    due_date: row.due_date ?? "",
    sum_debt_value: numberValue(row.sum_debt_value),
    sum_tax_value: numberValue(row.sum_tax_value),
    sum_debt_amount: numberValue(row.sum_debt_amount),
    sum_discount: numberValue(row.sum_discount),
    sum_pay_money: numberValue(row.sum_pay_money),
    sum_debt_balance: numberValue(row.sum_debt_balance),
    remark: row.remark ?? "",
    last_status: numberValue(row.last_status)
  };
}

async function getSuppliers(
  providerCode: string,
  databaseName: string,
  search: string
): Promise<ApSupplier[]> {
  const rows = await queryProviderDatabase<ApSupplier>(
    providerCode,
    databaseName,
    `
      SELECT
        COALESCE(code, '') AS code,
        COALESCE(name_1, '') AS name_1,
        COALESCE(name_2, '') AS name_2,
        COALESCE(address, '') AS address,
        COALESCE(telephone, '') AS telephone,
        COALESCE(email, '') AS email,
        COALESCE(website, '') AS website,
        COALESCE(ap_type, '') AS ap_type,
        COALESCE(status, 0) AS status,
        COALESCE(ap_status, 0) AS ap_status,
        COALESCE(debt_balance, 0) AS debt_balance,
        COALESCE(chq_balance, 0) AS chq_balance,
        COALESCE(bill_balance, 0) AS bill_balance,
        COALESCE(remark, '') AS remark,
        COALESCE(create_datetime::text, '') AS create_datetime,
        COALESCE(last_update_date_time::text, '') AS last_update_date_time
      FROM ap_supplier
      WHERE (
        $1::text = ''
        OR code ILIKE '%' || $1::text || '%'
        OR COALESCE(name_1, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(name_2, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(telephone, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(email, '') ILIKE '%' || $1::text || '%'
      )
      ORDER BY code
      LIMIT 150
    `,
    [search]
  );

  return rows.map(mapSupplier);
}

async function getIcDocuments(
  providerCode: string,
  databaseName: string,
  period: ApPeriod,
  flags: number[],
  search: string
): Promise<ApDocument[]> {
  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");
  const rows = await queryProviderDatabase<ApDocumentRow>(
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
          ${optionalUserCancel("t", transColumns)},
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
        0 AS debt_line_count,
        0 AS debt_amount,
        0 AS paid_amount,
        COALESCE(item_detail.sample_item_code, '') AS sample_item_code,
        COALESCE(item_detail.sample_item_name, '') AS sample_item_name,
        '' AS sample_ref_doc_no
      FROM selected_docs
      LEFT JOIN item_detail
        ON item_detail.trans_flag = selected_docs.trans_flag
        AND item_detail.doc_no = selected_docs.doc_no
        AND item_detail.doc_date = selected_docs.doc_date
      ORDER BY selected_docs.doc_date DESC, selected_docs.doc_time DESC, selected_docs.doc_no DESC
    `,
    [flags, period.start_date, period.end_exclusive, search]
  );

  return rows.map((row) => mapDocument(row, "ic_trans"));
}

async function getApArDocuments(
  providerCode: string,
  databaseName: string,
  period: ApPeriod,
  flags: number[],
  search: string
): Promise<ApDocument[]> {
  const transColumns = await tableColumns(providerCode, databaseName, "ap_ar_trans");
  const rows = await queryProviderDatabase<ApDocumentRow>(
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
          0 AS approve_status,
          COALESCE(t.doc_success, 0) AS doc_success,
          COALESCE(t.used_status, 0) AS used_status,
          0 AS on_hold,
          0 AS expire_status,
          0 AS not_approve_1,
          '' AS user_approve,
          ${optionalUserCancel("t", transColumns)},
          COALESCE(NULLIF(t.total_net_value, 0), NULLIF(t.total_pay_money, 0), NULLIF(t.total_debt_value, 0), NULLIF(t.amount, 0), t.total_value, 0) AS total_amount,
          COALESCE(NULLIF(t.total_debt_balance, 0), t.money_balance, 0) AS balance_amount
        FROM ap_ar_trans t
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
              FROM ap_ar_trans_detail dx
              WHERE dx.trans_flag = t.trans_flag
                AND dx.doc_no = t.doc_no
                AND dx.doc_date = t.doc_date
                AND (
                  COALESCE(dx.billing_no, '') ILIKE '%' || $4::text || '%'
                  OR COALESCE(dx.ref_doc_no, '') ILIKE '%' || $4::text || '%'
                  OR COALESCE(dx.remark, '') ILIKE '%' || $4::text || '%'
                )
            )
          )
        ORDER BY t.doc_date DESC, COALESCE(t.doc_time, '') DESC, t.doc_no DESC
        LIMIT 150
      ),
      debt_detail AS (
        SELECT
          d.trans_flag,
          d.doc_no,
          d.doc_date,
          COUNT(*)::int AS debt_line_count,
          COALESCE(SUM(d.sum_debt_amount), 0) AS debt_amount,
          COALESCE(SUM(d.sum_pay_money), 0) AS paid_amount,
          COALESCE(MIN(NULLIF(COALESCE(d.billing_no, d.ref_doc_no), '')), '') AS sample_ref_doc_no
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
        0 AS line_count,
        0 AS item_qty,
        0 AS item_amount,
        COALESCE(debt_detail.debt_line_count, 0) AS debt_line_count,
        COALESCE(debt_detail.debt_amount, 0) AS debt_amount,
        COALESCE(debt_detail.paid_amount, 0) AS paid_amount,
        '' AS sample_item_code,
        '' AS sample_item_name,
        COALESCE(debt_detail.sample_ref_doc_no, '') AS sample_ref_doc_no
      FROM selected_docs
      LEFT JOIN debt_detail
        ON debt_detail.trans_flag = selected_docs.trans_flag
        AND debt_detail.doc_no = selected_docs.doc_no
        AND debt_detail.doc_date = selected_docs.doc_date
      ORDER BY selected_docs.doc_date DESC, selected_docs.doc_time DESC, selected_docs.doc_no DESC
    `,
    [flags, period.start_date, period.end_exclusive, search]
  );

  return rows.map((row) => mapDocument(row, "ap_ar_trans"));
}

export async function getApDashboard(
  providerCode: string,
  databaseName: string,
  input: ApQueryInput
): Promise<ApDashboardData> {
  const period = getPeriod(input);
  const menu = selectedMenu(input.menu);
  const search = input.search?.trim() ?? "";

  const companyNamePromise = getCompanyName(providerCode, databaseName);
  const suppliersPromise =
    menu.source === "supplier"
      ? getSuppliers(providerCode, databaseName, search)
      : Promise.resolve([]);

  const flags = apDocumentFlags(menu);
  const documentsPromise =
    menu.source === "ic_trans"
      ? menu.id === "all"
        ? Promise.all([
            getIcDocuments(
              providerCode,
              databaseName,
              period,
              flags.filter((flag) => documentSourceByFlag(flag) === "ic_trans"),
              search
            ),
            getApArDocuments(
              providerCode,
              databaseName,
              period,
              flags.filter((flag) => documentSourceByFlag(flag) === "ap_ar_trans"),
              search
            )
          ]).then(([icDocs, apArDocs]) =>
            [...icDocs, ...apArDocs]
              .sort((a, b) => `${b.doc_date}${b.doc_time}${b.doc_no}`.localeCompare(`${a.doc_date}${a.doc_time}${a.doc_no}`))
              .slice(0, 150)
          )
        : getIcDocuments(providerCode, databaseName, period, flags, search)
      : menu.source === "ap_ar_trans"
        ? getApArDocuments(providerCode, databaseName, period, flags, search)
        : Promise.resolve([]);

  const [companyName, suppliers, documents] = await Promise.all([
    companyNamePromise,
    suppliersPromise,
    documentsPromise
  ]);

  return {
    period,
    company_name: companyName,
    selected_menu: menu,
    suppliers,
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
  menu: ApMenu,
  flag: number,
  docNo: string,
  docDate: string
): Promise<Pick<ApDocumentDetailData, "header" | "item_lines" | "debt_lines" | "totals"> | null> {
  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");
  const [headerRows, itemRows] = await Promise.all([
    queryProviderDatabase<ApDocumentHeaderRow>(
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
          COALESCE(t.tax_doc_no, '') AS tax_doc_no,
          COALESCE(t.tax_doc_date::text, '') AS tax_doc_date,
          COALESCE(t.cust_code, '') AS supplier_code,
          COALESCE(NULLIF(s.name_1, ''), NULLIF(t.cust_code, ''), '') AS supplier_name,
          COALESCE(t.branch_code, '') AS branch_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          COALESCE(t.vat_type, 0) AS vat_type,
          COALESCE(t.credit_day, 0) AS credit_day,
          COALESCE(t.due_date::text, '') AS due_date,
          COALESCE(t.currency_code, '') AS currency_code,
          COALESCE(t.total_value, 0) AS total_value,
          COALESCE(t.total_discount, 0) AS total_discount,
          COALESCE(t.total_before_vat, 0) AS total_before_vat,
          COALESCE(t.total_vat_value, 0) AS total_vat_value,
          COALESCE(t.total_after_vat, 0) AS total_after_vat,
          COALESCE(t.total_amount, 0) AS total_amount,
          COALESCE(t.balance_amount, 0) AS balance_amount,
          0 AS total_pay_money,
          0 AS total_pay_tax,
          COALESCE(t.total_amount, 0) AS total_debt_value,
          COALESCE(t.balance_amount, 0) AS total_debt_balance,
          0 AS sum_pay_money_cash,
          0 AS sum_pay_money_chq,
          0 AS sum_pay_money_credit,
          0 AS sum_pay_money_transfer,
          COALESCE(t.last_status, 0) AS last_status,
          COALESCE(t.approve_status, 0) AS approve_status,
          COALESCE(t.doc_success, 0) AS doc_success,
          COALESCE(t.used_status, 0) AS used_status,
          COALESCE(t.on_hold, 0) AS on_hold,
          COALESCE(t.expire_status, 0) AS expire_status,
          COALESCE(t.not_approve_1, 0) AS not_approve_1,
          ${optionalTextColumn("t", "user_approve", transColumns)},
          ${optionalUserCancel("t", transColumns)}
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
    queryProviderDatabase<ApItemLineRow>(
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
      ...normalizeHeader(header, "ic_trans", menu, transFlag)
    },
    item_lines: itemLines,
    debt_lines: [],
    totals: {
      item_line_count: itemLines.length,
      debt_line_count: 0,
      item_qty: itemLines.reduce((sum, line) => sum + line.base_qty, 0),
      item_amount: itemLines.reduce((sum, line) => sum + line.sum_amount, 0),
      debt_amount: 0,
      paid_amount: 0
    }
  };
}

async function getApArDetail(
  providerCode: string,
  databaseName: string,
  menu: ApMenu,
  flag: number,
  docNo: string,
  docDate: string
): Promise<Pick<ApDocumentDetailData, "header" | "item_lines" | "debt_lines" | "totals"> | null> {
  const transColumns = await tableColumns(providerCode, databaseName, "ap_ar_trans");
  const [headerRows, debtRows] = await Promise.all([
    queryProviderDatabase<ApDocumentHeaderRow>(
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
          COALESCE(t.tax_doc_no, '') AS tax_doc_no,
          COALESCE(t.tax_doc_date::text, '') AS tax_doc_date,
          COALESCE(t.cust_code, '') AS supplier_code,
          COALESCE(NULLIF(s.name_1, ''), NULLIF(t.cust_code, ''), '') AS supplier_name,
          COALESCE(t.branch_code, '') AS branch_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          COALESCE(t.vat_type, 0) AS vat_type,
          COALESCE(t.credit_day, 0) AS credit_day,
          COALESCE(t.due_date::text, '') AS due_date,
          COALESCE(t.currency_code, '') AS currency_code,
          COALESCE(t.total_value, 0) AS total_value,
          COALESCE(t.total_discount, 0) AS total_discount,
          COALESCE(t.total_before_vat, 0) AS total_before_vat,
          COALESCE(t.total_vat_value, 0) AS total_vat_value,
          COALESCE(t.total_after_vat, 0) AS total_after_vat,
          COALESCE(NULLIF(t.total_net_value, 0), NULLIF(t.total_pay_money, 0), NULLIF(t.total_debt_value, 0), NULLIF(t.amount, 0), t.total_value, 0) AS total_amount,
          COALESCE(NULLIF(t.total_debt_balance, 0), t.money_balance, 0) AS balance_amount,
          COALESCE(t.total_pay_money, 0) AS total_pay_money,
          COALESCE(t.total_pay_tax, 0) AS total_pay_tax,
          COALESCE(t.total_debt_value, 0) AS total_debt_value,
          COALESCE(t.total_debt_balance, 0) AS total_debt_balance,
          COALESCE(t.sum_pay_money_cash, 0) AS sum_pay_money_cash,
          COALESCE(t.sum_pay_money_chq, 0) AS sum_pay_money_chq,
          COALESCE(t.sum_pay_money_credit, 0) AS sum_pay_money_credit,
          COALESCE(t.sum_pay_money_transfer, 0) AS sum_pay_money_transfer,
          COALESCE(t.last_status, 0) AS last_status,
          0 AS approve_status,
          COALESCE(t.doc_success, 0) AS doc_success,
          COALESCE(t.used_status, 0) AS used_status,
          0 AS on_hold,
          0 AS expire_status,
          0 AS not_approve_1,
          '' AS user_approve,
          ${optionalUserCancel("t", transColumns)}
        FROM ap_ar_trans t
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
    queryProviderDatabase<ApDebtLineRow>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(d.line_number, 0) AS line_number,
          COALESCE(d.billing_no, '') AS billing_no,
          COALESCE(d.billing_date::text, '') AS billing_date,
          COALESCE(d.ref_doc_no, '') AS ref_doc_no,
          COALESCE(d.ref_doc_date::text, '') AS ref_doc_date,
          COALESCE(d.due_date::text, '') AS due_date,
          COALESCE(d.sum_debt_value, 0) AS sum_debt_value,
          COALESCE(d.sum_tax_value, 0) AS sum_tax_value,
          COALESCE(d.sum_debt_amount, 0) AS sum_debt_amount,
          COALESCE(d.sum_discount, 0) AS sum_discount,
          COALESCE(d.sum_pay_money, 0) AS sum_pay_money,
          COALESCE(d.sum_debt_balance, 0) AS sum_debt_balance,
          COALESCE(d.remark, '') AS remark,
          COALESCE(d.last_status, 0) AS last_status
        FROM ap_ar_trans_detail d
        JOIN ap_ar_trans t
          ON t.trans_flag = d.trans_flag
          AND t.doc_no = d.doc_no
          AND t.doc_date = d.doc_date
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
        ORDER BY d.line_number, d.billing_no, d.ref_doc_no
      `,
      [flag, docNo, docDate]
    )
  ]);

  const header = headerRows[0];
  if (!header) return null;
  const transFlag = numberValue(header.trans_flag);
  const debtLines = debtRows.map(mapDebtLine);

  return {
    header: {
      ...normalizeHeader(header, "ap_ar_trans", menu, transFlag)
    },
    item_lines: [],
    debt_lines: debtLines,
    totals: {
      item_line_count: 0,
      debt_line_count: debtLines.length,
      item_qty: 0,
      item_amount: 0,
      debt_amount: debtLines.reduce((sum, line) => sum + line.sum_debt_amount, 0),
      paid_amount: debtLines.reduce((sum, line) => sum + line.sum_pay_money, 0)
    }
  };
}

function normalizeHeader(
  header: ApDocumentHeaderRow,
  source: Exclude<ApSource, "supplier">,
  menu: ApMenu,
  transFlag: number
): ApDocumentHeader {
  return {
    ...header,
    source,
    trans_flag: transFlag,
    menu_label: menu.id === "all" ? apMenuLabelByFlag(transFlag) : menu.label,
    flag_label: apFlagLabel(transFlag),
    is_cancel_flag: isApCancelFlag(transFlag),
    doc_time: header.doc_time ?? "",
    doc_ref: header.doc_ref ?? "",
    doc_ref_date: header.doc_ref_date ?? "",
    tax_doc_no: header.tax_doc_no ?? "",
    tax_doc_date: header.tax_doc_date ?? "",
    supplier_code: header.supplier_code ?? "",
    supplier_name: header.supplier_name ?? "",
    branch_code: header.branch_code ?? "",
    branch_name: header.branch_name ?? "",
    remark: header.remark ?? "",
    vat_type: numberValue(header.vat_type),
    credit_day: numberValue(header.credit_day),
    due_date: header.due_date ?? "",
    currency_code: header.currency_code ?? "",
    total_value: numberValue(header.total_value),
    total_discount: numberValue(header.total_discount),
    total_before_vat: numberValue(header.total_before_vat),
    total_vat_value: numberValue(header.total_vat_value),
    total_after_vat: numberValue(header.total_after_vat),
    total_amount: numberValue(header.total_amount),
    balance_amount: numberValue(header.balance_amount),
    total_pay_money: numberValue(header.total_pay_money),
    total_pay_tax: numberValue(header.total_pay_tax),
    total_debt_value: numberValue(header.total_debt_value),
    total_debt_balance: numberValue(header.total_debt_balance),
    sum_pay_money_cash: numberValue(header.sum_pay_money_cash),
    sum_pay_money_chq: numberValue(header.sum_pay_money_chq),
    sum_pay_money_credit: numberValue(header.sum_pay_money_credit),
    sum_pay_money_transfer: numberValue(header.sum_pay_money_transfer),
    last_status: numberValue(header.last_status),
    approve_status: numberValue(header.approve_status),
    doc_success: numberValue(header.doc_success),
    used_status: numberValue(header.used_status),
    on_hold: numberValue(header.on_hold),
    expire_status: numberValue(header.expire_status),
    not_approve_1: numberValue(header.not_approve_1),
    user_approve: header.user_approve ?? "",
    user_cancel: header.user_cancel ?? ""
  };
}

export async function getApDocumentDetail(
  providerCode: string,
  databaseName: string,
  input: ApDocumentDetailInput
): Promise<ApDocumentDetailData | null> {
  const menu = selectedMenu(input.menu);
  const flag = parseDetailFlag(input.flag);
  const docNo = normalizeDocNo(input.docNo);
  const docDate = normalizeDetailDate(input.docDate);

  if (flag === null || !docNo || !docDate) return null;
  if (!apDocumentFlags(menu).includes(flag)) return null;

  const detail =
    documentSourceByFlag(flag) === "ap_ar_trans"
      ? await getApArDetail(providerCode, databaseName, menu, flag, docNo, docDate)
      : await getIcDetail(providerCode, databaseName, menu, flag, docNo, docDate);

  if (!detail) return null;
  const companyName = await getCompanyName(providerCode, databaseName);

  return {
    company_name: companyName,
    selected_menu: menu,
    ...detail
  };
}

export async function getApSupplierDetail(
  providerCode: string,
  databaseName: string,
  input: ApSupplierDetailInput
): Promise<ApSupplierDetailData | null> {
  const code = normalizeSupplierCode(input.code);
  if (!code) return null;

  const [companyName, rows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<ApSupplier>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(code, '') AS code,
          COALESCE(name_1, '') AS name_1,
          COALESCE(name_2, '') AS name_2,
          COALESCE(address, '') AS address,
          COALESCE(telephone, '') AS telephone,
          COALESCE(email, '') AS email,
          COALESCE(website, '') AS website,
          COALESCE(ap_type, '') AS ap_type,
          COALESCE(status, 0) AS status,
          COALESCE(ap_status, 0) AS ap_status,
          COALESCE(debt_balance, 0) AS debt_balance,
          COALESCE(chq_balance, 0) AS chq_balance,
          COALESCE(bill_balance, 0) AS bill_balance,
          COALESCE(remark, '') AS remark,
          COALESCE(create_datetime::text, '') AS create_datetime,
          COALESCE(last_update_date_time::text, '') AS last_update_date_time
        FROM ap_supplier
        WHERE code = $1::text
        LIMIT 1
      `,
      [code]
    )
  ]);

  const supplier = rows[0];
  if (!supplier) return null;

  return {
    company_name: companyName,
    supplier: mapSupplier(supplier)
  };
}
