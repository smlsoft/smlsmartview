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
      item("inventory-items", "รายการสินค้า", "/inventory/items", {
        enabled: true
      }),
      item("inventory-sale-prices", "ราคาขายสินค้า", "/inventory/prices", {
        enabled: true
      }),
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
      item(
        "inventory-request-stock-count",
        "ขอตรวจนับสินค้า",
        "/inventory?menu=stock-check-request",
        { enabled: true }
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
      item("purchase-quote", "ใบเสนอซื้อ", "/purchase?menu=quote", {
        enabled: true
      }),
      item("purchase-order", "ใบสั่งซื้อ", "/purchase?menu=order", {
        enabled: true
      }),
      item(
        "purchase-advance-opening",
        "จ่ายเงินล่วงหน้ายกมา",
        "/purchase?menu=advance-opening",
        { enabled: true }
      ),
      item("purchase-advance", "จ่ายเงินล่วงหน้า", "/purchase?menu=advance", {
        enabled: true
      }),
      item(
        "purchase-advance-return",
        "รับคืนจ่ายเงินล่วงหน้า",
        "/purchase?menu=advance-return",
        { enabled: true }
      ),
      item(
        "purchase-deposit-opening",
        "จ่ายเงินมัดจำยกมา",
        "/purchase?menu=deposit-opening",
        { enabled: true }
      ),
      item("purchase-deposit", "จ่ายเงินมัดจำ", "/purchase?menu=deposit", {
        enabled: true
      }),
      item(
        "purchase-deposit-return",
        "รับคืนจ่ายเงินมัดจำ",
        "/purchase?menu=deposit-return",
        { enabled: true }
      ),
      item("purchase-bill", "ซื้อสินค้า/ตั้งหนี้", "/purchase?menu=bill", {
        enabled: true
      }),
      item("purchase-debit-note", "เพิ่มหนี้/ราคาผิด", "/purchase?menu=debit-note", {
        enabled: true
      }),
      item("purchase-return", "ส่งคืนสินค้า/ราคาผิด", "/purchase?menu=return", {
        enabled: true
      }),
      item(
        "purchase-partial-receive",
        "รับสินค้าแบบทะยอยรับ",
        "/purchase?menu=partial-receive",
        { enabled: true }
      ),
      item(
        "purchase-partial-return",
        "ส่งคืนสินค้าแบบทะยอยรับ",
        "/purchase?menu=partial-return",
        { enabled: true }
      ),
      item(
        "purchase-bill-from-receive",
        "ตั้งหนี้จากการรับสินค้า",
        "/purchase?menu=bill-from-receive",
        { enabled: true }
      ),
      item(
        "purchase-debit-from-bill",
        "เพิ่มหนี้จากใบตั้งหนี้",
        "/purchase?menu=debit-from-bill",
        { enabled: true }
      ),
      item(
        "purchase-credit-from-bill",
        "ลดหนี้จากใบตั้งหนี้",
        "/purchase?menu=credit-from-bill",
        { enabled: true }
      )
    ]
  },
  {
    id: "sales",
    label: "ระบบขาย",
    icon: ReceiptText,
    items: [
      item("sales-quotation", "ใบเสนอราคา", "/sales?menu=quotation", {
        enabled: true
      }),
      item("sales-reserve-order", "ใบสั่งซื้อ/สั่งจอง", "/sales?menu=reserve-order", {
        enabled: true
      }),
      item("sales-order", "ใบสั่งขาย", "/sales?menu=order", {
        enabled: true
      }),
      item(
        "sales-advance-opening",
        "รับเงินล่วงหน้ายกมา",
        "/sales?menu=advance-opening",
        { enabled: true }
      ),
      item("sales-advance", "รับเงินล่วงหน้า", "/sales?menu=advance", {
        enabled: true
      }),
      item(
        "sales-advance-return",
        "คืนเงินรับล่วงหน้า",
        "/sales?menu=advance-return",
        { enabled: true }
      ),
      item(
        "sales-deposit-opening",
        "รับเงินมัดจำล่วงหน้า",
        "/sales?menu=deposit-opening",
        { enabled: true }
      ),
      item("sales-deposit", "รับเงินมัดจำ", "/sales?menu=deposit", {
        enabled: true
      }),
      item(
        "sales-deposit-return",
        "คืนเงินรับมัดจำ",
        "/sales?menu=deposit-return",
        { enabled: true }
      ),
      item("sales-bill", "ขายสินค้า/บริการ", "/sales?menu=bill", {
        enabled: true
      }),
      item("sales-return", "รับคืนสินค้า/ลดหนี้", "/sales?menu=return", {
        enabled: true
      }),
      item("sales-debit-note", "เพิ่มหนี้", "/sales?menu=debit-note", {
        enabled: true
      }),
      item(
        "sales-pos-tax-invoice-short",
        "รายการใบกำกับภาษีอย่างย่อ",
        "/sales?menu=pos-tax-invoice-short",
        { enabled: true }
      ),
      item(
        "sales-pos-tax-invoice-full",
        "รายการใบกำกับภาษีอย่างเต็มออกแทน",
        "/sales?menu=pos-tax-invoice-full",
        { enabled: true }
      ),
      item("sales-change-money", "บันทึกรับเงิน (เงินทอน)", "/sales?menu=change-money", {
        enabled: true
      }),
      item("sales-pos-shift-money", "บันทึกส่งเงิน POS", "/sales?menu=pos-shift-money", {
        enabled: true
      })
    ]
  },
  {
    id: "ap",
    label: "ระบบเจ้าหนี้",
    icon: HandCoins,
    items: [
      item("ap-supplier", "ข้อมูลเจ้าหนี้", "/ap?menu=supplier", {
        enabled: true
      }),
      item("ap-opening-debt", "ตั้งหนี้ยกมา (เจ้าหนี้)", "/ap?menu=opening-debt", {
        enabled: true
      }),
      item("ap-opening-credit", "ลดหนี้ยกมา (เจ้าหนี้)", "/ap?menu=opening-credit", {
        enabled: true
      }),
      item("ap-opening-debit", "เพิ่มหนี้ยกมา (เจ้าหนี้)", "/ap?menu=opening-debit", {
        enabled: true
      }),
      item("ap-other-debt", "ตั้งหนี้อื่นๆ (เจ้าหนี้)", "/ap?menu=other-debt", {
        enabled: true
      }),
      item("ap-other-credit", "ลดหนี้อื่นๆ (เจ้าหนี้)", "/ap?menu=other-credit", {
        enabled: true
      }),
      item("ap-other-debit", "เพิ่มหนี้อื่นๆ (เจ้าหนี้)", "/ap?menu=other-debit", {
        enabled: true
      }),
      item("ap-billing", "ใบรับวางบิล (เจ้าหนี้)", "/ap?menu=billing", {
        enabled: true
      }),
      item("ap-payment", "จ่ายชำระหนี้ (เจ้าหนี้)", "/ap?menu=payment", {
        enabled: true
      })
    ]
  },
  {
    id: "ar",
    label: "ระบบลูกหนี้",
    icon: Landmark,
    items: [
      item("ar-customer", "ข้อมูลลูกหนี้", "/ar?menu=customer", {
        enabled: true
      }),
      item("ar-opening-debt", "ตั้งหนี้ยกมา (ลูกหนี้)", "/ar?menu=opening-debt", {
        enabled: true
      }),
      item("ar-opening-debit", "เพิ่มหนี้ยกมา (ลูกหนี้)", "/ar?menu=opening-debit", {
        enabled: true
      }),
      item("ar-opening-credit", "ลดหนี้ยกมา (ลูกหนี้)", "/ar?menu=opening-credit", {
        enabled: true
      }),
      item("ar-other-debt", "ตั้งหนี้อื่นๆ (ลูกหนี้)", "/ar?menu=other-debt", {
        enabled: true
      }),
      item("ar-other-credit", "ลดหนี้อื่นๆ (ลูกหนี้)", "/ar?menu=other-credit", {
        enabled: true
      }),
      item("ar-other-debit", "เพิ่มหนี้อื่นๆ (ลูกหนี้)", "/ar?menu=other-debit", {
        enabled: true
      }),
      item("ar-billing", "ใบวางบิล (ลูกหนี้)", "/ar?menu=billing", {
        enabled: true
      }),
      item("ar-receipt", "รับชำระหนี้ (ลูกหนี้)", "/ar?menu=payment", {
        enabled: true
      })
    ]
  },
  {
    id: "cash-bank",
    label: "ระบบเงินสด/ธนาคาร",
    icon: Banknote,
    items: [
      item("cash-other-income", "รายได้อื่นๆ", "/cash-bank?menu=other-income", {
        enabled: true
      }),
      item("cash-other-income-credit", "ลดหนี้รายได้อื่นๆ", "/cash-bank?menu=other-income-credit", {
        enabled: true
      }),
      item("cash-other-income-debit", "เพิ่มหนี้รายได้อื่นๆ", "/cash-bank?menu=other-income-debit", {
        enabled: true
      }),
      item("cash-other-expense", "ค่าใช้จ่ายอื่นๆ", "/cash-bank?menu=other-expense", {
        enabled: true
      }),
      item("cash-other-expense-credit", "ลดหนี้ค่าใช้จ่ายอื่นๆ", "/cash-bank?menu=other-expense-credit", {
        enabled: true
      }),
      item("cash-other-expense-debit", "เพิ่มหนี้ค่าใช้จ่ายอื่นๆ", "/cash-bank?menu=other-expense-debit", {
        enabled: true
      }),
      item("cash-opening", "ยกมาเงินสด", "/cash-bank?menu=cash-opening", {
        enabled: true
      }),
      item("cash-petty-reduce", "คืน/ลด วงเงินสดย่อย", "/cash-bank?menu=petty-reduce", {
        enabled: true
      }),
      item("cash-petty-increase", "รับ/เพิ่ม วงเงินสดย่อย", "/cash-bank?menu=petty-increase", {
        enabled: true
      }),
      item("bank-opening", "เงินฝากธนาคารยกมา", "/cash-bank?menu=bank-opening", {
        enabled: true
      }),
      item("bank-deposit", "บันทึกฝากเงิน", "/cash-bank?menu=bank-deposit", {
        enabled: true
      }),
      item("bank-withdraw", "บันทึกถอนเงิน", "/cash-bank?menu=bank-withdraw", {
        enabled: true
      }),
      item("bank-transfer", "บันทึกโอนเงินระหว่างธนาคาร", "/cash-bank?menu=bank-transfer", {
        enabled: true
      }),
      item("wallet-redeem", "บันทึกขึ้นเงิน wallet", "/cash-bank?menu=wallet-redeem", {
        badge: "รอ",
        enabled: true
      }),
      item("cheque-in-list", "ทะเบียนเช็ครับ", "/cash-bank?menu=cheque-in-list", {
        enabled: true
      }),
      item("cheque-in-opening", "เช็ครับยกมา", "/cash-bank?menu=cheque-in-opening", {
        enabled: true
      }),
      item("cheque-in-deposit", "บันทึกนำฝาก (เช็ครับ)", "/cash-bank?menu=cheque-in-deposit", {
        enabled: true
      }),
      item("cheque-in-pass", "บันทึกเช็คผ่าน (เช็ครับ)", "/cash-bank?menu=cheque-in-pass", {
        enabled: true
      }),
      item("cheque-in-return", "บันทึกเช็คคืน (เช็ครับ)", "/cash-bank?menu=cheque-in-return", {
        enabled: true
      }),
      item("cheque-in-expire", "บันทึกเช็คขาดสิทธิ์ (เช็ครับ)", "/cash-bank?menu=cheque-in-expire", {
        enabled: true
      }),
      item("cheque-in-change", "บันทึกการเปลี่ยนเช็ค (เช็ครับ)", "/cash-bank?menu=cheque-in-change", {
        enabled: true
      }),
      item("cheque-in-return-new-debt", "บันทึกคืนเช็ค/ตั้งหนี้ใหม่", "/cash-bank?menu=cheque-in-return-new-debt", {
        enabled: true
      }),
      item("cheque-out-list", "ทะเบียนเช็คจ่าย", "/cash-bank?menu=cheque-out-list", {
        enabled: true
      }),
      item("cheque-out-opening", "เช็คจ่ายยกมา", "/cash-bank?menu=cheque-out-opening", {
        enabled: true
      }),
      item("cheque-out-pass", "บันทึกเช็คผ่าน (เช็คจ่าย)", "/cash-bank?menu=cheque-out-pass", {
        enabled: true
      }),
      item("cheque-out-return", "บันทึกเช็คคืน (เช็คจ่าย)", "/cash-bank?menu=cheque-out-return", {
        enabled: true
      }),
      item("cheque-out-expire", "บันทึกเช็คขาดสิทธิ์ (เช็คจ่าย)", "/cash-bank?menu=cheque-out-expire", {
        enabled: true
      }),
      item("cheque-out-change", "บันทึกการเปลี่ยนเช็ค (เช็คจ่าย)", "/cash-bank?menu=cheque-out-change", {
        enabled: true
      }),
      item("credit-card-redeem", "บันทึกขึ้นเงินบัตรเครดิต", "/cash-bank?menu=credit-card-redeem", {
        enabled: true
      })
    ]
  },
  {
    id: "accounting",
    label: "ระบบบัญชี",
    icon: BookOpenCheck,
    items: [
      item("accounting-assets", "รายละเอียดสินทรัพย์", "/accounting?menu=assets", {
        enabled: true
      }),
      item(
        "accounting-asset-maintenance",
        "บันทึกการซ่อมบำรุงสินทรัพย์",
        "/accounting?menu=asset-maintenance",
        { enabled: true }
      ),
      item(
        "accounting-asset-sale",
        "บันทึกการขายสินทรัพย์",
        "/accounting?menu=asset-sale",
        { enabled: true }
      ),
      item(
        "accounting-transfer",
        "โอนข้อมูลเข้าระบบบัญชี",
        "/accounting?menu=transfer",
        { enabled: true }
      ),
      item("accounting-mapping", "รายละเอียดฝังบัญชี", "/accounting?menu=mapping", {
        enabled: true
      }),
      item("accounting-journal", "ข้อมูลรายวัน", "/accounting?menu=journal", {
        enabled: true
      })
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
