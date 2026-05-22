import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;
type AccountingSource = "asset" | "maintenance" | "sale" | "transfer" | "mapping" | "journal";

export type AccountingPeriod = {
  as_of_date: string;
  start_date: string;
  end_date: string;
  end_exclusive: string;
};

export type AccountingMenu = {
  id: string;
  label: string;
  erp_menu: string;
  stage: "สินทรัพย์" | "โอนบัญชี" | "ตั้งค่า" | "รายวัน";
  source: AccountingSource;
};

export type AccountingAsset = {
  code: string;
  name_1: string;
  name_2: string;
  unit_code: string;
  as_type: string;
  type_name: string;
  as_location: string;
  location_name: string;
  branch_code: string;
  department_code: string;
  side_code: string;
  user_code: string;
  account_code: string;
  account_name: string;
  depreciation_account_code: string;
  depreciation_account_name: string;
  depreciation_sum_account_code: string;
  depreciation_sum_account_name: string;
  status: number;
  remark: string;
  as_buy_date: string;
  as_buy_price: number;
  as_calc_value: number;
  as_value_balance: number;
  as_sum_value_balance: number;
  as_dead_value: number;
  depreciate_balance: number;
  as_rate: number;
  start_calc_date: string;
  depreciate_method: string;
};

export type AccountingDocument = {
  source: Exclude<AccountingSource, "asset" | "mapping">;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  book_code: string;
  book_name: string;
  doc_ref: string;
  doc_format_code: string;
  title: string;
  party_code: string;
  party_name: string;
  branch_code: string;
  department_code: string;
  remark: string;
  status: number;
  is_pass: number;
  trans_flag: number;
  total_amount: number;
  debit: number;
  credit: number;
  line_count: number;
  sample_line: string;
};

export type AccountingMapping = {
  doc_code: string;
  doc_name: string;
  screen_code: string;
  gl_book: string;
  gl_book_name: string;
  line_count: number;
  debit_count: number;
  credit_count: number;
  sample_condition: string;
};

