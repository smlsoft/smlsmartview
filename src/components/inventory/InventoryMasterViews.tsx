import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Barcode, Boxes, FileSearch, Package, Search, Tags } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  InventoryBarcode,
  InventoryItem,
  InventoryItemDetailData,
  InventoryItemsData,
  InventoryPrice,
  InventoryPricesData
} from "@/lib/queries/inventory";

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(date: string) {
  const value = date.slice(0, 10);
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function priceModeLabel(mode: number) {
  if (mode === 0) return "ราคาขายหลัก";
  if (mode === 1) return "ราคาขายทั่วไป";
  return `mode ${mode}`;
}

function priceTypeLabel(type: number) {
  if (type === 1) return "มาตรฐาน";
  if (type === 2) return "กลุ่มลูกค้า";
  if (type === 3) return "ลูกค้าเฉพาะ";
  return `type ${type}`;
}

function statusVariant(status: number): "success" | "neutral" {
  return status === 1 ? "success" : "neutral";
}

function statusLabel(status: number) {
  return `status ${status}`;
}

function itemHref(itemCode: string) {
  return `/inventory/items/${encodeURIComponent(itemCode)}`;
}

function MasterFilter({
  action,
  search,
  placeholder
}: {
  action: string;
  search: string;
  placeholder: string;
}) {
  return (
    <Card className="p-4">
      <form action={action} className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_auto]">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={search}
            placeholder={placeholder}
            className="h-11 pl-9"
            aria-label="ค้นหา"
          />
        </div>
        <Button type="submit" className="h-11">
          <Search className="h-4 w-4" aria-hidden="true" />
          ค้นหา
        </Button>
      </form>
    </Card>
  );
}

function PageHeading({
  title,
  description
}: {
  companyName?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <section>
      <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        <span>{description}</span>
      </p>
    </section>
  );
}

