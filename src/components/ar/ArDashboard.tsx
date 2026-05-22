import { CalendarDays, Landmark, Search } from "lucide-react";
import Link from "next/link";
import { DocumentStatusChips } from "@/components/erp/DocumentStatusChips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import type { ArDashboardData, ArDocument, ArMenu, ArCustomer } from "@/lib/queries/ar";

type ArDashboardProps = {
  data: ArDashboardData;
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

function stageVariant(stage: ArMenu["stage"]) {
  if (stage === "ยกมา") return "warning" as const;
  if (stage === "วางบิล/ชำระ") return "success" as const;
  if (stage === "อื่นๆ") return "info" as const;
  return "neutral" as const;
}

function customerStatus(customer: ArCustomer) {
  if (customer.status === 1) return <StatusChip variant="success">ติดต่อ</StatusChip>;
  if (customer.status === 0) return <StatusChip variant="danger">ยกเลิก</StatusChip>;
  return <StatusChip variant="neutral">status {customer.status}</StatusChip>;
}

function documentDetailHref(data: ArDashboardData, doc: ArDocument) {
  const params = new URLSearchParams({
    menu: data.filters.menu,
    flag: String(doc.trans_flag),
    doc_no: doc.doc_no,
    doc_date: doc.doc_date.slice(0, 10)
  });

  if (data.filters.start_date) params.set("from", data.filters.start_date);
  if (data.filters.end_date) params.set("to", data.filters.end_date);
  if (data.filters.search) params.set("q", data.filters.search);

  return `/ar/document?${params.toString()}`;
}

function CustomerFilter({ data }: { data: ArDashboardData }) {
  return (
    <Card className="p-4">
      <form action="/ar" className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto]">
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
            aria-label="ค้นหาลูกหนี้"
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

function DocumentFilter({ data }: { data: ArDashboardData }) {
  return (
    <Card className="p-4">
      <form
        action="/ar"
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
            placeholder="เลขเอกสาร / ลูกหนี้ / เอกสารอ้างอิง"
            className="h-11 pl-9"
            aria-label="ค้นหาเอกสารลูกหนี้"
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

function CustomersTable({ data }: { data: ArDashboardData }) {
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
            แสดงจากตาราง ar_customer
          </p>
        </div>
        <StatusChip variant="neutral">{formatNumber(data.customers.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[980px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">ลูกหนี้</th>
                <th className="px-5 py-3 font-semibold">ติดต่อ</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 text-right font-semibold">ระดับราคา</th>
                <th className="px-5 py-3 text-right font-semibold">แต้มสะสม</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบลูกหนี้ตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.customers.map((customer) => (
                  <tr key={customer.code}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/ar/customer?code=${encodeURIComponent(customer.code)}`}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {customer.code}
                      </Link>
                      <p className="mt-1 line-clamp-2 max-w-[280px] leading-5 text-text-primary">
                        {customer.name_1 || customer.name_2 || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-[220px] truncate text-text-primary">
                        {customer.telephone || "-"}
                      </p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {customer.email || customer.website || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-text-secondary">
                      {customer.ar_type || "-"}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatNumber(customer.price_level)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatCompact(customer.point_balance)}
                    </td>
                    <td className="px-5 py-4 align-top">{customerStatus(customer)}</td>
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

function DocumentsTable({ data }: { data: ArDashboardData }) {
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
                <th className="px-5 py-3 font-semibold">ลูกหนี้</th>
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
                        {doc.customer_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.customer_code || "-"}
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

export function ArDashboard({ data }: ArDashboardProps) {
  const isCustomer = data.selected_menu.source === "customer";

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 text-[34px] leading-[42px] tracking-normal text-text-primary">
            ระบบลูกหนี้
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {isCustomer
              ? "ข้อมูลหลักลูกหนี้"
              : `ช่วงเอกสาร ${formatDate(data.period.start_date)} ถึง ${formatDate(data.period.end_date)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="info">
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            AR
          </StatusChip>
          <StatusChip variant="neutral">อ่านอย่างเดียว</StatusChip>
        </div>
      </section>

      {isCustomer ? <CustomerFilter data={data} /> : <DocumentFilter data={data} />}

      {isCustomer ? <CustomersTable data={data} /> : <DocumentsTable data={data} />}
    </div>
  );
}
