import { CalendarDays, HandCoins, Search } from "lucide-react";
import Link from "next/link";
import { DocumentStatusChips } from "@/components/erp/DocumentStatusChips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import type { ApDashboardData, ApDocument, ApMenu, ApSupplier } from "@/lib/queries/ap";

type ApDashboardProps = {
  data: ApDashboardData;
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
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function stageVariant(stage: ApMenu["stage"]) {
  if (stage === "ยกมา") return "warning" as const;
  if (stage === "วางบิล/ชำระ") return "success" as const;
  if (stage === "อื่นๆ") return "info" as const;
  return "neutral" as const;
}

function supplierStatus(supplier: ApSupplier) {
  if (supplier.status === 1) return <StatusChip variant="success">ติดต่อ</StatusChip>;
  if (supplier.status === 0) return <StatusChip variant="danger">ยกเลิก</StatusChip>;
  return <StatusChip variant="neutral">status {supplier.status}</StatusChip>;
}

function documentDetailHref(data: ApDashboardData, doc: ApDocument) {
  const params = new URLSearchParams({
    menu: data.filters.menu,
    flag: String(doc.trans_flag),
    doc_no: doc.doc_no,
    doc_date: doc.doc_date.slice(0, 10)
  });

  if (data.filters.start_date) params.set("from", data.filters.start_date);
  if (data.filters.end_date) params.set("to", data.filters.end_date);
  if (data.filters.search) params.set("q", data.filters.search);

  return `/ap/document?${params.toString()}`;
}

function SupplierFilter({ data }: { data: ApDashboardData }) {
  return (
    <Card className="p-4">
      <form action="/ap" className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto]">
        <input type="hidden" name="menu" value={data.filters.menu} />
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={data.filters.search}
            placeholder="รหัส / ชื่อ / โทรศัพท์ / อีเมล"
            className="h-11 pl-9"
            aria-label="ค้นหาเจ้าหนี้"
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

function DocumentFilter({ data }: { data: ApDashboardData }) {
  return (
    <Card className="p-4">
      <form
        action="/ap"
        className="grid gap-3 md:grid-cols-[150px_150px_minmax(220px,1fr)_auto]"
      >
        <input type="hidden" name="menu" value={data.filters.menu} />
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
            placeholder="เลขเอกสาร / เจ้าหนี้ / เอกสารอ้างอิง"
            className="h-11 pl-9"
            aria-label="ค้นหาเอกสารเจ้าหนี้"
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

function SuppliersTable({ data }: { data: ApDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-col gap-3 p-6 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{data.selected_menu.label}</CardTitle>
            <StatusChip variant={stageVariant(data.selected_menu.stage)}>
              {data.selected_menu.stage}
            </StatusChip>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            แสดงจากตาราง ap_supplier
          </p>
        </div>
        <StatusChip variant="neutral">{formatNumber(data.suppliers.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[980px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">เจ้าหนี้</th>
                <th className="px-5 py-3 font-semibold">ติดต่อ</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 text-right font-semibold">ยอดหนี้</th>
                <th className="px-5 py-3 text-right font-semibold">เช็ค/วางบิล</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบเจ้าหนี้ตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.suppliers.map((supplier) => (
                  <tr key={supplier.code}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/ap/supplier?code=${encodeURIComponent(supplier.code)}`}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {supplier.code}
                      </Link>
                      <p className="mt-1 line-clamp-2 max-w-[280px] leading-5 text-text-primary">
                        {supplier.name_1 || supplier.name_2 || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-[220px] truncate text-text-primary">
                        {supplier.telephone || "-"}
                      </p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {supplier.email || supplier.website || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-text-secondary">
                      {supplier.ap_type || "-"}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatCompact(supplier.debt_balance)}
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatCompact(supplier.chq_balance)}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                        วางบิล {formatCompact(supplier.bill_balance)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">{supplierStatus(supplier)}</td>
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

function DocumentsTable({ data }: { data: ApDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-col gap-3 p-6 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{data.selected_menu.label}</CardTitle>
            <StatusChip variant={stageVariant(data.selected_menu.stage)}>
              {data.selected_menu.stage}
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
          <table className="w-full min-w-[1120px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">เอกสาร</th>
                <th className="px-5 py-3 font-semibold">วันที่</th>
                <th className="px-5 py-3 font-semibold">เจ้าหนี้</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">รายการอ้างอิง</th>
                <th className="px-5 py-3 text-right font-semibold">ยอดสุทธิ</th>
                <th className="px-5 py-3 text-right font-semibold">คงเหลือ/จ่าย</th>
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
                  <tr key={`${doc.source}-${doc.trans_flag}-${doc.doc_no}-${doc.doc_date}`}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={documentDetailHref(data, doc)}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {doc.doc_no}
                      </Link>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {doc.doc_ref || doc.remark || "-"}
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
                      <p className="line-clamp-2 max-w-[220px] leading-5 text-text-primary">
                        {doc.supplier_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.supplier_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[190px] leading-5 text-text-primary">
                        {doc.flag_label}
                      </p>
                      <p className="label-caps mt-1 text-text-tertiary">
                        {doc.source === "ap_ar_trans" ? "AP/AR" : "IC"} · TF {doc.trans_flag}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[230px] leading-5 text-text-primary">
                        {doc.sample_item_name || doc.sample_ref_doc_no || doc.remark || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.sample_item_code ||
                          `${formatNumber(doc.line_count + doc.debt_line_count)} lines`}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatCompact(doc.total_amount || doc.item_amount || doc.debt_amount)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatNumber(doc.line_count)} item / {formatNumber(doc.debt_line_count)} debt
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-secondary">
                        {formatCompact(doc.balance_amount)}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                        จ่าย {formatCompact(doc.paid_amount)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <DocumentStatusChips doc={doc} />
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

export function ApDashboard({ data }: ApDashboardProps) {
  const isSupplier = data.selected_menu.source === "supplier";

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 text-[34px] leading-[42px] tracking-normal text-text-primary">
            ระบบเจ้าหนี้
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {isSupplier
              ? "ข้อมูลหลักเจ้าหนี้"
              : `ช่วงเอกสาร ${formatDate(data.period.start_date)} ถึง ${formatDate(data.period.end_date)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="info">
            <HandCoins className="h-3.5 w-3.5" aria-hidden="true" />
            AP
          </StatusChip>
          <StatusChip variant="neutral">อ่านอย่างเดียว</StatusChip>
        </div>
      </section>

      {isSupplier ? <SupplierFilter data={data} /> : <DocumentFilter data={data} />}

      {isSupplier ? <SuppliersTable data={data} /> : <DocumentsTable data={data} />}
    </div>
  );
}
