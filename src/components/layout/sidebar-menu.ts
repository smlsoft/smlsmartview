import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Bot,
  BookOpenCheck,
  FileSearch,
  Gauge,
  HandCoins,
  Landmark,
  LineChart,
  Package,
  ReceiptText,
  ShoppingCart
} from "lucide-react";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  enabled?: boolean;
  badge?: string;
  favoriteable?: boolean;
};

export type SidebarNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items: SidebarNavItem[];
};

function item(
  id: string,
  label: string,
  href: string,
  options: Pick<SidebarNavItem, "enabled" | "badge" | "favoriteable"> = {}
): SidebarNavItem {
  return {
    id,
    label,
    href,
    ...options
  };
}

function pending(id: string, label: string, href: string): SidebarNavItem {
  return item(id, label, href, { badge: "รอ" });
}

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Gauge,
    defaultOpen: true,
    items: [
      item("dashboard-overview", "ภาพรวม", "/dashboard", { enabled: true })
    ]
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: Bot,
    items: [
      item("ai-brain-alerts", "Alert สมอง", "/brain-alerts", { badge: "AI" }),
      item("ai-recommendations", "แนะนำระบบ", "/recommendations", {
        badge: "AI"
      }),
      item("ai-search", "ค้นหาข้อมูล", "/search", { badge: "AI" }),
      item("ai-assistant", "ผู้ช่วย AI", "/assistant", { badge: "AI" }),
      item("ai-secretary", "เลขาส่วนตัว", "/secretary", { badge: "AI" }),
      item("ai-customer-chat", "คุยกับลูกค้า", "/customer-chat", {
        badge: "AI"
      }),
      item("ai-kms", "KMS", "/kms", { badge: "AI" }),
      item("ai-mcp-endpoint", "MCP Endpoint", "/mcp-endpoint", {
        badge: "AI"
      }),
      item("ai-brain-graph", "Graph สมอง", "/brain-graph", { badge: "AI" }),
      item("ai-object-storage", "Object Storage", "/object-storage", {
        badge: "AI"
      })
    ]
  },
  {
    id: "inventory",
    label: "ระบบสินค้า",
    icon: Package,
    items: [
      pending("inventory-items", "รายการสินค้า", "/inventory/items"),
      pending("inventory-sale-prices", "ราคาขายสินค้า", "/inventory/prices"),
      item(
        "inventory-opening",
        "สินค้า/วัตถุดิบ คงเหลือยกมา",
        "/inventory?menu=opening",
        { enabled: true }
      ),
      item(
        "inventory-finish-receive",
        "รับสินค้าสำเร็จรูป",
        "/inventory?menu=finish-receive",
        { enabled: true }
      ),
      item(
        "inventory-request-issue",
        "ขอเบิกสินค้า/วัตถุดิบ",
        "/inventory?menu=request-issue",
        { enabled: true }
      ),
      item("inventory-issue", "เบิกสินค้า/วัตถุดิบ", "/inventory?menu=issue", {
        enabled: true
      }),
      item(
        "inventory-return-receive",
        "รับคืนสินค้า/วัตถุดิบ จากการเบิก",
        "/inventory?menu=return-receive",
        { enabled: true }
      ),
      item(
        "inventory-request-transfer",
        "ขอโอนสินค้า/วัตถุดิบ",
        "/inventory?menu=request-transfer",
        { enabled: true }
      ),
      item(
        "inventory-transfer",
        "โอนสินค้า/วัตถุดิบ",
        "/inventory?menu=transfer-out",
        { enabled: true }
      ),
      pending(
        "inventory-request-stock-count",
        "ขอตรวจนับสินค้า",
        "/inventory?menu=request-stock-count"
      ),
      item(
        "inventory-stock-count",
        "ตรวจนับสินค้า",
        "/inventory?menu=stock-count",
        { enabled: true }
      ),
      item(
        "inventory-adjust-plus",
        "ปรับปรุงสต็อกสินค้า/วัตถุดิบ (เพิ่ม)",
        "/inventory?menu=adjust-plus",
        { enabled: true }
      ),
      item(
        "inventory-adjust-minus",
        "ปรับปรุงสต็อกสินค้า/วัตถุดิบ (ลด)",
        "/inventory?menu=adjust-minus",
        { enabled: true }
      )
    ]
  },
  {
    id: "purchase",
    label: "ระบบซื้อ",
    icon: ShoppingCart,
    items: [
      pending("purchase-quote", "ใบเสนอซื้อ", "/purchase?menu=quote"),
      pending("purchase-order", "ใบสั่งซื้อ", "/purchase?menu=order"),
      pending(
        "purchase-advance-opening",
        "จ่ายเงินล่วงหน้ายกมา",
        "/purchase?menu=advance-opening"
      ),
      pending("purchase-advance", "จ่ายเงินล่วงหน้า", "/purchase?menu=advance"),
      pending(
        "purchase-advance-return",
        "รับคืนจ่ายเงินล่วงหน้า",
        "/purchase?menu=advance-return"
      ),
      pending(
        "purchase-deposit-opening",
        "จ่ายเงินมัดจำยกมา",
        "/purchase?menu=deposit-opening"
      ),
      pending("purchase-deposit", "จ่ายเงินมัดจำ", "/purchase?menu=deposit"),
      pending(
        "purchase-deposit-return",
        "รับคืนจ่ายเงินมัดจำ",
        "/purchase?menu=deposit-return"
      ),
      pending("purchase-bill", "ซื้อสินค้า/ตั้งหนี้", "/purchase?menu=bill"),
      pending("purchase-debit-note", "เพิ่มหนี้/ราคาผิด", "/purchase?menu=debit-note"),
      pending("purchase-return", "ส่งคืนสินค้า/ราคาผิด", "/purchase?menu=return"),
      pending(
        "purchase-partial-receive",
        "รับสินค้าแบบทะยอยรับ",
        "/purchase?menu=partial-receive"
      ),
      pending(
        "purchase-partial-return",
        "ส่งคืนสินค้าแบบทะยอยรับ",
        "/purchase?menu=partial-return"
      ),
      pending(
        "purchase-bill-from-receive",
        "ตั้งหนี้จากการรับสินค้า",
        "/purchase?menu=bill-from-receive"
      ),
      pending(
        "purchase-debit-from-bill",
        "เพิ่มหนี้จากใบตั้งหนี้",
        "/purchase?menu=debit-from-bill"
      ),
      pending(
        "purchase-credit-from-bill",
        "ลดหนี้จากใบตั้งหนี้",
        "/purchase?menu=credit-from-bill"
      )
    ]
  },
  {
    id: "sales",
    label: "ระบบขาย",
    icon: ReceiptText,
    items: [
      pending("sales-quotation", "ใบเสนอราคา", "/sales?menu=quotation"),
      pending("sales-reserve-order", "ใบสั่งซื้อ/สั่งจอง", "/sales?menu=reserve-order"),
      pending("sales-order", "ใบสั่งขาย", "/sales?menu=order"),
      pending(
        "sales-advance-opening",
        "รับเงินล่วงหน้ายกมา",
        "/sales?menu=advance-opening"
      ),
      pending("sales-advance", "รับเงินล่วงหน้า", "/sales?menu=advance"),
      pending(
        "sales-advance-return",
        "คืนเงินรับล่วงหน้า",
        "/sales?menu=advance-return"
      ),
      pending(
        "sales-deposit-opening",
        "รับเงินมัดจำล่วงหน้า",
        "/sales?menu=deposit-opening"
      ),
      pending("sales-deposit", "รับเงินมัดจำ", "/sales?menu=deposit"),
      pending(
        "sales-deposit-return",
        "คืนเงินรับมัดจำ",
        "/sales?menu=deposit-return"
      ),
      pending("sales-bill", "ขายสินค้า/บริการ", "/sales?menu=bill"),
      pending("sales-return", "รับคืนสินค้า/ลดหนี้", "/sales?menu=return"),
      pending("sales-debit-note", "เพิ่มหนี้", "/sales?menu=debit-note"),
      pending(
        "sales-pos-tax-invoice-short",
        "รายการใบกำกับภาษีอย่างย่อ",
        "/sales?menu=pos-tax-invoice-short"
      ),
      pending(
        "sales-pos-tax-invoice-full",
        "รายการใบกำกับภาษีอย่างเต็มออกแทน",
        "/sales?menu=pos-tax-invoice-full"
      ),
      pending("sales-change-money", "บันทึกรับเงิน (เงินทอน)", "/sales?menu=change-money"),
      pending("sales-pos-shift-money", "บันทึกส่งเงิน POS", "/sales?menu=pos-shift-money")
    ]
  },
  {
    id: "ap",
    label: "ระบบเจ้าหนี้",
    icon: HandCoins,
    items: [
      pending("ap-supplier", "ข้อมูลเจ้าหนี้", "/ap?menu=supplier"),
      pending("ap-opening-debt", "ตั้งหนี้ยกมา (เจ้าหนี้)", "/ap?menu=opening-debt"),
      pending("ap-opening-credit", "ลดหนี้ยกมา (เจ้าหนี้)", "/ap?menu=opening-credit"),
      pending("ap-opening-debit", "เพิ่มหนี้ยกมา (เจ้าหนี้)", "/ap?menu=opening-debit"),
      pending("ap-other-debt", "ตั้งหนี้อื่นๆ (เจ้าหนี้)", "/ap?menu=other-debt"),
      pending("ap-other-credit", "ลดหนี้อื่นๆ (เจ้าหนี้)", "/ap?menu=other-credit"),
      pending("ap-other-debit", "เพิ่มหนี้อื่นๆ (เจ้าหนี้)", "/ap?menu=other-debit"),
      pending("ap-billing", "ใบรับวางบิล (เจ้าหนี้)", "/ap?menu=billing"),
      pending("ap-payment", "จ่ายชำระหนี้ (เจ้าหนี้)", "/ap?menu=payment")
    ]
  },
  {
    id: "ar",
    label: "ระบบลูกหนี้",
    icon: Landmark,
    items: [
      pending("ar-customer", "ข้อมูลลูกหนี้", "/ar?menu=customer"),
      pending("ar-opening-debt", "ตั้งหนี้ยกมา (ลูกหนี้)", "/ar?menu=opening-debt"),
      pending("ar-opening-debit", "เพิ่มหนี้ยกมา (ลูกหนี้)", "/ar?menu=opening-debit"),
      pending("ar-opening-credit", "ลดหนี้ยกมา (ลูกหนี้)", "/ar?menu=opening-credit"),
      pending("ar-other-debt", "ตั้งหนี้อื่นๆ (ลูกหนี้)", "/ar?menu=other-debt"),
      pending("ar-other-credit", "ลดหนี้อื่นๆ (ลูกหนี้)", "/ar?menu=other-credit"),
      pending("ar-other-debit", "เพิ่มหนี้อื่นๆ (ลูกหนี้)", "/ar?menu=other-debit"),
      pending("ar-billing", "ใบวางบิล (ลูกหนี้)", "/ar?menu=billing"),
      pending("ar-receipt", "รับชำระหนี้ (ลูกหนี้)", "/ar?menu=receipt")
    ]
  },
  {
    id: "cash-bank",
    label: "ระบบเงินสด/ธนาคาร",
    icon: Banknote,
    items: [
      pending("cash-other-income", "รายได้อื่นๆ", "/cash-bank?menu=other-income"),
      pending("cash-other-income-credit", "ลดหนี้รายได้อื่นๆ", "/cash-bank?menu=other-income-credit"),
      pending("cash-other-income-debit", "เพิ่มหนี้รายได้อื่นๆ", "/cash-bank?menu=other-income-debit"),
      pending("cash-other-expense", "ค่าใช้จ่ายอื่นๆ", "/cash-bank?menu=other-expense"),
      pending("cash-other-expense-credit", "ลดหนี้ค่าใช้จ่ายอื่นๆ", "/cash-bank?menu=other-expense-credit"),
      pending("cash-other-expense-debit", "เพิ่มหนี้ค่าใช้จ่ายอื่นๆ", "/cash-bank?menu=other-expense-debit"),
      pending("cash-opening", "ยกมาเงินสด", "/cash-bank?menu=cash-opening"),
      pending("cash-petty-reduce", "คืน/ลด วงเงินสดย่อย", "/cash-bank?menu=petty-reduce"),
      pending("cash-petty-increase", "รับ/เพิ่ม วงเงินสดย่อย", "/cash-bank?menu=petty-increase"),
      pending("bank-opening", "เงินฝากธนาคารยกมา", "/cash-bank?menu=bank-opening"),
      pending("bank-deposit", "บันทึกฝากเงิน", "/cash-bank?menu=bank-deposit"),
      pending("bank-withdraw", "บันทึกถอนเงิน", "/cash-bank?menu=bank-withdraw"),
      pending("bank-transfer", "บันทึกโอนเงินระหว่างธนาคาร", "/cash-bank?menu=bank-transfer"),
      pending("wallet-redeem", "บันทึกขึ้นเงิน wallet", "/cash-bank?menu=wallet-redeem"),
      pending("cheque-in-list", "ทะเบียนเช็ครับ", "/cash-bank?menu=cheque-in-list"),
      pending("cheque-in-opening", "เช็ครับยกมา", "/cash-bank?menu=cheque-in-opening"),
      pending("cheque-in-deposit", "บันทึกนำฝาก (เช็ครับ)", "/cash-bank?menu=cheque-in-deposit"),
      pending("cheque-in-pass", "บันทึกเช็คผ่าน (เช็ครับ)", "/cash-bank?menu=cheque-in-pass"),
      pending("cheque-in-return", "บันทึกเช็คคืน (เช็ครับ)", "/cash-bank?menu=cheque-in-return"),
      pending("cheque-in-expire", "บันทึกเช็คขาดสิทธิ์ (เช็ครับ)", "/cash-bank?menu=cheque-in-expire"),
      pending("cheque-in-change", "บันทึกการเปลี่ยนเช็ค (เช็ครับ)", "/cash-bank?menu=cheque-in-change"),
      pending("cheque-in-return-new-debt", "บันทึกคืนเช็ค/ตั้งหนี้ใหม่", "/cash-bank?menu=cheque-in-return-new-debt"),
      pending("cheque-out-list", "ทะเบียนเช็คจ่าย", "/cash-bank?menu=cheque-out-list"),
      pending("cheque-out-opening", "เช็คจ่ายยกมา", "/cash-bank?menu=cheque-out-opening"),
      pending("cheque-out-pass", "บันทึกเช็คผ่าน (เช็คจ่าย)", "/cash-bank?menu=cheque-out-pass"),
      pending("cheque-out-return", "บันทึกเช็คคืน (เช็คจ่าย)", "/cash-bank?menu=cheque-out-return"),
      pending("cheque-out-expire", "บันทึกเช็คขาดสิทธิ์ (เช็คจ่าย)", "/cash-bank?menu=cheque-out-expire"),
      pending("cheque-out-change", "บันทึกการเปลี่ยนเช็ค (เช็คจ่าย)", "/cash-bank?menu=cheque-out-change"),
      pending("credit-card-redeem", "บันทึกขึ้นเงินบัตรเครดิต", "/cash-bank?menu=credit-card-redeem")
    ]
  },
  {
    id: "accounting",
    label: "ระบบบัญชี",
    icon: BookOpenCheck,
    items: [
      pending("accounting-assets", "รายละเอียดสินทรัพย์", "/accounting?menu=assets"),
      pending(
        "accounting-asset-maintenance",
        "บันทึกการซ่อมบำรุงสินทรัพย์",
        "/accounting?menu=asset-maintenance"
      ),
      pending(
        "accounting-asset-sale",
        "บันทึกการขายสินทรัพย์",
        "/accounting?menu=asset-sale"
      ),
      pending(
        "accounting-transfer",
        "โอนข้อมูลเข้าระบบบัญชี",
        "/accounting?menu=transfer"
      ),
      pending("accounting-mapping", "รายละเอียดฝังบัญชี", "/accounting?menu=mapping"),
      pending("accounting-journal", "ข้อมูลรายวัน", "/accounting?menu=journal")
    ]
  },
  {
    id: "other-reports",
    label: "รายงานอื่นๆ",
    icon: LineChart,
    items: [
      pending("reports-inventory", "รายงานระบบสินค้า", "/reports?menu=inventory"),
      pending("reports-purchase", "รายงานระบบซื้อ", "/reports?menu=purchase"),
      pending("reports-sales", "รายงานระบบขาย", "/reports?menu=sales"),
      pending("reports-ap", "รายงานระบบเจ้าหนี้", "/reports?menu=ap"),
      pending("reports-ar", "รายงานระบบลูกหนี้", "/reports?menu=ar"),
      pending("reports-cash-bank", "รายงานระบบเงินสด/ธนาคาร", "/reports?menu=cash-bank"),
      pending("reports-accounting", "รายงานระบบบัญชี", "/reports?menu=accounting"),
      pending("reports-financial-statement", "งบการเงิน", "/reports?menu=financial-statement"),
      pending("reports-custom", "Custom Reports", "/reports?menu=custom")
    ]
  }
];

export const fallbackNavIcon = FileSearch;
