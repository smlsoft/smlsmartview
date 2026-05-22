import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;
type CashBankSource = "ic_trans" | "cheque" | "unconfirmed";

const tableColumnCache = new Map<string, Promise<Set<string>>>();

export type CashBankPeriod = {
  as_of_date: string;
  start_date: string;
  end_date: string;
  end_exclusive: string;
};

export type CashBankMenu = {
  id: string;
  label: string;
  erp_menu: string;
  flags: number[];
  cancel_flags?: number[];
  stage: "รายได้/ค่าใช้จ่าย" | "เงินสดย่อย" | "ธนาคาร" | "เช็ครับ" | "เช็คจ่าย" | "บัตรเครดิต" | "ยกมา" | "ยังไม่ยืนยัน";
  source: CashBankSource;
  cheque_type?: 1 | 2;
  unconfirmed_reason?: string;
};

export type CashBankStatusFields = {
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

export type CashBankDocument = CashBankStatusFields & {
  trans_flag: number;
  menu_label: string;
  flag_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  description: string;
  party_code: string;
  party_name: string;
  pass_book_code: string;
  pass_book_name: string;
  branch_name: string;
  remark: string;
  total_amount: number;
  line_count: number;
  detail_amount: number;
  bank_info: string;
  sample_detail: string;
};

type CashBankDocumentRow = Omit<
  CashBankDocument,
  "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type CashBankCheque = {
  chq_type: number;
  chq_number: string;
  chq_get_date: string;
  chq_due_date: string;
  doc_ref: string;
  book_code: string;
  pass_book_code: string;
  pass_book_name: string;
  bank_code: string;
  bank_name: string;
  bank_branch: string;
  amount: number;
  currency_code: string;
  owner_name: string;
  person_code: string;
  ap_ar_code: string;
  ap_ar_name: string;
  remark: string;
  status: number;
  trans_flag: number;
};

