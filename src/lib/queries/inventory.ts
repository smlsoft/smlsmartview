import { queryProviderDatabase } from "@/lib/db";

type Numeric = string | number | null | undefined;

const tableColumnCache = new Map<string, Promise<Set<string>>>();

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
  cancel_flags?: number[];
  group: "สินค้า" | "คลัง/WMS" | "รวม";
  movement: "in" | "out" | "neutral" | "mixed";
};

export type InventoryStatusFields = {
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

export type InventoryDocument = InventoryStatusFields & {
  trans_flag: number;
  menu_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  cust_code: string;
  branch_name: string;
  remark: string;
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

type InventoryDocumentRow = Omit<
  InventoryDocument,
  "menu_label" | "is_cancel_flag"
> & {
  doc_date: string;
};

export type InventoryDashboardData = {
  period: InventoryPeriod;
  company_name: string;
  selected_menu: InventoryMenu;
  documents: InventoryDocument[];
  filters: {
    menu: string;
    search: string;
    start_date: string;
    end_date: string;
  };
};

export type InventoryDocumentHeader = InventoryStatusFields & {
  trans_flag: number;
  menu_label: string;
  doc_no: string;
  doc_date: string;
  doc_time: string;
  doc_ref: string;
  doc_ref_date: string;
  doc_ref_trans: string;
  cust_code: string;
  branch_code: string;
  branch_name: string;
  remark: string;
  vat_type: number;
  currency_code: string;
  total_value: number;
  total_discount: number;
  total_before_vat: number;
  total_vat_value: number;
  total_after_vat: number;
  total_amount: number;
  balance_amount: number;
  total_cost: number;
};

type InventoryDocumentHeaderRow = Omit<
  InventoryDocumentHeader,
  "menu_label" | "is_cancel_flag"
>;

export type InventoryDocumentLine = {
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
  wh_code_2: string;
  shelf_code_2: string;
  ref_doc_no: string;
  ref_doc_date: string;
  remark: string;
  last_status: number;
};

type InventoryDocumentLineRow = Omit<InventoryDocumentLine, "base_qty">;

export type InventoryDocumentDetailData = {
  company_name: string;
  selected_menu: InventoryMenu;
  header: InventoryDocumentHeader;
  lines: InventoryDocumentLine[];
  totals: {
    line_count: number;
    item_qty: number;
    item_amount: number;
    item_cost: number;
  };
};

export type InventoryQueryInput = {
  menu?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type InventoryDocumentDetailInput = {
  menu?: string;
  flag?: string;
  docNo?: string;
  docDate?: string;
};

export type InventoryMasterQueryInput = {
  search?: string;
};

export type InventoryItem = {
  code: string;
  name_1: string;
  name_2: string;
  short_name: string;
  item_type: number;
  item_category: string;
  group_main: string;
  group_sub: string;
  item_brand: string;
  unit_standard: string;
  unit_standard_name: string;
  balance_qty: number;
  average_cost: number;
  standard_cost: number;
  last_movement_date: string;
  item_status: number;
  status: number;
  remark: string;
  barcode_count: number;
  price_count: number;
  sample_barcode: string;
};

type InventoryItemRow = InventoryItem;

export type InventoryItemsData = {
  company_name: string;
  items: InventoryItem[];
  filters: {
    search: string;
  };
};

export type InventoryBarcode = {
  barcode: string;
  description: string;
  unit_code: string;
  price: number;
  price_2: number;
  price_3: number;
  price_4: number;
  price_member: number;
  price_member_2: number;
  status: number;
};

type InventoryBarcodeRow = InventoryBarcode;

export type InventoryPrice = {
  ic_code: string;
  item_name: string;
  unit_code: string;
  from_date: string;
  to_date: string;
  sale_type: number;
  price_type: number;
  price_mode: number;
  cust_code: string;
  cust_group_1: string;
  sale_price1: number;
  sale_price2: number;
  status: number;
  line_number: number;
};

type InventoryPriceRow = InventoryPrice;

export type InventoryPricesData = {
  company_name: string;
  prices: InventoryPrice[];
  filters: {
    search: string;
  };
};

export type InventoryItemDetailData = {
  company_name: string;
  item: InventoryItem;
  barcodes: InventoryBarcode[];
  prices: InventoryPrice[];
};

const INTERNAL_DOCUMENT_FLAGS = [
  54, 56, 58, 60, 66, 68, 70, 72, 76, 122, 124, 270, 701, 501, 502, 503, 505,
  509, 521, 522, 523
];

const INTERNAL_CANCEL_DOCUMENT_FLAGS = [
  55, 57, 59, 61, 65, 67, 69, 71, 73, 123, 125
];

export const inventoryMenus: InventoryMenu[] = [
  {
    id: "all",
    label: "เอกสารสินค้า/คลังทั้งหมด",
    erp_menu: "menu_ic + menu_wh",
    flags: INTERNAL_DOCUMENT_FLAGS,
    cancel_flags: INTERNAL_CANCEL_DOCUMENT_FLAGS,
    group: "รวม",
    movement: "mixed"
  },
  {
    id: "opening",
    label: "สินค้า/วัตถุดิบ คงเหลือยกมา",
    erp_menu: "menu_ic_stk_balance",
    flags: [54],
    cancel_flags: [55],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "finish-receive",
    label: "รับสินค้าสำเร็จรูป",
    erp_menu: "menu_ic_finish_receive",
    flags: [60],
    cancel_flags: [61],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "request-issue",
    label: "ขอเบิกสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_request_issue",
    flags: [122],
    cancel_flags: [123],
    group: "สินค้า",
    movement: "neutral"
  },
  {
    id: "issue",
    label: "เบิกสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_issue",
    flags: [56],
    cancel_flags: [57],
    group: "สินค้า",
    movement: "out"
  },
  {
    id: "return-receive",
    label: "รับคืนสินค้า/วัตถุดิบ จากการเบิก",
    erp_menu: "menu_ic_return_receive",
    flags: [58],
    cancel_flags: [59],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "request-transfer",
    label: "ขอโอนสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_request_transfer",
    flags: [124],
    cancel_flags: [125],
    group: "สินค้า",
    movement: "neutral"
  },
  {
    id: "transfer-out",
    label: "โอนสินค้า/วัตถุดิบ",
    erp_menu: "menu_ic_transfer_wh_out",
    flags: [72],
    cancel_flags: [73],
    group: "สินค้า",
    movement: "out"
  },
  {
    id: "transfer-in",
    label: "รับโอนเข้า",
    erp_menu: "สินค้า_โอนเข้า",
    flags: [70],
    cancel_flags: [71],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "stock-check-request",
    label: "ขอตรวจนับสินค้า",
    erp_menu: "menu_ic_stk_count_main",
    flags: [64],
    cancel_flags: [65],
    group: "สินค้า",
    movement: "neutral"
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
    label: "ปรับปรุงสต็อกสินค้า/วัตถุดิบ (เพิ่ม)",
    erp_menu: "menu_ic_stk_adjust",
    flags: [66],
    cancel_flags: [67],
    group: "สินค้า",
    movement: "in"
  },
  {
    id: "adjust-minus",
    label: "ปรับปรุงสต็อกสินค้า/วัตถุดิบ (ลด)",
    erp_menu: "menu_ic_stk_adjust_subtract",
    flags: [68],
    cancel_flags: [69],
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

export function documentFlags(menu: InventoryMenu) {
  return Array.from(new Set([...menu.flags, ...(menu.cancel_flags ?? [])]));
}

export function isCancelFlag(flag: number) {
  return INTERNAL_CANCEL_DOCUMENT_FLAGS.includes(flag);
}

async function getCompanyName(providerCode: string, databaseName: string) {
  const rows = await queryProviderDatabase<{ company_name_1: string | null }>(
    providerCode,
    databaseName,
    "SELECT company_name_1 FROM erp_company_profile LIMIT 1"
  );
  return rows[0]?.company_name_1?.trim() || databaseName.toUpperCase();
}

function menuLabelByFlag(flag: number) {
  return (
    inventoryMenus.find(
      (menu) =>
        menu.id !== "all" &&
        (menu.flags.includes(flag) || menu.cancel_flags?.includes(flag))
    )
      ?.label ?? "เอกสารสินค้า"
  );
}

function parseDetailFlag(value: string | undefined) {
  const flag = Number(value);
  if (!Number.isInteger(flag)) return null;
  return flag;
}

function normalizeDetailDate(value: string | undefined) {
  return parseInputDate(value);
}

function normalizeDocNo(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function itemSearch(input: InventoryMasterQueryInput) {
  return input.search?.trim() ?? "";
}

function normalizeItemCode(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next || null;
}

function mapInventoryItem(row: InventoryItemRow): InventoryItem {
  return {
    code: row.code ?? "",
    name_1: row.name_1 ?? "",
    name_2: row.name_2 ?? "",
    short_name: row.short_name ?? "",
    item_type: numberValue(row.item_type),
    item_category: row.item_category ?? "",
    group_main: row.group_main ?? "",
    group_sub: row.group_sub ?? "",
    item_brand: row.item_brand ?? "",
    unit_standard: row.unit_standard ?? "",
    unit_standard_name: row.unit_standard_name ?? "",
    balance_qty: numberValue(row.balance_qty),
    average_cost: numberValue(row.average_cost),
    standard_cost: numberValue(row.standard_cost),
    last_movement_date: row.last_movement_date ?? "",
    item_status: numberValue(row.item_status),
    status: numberValue(row.status),
    remark: row.remark ?? "",
    barcode_count: numberValue(row.barcode_count),
    price_count: numberValue(row.price_count),
    sample_barcode: row.sample_barcode ?? ""
  };
}

function mapInventoryPrice(row: InventoryPriceRow): InventoryPrice {
  return {
    ic_code: row.ic_code ?? "",
    item_name: row.item_name ?? "",
    unit_code: row.unit_code ?? "",
    from_date: row.from_date ?? "",
    to_date: row.to_date ?? "",
    sale_type: numberValue(row.sale_type),
    price_type: numberValue(row.price_type),
    price_mode: numberValue(row.price_mode),
    cust_code: row.cust_code ?? "",
    cust_group_1: row.cust_group_1 ?? "",
    sale_price1: numberValue(row.sale_price1),
    sale_price2: numberValue(row.sale_price2),
    status: numberValue(row.status),
    line_number: numberValue(row.line_number)
  };
}

function mapInventoryBarcode(row: InventoryBarcodeRow): InventoryBarcode {
  return {
    barcode: row.barcode ?? "",
    description: row.description ?? "",
    unit_code: row.unit_code ?? "",
    price: numberValue(row.price),
    price_2: numberValue(row.price_2),
    price_3: numberValue(row.price_3),
    price_4: numberValue(row.price_4),
    price_member: numberValue(row.price_member),
    price_member_2: numberValue(row.price_member_2),
    status: numberValue(row.status)
  };
}

async function getItems(
  providerCode: string,
  databaseName: string,
  search: string,
  itemCode?: string
) {
  const [itemColumns, barcodeColumns, priceColumns] = await Promise.all([
    tableColumns(providerCode, databaseName, "ic_inventory"),
    tableColumns(providerCode, databaseName, "ic_inventory_barcode"),
    tableColumns(providerCode, databaseName, "ic_inventory_price")
  ]);

  const barcodeItemColumn = barcodeColumns.has("ic_code") ? "ic_code" : "item_code";
  const priceItemColumn = priceColumns.has("ic_code") ? "ic_code" : "item_code";

  const rows = await queryProviderDatabase<InventoryItemRow>(
    providerCode,
    databaseName,
    `
      SELECT
        i.code,
        COALESCE(i.name_1, '') AS name_1,
        COALESCE(i.name_2, '') AS name_2,
        ${optionalTextColumn("i", "short_name", itemColumns)},
        ${optionalNumberColumn("i", "item_type", itemColumns)},
        ${optionalTextColumn("i", "item_category", itemColumns)},
        ${optionalTextColumn("i", "group_main", itemColumns)},
        ${optionalTextColumn("i", "group_sub", itemColumns)},
        ${optionalTextColumn("i", "item_brand", itemColumns)},
        ${optionalTextColumn("i", "unit_standard", itemColumns)},
        ${optionalTextColumn("i", "unit_standard_name", itemColumns)},
        ${optionalNumberColumn("i", "balance_qty", itemColumns)},
        ${optionalNumberColumn("i", "average_cost", itemColumns)},
        ${optionalNumberColumn("i", "standard_cost", itemColumns)},
        ${optionalDateTextColumn("i", "last_movement_date", itemColumns)},
        ${optionalNumberColumn("i", "item_status", itemColumns)},
        ${optionalNumberColumn("i", "status", itemColumns)},
        ${optionalTextColumn("i", "remark", itemColumns)},
        (
          SELECT COUNT(*)::int
          FROM ic_inventory_barcode b
          WHERE b.${barcodeItemColumn} = i.code
        ) AS barcode_count,
        (
          SELECT COUNT(*)::int
          FROM ic_inventory_price p
          WHERE p.${priceItemColumn} = i.code
        ) AS price_count,
        COALESCE((
          SELECT b.barcode
          FROM ic_inventory_barcode b
          WHERE b.${barcodeItemColumn} = i.code
          ORDER BY b.barcode
          LIMIT 1
        ), '') AS sample_barcode
      FROM ic_inventory i
      WHERE (
          $1::text = ''
          OR $1::text IS NULL
          OR i.code ILIKE '%' || $1::text || '%'
          OR COALESCE(i.name_1, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(i.name_2, '') ILIKE '%' || $1::text || '%'
          OR EXISTS (
            SELECT 1
            FROM ic_inventory_barcode bx
            WHERE bx.${barcodeItemColumn} = i.code
              AND bx.barcode ILIKE '%' || $1::text || '%'
          )
        )
        AND ($2::text IS NULL OR i.code = $2::text)
      ORDER BY i.code
      LIMIT 150
    `,
    [search, itemCode ?? null]
  );

  return rows
    .filter((row) => (itemCode ? row.code === itemCode : true))
    .map(mapInventoryItem);
}

async function getBarcodesForItem(
  providerCode: string,
  databaseName: string,
  itemCode: string
) {
  const barcodeColumns = await tableColumns(
    providerCode,
    databaseName,
    "ic_inventory_barcode"
  );
  const barcodeItemColumn = barcodeColumns.has("ic_code") ? "ic_code" : "item_code";

  const rows = await queryProviderDatabase<InventoryBarcodeRow>(
    providerCode,
    databaseName,
    `
      SELECT
        ${optionalTextColumn("b", "barcode", barcodeColumns)},
        ${optionalTextColumn("b", "description", barcodeColumns)},
        ${optionalTextColumn("b", "unit_code", barcodeColumns)},
        ${optionalNumberColumn("b", "price", barcodeColumns)},
        ${optionalNumberColumn("b", "price_2", barcodeColumns)},
        ${optionalNumberColumn("b", "price_3", barcodeColumns)},
        ${optionalNumberColumn("b", "price_4", barcodeColumns)},
        ${optionalNumberColumn("b", "price_member", barcodeColumns)},
        ${optionalNumberColumn("b", "price_member_2", barcodeColumns)},
        ${optionalNumberColumn("b", "status", barcodeColumns)}
      FROM ic_inventory_barcode b
      WHERE b.${barcodeItemColumn} = $1::text
      ORDER BY b.barcode
      LIMIT 150
    `,
    [itemCode]
  );

  return rows.map(mapInventoryBarcode);
}

async function getPrices(
  providerCode: string,
  databaseName: string,
  search: string,
  itemCode?: string
) {
  const priceColumns = await tableColumns(
    providerCode,
    databaseName,
    "ic_inventory_price"
  );
  const priceItemColumn = priceColumns.has("ic_code") ? "ic_code" : "item_code";

  const rows = await queryProviderDatabase<InventoryPriceRow>(
    providerCode,
    databaseName,
    `
      SELECT
        p.${priceItemColumn} AS ic_code,
        COALESCE(i.name_1, '') AS item_name,
        ${optionalTextColumn("p", "unit_code", priceColumns)},
        ${optionalDateTextColumn("p", "from_date", priceColumns)},
        ${optionalDateTextColumn("p", "to_date", priceColumns)},
        ${optionalNumberColumn("p", "sale_type", priceColumns)},
        ${optionalNumberColumn("p", "price_type", priceColumns)},
        ${optionalNumberColumn("p", "price_mode", priceColumns)},
        ${optionalTextColumn("p", "cust_code", priceColumns)},
        ${optionalTextColumn("p", "cust_group_1", priceColumns)},
        ${optionalNumberColumn("p", "sale_price1", priceColumns)},
        ${optionalNumberColumn("p", "sale_price2", priceColumns)},
        ${optionalNumberColumn("p", "status", priceColumns)},
        ${optionalNumberColumn("p", "line_number", priceColumns)}
      FROM ic_inventory_price p
      LEFT JOIN ic_inventory i ON i.code = p.${priceItemColumn}
      WHERE (
          $1::text = ''
          OR $1::text IS NULL
          OR p.${priceItemColumn} ILIKE '%' || $1::text || '%'
          OR COALESCE(i.name_1, '') ILIKE '%' || $1::text || '%'
          OR COALESCE(p.unit_code, '') ILIKE '%' || $1::text || '%'
        )
        AND ($2::text IS NULL OR p.${priceItemColumn} = $2::text)
      ORDER BY p.${priceItemColumn}, p.price_type, p.price_mode, p.unit_code, p.line_number
      LIMIT 150
    `,
    [search, itemCode ?? null]
  );

  return rows
    .filter((row) => (itemCode ? row.ic_code === itemCode : true))
    .map(mapInventoryPrice);
}

async function getDocuments(
  providerCode: string,
  databaseName: string,
  period: InventoryPeriod,
  menu: InventoryMenu,
  search: string
): Promise<InventoryDocument[]> {
  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");

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
          COALESCE(t.total_cost, 0) AS total_cost
        FROM ic_trans t
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
    [documentFlags(menu), period.start_date, period.end_exclusive, search]
  );

  return rows.map((row) => {
    const { trans_flag: documentType, ...document } = row;
    return {
      ...document,
      trans_flag: documentType,
      menu_label: menuLabelByFlag(documentType),
      is_cancel_flag: isCancelFlag(documentType),
      doc_time: document.doc_time ?? "",
      doc_ref: document.doc_ref ?? "",
      cust_code: document.cust_code ?? "",
      branch_name: document.branch_name ?? "",
      remark: document.remark ?? "",
      last_status: numberValue(document.last_status),
      approve_status: numberValue(document.approve_status),
      doc_success: numberValue(document.doc_success),
      used_status: numberValue(document.used_status),
      on_hold: numberValue(document.on_hold),
      expire_status: numberValue(document.expire_status),
      not_approve_1: numberValue(document.not_approve_1),
      user_approve: document.user_approve ?? "",
      user_cancel: document.user_cancel ?? "",
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

export async function getInventoryDocumentDetail(
  providerCode: string,
  databaseName: string,
  input: InventoryDocumentDetailInput
): Promise<InventoryDocumentDetailData | null> {
  const menu = selectedMenu(input.menu);
  const flag = parseDetailFlag(input.flag);
  const docNo = normalizeDocNo(input.docNo);
  const docDate = normalizeDetailDate(input.docDate);

  if (flag === null || !docNo || !docDate) return null;
  if (!documentFlags(menu).includes(flag)) return null;

  const transColumns = await tableColumns(providerCode, databaseName, "ic_trans");

  const [companyName, headerRows, lineRows] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    queryProviderDatabase<InventoryDocumentHeaderRow>(
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
          COALESCE(t.cust_code, '') AS cust_code,
          COALESCE(t.branch_code, '') AS branch_code,
          COALESCE(NULLIF(b.name_1, ''), NULLIF(t.branch_code, ''), '') AS branch_name,
          COALESCE(t.remark, '') AS remark,
          COALESCE(t.vat_type, 0) AS vat_type,
          COALESCE(t.currency_code, '') AS currency_code,
          COALESCE(t.total_value, 0) AS total_value,
          COALESCE(t.total_discount, 0) AS total_discount,
          COALESCE(t.total_before_vat, 0) AS total_before_vat,
          COALESCE(t.total_vat_value, 0) AS total_vat_value,
          COALESCE(t.total_after_vat, 0) AS total_after_vat,
          COALESCE(t.total_amount, 0) AS total_amount,
          COALESCE(t.balance_amount, 0) AS balance_amount,
          COALESCE(t.total_cost, 0) AS total_cost,
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
        LEFT JOIN erp_branch_list b ON b.code = t.branch_code
        WHERE t.trans_flag = $1::int
          -- Document viewer intentionally includes cancelled rows; reports still filter last_status = 0.
          AND t.doc_no = $2::text
          AND t.doc_date = $3::date
        LIMIT 1
      `,
      [flag, docNo, docDate]
    ),
    queryProviderDatabase<InventoryDocumentLineRow>(
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
          COALESCE(d.wh_code_2, '') AS wh_code_2,
          COALESCE(d.shelf_code_2, '') AS shelf_code_2,
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

  const lines = lineRows.map((line) => {
    const qty = numberValue(line.qty);
    const standValue = numberValue(line.stand_value) || 1;
    const divideValue = numberValue(line.divide_value) || 1;
    return {
      line_number: numberValue(line.line_number),
      item_code: line.item_code ?? "",
      item_name: line.item_name ?? "",
      qty,
      unit_code: line.unit_code ?? "",
      stand_value: standValue,
      divide_value: divideValue,
      base_qty: qty * (standValue / divideValue),
      total_qty: numberValue(line.total_qty),
      price: numberValue(line.price),
      discount: line.discount ?? "",
      sum_amount: numberValue(line.sum_amount),
      sum_of_cost: numberValue(line.sum_of_cost),
      wh_code: line.wh_code ?? "",
      shelf_code: line.shelf_code ?? "",
      wh_code_2: line.wh_code_2 ?? "",
      shelf_code_2: line.shelf_code_2 ?? "",
      ref_doc_no: line.ref_doc_no ?? "",
      ref_doc_date: line.ref_doc_date ?? "",
      remark: line.remark ?? "",
      last_status: numberValue(line.last_status)
    };
  });

  return {
    company_name: companyName,
    selected_menu: menu,
    header: {
      trans_flag: numberValue(header.trans_flag),
      menu_label: menuLabelByFlag(flag),
      is_cancel_flag: isCancelFlag(flag),
      doc_no: header.doc_no ?? "",
      doc_date: header.doc_date ?? "",
      doc_time: header.doc_time ?? "",
      doc_ref: header.doc_ref ?? "",
      doc_ref_date: header.doc_ref_date ?? "",
      doc_ref_trans: header.doc_ref_trans ?? "",
      cust_code: header.cust_code ?? "",
      branch_code: header.branch_code ?? "",
      branch_name: header.branch_name ?? "",
      remark: header.remark ?? "",
      vat_type: numberValue(header.vat_type),
      currency_code: header.currency_code ?? "",
      total_value: numberValue(header.total_value),
      total_discount: numberValue(header.total_discount),
      total_before_vat: numberValue(header.total_before_vat),
      total_vat_value: numberValue(header.total_vat_value),
      total_after_vat: numberValue(header.total_after_vat),
      total_amount: numberValue(header.total_amount),
      balance_amount: numberValue(header.balance_amount),
      total_cost: numberValue(header.total_cost),
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
    lines,
    totals: {
      line_count: lines.length,
      item_qty: lines.reduce((sum, line) => sum + line.base_qty, 0),
      item_amount: lines.reduce((sum, line) => sum + line.sum_amount, 0),
      item_cost: lines.reduce((sum, line) => sum + line.sum_of_cost, 0)
    }
  };
}

export async function getInventoryItems(
  providerCode: string,
  databaseName: string,
  input: InventoryMasterQueryInput
): Promise<InventoryItemsData> {
  const search = itemSearch(input);
  const [companyName, items] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getItems(providerCode, databaseName, search)
  ]);

  return {
    company_name: companyName,
    items,
    filters: {
      search
    }
  };
}

export async function getInventoryItemDetail(
  providerCode: string,
  databaseName: string,
  code: string | undefined
): Promise<InventoryItemDetailData | null> {
  const itemCode = normalizeItemCode(code);
  if (!itemCode) return null;

  const [companyName, items, barcodes, prices] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getItems(providerCode, databaseName, "", itemCode),
    getBarcodesForItem(providerCode, databaseName, itemCode),
    getPrices(providerCode, databaseName, "", itemCode)
  ]);

  const item = items[0];
  if (!item) return null;

  return {
    company_name: companyName,
    item,
    barcodes,
    prices
  };
}

export async function getInventoryPrices(
  providerCode: string,
  databaseName: string,
  input: InventoryMasterQueryInput
): Promise<InventoryPricesData> {
  const search = itemSearch(input);
  const [companyName, prices] = await Promise.all([
    getCompanyName(providerCode, databaseName),
    getPrices(providerCode, databaseName, search)
  ]);

  return {
    company_name: companyName,
    prices,
    filters: {
      search
    }
  };
}