function ItemsTable({ items }: { items: InventoryItem[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 py-3.5">
        <span className="text-sm font-semibold text-text-secondary">รายการสินค้าทั้งหมด</span>
        <StatusChip variant="neutral">{formatNumber(items.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1100px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">สินค้า</th>
                <th className="px-5 py-3 font-semibold">กลุ่ม/ยี่ห้อ</th>
                <th className="px-5 py-3 font-semibold">หน่วย</th>
                <th className="px-5 py-3 text-right font-semibold">คงเหลือ</th>
                <th className="px-5 py-3 text-right font-semibold">ต้นทุนเฉลี่ย</th>
                <th className="px-5 py-3 font-semibold">บาร์โค้ด/ราคา</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบสินค้า
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.code}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={itemHref(item.code)}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {item.code}
                      </Link>
                      <p className="mt-1 line-clamp-2 max-w-[280px] leading-5 text-text-primary">
                        {item.name_1 || "-"}
                      </p>
                      <p className="mt-1 truncate text-xs text-text-tertiary">
                        {item.short_name || item.name_2 || item.remark || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-text-primary">{item.group_main || "-"}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {item.group_sub || item.item_category || item.item_brand || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-text-primary">{item.unit_standard_name || item.unit_standard || "-"}</p>
                      <p className="mt-1 text-xs text-text-tertiary">type {item.item_type}</p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatNumber(item.balance_qty, 2)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-secondary">
                      {formatMoney(item.average_cost)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-secondary">
                        {item.sample_barcode || "-"}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatNumber(item.barcode_count)} barcode · {formatNumber(item.price_count)} price
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        <StatusChip variant={statusVariant(item.status)}>
                          {statusLabel(item.status)}
                        </StatusChip>
                        <StatusChip variant="neutral">item {item.item_status}</StatusChip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PricesTable({ prices, itemLinks = true }: { prices: InventoryPrice[]; itemLinks?: boolean }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 py-3.5">
        <span className="text-sm font-semibold text-text-secondary">ตารางราคาขายทั้งหมด</span>
        <StatusChip variant="neutral">{formatNumber(prices.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1120px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">สินค้า</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">หน่วย</th>
                <th className="px-5 py-3 text-right font-semibold">แยก VAT</th>
                <th className="px-5 py-3 text-right font-semibold">รวม VAT</th>
                <th className="px-5 py-3 font-semibold">ช่วงวันที่</th>
                <th className="px-5 py-3 font-semibold">ลูกค้า/กลุ่ม</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบราคาขายสินค้า
                  </td>
                </tr>
              ) : (
                prices.map((price, index) => (
                  <tr key={`${price.ic_code}-${price.unit_code}-${price.price_type}-${price.price_mode}-${price.line_number}-${index}`}>
                    <td className="px-5 py-4 align-top">
                      {itemLinks ? (
                        <Link
                          href={itemHref(price.ic_code)}
                          className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                        >
                          {price.ic_code}
                        </Link>
                      ) : (
                        <p className="font-mono text-sm font-semibold text-text-primary">
                          {price.ic_code}
                        </p>
                      )}
                      <p className="mt-1 line-clamp-2 max-w-[260px] leading-5 text-text-primary">
                        {price.item_name || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-text-primary">{priceModeLabel(price.price_mode)}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {priceTypeLabel(price.price_type)} · sale {price.sale_type}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-text-primary">
                      {price.unit_code || "-"}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(price.sale_price1)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(price.sale_price2)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-text-primary">{formatDate(price.from_date)}</p>
                      <p className="mt-1 text-xs text-text-tertiary">ถึง {formatDate(price.to_date)}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-secondary">{price.cust_code || "-"}</p>
                      <p className="mt-1 text-xs text-text-tertiary">{price.cust_group_1 || "-"}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusChip variant={statusVariant(price.status)}>
                        {statusLabel(price.status)}
                      </StatusChip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function BarcodesTable({ barcodes }: { barcodes: InventoryBarcode[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-4">
        <div>
          <CardTitle>บาร์โค้ด</CardTitle>
          <p className="mt-2 text-sm text-text-secondary">{formatNumber(barcodes.length)} rows</p>
        </div>
        <Barcode className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[820px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">Barcode</th>
                <th className="px-5 py-3 font-semibold">รายละเอียด</th>
                <th className="px-5 py-3 font-semibold">หน่วย</th>
                <th className="px-5 py-3 text-right font-semibold">ราคา 1</th>
                <th className="px-5 py-3 text-right font-semibold">ราคา 2</th>
                <th className="px-5 py-3 text-right font-semibold">สมาชิก</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {barcodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบบาร์โค้ด
                  </td>
                </tr>
              ) : (
                barcodes.map((barcode) => (
                  <tr key={barcode.barcode}>
                    <td className="px-5 py-4 align-top font-mono text-text-primary">
                      {barcode.barcode || "-"}
                    </td>
                    <td className="px-5 py-4 align-top text-text-primary">
                      {barcode.description || "-"}
                    </td>
                    <td className="px-5 py-4 align-top text-text-primary">
                      {barcode.unit_code || "-"}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(barcode.price)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(barcode.price_2)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(barcode.price_member)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusChip variant={statusVariant(barcode.status)}>
                        {statusLabel(barcode.status)}
                      </StatusChip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function InventoryItemsView({ data }: { data: InventoryItemsData }) {
  return (
    <div className="space-y-4">
      <PageHeading
        companyName={data.company_name}
        title="รายการสินค้า"
        description="ดู master สินค้า หน่วย ยอดคงเหลือรวม บาร์โค้ด และจำนวนราคาที่ผูกไว้"
        icon={Package}
      />
      <MasterFilter
        action="/inventory/items"
        search={data.filters.search}
        placeholder="รหัสสินค้า / ชื่อสินค้า / บาร์โค้ด"
      />
      <ItemsTable items={data.items} />
    </div>
  );
}

export function InventoryPricesView({ data }: { data: InventoryPricesData }) {
  return (
    <div className="space-y-4">
      <PageHeading
        companyName={data.company_name}
        title="ราคาขายสินค้า"
        description="ดูราคาขายจาก ic_inventory_price แยกประเภท ราคาแยก VAT/รวม VAT และช่วงวันที่ใช้งาน"
        icon={Tags}
      />
      <MasterFilter
        action="/inventory/prices"
        search={data.filters.search}
        placeholder="รหัสสินค้า / ชื่อสินค้า / หน่วย"
      />
      <PricesTable prices={data.prices} />
    </div>
  );
}

export function InventoryItemDetailView({
  data
}: {
  data: InventoryItemDetailData;
}) {
  const item = data.item;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="secondary">
          <Link href="/inventory/items">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            กลับรายการสินค้า
          </Link>
        </Button>
      </div>

      <section>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl break-all">
          {item.code}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          <span>{item.name_1 || "รายละเอียดสินค้า"}</span>
        </p>
      </section>

      <Card className="p-6">
        <CardHeader className="space-y-0 p-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{item.name_1 || item.code}</CardTitle>
              <p className="mt-2 text-sm text-text-secondary">{item.name_2 || item.short_name || "-"}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusChip variant={statusVariant(item.status)}>{statusLabel(item.status)}</StatusChip>
              <StatusChip variant="neutral">item {item.item_status}</StatusChip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-0 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["กลุ่มหลัก", item.group_main || "-"],
            ["กลุ่มย่อย", item.group_sub || "-"],
            ["หมวด/ยี่ห้อ", item.item_category || item.item_brand || "-"],
            ["หน่วยมาตรฐาน", item.unit_standard_name || item.unit_standard || "-"],
            ["คงเหลือรวม", formatNumber(item.balance_qty, 2)],
            ["ต้นทุนเฉลี่ย", formatMoney(item.average_cost)],
            ["ต้นทุนมาตรฐาน", formatMoney(item.standard_cost)],
            ["เคลื่อนไหวล่าสุด", formatDate(item.last_movement_date)]
          ].map(([label, value]) => (
            <div key={label} className="premium-panel rounded-md p-4">
              <p className="label-caps text-text-tertiary">{label}</p>
              <p className="mt-2 truncate text-sm font-medium text-text-primary" title={value}>
                {value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {item.remark ? (
        <Card className="p-5">
          <p className="label-caps text-text-tertiary">หมายเหตุ</p>
          <p className="mt-2 text-sm leading-6 text-text-primary">{item.remark}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <BarcodesTable barcodes={data.barcodes} />
        <PricesTable prices={data.prices} itemLinks={false} />
      </section>

      <div className="sr-only">
        <FileSearch aria-hidden="true" />
      </div>
    </div>
  );
}