export type CashBankDashboardData = {
  period: CashBankPeriod;
  company_name: string;
  selected_menu: CashBankMenu;
  documents: CashBankDocument[];
  cheques: CashBankCheque[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type CashBankQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type CashBankDocumentDetailInput = {
  menu?: string;
  flag?: string;
  docNo?: string;
  docDate?: string;
};

export type CashBankChequeDetailInput = {
  type?: string;
  chqNumber?: string;
  getDate?: string;
};

export type CashBankDocumentHeader = CashBankStatusFields & {
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
  description: string;
  party_code: string;
  party_name: string;
  pass_book_code: string;
  pass_book_name: string;
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
};

type CashBankDocumentHeaderRow = Omit<
  CashBankDocumentHeader,
  "menu_label" | "flag_label" | "is_cancel_flag"
>;

export type CashBankDocumentLine = {
  line_number: number;
  item_code: string;
  item_name: string;
  ref_doc_no: string;
  ref_doc_date: string;
  bank_name: string;
  bank_branch: string;
  chq_number: string;
  credit_card_no: string;
  sum_amount: number;
  fee_amount: number;
  other_amount: number;
  tax_at_pay: number;
  remark: string;
  status: number;
  last_status: number;
};

type CashBankDocumentLineRow = CashBankDocumentLine;

export type CashBankDocumentDetailData = {
  company_name: string;
  selected_menu: CashBankMenu;
  header: CashBankDocumentHeader;
  lines: CashBankDocumentLine[];
  totals: {
    line_count: number;
    line_amount: number;
    fee_amount: number;
    other_amount: number;
    tax_at_pay: number;
  };
};

export type CashBankChequeDetailData = {
  company_name: string;
  cheque: CashBankCheque;
};

const CASH_BANK_CANCEL_FLAGS = [
  251, 253, 255, 261, 263, 265, 302, 303, 403, 404, 408, 407,
  430, 431, 432, 433, 436, 471, 472, 473, 476, 423, 462
];

export const cashBankMenus: CashBankMenu[] = [
  {
    id: "other-income",
    label: "รายได้อื่นๆ",
    erp_menu: "menu_cash_income_other",
    flags: [250],
    cancel_flags: [251],
    stage: "รายได้/ค่าใช้จ่าย",
    source: "ic_trans"
  },
  {
    id: "other-income-credit",
    label: "ลดหนี้รายได้อื่นๆ",
    erp_menu: "menu_cash_income_other_credit",
    flags: [252],
    cancel_flags: [253],
    stage: "รายได้/ค่าใช้จ่าย",
    source: "ic_trans"
  },
  {
    id: "other-income-debit",
    label: "เพิ่มหนี้รายได้อื่นๆ",
    erp_menu: "menu_cash_income_other_debit",
    flags: [254],
    cancel_flags: [255],
    stage: "รายได้/ค่าใช้จ่าย",
    source: "ic_trans"
  },
  {
    id: "other-expense",
    label: "ค่าใช้จ่ายอื่นๆ",
    erp_menu: "menu_cash_expense_other",
    flags: [260],
    cancel_flags: [261],
    stage: "รายได้/ค่าใช้จ่าย",
    source: "ic_trans"
  },
  {
    id: "other-expense-credit",
    label: "ลดหนี้ค่าใช้จ่ายอื่นๆ",
    erp_menu: "menu_cash_expense_other_credit",
    flags: [262],
    cancel_flags: [263],
    stage: "รายได้/ค่าใช้จ่าย",
    source: "ic_trans"
  },
  {
    id: "other-expense-debit",
    label: "เพิ่มหนี้ค่าใช้จ่ายอื่นๆ",
    erp_menu: "menu_cash_expense_other_debit",
    flags: [264],
    cancel_flags: [265],
    stage: "รายได้/ค่าใช้จ่าย",
    source: "ic_trans"
  },
  {
    id: "cash-opening",
    label: "ยกมาเงินสด",
    erp_menu: "menu_cb_cash_balance",
    flags: [602],
    stage: "ยกมา",
    source: "ic_trans"
  },
  {
    id: "petty-reduce",
    label: "คืน/ลด วงเงินสดย่อย",
    erp_menu: "menu_cb_petty_cash_receive",
    flags: [300],
    cancel_flags: [302],
    stage: "เงินสดย่อย",
    source: "ic_trans"
  },
  {
    id: "petty-increase",
    label: "รับ/เพิ่ม วงเงินสดย่อย",
    erp_menu: "menu_cb_petty_return",
    flags: [301],
    cancel_flags: [303],
    stage: "เงินสดย่อย",
    source: "ic_trans"
  },
  {
    id: "bank-opening",
    label: "เงินฝากธนาคารยกมา",
    erp_menu: "menu_cb_bank_balance",
    flags: [604],
    stage: "ยกมา",
    source: "ic_trans"
  },
  {
    id: "bank-deposit",
    label: "บันทึกฝากเงิน",
    erp_menu: "menu_cb_cash_payin",
    flags: [401],
    cancel_flags: [403],
    stage: "ธนาคาร",
    source: "ic_trans"
  },
  {
    id: "bank-withdraw",
    label: "บันทึกถอนเงิน",
    erp_menu: "menu_cb_cash_withdraw",
    flags: [402],
    cancel_flags: [404],
    stage: "ธนาคาร",
    source: "ic_trans"
  },
  {
    id: "bank-transfer",
    label: "บันทึกโอนเงินระหว่างธนาคาร",
    erp_menu: "menu_cash_transfer",
    flags: [422],
    cancel_flags: [423],
    stage: "ธนาคาร",
    source: "ic_trans"
  },
  {
    id: "wallet-redeem",
    label: "บันทึกขึ้นเงิน wallet",
    erp_menu: "ยังไม่พบใน SMLERPCASHBANK/_selectMenu.cs",
    flags: [],
    stage: "ยังไม่ยืนยัน",
    source: "unconfirmed",
    unconfirmed_reason:
      "ค้นใน SMLERPCASHBANK/_selectMenu.cs, SMLAccount/menu.json และ SMLERPGlobal/_global.cs แล้วพบเฉพาะ wallet config ยังไม่พบเมนูหรือ trans_flag สำหรับบันทึกขึ้นเงิน wallet"
  },
  {
    id: "cheque-in-list",
    label: "ทะเบียนเช็ครับ",
    erp_menu: "menu_cb_chq_in_receive_master",
    flags: [],
    stage: "เช็ครับ",
    source: "cheque",
    cheque_type: 1
  },
  {
    id: "cheque-in-opening",
    label: "เช็ครับยกมา",
    erp_menu: "menu_cb_chq_in_receive_balance",
    flags: [405],
    cancel_flags: [408],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-in-deposit",
    label: "บันทึกนำฝาก (เช็ครับ)",
    erp_menu: "menu_cb_chq_in_payin",
    flags: [410],
    cancel_flags: [430],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-in-pass",
    label: "บันทึกเช็คผ่าน (เช็ครับ)",
    erp_menu: "menu_cb_chq_in_pass",
    flags: [411],
    cancel_flags: [431],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-in-return",
    label: "บันทึกเช็คคืน (เช็ครับ)",
    erp_menu: "menu_cb_chq_in_return",
    flags: [412],
    cancel_flags: [432],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-in-expire",
    label: "บันทึกเช็คขาดสิทธิ์ (เช็ครับ)",
    erp_menu: "menu_cb_chq_in_cancel",
    flags: [413],
    cancel_flags: [433],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-in-change",
    label: "บันทึกการเปลี่ยนเช็ค (เช็ครับ)",
    erp_menu: "menu_cb_chq_renew",
    flags: [416],
    cancel_flags: [436],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-in-return-new-debt",
    label: "บันทึกคืนเช็ค/ตั้งหนี้ใหม่",
    erp_menu: "menu_cb_return_chq_new_debt",
    flags: [418],
    stage: "เช็ครับ",
    source: "ic_trans"
  },
  {
    id: "cheque-out-list",
    label: "ทะเบียนเช็คจ่าย",
    erp_menu: "menu_cb_chq_out_payment_master",
    flags: [],
    stage: "เช็คจ่าย",
    source: "cheque",
    cheque_type: 2
  },
  {
    id: "cheque-out-opening",
    label: "เช็คจ่ายยกมา",
    erp_menu: "menu_cb_chq_out_payment_balance",
    flags: [406],
    cancel_flags: [407],
    stage: "เช็คจ่าย",
    source: "ic_trans"
  },
  {
    id: "cheque-out-pass",
    label: "บันทึกเช็คผ่าน (เช็คจ่าย)",
    erp_menu: "menu_cb_chq_out_pass",
    flags: [451],
    cancel_flags: [471],
    stage: "เช็คจ่าย",
    source: "ic_trans"
  },
  {
    id: "cheque-out-return",
    label: "บันทึกเช็คคืน (เช็คจ่าย)",
    erp_menu: "menu_cb_chq_out_return",
    flags: [453],
    cancel_flags: [473],
    stage: "เช็คจ่าย",
    source: "ic_trans"
  },
  {
    id: "cheque-out-expire",
    label: "บันทึกเช็คขาดสิทธิ์ (เช็คจ่าย)",
    erp_menu: "menu_cb_chq_out_cancel",
    flags: [452],
    cancel_flags: [472],
    stage: "เช็คจ่าย",
    source: "ic_trans"
  },
  {
    id: "cheque-out-change",
    label: "บันทึกการเปลี่ยนเช็ค (เช็คจ่าย)",
    erp_menu: "menu_cb_chq_out_renew",
    flags: [456],
    cancel_flags: [476],
    stage: "เช็คจ่าย",
    source: "ic_trans"
  },
  {
    id: "credit-card-redeem",
    label: "บันทึกขึ้นเงินบัตรเครดิต",
    erp_menu: "menu_cb_credit_card_pass",
    flags: [461],
    cancel_flags: [462],
    stage: "บัตรเครดิต",
    source: "ic_trans"
  }
];

const cashBankFlagLabels = new Map<number, string>([
  [250, "รายได้อื่น"],
  [251, "ยกเลิกรายได้อื่น"],
  [252, "ลดหนี้รายได้อื่น"],
  [253, "ยกเลิกลดหนี้รายได้อื่น"],
  [254, "เพิ่มหนี้รายได้อื่น"],
  [255, "ยกเลิกเพิ่มหนี้รายได้อื่น"],
  [260, "รายจ่ายอื่น"],
  [261, "ยกเลิกค่าใช้จ่ายอื่น"],
  [262, "ลดหนี้ค่าใช้จ่ายอื่น"],
  [263, "ยกเลิกลดหนี้ค่าใช้จ่ายอื่น"],
  [264, "เพิ่มหนี้ค่าใช้จ่ายอื่น"],
  [265, "ยกเลิกเพิ่มหนี้ค่าใช้จ่ายอื่น"],
  [300, "เบิกเงินสดย่อย"],
  [301, "รับคืนเงินสดย่อย"],
  [302, "ยกเลิกเบิกเงินสดย่อย"],
  [303, "ยกเลิกรับคืนเงินสดย่อย"],
  [401, "ฝากเงิน"],
  [402, "ถอนเงิน"],
  [403, "ยกเลิกฝากเงิน"],
  [404, "ยกเลิกถอนเงิน"],
  [405, "เช็ครับยกมา"],
  [406, "เช็คจ่ายยกมา"],
  [407, "ยกเลิกเช็คจ่ายยกมา"],
  [408, "ยกเลิกเช็ครับยกมา"],
  [410, "เช็ครับฝาก"],
  [411, "เช็ครับผ่าน"],
  [412, "เช็ครับคืน"],
  [413, "เช็ครับยกเลิก"],
  [414, "เช็ครับเข้าใหม่"],
  [416, "เปลี่ยนเช็ค"],
  [418, "เช็ครับคืน/ตั้งหนี้ใหม่"],
  [422, "โอนออก"],
  [423, "ยกเลิกโอนเงินออกธนาคาร"],
  [430, "ยกเลิกฝากเช็ครับ"],
  [431, "ยกเลิกผ่านเช็ครับ"],
  [432, "ยกเลิกคืนเช็ครับ"],
  [433, "ยกเลิกเช็ครับยกเลิก"],
  [436, "ยกเลิกเปลี่ยนเช็ครับ"],
  [451, "เช็คจ่ายผ่าน"],
  [452, "เช็คขาดสิทธิ์"],
  [453, "เช็คจ่ายคืน"],
  [456, "เปลี่ยนเช็ค"],
  [461, "ขึ้นเงินบัตรเครดิต"],
  [462, "ยกเลิกบัตรเครดิต"],
  [471, "ยกเลิกเช็คจ่ายผ่าน"],
  [472, "ยกเลิกเช็คจ่ายยกเลิก"],
  [473, "ยกเลิกเช็คจ่ายคืน"],
  [476, "ยกเลิกเปลี่ยนเช็คจ่าย"],
  [602, "ยกมาเงินสด"],
  [604, "เงินฝากธนาคารยกมา"]
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

function getPeriod(input: CashBankQueryInput): CashBankPeriod {
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
  return cashBankMenus.find((menu) => menu.id === menuId) ?? cashBankMenus[0];
}

export function cashBankDocumentFlags(menu: CashBankMenu) {
  return Array.from(new Set([...menu.flags, ...(menu.cancel_flags ?? [])]));
}

export function isCashBankCancelFlag(flag: number) {
  return CASH_BANK_CANCEL_FLAGS.includes(flag);
}

function cashBankFlagLabel(flag: number) {
  return cashBankFlagLabels.get(flag) ?? `trans_flag ${flag}`;
}

function cashBankMenuLabelByFlag(flag: number) {
  return (
    cashBankMenus.find(
      (menu) =>
        menu.source === "ic_trans" &&
        (menu.flags.includes(flag) || menu.cancel_flags?.includes(flag))
    )?.label ?? "เอกสารเงินสด/ธนาคาร"
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

function mapDocument(row: CashBankDocumentRow): CashBankDocument {
  const transFlag = numberValue(row.trans_flag);
  return {
    ...row,
    trans_flag: transFlag,
    menu_label: cashBankMenuLabelByFlag(transFlag),
    flag_label: cashBankFlagLabel(transFlag),
    is_cancel_flag: isCashBankCancelFlag(transFlag),
    doc_time: row.doc_time ?? "",
    doc_ref: row.doc_ref ?? "",
    description: row.description ?? "",
    party_code: row.party_code ?? "",
    party_name: row.party_name ?? "",
    pass_book_code: row.pass_book_code ?? "",
    pass_book_name: row.pass_book_name ?? "",
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
    line_count: numberValue(row.line_count),
    detail_amount: numberValue(row.detail_amount),
    bank_info: row.bank_info ?? "",
    sample_detail: row.sample_detail ?? ""
  };
}

function mapLine(row: CashBankDocumentLineRow): CashBankDocumentLine {
  return {
    line_number: numberValue(row.line_number),
    item_code: row.item_code ?? "",
    item_name: row.item_name ?? "",
    ref_doc_no: row.ref_doc_no ?? "",
    ref_doc_date: row.ref_doc_date ?? "",
    bank_name: row.bank_name ?? "",
    bank_branch: row.bank_branch ?? "",
    chq_number: row.chq_number ?? "",
    credit_card_no: row.credit_card_no ?? "",
    sum_amount: numberValue(row.sum_amount),
    fee_amount: numberValue(row.fee_amount),
    other_amount: numberValue(row.other_amount),
    tax_at_pay: numberValue(row.tax_at_pay),
    remark: row.remark ?? "",
    status: numberValue(row.status),
    last_status: numberValue(row.last_status)
  };
}

function mapCheque(row: CashBankCheque): CashBankCheque {
  return {
    chq_type: numberValue(row.chq_type),
    chq_number: row.chq_number ?? "",
    chq_get_date: row.chq_get_date ?? "",
    chq_due_date: row.chq_due_date ?? "",
    doc_ref: row.doc_ref ?? "",
    book_code: row.book_code ?? "",
    pass_book_code: row.pass_book_code ?? "",
    pass_book_name: row.pass_book_name ?? "",
    bank_code: row.bank_code ?? "",
    bank_name: row.bank_name ?? "",
    bank_branch: row.bank_branch ?? "",
    amount: numberValue(row.amount),
    currency_code: row.currency_code ?? "",
    owner_name: row.owner_name ?? "",
    person_code: row.person_code ?? "",
    ap_ar_code: row.ap_ar_code ?? "",
    ap_ar_name: row.ap_ar_name ?? "",
    remark: row.remark ?? "",
    status: numberValue(row.status),
    trans_flag: numberValue(row.trans_flag)
  };
}

function detailSampleExpression(columns: Set<string>) {
  const parts = ["NULLIF(d.item_name, '')", "NULLIF(d.item_code, '')", "NULLIF(d.remark, '')"];
  if (hasColumn(columns, "chq_number")) parts.push("NULLIF(d.chq_number, '')");
  if (hasColumn(columns, "credit_card_no")) parts.push("NULLIF(d.credit_card_no, '')");
  if (hasColumn(columns, "bank_name")) parts.push("NULLIF(d.bank_name, '')");
  return `COALESCE(MIN(COALESCE(${parts.join(", ")})), '')`;
}

function detailBankInfoExpression(columns: Set<string>) {
  if (!hasColumn(columns, "bank_name") && !hasColumn(columns, "bank_branch")) return "''";
  const bankName = hasColumn(columns, "bank_name") ? "NULLIF(d.bank_name, '')" : "NULL::text";
  const bankBranch = hasColumn(columns, "bank_branch") ? "NULLIF(d.bank_branch, '')" : "NULL::text";
  return `COALESCE(STRING_AGG(DISTINCT NULLIF(CONCAT_WS('/', ${bankName}, ${bankBranch}), ''), ', '), '')`;
}

function detailSearchCondition(columns: Set<string>) {
  const fields = [
    "COALESCE(dx.item_code, '')",
    "COALESCE(dx.item_name, '')",
    "COALESCE(dx.ref_doc_no, '')",
    "COALESCE(dx.remark, '')"
  ];
  if (hasColumn(columns, "chq_number")) fields.push("COALESCE(dx.chq_number, '')");
  if (hasColumn(columns, "credit_card_no")) fields.push("COALESCE(dx.credit_card_no, '')");
  if (hasColumn(columns, "bank_name")) fields.push("COALESCE(dx.bank_name, '')");
  if (hasColumn(columns, "bank_branch")) fields.push("COALESCE(dx.bank_branch, '')");

  return fields.map((field) => `${field} ILIKE '%' || $4::text || '%'`).join("\n                  OR ");
}

async function getDocuments(
  providerCode: string,
  databaseName: string,
  period: CashBankPeriod,
  flags: number[],
  search: string
): Promise<CashBankDocument[]> {
  if (flags.length === 0) return [];
  const [transColumns, detailColumns] = await Promise.all([
    tableColumns(providerCode, databaseName, "ic_trans"),
    tableColumns(providerCode, databaseName, "ic_trans_detail")
  ]);

  const partyExpr = hasColumn(transColumns, "ap_ar_code")
    ? "COALESCE(NULLIF(t.cust_code, ''), NULLIF(t.ap_ar_code, ''), '')"
    : "COALESCE(t.cust_code, '')";
  const descriptionSelect = optionalTextColumn("t", "description", transColumns);
  const passBookSelect = optionalTextColumn("t", "pass_book_code", transColumns);
  const detailSearch = detailSearchCondition(detailColumns);

  const rows = await queryProviderDatabase<CashBankDocumentRow>(
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
          ${descriptionSelect},
          ${partyExpr} AS party_code,
          COALESCE(NULLIF(ar.name_1, ''), NULLIF(ap.name_1, ''), NULLIF(${partyExpr}, ''), '') AS party_name,
          ${passBookSelect},
          COALESCE(NULLIF(pb.name_1, ''), NULLIF(t.pass_book_code, ''), '') AS pass_book_name,
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
          COALESCE(t.total_amount, 0) AS total_amount
        FROM ic_trans t
        LEFT JOIN erp_pass_book pb ON pb.code = t.pass_book_code
        LEFT JOIN ar_customer ar ON ar.code = ${partyExpr}
        LEFT JOIN ap_supplier ap ON ap.code = ${partyExpr}
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = ANY($1::int[])
          -- Document browser intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_date >= $2::date
          AND t.doc_date < $3::date
          AND (
            $4::text = ''
            OR t.doc_no ILIKE '%' || $4::text || '%'
            OR COALESCE(t.doc_ref, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.remark, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(t.pass_book_code, '') ILIKE '%' || $4::text || '%'
            OR ${partyExpr} ILIKE '%' || $4::text || '%'
            OR COALESCE(ar.name_1, '') ILIKE '%' || $4::text || '%'
            OR COALESCE(ap.name_1, '') ILIKE '%' || $4::text || '%'
            OR EXISTS (
              SELECT 1
              FROM ic_trans_detail dx
              WHERE dx.trans_flag = t.trans_flag
                AND dx.doc_no = t.doc_no
                AND dx.doc_date = t.doc_date
                AND (
                  ${detailSearch}
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
          COALESCE(SUM(d.sum_amount), 0) AS detail_amount,
          ${detailBankInfoExpression(detailColumns)} AS bank_info,
          ${detailSampleExpression(detailColumns)} AS sample_detail
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
        selected_docs.description,
        selected_docs.party_code,
        selected_docs.party_name,
        selected_docs.pass_book_code,
        selected_docs.pass_book_name,
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
        COALESCE(detail.line_count, 0) AS line_count,
        COALESCE(detail.detail_amount, 0) AS detail_amount,
        COALESCE(detail.bank_info, '') AS bank_info,
        COALESCE(detail.sample_detail, '') AS sample_detail
      FROM selected_docs
      LEFT JOIN detail
        ON detail.trans_flag = selected_docs.trans_flag
        AND detail.doc_no = selected_docs.doc_no
        AND detail.doc_date = selected_docs.doc_date
      ORDER BY selected_docs.doc_date DESC, selected_docs.doc_time DESC, selected_docs.doc_no DESC
    `,
    [flags, period.start_date, period.end_exclusive, search]
  );

  return rows.map(mapDocument);
}

async function getCheques(
  providerCode: string,
  databaseName: string,
  period: CashBankPeriod,
  chequeType: 1 | 2,
  search: string
): Promise<CashBankCheque[]> {
  const rows = await queryProviderDatabase<CashBankCheque>(
    providerCode,
    databaseName,
    `
      SELECT
        COALESCE(c.chq_type, 0) AS chq_type,
        COALESCE(c.chq_number, '') AS chq_number,
        COALESCE(c.chq_get_date::text, '') AS chq_get_date,
        COALESCE(c.chq_due_date::text, '') AS chq_due_date,
        COALESCE(c.doc_ref, '') AS doc_ref,
        COALESCE(c.book_code, '') AS book_code,
        COALESCE(c.pass_book_code, '') AS pass_book_code,
        COALESCE(NULLIF(pb.name_1, ''), NULLIF(c.pass_book_code, ''), '') AS pass_book_name,
        COALESCE(c.bank_code, '') AS bank_code,
        COALESCE(NULLIF(b.name_1, ''), NULLIF(c.bank_code, ''), '') AS bank_name,
        COALESCE(c.bank_branch, '') AS bank_branch,
        COALESCE(c.amount, 0) AS amount,
        COALESCE(c.currency_code, '') AS currency_code,
        COALESCE(c.owner_name, '') AS owner_name,
        COALESCE(c.person_code, '') AS person_code,
        COALESCE(c.ap_ar_code, '') AS ap_ar_code,
        COALESCE(c.ap_ar_name, '') AS ap_ar_name,
        COALESCE(c.remark, '') AS remark,
        COALESCE(c.status, 0) AS status,
        COALESCE(c.trans_flag, 0) AS trans_flag
      FROM cb_chq_list c
      LEFT JOIN erp_pass_book pb ON pb.code = c.pass_book_code
      LEFT JOIN erp_bank b ON b.code = c.bank_code
      WHERE c.chq_type = $1::int
        AND COALESCE(c.chq_get_date, c.chq_due_date)::date >= $2::date
        AND COALESCE(c.chq_get_date, c.chq_due_date)::date < $3::date
        AND (
          $4::text = ''
          OR COALESCE(c.chq_number, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.doc_ref, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.owner_name, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.person_code, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.ap_ar_code, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.ap_ar_name, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.bank_code, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(b.name_1, '') ILIKE '%' || $4::text || '%'
          OR COALESCE(c.remark, '') ILIKE '%' || $4::text || '%'
        )
      ORDER BY COALESCE(c.chq_get_date, c.chq_due_date) DESC, c.chq_number DESC
      LIMIT 150
    `,
    [chequeType, period.start_date, period.end_exclusive, search]
  );

  return rows.map(mapCheque);
}

export async function getCashBankDashboard(
  providerCode: string,
  databaseName: string,
  input: CashBankQueryInput
): Promise<CashBankDashboardData> {
  const period = getPeriod(input);
  const menu = selectedMenu(input.menu);
  const search = input.search?.trim() ?? "";

  const companyNamePromise = getCompanyName(providerCode, databaseName);
  const documentsPromise =
    menu.source === "ic_trans"
      ? getDocuments(providerCode, databaseName, period, cashBankDocumentFlags(menu), search)
      : Promise.resolve([]);
  const chequesPromise =
    menu.source === "cheque" && menu.cheque_type
      ? getCheques(providerCode, databaseName, period, menu.cheque_type, search)
      : Promise.resolve([]);

  const [companyName, documents, cheques] = await Promise.all([
    companyNamePromise,
    documentsPromise,
    chequesPromise
  ]);

  return {
    period,
    company_name: companyName,
    selected_menu: menu,
    documents,
    cheques,
    filters: {
      menu: menu.id,
      search,
      start_date: period.start_date,
      end_date: period.end_date
    }
  };
}

function normalizeHeader(
  header: CashBankDocumentHeaderRow,
  menu: CashBankMenu,
  transFlag: number
): CashBankDocumentHeader {
  return {
    ...header,
    trans_flag: transFlag,
    menu_label: menu.label,
    flag_label: cashBankFlagLabel(transFlag),
    is_cancel_flag: isCashBankCancelFlag(transFlag),
    doc_time: header.doc_time ?? "",
    doc_ref: header.doc_ref ?? "",
    doc_ref_date: header.doc_ref_date ?? "",
    tax_doc_no: header.tax_doc_no ?? "",
    tax_doc_date: header.tax_doc_date ?? "",
    description: header.description ?? "",
    party_code: header.party_code ?? "",
    party_name: header.party_name ?? "",
    pass_book_code: header.pass_book_code ?? "",
    pass_book_name: header.pass_book_name ?? "",
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

export async function getCashBankDocumentDetail(
  providerCode: string,
  databaseName: string,
  input: CashBankDocumentDetailInput
): Promise<CashBankDocumentDetailData | null> {
  const menu = selectedMenu(input.menu);
  const flag = parseDetailFlag(input.flag);
  const docNo = normalizeDocNo(input.docNo);
  const docDate = normalizeDetailDate(input.docDate);

  if (menu.source !== "ic_trans") return null;
  if (flag === null || !docNo || !docDate) return null;
  if (!cashBankDocumentFlags(menu).includes(flag)) return null;

  const [transColumns, detailColumns] = await Promise.all([
    tableColumns(providerCode, databaseName, "ic_trans"),
    tableColumns(providerCode, databaseName, "ic_trans_detail")
  ]);
  const partyExpr = hasColumn(transColumns, "ap_ar_code")
    ? "COALESCE(NULLIF(t.cust_code, ''), NULLIF(t.ap_ar_code, ''), '')"
    : "COALESCE(t.cust_code, '')";

  const [companyName, headerRows, lineRows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<CashBankDocumentHeaderRow>(
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
          ${optionalTextColumn("t", "description", transColumns)},
          ${partyExpr} AS party_code,
          COALESCE(NULLIF(ar.name_1, ''), NULLIF(ap.name_1, ''), NULLIF(${partyExpr}, ''), '') AS party_name,
          ${optionalTextColumn("t", "pass_book_code", transColumns)},
          COALESCE(NULLIF(pb.name_1, ''), NULLIF(t.pass_book_code, ''), '') AS pass_book_name,
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
        LEFT JOIN erp_pass_book pb ON pb.code = t.pass_book_code
        LEFT JOIN ar_customer ar ON ar.code = ${partyExpr}
        LEFT JOIN ap_supplier ap ON ap.code = ${partyExpr}
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
        LIMIT 1
      `,
      [flag, docNo, docDate]
    ),
    queryProviderDatabase<CashBankDocumentLineRow>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(d.line_number, 0) AS line_number,
          COALESCE(d.item_code, '') AS item_code,
          COALESCE(d.item_name, '') AS item_name,
          COALESCE(d.ref_doc_no, '') AS ref_doc_no,
          COALESCE(d.ref_doc_date::text, '') AS ref_doc_date,
          ${optionalTextColumn("d", "bank_name", detailColumns)},
          ${optionalTextColumn("d", "bank_branch", detailColumns)},
          ${optionalTextColumn("d", "chq_number", detailColumns)},
          ${optionalTextColumn("d", "credit_card_no", detailColumns)},
          COALESCE(d.sum_amount, 0) AS sum_amount,
          ${optionalNumberColumn("d", "fee_amount", detailColumns)},
          ${optionalNumberColumn("d", "other_amount", detailColumns)},
          ${optionalNumberColumn("d", "tax_at_pay", detailColumns)},
          COALESCE(d.remark, '') AS remark,
          COALESCE(d.status, 0) AS status,
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

  const lines = lineRows.map(mapLine);

  return {
    company_name: companyName,
    selected_menu: menu,
    header: normalizeHeader(header, menu, numberValue(header.trans_flag)),
    lines,
    totals: {
      line_count: lines.length,
      line_amount: lines.reduce((sum, line) => sum + line.sum_amount, 0),
      fee_amount: lines.reduce((sum, line) => sum + line.fee_amount, 0),
      other_amount: lines.reduce((sum, line) => sum + line.other_amount, 0),
      tax_at_pay: lines.reduce((sum, line) => sum + line.tax_at_pay, 0)
    }
  };
}

export async function getCashBankChequeDetail(
  providerCode: string,
  databaseName: string,
  input: CashBankChequeDetailInput
): Promise<CashBankChequeDetailData | null> {
  const chqType = Number(input.type);
  if (chqType !== 1 && chqType !== 2) return null;
  const chqNumber = input.chqNumber?.trim();
  if (!chqNumber) return null;
  const getDate = parseInputDate(input.getDate);

  const [companyName, rows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<CashBankCheque>(
      providerCode,
      databaseName,
      `
        SELECT
          COALESCE(c.chq_type, 0) AS chq_type,
          COALESCE(c.chq_number, '') AS chq_number,
          COALESCE(c.chq_get_date::text, '') AS chq_get_date,
          COALESCE(c.chq_due_date::text, '') AS chq_due_date,
          COALESCE(c.doc_ref, '') AS doc_ref,
          COALESCE(c.book_code, '') AS book_code,
          COALESCE(c.pass_book_code, '') AS pass_book_code,
          COALESCE(NULLIF(pb.name_1, ''), NULLIF(c.pass_book_code, ''), '') AS pass_book_name,
          COALESCE(c.bank_code, '') AS bank_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(c.bank_code, ''), '') AS bank_name,
          COALESCE(c.bank_branch, '') AS bank_branch,
          COALESCE(c.amount, 0) AS amount,
          COALESCE(c.currency_code, '') AS currency_code,
          COALESCE(c.owner_name, '') AS owner_name,
          COALESCE(c.person_code, '') AS person_code,
          COALESCE(c.ap_ar_code, '') AS ap_ar_code,
          COALESCE(c.ap_ar_name, '') AS ap_ar_name,
          COALESCE(c.remark, '') AS remark,
          COALESCE(c.status, 0) AS status,
          COALESCE(c.trans_flag, 0) AS trans_flag
        FROM cb_chq_list c
        LEFT JOIN erp_pass_book pb ON pb.code = c.pass_book_code
        LEFT JOIN erp_bank b ON b.code = c.bank_code
        WHERE c.chq_type = $1::int
          AND c.chq_number = $2::text
          AND ($3::date IS NULL OR COALESCE(c.chq_get_date, c.chq_due_date)::date = $3::date)
        ORDER BY COALESCE(c.chq_get_date, c.chq_due_date) DESC
        LIMIT 1
      `,
      [chqType, chqNumber, getDate]
    )
  ]);

  const cheque = rows[0];
  if (!cheque) return null;

  return {
    company_name: companyName,
    cheque: mapCheque(cheque)
  };
}
