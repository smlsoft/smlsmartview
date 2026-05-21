import {
  Activity,
  AlertTriangle,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Filter,
  Package,
  PackageCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  InventoryDashboardData,
  InventoryDocument,
  InventoryMenu,
} from "@/lib/queries/inventory";
import { cn } from "@/lib/utils";

type InventoryDashboardProps = {
  data: InventoryDashboardData;
};

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("th-TH", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatDate(date: string) {
  const value = date.slice(0, 10);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function movementLabel(menu: InventoryMenu) {
  if (menu.movement === "in") return "เข้า";
  if (menu.movement === "out") return "ออก";
  if (menu.movement === "neutral") return "ไม่ตัดสต็อก";
  return "ผสม";
}

function movementVariant(menu: InventoryMenu) {
  if (menu.movement === "in") return "success" as const;
  if (menu.movement === "out") return "warning" as const;
  if (menu.movement === "neutral") return "neutral" as const;
  return "info" as const;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Package;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    neutral: "text-text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info"
  }[tone];

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <p className="label-caps text-text-tertiary">{label}</p>
        <Icon className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <p
          className={cn(
            "truncate text-3xl font-semibold leading-none tabular-nums",
            toneClass
          )}
          title={value}
        >
          {value}
        </p>
        <p className="mt-2 text-sm leading-5 text-text-secondary">{sub}</p>
      </CardContent>
    </Card>
  );
}

function FilterBar({ data }: { data: InventoryDashboardData }) {
  return (
    <Card className="p-4">
      <form
        action="/inventory"
        className="grid gap-3 md:grid-cols-[minmax(220px,1.4fr)_150px_150px_minmax(190px,1fr)_auto]"
      >
        <div className="relative min-w-0">
          <Filter
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Select
            name="menu"
            defaultValue={data.filters.menu}
            className="h-11 pl-9"
            aria-label="เลือกเมนูเอกสาร"
          >
            {data.menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="relative">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Input
            name="from"
            type="date"
            defaultValue={data.filters.start_date}
            className="h-11 pl-9"
            aria-label="วันที่เริ่มต้น"
          />
        </div>
        <div className="relative">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Input
            name="to"
            type="date"
            defaultValue={data.filters.end_date}
            className="h-11 pl-9"
            aria-label="วันที่สิ้นสุด"
          />
        </div>
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={data.filters.search}
            placeholder="เลขเอกสาร / สินค้า / หมายเหตุ"
            className="h-11 pl-9"
            aria-label="ค้นหาเอกสาร"
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

function OverviewGrid({ data }: { data: InventoryDashboardData }) {
  const summary = data.summary;
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="มูลค่าสต็อก"
        value={formatCompact(summary.stock_value)}
        sub={`${formatNumber(summary.stock_items)} SKU มีคงเหลือ`}
        icon={PackageCheck}
        tone="info"
      />
      <KpiCard
        label="จำนวนคงเหลือ"
        value={formatCompact(summary.stock_qty)}
        sub={`${formatNumber(summary.total_items)} รหัสสินค้าใน master`}
        icon={Boxes}
      />
      <KpiCard
        label="เคลื่อนไหวเดือนนี้"
        value={formatNumber(summary.current_docs)}
        sub={`เข้า ${formatCompact(summary.qty_in)} · ออก ${formatCompact(summary.qty_out)}`}
        icon={Activity}
        tone="success"
      />
      <KpiCard
        label="จุดเสี่ยง"
        value={formatNumber(summary.negative_items)}
        sub={`คำขอค้าง ${formatNumber(summary.open_requests)} · ปรับปรุง ${formatNumber(summary.adjust_docs)}`}
        icon={AlertTriangle}
        tone={summary.negative_items > 0 ? "danger" : "success"}
      />
    </section>
  );
}

function DocumentStatus({ doc }: { doc: InventoryDocument }) {
  if (doc.doc_success === 1) {
    return (
      <StatusChip variant="success">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        ปิดแล้ว
      </StatusChip>
    );
  }
  return <StatusChip variant="warning">ค้าง</StatusChip>;
}

function DocumentsTable({ data }: { data: InventoryDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-col gap-3 p-6 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{data.selected_menu.label}</CardTitle>
            <StatusChip variant={movementVariant(data.selected_menu)}>
              {movementLabel(data.selected_menu)}
            </StatusChip>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {formatDate(data.period.start_date)} ถึง {formatDate(data.period.end_date)}
          </p>
        </div>
        <StatusChip variant="neutral">{formatNumber(data.documents.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1040px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">เอกสาร</th>
                <th className="px-5 py-3 font-semibold">วันที่</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">ตัวอย่างสินค้า</th>
                <th className="px-5 py-3 text-right font-semibold">จำนวน</th>
                <th className="px-5 py-3 text-right font-semibold">มูลค่า</th>
                <th className="px-5 py-3 font-semibold">คลัง</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบเอกสารตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.documents.map((doc) => (
                  <tr key={`${doc.menu_label}-${doc.doc_no}-${doc.doc_date}`}>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-sm font-semibold text-text-primary">
                        {doc.doc_no}
                      </p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {doc.doc_ref || doc.remark || doc.cust_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatDate(doc.doc_date)}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                        {doc.doc_time || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[190px] leading-5 text-text-primary">
                        {doc.menu_label}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[230px] leading-5 text-text-primary">
                        {doc.sample_item_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.sample_item_code || `${formatNumber(doc.line_count)} lines`}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatNumber(doc.item_qty, 2)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatNumber(doc.line_count)} lines
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatCompact(doc.item_amount || doc.total_amount)}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                        cost {formatCompact(doc.item_cost || doc.total_cost)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-[130px] truncate text-text-secondary">
                        {doc.warehouses || doc.branch_name || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <DocumentStatus doc={doc} />
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

export function InventoryDashboard({ data }: InventoryDashboardProps) {
  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 text-[34px] leading-[42px] tracking-normal text-text-primary">
            ระบบสินค้า
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            ข้อมูลถึง {formatDate(data.period.as_of_date)} · ช่วงเอกสาร{" "}
            {formatDate(data.period.start_date)} ถึง {formatDate(data.period.end_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="info">Inventory</StatusChip>
          <StatusChip variant="neutral">Read only</StatusChip>
        </div>
      </section>

      <OverviewGrid data={data} />
      <FilterBar data={data} />

      <DocumentsTable data={data} />
    </div>
  );
}
