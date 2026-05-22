import { ArrowLeft, BookOpenCheck, CalendarDays, FileText, Hash, Landmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  AccountingDocumentDetailData,
  AccountingDocumentLine
} from "@/lib/queries/accounting";

type AccountingDocumentDetailProps = {
  data: AccountingDocumentDetailData;
  backHref: string;
};

type Header = AccountingDocumentDetailData["header"];

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

function valueOrDash(value: string | number) {
  if (typeof value === "number") return value === 0 ? "-" : formatNumber(value);
  return value.trim() || "-";
}

function sourceLabel(source: Header["source"]) {
  if (source === "maintenance") return "as_asset_maintenance";
  if (source === "sale") return "as_asset_sale";
  if (source === "transfer") return "as_trans";
  return "gl_journal";
}

function statusChip(header: Header) {
  if (header.source === "journal") {
    return header.is_pass === 1 ? (
      <StatusChip variant="success">ผ่านรายการ</StatusChip>
    ) : (
      <StatusChip variant="warning">ยังไม่ผ่าน</StatusChip>
    );
  }
  return <StatusChip variant={header.status === 0 ? "neutral" : "warning"}>status {header.status}</StatusChip>;
}

function InfoItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="premium-panel min-w-0 rounded-md p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-medium text-text-primary" title={value}>
        {value}
      </p>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
        {formatMoney(value)}
      </span>
    </div>
  );
}

function DocumentOverview({ header }: { header: Header }) {
  return (
    <Card className="p-6">
      <CardHeader className="space-y-0 p-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="label-caps text-text-tertiary">เอกสาร</p>
            <h2 className="mt-2 break-all font-mono text-2xl font-semibold tracking-normal text-text-primary">
              {header.doc_no}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">{sourceLabel(header.source)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusChip(header)}
            {header.trans_flag ? (
              <StatusChip variant="neutral">TF {header.trans_flag}</StatusChip>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-0 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <InfoItem
          icon={CalendarDays}
          label="วันที่"
          value={`${formatDate(header.doc_date)}${header.doc_time ? ` · ${header.doc_time}` : ""}`}
        />
        <InfoItem icon={Hash} label="เอกสาร/รูปแบบ" value={valueOrDash(header.doc_format_code)} />
        <InfoItem icon={FileText} label="อ้างอิง" value={valueOrDash(header.doc_ref)} />
        <InfoItem icon={Landmark} label="สมุดรายวัน" value={valueOrDash(header.book_name || header.book_code)} />
        <InfoItem icon={BookOpenCheck} label="คู่ค้า/สินทรัพย์" value={valueOrDash(header.party_name || header.party_code)} />
        <InfoItem icon={Landmark} label="สาขา/แผนก" value={valueOrDash([header.branch_code, header.department_code].filter(Boolean).join(" / "))} />
        <InfoItem icon={FileText} label="จำนวนบรรทัด" value={formatNumber(header.line_count)} />
        <InfoItem icon={Hash} label="Source" value={sourceLabel(header.source)} />
      </CardContent>
    </Card>
  );
}

function TotalsPanel({ data }: { data: AccountingDocumentDetailData }) {
  return (
    <Card className="p-6">
      <CardHeader className="space-y-0 p-0">
        <CardTitle>ยอดรวม</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <AmountRow label="มูลค่าเอกสาร" value={data.header.total_amount} />
        <AmountRow label="ยอดรายการ" value={data.totals.amount} />
        <AmountRow label="เดบิต" value={data.header.debit || data.totals.debit} />
        <AmountRow label="เครดิต" value={data.header.credit || data.totals.credit} />
        <AmountRow label="ผลต่างเดบิต-เครดิต" value={data.totals.diff} />
      </CardContent>
    </Card>
  );
}

function LinesTable({ lines }: { lines: AccountingDocumentLine[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-4">
        <div>
          <CardTitle>รายการ</CardTitle>
          <p className="mt-2 text-sm text-text-secondary">{formatNumber(lines.length)} lines</p>
        </div>
        <BookOpenCheck className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1080px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">รายการ/สินทรัพย์</th>
                <th className="px-5 py-3 font-semibold">บัญชี</th>
                <th className="px-5 py-3 font-semibold">อ้างอิง</th>
                <th className="px-5 py-3 text-right font-semibold">มูลค่า</th>
                <th className="px-5 py-3 text-right font-semibold">เดบิต</th>
                <th className="px-5 py-3 text-right font-semibold">เครดิต</th>
                <th className="px-5 py-3 font-semibold">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบรายการในเอกสารนี้
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={`${line.line_number}-${line.item_code}-${line.account_code}`}>
                    <td className="px-5 py-4 align-top font-mono text-text-tertiary">
                      {line.line_number || "-"}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[260px] leading-5 text-text-primary">
                        {line.item_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {line.item_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-primary">{line.account_code || "-"}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {line.account_name || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-secondary">{line.ref_doc_no || "-"}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatDate(line.ref_doc_date)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(line.amount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(line.debit)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(line.credit)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[220px] leading-5 text-text-secondary">
                        {line.remark || "-"}
                      </p>
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

export function AccountingDocumentDetail({
  data,
  backHref
}: AccountingDocumentDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="secondary">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            กลับรายการ
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="info">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ระบบบัญชี
          </StatusChip>
          <StatusChip variant="neutral">อ่านอย่างเดียว</StatusChip>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 text-[34px] leading-[42px] tracking-normal text-text-primary">
            รายละเอียดเอกสารบัญชี
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {data.selected_menu.label} · {formatDate(data.header.doc_date)}
          </p>
        </div>
      </section>

      <DocumentOverview header={data.header} />

      {data.header.remark || data.header.title ? (
        <Card className="p-5">
          <p className="label-caps text-text-tertiary">คำอธิบาย/หมายเหตุ</p>
          <p className="mt-2 text-sm leading-6 text-text-primary">
            {data.header.remark || data.header.title}
          </p>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <LinesTable lines={data.lines} />
        <TotalsPanel data={data} />
      </section>
    </div>
  );
}