export type AccountingDashboardData = {
  period: AccountingPeriod;
  company_name: string;
  selected_menu: AccountingMenu;
  assets: AccountingAsset[];
  documents: AccountingDocument[];
  mappings: AccountingMapping[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type AccountingQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type AccountingAssetDetailInput = {
  code?: string;
};

export type AccountingDocumentDetailInput = {
  menu?: string;
  docNo?: string;
  docDate?: string;
  bookCode?: string;
};

export type AccountingMappingDetailInput = {
  docCode?: string;
};

export type AccountingDocumentLine = {
  line_number: number;
  item_code: string;
  item_name: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  amount: number;
  ref_doc_no: string;
  ref_doc_date: string;
  remark: string;
};

export type AccountingDocumentDetailData = {
  company_name: string;
  selected_menu: AccountingMenu;
  header: AccountingDocument;
  lines: AccountingDocumentLine[];
  totals: {
    line_count: number;
    amount: number;
    debit: number;
    credit: number;
    diff: number;
  };
};

export type AccountingAssetDetailData = {
  company_name: string;
  asset: AccountingAsset;
};

export type AccountingMappingLine = {
  line_number: number;
  condition_number: number;
  condition_name: string;
  condition_case: string;
  account_code_debit: string;
  account_debit_name: string;
  account_code_credit: string;
  account_credit_name: string;
  account_name: string;
  code_compare: string;
};

export type AccountingMappingDetailData = {
  company_name: string;
  mapping: AccountingMapping;
  lines: AccountingMappingLine[];
};

export const accountingMenus: AccountingMenu[] = [
  {
    id: "assets",
    label: "รายละเอียดสินทรัพย์",
    erp_menu: "menu_asset_lists",
    stage: "สินทรัพย์",
    source: "asset"
  },
  {
    id: "asset-maintenance",
    label: "บันทึกการซ่อมบำรุงสินทรัพย์",
    erp_menu: "menu_asset_maintenance",
    stage: "สินทรัพย์",
    source: "maintenance"
  },
  {
    id: "asset-sale",
    label: "บันทึกการขายสินทรัพย์",
    erp_menu: "menu_asset_sale",
    stage: "สินทรัพย์",
    source: "sale"
  },
  {
    id: "transfer",
    label: "โอนข้อมูลเข้าระบบบัญชี",
    erp_menu: "menu_asset_transfers",
    stage: "โอนบัญชี",
    source: "transfer"
  },
  {
    id: "mapping",
    label: "รายละเอียดฝังบัญชี",
    erp_menu: "erp_doc_format_gl",
    stage: "ตั้งค่า",
    source: "mapping"
  },
  {
    id: "journal",
    label: "ข้อมูลรายวัน",
    erp_menu: "menu_gl_journal",
    stage: "รายวัน",
    source: "journal"
  }
];

function numberValue(value: Numeric) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
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

function getPeriod(input: AccountingQueryInput): AccountingPeriod {
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
  return accountingMenus.find((menu) => menu.id === menuId) ?? accountingMenus[0];
}

async function getCompanyName(providerCode: string, databaseName: string) {
  const rows = await queryProviderDatabase<{ company_name_1: string | null }>(
    providerCode,
    databaseName,
    "SELECT company_name_1 FROM erp_company_profile LIMIT 1"
  );
  return rows[0]?.company_name_1?.trim() || databaseName.toUpperCase();
}

function normalizeDocNo(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function normalizeAssetCode(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function normalizeMappingCode(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function assetStatusLabel(status: number) {
  if (status === 0) return "ปกติ";
  if (status === 1) return "ชำรุด";
  if (status === 2) return "สูญหาย";
  return `status ${status}`;
}

export function accountingAssetStatusLabel(status: number) {
  return assetStatusLabel(status);
}

function mapAsset(row: AccountingAsset): AccountingAsset {
  return {
    code: row.code ?? "",
    name_1: row.name_1 ?? "",
    name_2: row.name_2 ?? "",
    unit_code: row.unit_code ?? "",
    as_type: row.as_type ?? "",
    type_name: row.type_name ?? "",
    as_location: row.as_location ?? "",
    location_name: row.location_name ?? "",
    branch_code: row.branch_code ?? "",
    department_code: row.department_code ?? "",
    side_code: row.side_code ?? "",
    user_code: row.user_code ?? "",
    account_code: row.account_code ?? "",
    account_name: row.account_name ?? "",
    depreciation_account_code: row.depreciation_account_code ?? "",
    depreciation_account_name: row.depreciation_account_name ?? "",
    depreciation_sum_account_code: row.depreciation_sum_account_code ?? "",
    depreciation_sum_account_name: row.depreciation_sum_account_name ?? "",
    status: numberValue(row.status),
    remark: row.remark ?? "",
    as_buy_date: row.as_buy_date ?? "",
    as_buy_price: numberValue(row.as_buy_price),
    as_calc_value: numberValue(row.as_calc_value),
    as_value_balance: numberValue(row.as_value_balance),
    as_sum_value_balance: numberValue(row.as_sum_value_balance),
    as_dead_value: numberValue(row.as_dead_value),
    depreciate_balance: numberValue(row.depreciate_balance),
    as_rate: numberValue(row.as_rate),
    start_calc_date: row.start_calc_date ?? "",
    depreciate_method: row.depreciate_method ?? ""
  };
}

function mapDocument(row: AccountingDocument): AccountingDocument {
  return {
    source: row.source,
    doc_no: row.doc_no ?? "",
    doc_date: row.doc_date ?? "",
    doc_time: row.doc_time ?? "",
    book_code: row.book_code ?? "",
    book_name: row.book_name ?? "",
    doc_ref: row.doc_ref ?? "",
    doc_format_code: row.doc_format_code ?? "",
    title: row.title ?? "",
    party_code: row.party_code ?? "",
    party_name: row.party_name ?? "",
    branch_code: row.branch_code ?? "",
    department_code: row.department_code ?? "",
    remark: row.remark ?? "",
    status: numberValue(row.status),
    is_pass: numberValue(row.is_pass),
    trans_flag: numberValue(row.trans_flag),
    total_amount: numberValue(row.total_amount),
    debit: numberValue(row.debit),
    credit: numberValue(row.credit),
    line_count: numberValue(row.line_count),
    sample_line: row.sample_line ?? ""
  };
}

function mapMapping(row: AccountingMapping): AccountingMapping {
  return {
    doc_code: row.doc_code ?? "",
    doc_name: row.doc_name ?? "",
    screen_code: row.screen_code ?? "",
    gl_book: row.gl_book ?? "",
    gl_book_name: row.gl_book_name ?? "",
    line_count: numberValue(row.line_count),
    debit_count: numberValue(row.debit_count),
    credit_count: numberValue(row.credit_count),
    sample_condition: row.sample_condition ?? ""
  };
}

function mapLine(row: AccountingDocumentLine): AccountingDocumentLine {
  return {
    line_number: numberValue(row.line_number),
    item_code: row.item_code ?? "",
    item_name: row.item_name ?? "",
    account_code: row.account_code ?? "",
    account_name: row.account_name ?? "",
    debit: numberValue(row.debit),
    credit: numberValue(row.credit),
    amount: numberValue(row.amount),
    ref_doc_no: row.ref_doc_no ?? "",
    ref_doc_date: row.ref_doc_date ?? "",
    remark: row.remark ?? ""
  };
}

async function getAssets(
  providerCode: string,
  databaseName: string,
  search: string
): Promise<AccountingAsset[]> {
  const rows = await queryProviderDatabase<AccountingAsset>(
    providerCode,
    databaseName,
    `
      SELECT
        COALESCE(a.code, '') AS code,
        COALESCE(a.name_1, '') AS name_1,
        COALESCE(a.name_2, '') AS name_2,
        COALESCE(a.unit_code, '') AS unit_code,
        COALESCE(a.as_type, '') AS as_type,
        COALESCE(t.name_1, '') AS type_name,
        COALESCE(a.as_location, '') AS as_location,
        COALESCE(l.name_1, '') AS location_name,
        COALESCE(a.branch_code, '') AS branch_code,
        COALESCE(a.department_code, '') AS department_code,
        COALESCE(a.side_code, '') AS side_code,
        COALESCE(a.user_code, '') AS user_code,
        COALESCE(a.account_code, '') AS account_code,
        COALESCE(acc.name_1, '') AS account_name,
        COALESCE(a.depreciation_account_code, '') AS depreciation_account_code,
        COALESCE(dep.name_1, '') AS depreciation_account_name,
        COALESCE(a.depreciation_sum_account_code, '') AS depreciation_sum_account_code,
        COALESCE(sumdep.name_1, '') AS depreciation_sum_account_name,
        COALESCE(a.status, 0) AS status,
        COALESCE(a.remark, '') AS remark,
        COALESCE(d.as_buy_date::text, '') AS as_buy_date,
        COALESCE(d.as_buy_price, 0) AS as_buy_price,
        COALESCE(d.as_calc_value, 0) AS as_calc_value,
        COALESCE(d.as_value_balance, 0) AS as_value_balance,
        COALESCE(d.as_sum_value_balance, 0) AS as_sum_value_balance,
        COALESCE(d.as_dead_value, 0) AS as_dead_value,
        COALESCE(d.depreciate_balance, 0) AS depreciate_balance,
        COALESCE(d.as_rate, 0) AS as_rate,
        COALESCE(d.start_calc_date::text, '') AS start_calc_date,
        COALESCE(d.depreciate_method, '') AS depreciate_method
      FROM as_asset a
      LEFT JOIN as_asset_detail d ON d.as_code = a.code
      LEFT JOIN as_asset_type t ON t.code = a.as_type
      LEFT JOIN as_asset_location l ON l.code = a.as_location
      LEFT JOIN gl_chart_of_account acc ON acc.code = a.account_code
      LEFT JOIN gl_chart_of_account dep ON dep.code = a.depreciation_account_code
      LEFT JOIN gl_chart_of_account sumdep ON sumdep.code = a.depreciation_sum_account_code
      WHERE $1::text = ''
        OR a.code ILIKE '%' || $1::text || '%'
        OR COALESCE(a.name_1, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(a.name_2, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(a.as_type, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(t.name_1, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(a.as_location, '') ILIKE '%' || $1::text || '%'
        OR COALESCE(l.name_1, '') ILIKE '%' || $1::text || '%'
      ORDER BY a.code
      LIMIT 150
    `,
    [search]
  );

  return rows.map(mapAsset);
}

async function getMaintenanceDocuments(
  providerCode: string,
  databaseName: string,
  period: AccountingPeriod,
  search: string
) {
  const rows = await queryProviderDatabase<AccountingDocument>(
    providerCode,
    databaseName,
    `
      SELECT
        'maintenance' AS source,
        h.doc_no,
        h.doc_date::text,
        '' AS doc_time,
        '' AS book_code,
        '' AS book_name,
        '' AS doc_ref,
        '' AS doc_format_code,
        COALESCE(MAX(d.maintain_name), h.remark, '') AS title,
        COALESCE(MAX(d.as_code), '') AS party_code,
        COALESCE(MAX(a.name_1), '') AS party_name,
        COALESCE(h.branch_code, '') AS branch_code,
        COALESCE(h.department_code, '') AS department_code,
        COALESCE(h.remark, '') AS remark,
        COALESCE(h.status, 0) AS status,
        0 AS is_pass,
        0 AS trans_flag,
        COALESCE(h.total_maintain_value, 0) AS total_amount,
        0 AS debit,
        0 AS credit,
        COUNT(d.doc_no)::int AS line_count,
        COALESCE(MAX(d.maintain_name), MAX(d.remark), '') AS sample_line
      FROM as_asset_maintenance h
      LEFT JOIN as_asset_maintenance_detail d
        ON d.doc_no = h.doc_no
        AND d.doc_date = h.doc_date
      LEFT JOIN as_asset a ON a.code = d.as_code
      WHERE h.doc_date >= $1::date
        AND h.doc_date < $2::date
        AND (
          $3::text = ''
          OR h.doc_no ILIKE '%' || $3::text || '%'
          OR COALESCE(h.remark, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.as_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(a.name_1, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.maintain_name, '') ILIKE '%' || $3::text || '%'
        )
      GROUP BY h.doc_no, h.doc_date, h.branch_code, h.department_code, h.remark, h.status, h.total_maintain_value
      ORDER BY h.doc_date DESC, h.doc_no DESC
      LIMIT 150
    `,
    [period.start_date, period.end_exclusive, search]
  );
  return rows.map(mapDocument);
}

async function getSaleDocuments(
  providerCode: string,
  databaseName: string,
  period: AccountingPeriod,
  search: string
) {
  const rows = await queryProviderDatabase<AccountingDocument>(
    providerCode,
    databaseName,
    `
      SELECT
        'sale' AS source,
        h.doc_no,
        h.doc_date::text,
        '' AS doc_time,
        '' AS book_code,
        '' AS book_name,
        COALESCE(h.doc_ref, '') AS doc_ref,
        COALESCE(h.doc_group, '') AS doc_format_code,
        COALESCE(MAX(a.name_1), h.remark, '') AS title,
        COALESCE(h.ar_code, '') AS party_code,
        COALESCE(ar.name_1, '') AS party_name,
        '' AS branch_code,
        COALESCE(h.department_code, '') AS department_code,
        COALESCE(h.remark, '') AS remark,
        COALESCE(h.status, 0) AS status,
        0 AS is_pass,
        1802 AS trans_flag,
        COALESCE(h.total_net_value, h.total_sale_price, 0) AS total_amount,
        0 AS debit,
        0 AS credit,
        COUNT(d.doc_no)::int AS line_count,
        COALESCE(MAX(a.name_1), MAX(d.remark), '') AS sample_line
      FROM as_asset_sale h
      LEFT JOIN as_asset_sale_detail d
        ON d.doc_no = h.doc_no
        AND d.doc_date = h.doc_date
      LEFT JOIN as_asset a ON a.code = d.as_code
      LEFT JOIN ar_customer ar ON ar.code = h.ar_code
      WHERE h.doc_date >= $1::date
        AND h.doc_date < $2::date
        AND (
          $3::text = ''
          OR h.doc_no ILIKE '%' || $3::text || '%'
          OR COALESCE(h.doc_ref, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(h.ar_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(ar.name_1, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.as_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(a.name_1, '') ILIKE '%' || $3::text || '%'
        )
      GROUP BY h.doc_no, h.doc_date, h.doc_ref, h.doc_group, h.ar_code, ar.name_1,
        h.department_code, h.remark, h.status, h.total_net_value, h.total_sale_price
      ORDER BY h.doc_date DESC, h.doc_no DESC
      LIMIT 150
    `,
    [period.start_date, period.end_exclusive, search]
  );
  return rows.map(mapDocument);
}

async function getTransferDocuments(
  providerCode: string,
  databaseName: string,
  period: AccountingPeriod,
  search: string
) {
  const rows = await queryProviderDatabase<AccountingDocument>(
    providerCode,
    databaseName,
    `
      SELECT
        'transfer' AS source,
        h.doc_no,
        h.doc_date::text,
        COALESCE(h.doc_time, '') AS doc_time,
        COALESCE(f.gl_book, '') AS book_code,
        COALESCE(jb.name_1, '') AS book_name,
        '' AS doc_ref,
        COALESCE(h.doc_format_code, '') AS doc_format_code,
        COALESCE(h.remark, '') AS title,
        COALESCE(h.from_as_code, '') AS party_code,
        COALESCE(h.to_as_code, '') AS party_name,
        '' AS branch_code,
        COALESCE(h.from_as_department, '') AS department_code,
        COALESCE(h.remark, '') AS remark,
        0 AS status,
        0 AS is_pass,
        COALESCE(h.trans_flag, 0) AS trans_flag,
        COALESCE(h.total_amount, 0) AS total_amount,
        COALESCE(g.debit, 0) AS debit,
        COALESCE(g.credit, 0) AS credit,
        COUNT(d.doc_no)::int AS line_count,
        COALESCE(MAX(d.item_name), MAX(d.remark), '') AS sample_line
      FROM as_trans h
      LEFT JOIN as_trans_detail d
        ON d.trans_flag = h.trans_flag
        AND d.doc_no = h.doc_no
        AND d.doc_date = h.doc_date
      LEFT JOIN gl_journal g
        ON g.trans_flag = h.trans_flag
        AND g.doc_no = h.doc_no
        AND g.doc_date = h.doc_date
      LEFT JOIN erp_doc_format f ON f.code = h.doc_format_code
      LEFT JOIN gl_journal_book jb ON jb.code = f.gl_book
      WHERE h.trans_flag = 1801
        AND h.doc_date >= $1::date
        AND h.doc_date < $2::date
        AND (
          $3::text = ''
          OR h.doc_no ILIKE '%' || $3::text || '%'
          OR COALESCE(h.doc_format_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(h.remark, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.item_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.item_name, '') ILIKE '%' || $3::text || '%'
        )
      GROUP BY h.doc_no, h.doc_date, h.doc_time, f.gl_book, jb.name_1, h.doc_format_code,
        h.remark, h.from_as_code, h.to_as_code, h.from_as_department,
        h.trans_flag, h.total_amount, g.debit, g.credit
      ORDER BY h.doc_date DESC, h.doc_time DESC, h.doc_no DESC
      LIMIT 150
    `,
    [period.start_date, period.end_exclusive, search]
  );
  return rows.map(mapDocument);
}

async function getJournalDocuments(
  providerCode: string,
  databaseName: string,
  period: AccountingPeriod,
  search: string
) {
  const rows = await queryProviderDatabase<AccountingDocument>(
    providerCode,
    databaseName,
    `
      SELECT
        'journal' AS source,
        h.doc_no,
        h.doc_date::text,
        '' AS doc_time,
        COALESCE(h.book_code, '') AS book_code,
        COALESCE(jb.name_1, '') AS book_name,
        COALESCE(h.ref_no, '') AS doc_ref,
        COALESCE(h.doc_format_code, '') AS doc_format_code,
        COALESCE(h.description, '') AS title,
        COALESCE(h.ap_ar_code, '') AS party_code,
        COALESCE(NULLIF(ar.name_1, ''), NULLIF(ap.name_1, ''), '') AS party_name,
        COALESCE(h.branch_code, '') AS branch_code,
        '' AS department_code,
        COALESCE(h.description, '') AS remark,
        0 AS status,
        COALESCE(h.is_pass, 0) AS is_pass,
        COALESCE(h.trans_flag, 0) AS trans_flag,
        COALESCE(h.debit, h.credit, 0) AS total_amount,
        COALESCE(h.debit, 0) AS debit,
        COALESCE(h.credit, 0) AS credit,
        COUNT(d.doc_no)::int AS line_count,
        COALESCE(MAX(d.description), MAX(d.account_name), '') AS sample_line
      FROM gl_journal h
      LEFT JOIN gl_journal_detail d
        ON d.book_code = h.book_code
        AND d.doc_no = h.doc_no
        AND d.doc_date = h.doc_date
      LEFT JOIN gl_journal_book jb ON jb.code = h.book_code
      LEFT JOIN ar_customer ar ON ar.code = h.ap_ar_code
      LEFT JOIN ap_supplier ap ON ap.code = h.ap_ar_code
      WHERE h.doc_date >= $1::date
        AND h.doc_date < $2::date
        AND (
          $3::text = ''
          OR h.doc_no ILIKE '%' || $3::text || '%'
          OR COALESCE(h.book_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(jb.name_1, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(h.ref_no, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(h.description, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.account_code, '') ILIKE '%' || $3::text || '%'
          OR COALESCE(d.account_name, '') ILIKE '%' || $3::text || '%'
        )
      GROUP BY h.doc_no, h.doc_date, h.book_code, jb.name_1, h.ref_no,
        h.doc_format_code, h.description, h.ap_ar_code, ar.name_1, ap.name_1,
        h.branch_code, h.is_pass, h.trans_flag, h.debit, h.credit
      ORDER BY h.doc_date DESC, h.doc_no DESC
      LIMIT 150
    `,
    [period.start_date, period.end_exclusive, search]
  );
  return rows.map(mapDocument);
}

async function getMappings(
  providerCode: string,
  databaseName: string,
  search: string
) {
  const rows = await queryProviderDatabase<AccountingMapping>(
    providerCode,
    databaseName,
    `
      SELECT
        COALESCE(g.doc_code, '') AS doc_code,
        COALESCE(f.name_1, '') AS doc_name,
        COALESCE(f.screen_code, '') AS screen_code,
        COALESCE(f.gl_book, '') AS gl_book,
        COALESCE(jb.name_1, '') AS gl_book_name,
        COUNT(*)::int AS line_count,
        COUNT(NULLIF(g.account_code_debit, ''))::int AS debit_count,
        COUNT(NULLIF(g.account_code_credit, ''))::int AS credit_count,
        COALESCE(MIN(NULLIF(g.condition_name, '')), '') AS sample_condition
      FROM erp_doc_format_gl g
      LEFT JOIN erp_doc_format f ON f.code = g.doc_code
      LEFT JOIN gl_journal_book jb ON jb.code = f.gl_book
      WHERE COALESCE(g.condition_number, 0) > 0
        AND (
          $1::text = ''
          OR COALESCE(g.doc_code, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(f.name_1, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(f.screen_code, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(g.condition_name, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(g.account_code_debit, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(g.account_code_credit, '') ILIKE '%' || $1::text || '%'
        )
      GROUP BY g.doc_code, f.name_1, f.screen_code, f.gl_book, jb.name_1
      ORDER BY g.doc_code
      LIMIT 150
    `,
    [search]
  );
  return rows.map(mapMapping);
}

export async function getAccountingDashboard(
  providerCode: string,
  databaseName: string,
  input: AccountingQueryInput
): Promise<AccountingDashboardData> {
  const period = getPeriod(input);
  const menu = selectedMenu(input.menu);
  const search = input.search?.trim() ?? "";

  const companyNamePromise = getCompanyName(providerCode, databaseName);
  const assetsPromise =
    menu.source === "asset" ? getAssets(providerCode, databaseName, search) : Promise.resolve([]);
  const mappingsPromise =
    menu.source === "mapping" ? getMappings(providerCode, databaseName, search) : Promise.resolve([]);
  const documentsPromise =
    menu.source === "maintenance"
      ? getMaintenanceDocuments(providerCode, databaseName, period, search)
      : menu.source === "sale"
        ? getSaleDocuments(providerCode, databaseName, period, search)
        : menu.source === "transfer"
          ? getTransferDocuments(providerCode, databaseName, period, search)
          : menu.source === "journal"
            ? getJournalDocuments(providerCode, databaseName, period, search)
            : Promise.resolve([]);

  const [companyName, assets, mappings, documents] = await Promise.all([
    companyNamePromise,
    assetsPromise,
    mappingsPromise,
    documentsPromise
  ]);

  return {
    period,
    company_name: companyName,
    selected_menu: menu,
    assets,
    documents,
    mappings,
    filters: {
      menu: menu.id,
      search,
      start_date: period.start_date,
      end_date: period.end_date
    }
  };
}

export async function getAccountingAssetDetail(
  providerCode: string,
  databaseName: string,
  input: AccountingAssetDetailInput
): Promise<AccountingAssetDetailData | null> {
  const code = normalizeAssetCode(input.code);
  if (!code) return null;
  const [companyName, rows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<AccountingAsset>(
      providerCode,
      databaseName,
      `
        SELECT *
        FROM (
          ${assetDetailSql()}
        ) asset
        WHERE asset.code = $1::text
        LIMIT 1
      `,
      [code]
    )
  ]);
  const asset = rows[0];
  if (!asset) return null;
  return { company_name: companyName, asset: mapAsset(asset) };
}

function assetDetailSql() {
  return `
    SELECT
      COALESCE(a.code, '') AS code,
      COALESCE(a.name_1, '') AS name_1,
      COALESCE(a.name_2, '') AS name_2,
      COALESCE(a.unit_code, '') AS unit_code,
      COALESCE(a.as_type, '') AS as_type,
      COALESCE(t.name_1, '') AS type_name,
      COALESCE(a.as_location, '') AS as_location,
      COALESCE(l.name_1, '') AS location_name,
      COALESCE(a.branch_code, '') AS branch_code,
      COALESCE(a.department_code, '') AS department_code,
      COALESCE(a.side_code, '') AS side_code,
      COALESCE(a.user_code, '') AS user_code,
      COALESCE(a.account_code, '') AS account_code,
      COALESCE(acc.name_1, '') AS account_name,
      COALESCE(a.depreciation_account_code, '') AS depreciation_account_code,
      COALESCE(dep.name_1, '') AS depreciation_account_name,
      COALESCE(a.depreciation_sum_account_code, '') AS depreciation_sum_account_code,
      COALESCE(sumdep.name_1, '') AS depreciation_sum_account_name,
      COALESCE(a.status, 0) AS status,
      COALESCE(a.remark, '') AS remark,
      COALESCE(d.as_buy_date::text, '') AS as_buy_date,
      COALESCE(d.as_buy_price, 0) AS as_buy_price,
      COALESCE(d.as_calc_value, 0) AS as_calc_value,
      COALESCE(d.as_value_balance, 0) AS as_value_balance,
      COALESCE(d.as_sum_value_balance, 0) AS as_sum_value_balance,
      COALESCE(d.as_dead_value, 0) AS as_dead_value,
      COALESCE(d.depreciate_balance, 0) AS depreciate_balance,
      COALESCE(d.as_rate, 0) AS as_rate,
      COALESCE(d.start_calc_date::text, '') AS start_calc_date,
      COALESCE(d.depreciate_method, '') AS depreciate_method
    FROM as_asset a
    LEFT JOIN as_asset_detail d ON d.as_code = a.code
    LEFT JOIN as_asset_type t ON t.code = a.as_type
    LEFT JOIN as_asset_location l ON l.code = a.as_location
    LEFT JOIN gl_chart_of_account acc ON acc.code = a.account_code
    LEFT JOIN gl_chart_of_account dep ON dep.code = a.depreciation_account_code
    LEFT JOIN gl_chart_of_account sumdep ON sumdep.code = a.depreciation_sum_account_code
  `;
}

async function getDocumentHeader(
  providerCode: string,
  databaseName: string,
  menu: AccountingMenu,
  docNo: string,
  docDate: string,
  bookCode: string | undefined
): Promise<AccountingDocument | null> {
  const period = {
    start_date: docDate,
    end_exclusive: addDays(docDate, 1)
  } as AccountingPeriod;
  const search = docNo;
  const rows =
    menu.source === "maintenance"
      ? await getMaintenanceDocuments(providerCode, databaseName, period, search)
      : menu.source === "sale"
        ? await getSaleDocuments(providerCode, databaseName, period, search)
        : menu.source === "transfer"
          ? await getTransferDocuments(providerCode, databaseName, period, search)
          : menu.source === "journal"
            ? (await getJournalDocuments(providerCode, databaseName, period, search)).filter(
                (row) => !bookCode || row.book_code === bookCode
              )
            : [];
  return rows.find((row) => row.doc_no === docNo && row.doc_date.slice(0, 10) === docDate) ?? null;
}

async function getDocumentLines(
  providerCode: string,
  databaseName: string,
  menu: AccountingMenu,
  header: AccountingDocument
) {
  if (menu.source === "maintenance") {
    const rows = await queryProviderDatabase<AccountingDocumentLine>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(d.line_number, 0) AS line_number,
          COALESCE(d.as_code, '') AS item_code,
          COALESCE(NULLIF(a.name_1, ''), NULLIF(d.maintain_name, ''), '') AS item_name,
          '' AS account_code,
          '' AS account_name,
          0 AS debit,
          0 AS credit,
          COALESCE(d.maintain_price, 0) AS amount,
          '' AS ref_doc_no,
          COALESCE(d.maintain_date::text, '') AS ref_doc_date,
          COALESCE(d.remark, '') AS remark
        FROM as_asset_maintenance_detail d
        LEFT JOIN as_asset a ON a.code = d.as_code
        WHERE d.doc_no = $1::text
          AND d.doc_date = $2::date
        ORDER BY d.line_number, d.as_code
      `,
      [header.doc_no, header.doc_date]
    );
    return rows.map(mapLine);
  }

  if (menu.source === "sale") {
    const rows = await queryProviderDatabase<AccountingDocumentLine>(
      providerCode,
      databaseName,
      `
        SELECT
          0 AS line_number,
          COALESCE(d.as_code, '') AS item_code,
          COALESCE(a.name_1, '') AS item_name,
          '' AS account_code,
          '' AS account_name,
          0 AS debit,
          0 AS credit,
          COALESCE(d.net_value, d.sale_price, 0) AS amount,
          '' AS ref_doc_no,
          COALESCE(d.doc_date::text, '') AS ref_doc_date,
          COALESCE(d.remark, '') AS remark
        FROM as_asset_sale_detail d
        LEFT JOIN as_asset a ON a.code = d.as_code
        WHERE d.doc_no = $1::text
          AND d.doc_date = $2::date
        ORDER BY d.as_code
      `,
      [header.doc_no, header.doc_date]
    );
    return rows.map(mapLine);
  }

  if (menu.source === "transfer") {
    const rows = await queryProviderDatabase<AccountingDocumentLine>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(d.line_number, 0) AS line_number,
          COALESCE(d.item_code, '') AS item_code,
          COALESCE(d.item_name, '') AS item_name,
          '' AS account_code,
          '' AS account_name,
          0 AS debit,
          0 AS credit,
          COALESCE(d.sum_amount, 0) AS amount,
          '' AS ref_doc_no,
          COALESCE(d.doc_date::text, '') AS ref_doc_date,
          COALESCE(d.remark, '') AS remark
        FROM as_trans_detail d
        WHERE d.trans_flag = 1801
          AND d.doc_no = $1::text
          AND d.doc_date = $2::date
        ORDER BY d.line_number, d.item_code
      `,
      [header.doc_no, header.doc_date]
    );
    return rows.map(mapLine);
  }

  const rows = await queryProviderDatabase<AccountingDocumentLine>(
    providerCode,
    databaseName,
    `
      SELECT
        COALESCE(d.line_number, 0) AS line_number,
        '' AS item_code,
        COALESCE(d.description, '') AS item_name,
        COALESCE(d.account_code, '') AS account_code,
        COALESCE(NULLIF(d.account_name, ''), ca.name_1, '') AS account_name,
        COALESCE(d.debit, 0) AS debit,
        COALESCE(d.credit, 0) AS credit,
        COALESCE(NULLIF(d.debit, 0), d.credit, 0) AS amount,
        '' AS ref_doc_no,
        COALESCE(d.doc_date::text, '') AS ref_doc_date,
        COALESCE(d.description, '') AS remark
      FROM gl_journal_detail d
      LEFT JOIN gl_chart_of_account ca ON ca.code = d.account_code
      WHERE d.book_code = $1::text
        AND d.doc_no = $2::text
        AND d.doc_date = $3::date
      ORDER BY d.line_number, d.account_code
    `,
    [header.book_code, header.doc_no, header.doc_date]
  );
  return rows.map(mapLine);
}

export async function getAccountingDocumentDetail(
  providerCode: string,
  databaseName: string,
  input: AccountingDocumentDetailInput
): Promise<AccountingDocumentDetailData | null> {
  const menu = selectedMenu(input.menu);
  if (!["maintenance", "sale", "transfer", "journal"].includes(menu.source)) return null;
  const docNo = normalizeDocNo(input.docNo);
  const docDate = parseInputDate(input.docDate);
  if (!docNo || !docDate) return null;

  const [companyName, header] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getDocumentHeader(providerCode, databaseName, menu, docNo, docDate, input.bookCode)
  ]);
  if (!header) return null;

  const lines = await getDocumentLines(providerCode, databaseName, menu, header);
  const totals = {
    line_count: lines.length,
    amount: lines.reduce((sum, line) => sum + line.amount, 0),
    debit: lines.reduce((sum, line) => sum + line.debit, 0),
    credit: lines.reduce((sum, line) => sum + line.credit, 0),
    diff: lines.reduce((sum, line) => sum + line.debit - line.credit, 0)
  };

  return {
    company_name: companyName,
    selected_menu: menu,
    header,
    lines,
    totals
  };
}

export async function getAccountingMappingDetail(
  providerCode: string,
  databaseName: string,
  input: AccountingMappingDetailInput
): Promise<AccountingMappingDetailData | null> {
  const docCode = normalizeMappingCode(input.docCode);
  if (!docCode) return null;
  const [companyName, mappingRows, lineRows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<AccountingMapping>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(g.doc_code, '') AS doc_code,
          COALESCE(f.name_1, '') AS doc_name,
          COALESCE(f.screen_code, '') AS screen_code,
          COALESCE(f.gl_book, '') AS gl_book,
          COALESCE(jb.name_1, '') AS gl_book_name,
          COUNT(*)::int AS line_count,
          COUNT(NULLIF(g.account_code_debit, ''))::int AS debit_count,
          COUNT(NULLIF(g.account_code_credit, ''))::int AS credit_count,
          COALESCE(MIN(NULLIF(g.condition_name, '')), '') AS sample_condition
        FROM erp_doc_format_gl g
        LEFT JOIN erp_doc_format f ON f.code = g.doc_code
        LEFT JOIN gl_journal_book jb ON jb.code = f.gl_book
        WHERE COALESCE(g.condition_number, 0) > 0
          AND g.doc_code = $1::text
        GROUP BY g.doc_code, f.name_1, f.screen_code, f.gl_book, jb.name_1
      `,
      [docCode]
    ),
    queryProviderDatabase<AccountingMappingLine>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(g.line_number, 0) AS line_number,
          COALESCE(g.condition_number, 0) AS condition_number,
          COALESCE(g.condition_name, '') AS condition_name,
          COALESCE(g.condition_case, '') AS condition_case,
          COALESCE(g.account_code_debit, '') AS account_code_debit,
          COALESCE(debit_acc.name_1, '') AS account_debit_name,
          COALESCE(g.account_code_credit, '') AS account_code_credit,
          COALESCE(credit_acc.name_1, '') AS account_credit_name,
          COALESCE(g.account_name, '') AS account_name,
          COALESCE(g.code_compare, '') AS code_compare
        FROM erp_doc_format_gl g
        LEFT JOIN gl_chart_of_account debit_acc ON debit_acc.code = g.account_code_debit
        LEFT JOIN gl_chart_of_account credit_acc ON credit_acc.code = g.account_code_credit
        WHERE COALESCE(g.condition_number, 0) > 0
          AND g.doc_code = $1::text
        ORDER BY g.line_number, g.condition_number
      `,
      [docCode]
    )
  ]);

  const mapping = mappingRows[0];
  if (!mapping) return null;
  return {
    company_name: companyName,
    mapping: mapMapping(mapping),
    lines: lineRows.map((line) => ({
      line_number: numberValue(line.line_number),
      condition_number: numberValue(line.condition_number),
      condition_name: line.condition_name ?? "",
      condition_case: line.condition_case ?? "",
      account_code_debit: line.account_code_debit ?? "",
      account_debit_name: line.account_debit_name ?? "",
      account_code_credit: line.account_code_credit ?? "",
      account_credit_name: line.account_credit_name ?? "",
      account_name: line.account_name ?? "",
      code_compare: line.code_compare ?? ""
    }))
  };
}
