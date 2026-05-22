import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  FileText,
  Hash,
  HandCoins,
  Landmark,
  ReceiptText,
  UserRound,
  Warehouse
} from "lucide-react";
import Link from "next/link";
import { DocumentStatusChips } from "@/components/erp/DocumentStatusChips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  ApDebtLine,
  ApDocumentDetailData,
  ApDocumentHeader,
  ApItemLine
} from "@/lib/queries/ap";

type ApDocumentDetailProps = {
  data: ApDocumentDetailData;
  backHref: string;
};

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

function DocumentOverview({ header }: { header: ApDocumentHeader }) {
  return (
    <Card className="p-6">
      <CardHeader className="space-y-0 p-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="label-caps text-text-tertiary">เอกสาร</p>
            <h2 className="mt-2 break-all font-mono text-2xl font-semibold tracking-normal text-text-primary">
              {header.doc_no}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">{header.flag_label}</p>
          </div>
          <DocumentStatusChips doc={header} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-0 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <InfoItem
          icon={CalendarDays}
          label="วันที่"
          value={`${formatDate(header.doc_date)}${header.doc_time ? ` · ${header.doc_time}` : ""}`}
        />
        <InfoItem icon={Hash} label="Trans Flag" value={`TF ${header.trans_flag}`} />
        <InfoItem
          icon={FileText}
          label="Source"
          value={header.source === "ap_ar_trans" ? "ap_ar_trans" : "ic_trans"}
        />
        <InfoItem icon={FileText} label="อ้างอิง" value={valueOrDash(header.doc_ref)} />
        <InfoItem
          icon={UserRound}
          label="เจ้าหนี้"
          value={valueOrDash(header.supplier_name || header.supplier_code)}
        />
        <InfoItem icon={Landmark} label="สาขา" value={valueOrDash(header.branch_name || header.branch_code)} />
        <InfoItem icon={ReceiptText} label="ใบกำกับ" value={valueOrDash(header.tax_doc_no)} />
        <InfoItem icon={CalendarDays} label="ครบกำหนด" value={formatDate(header.due_date)} />
      </CardContent>
    </Card>
  );
}

function TotalsPanel({ header }: { header: ApDocumentHeader }) {
  return (
    <Card className="p-6">
      <CardHeader className="space-y-0 p-0">
        <CardTitle>ยอดในเอกสาร</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <AmountRow label="มูลค่า" value={header.total_value || header.total_debt_value} />
        <AmountRow label="ส่วนลด" value={header.total_discount} />
        <AmountRow label="ก่อน VAT" value={header.total_before_vat} />
        <AmountRow label="VAT" value={header.total_vat_value} />
        <AmountRow label="หลัง VAT" value={header.total_after_vat} />
        <AmountRow label="สุทธิ" value={header.total_amount} />
        <AmountRow label="ชำระ" value={header.total_pay_money} />
        <AmountRow label="หัก ณ ที่จ่าย" value={header.total_pay_tax} />
        <AmountRow label="คงเหลือ" value={header.balance_amount || header.total_debt_balance} />
      </CardContent>
    </Card>
  );
}

function PaymentPanel({ header }: { header: ApDocumentHeader }) {
  return (
    <Card className="p-6">
      <CardHeader className="space-y-0 p-0">
        <CardTitle>ช่องทางชำระ</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <AmountRow label="เงินสด" value={header.sum_pay_money_cash} />
        <AmountRow label="เช็ค" value={header.sum_pay_money_chq} />
        <AmountRow label="บัตรเครดิต" value={header.sum_pay_money_credit} />
        <AmountRow label="โอน" value={header.sum_pay_money_transfer} />
      </CardContent>
    </Card>
  );
}

function StatusPanel({ header }: { header: ApDocumentHeader }) {
  const rows = [
    ["last_status", header.last_status],
    ["approve_status", header.approve_status],
    ["doc_success", header.doc_success],
    ["used_status", header.used_status],
    ["on_hold", header.on_hold],
    ["expire_status", header.expire_status],
    ["not_approve_1", header.not_approve_1]
  ];

  return (
    <Card className="p-6">
      <CardHeader className="space-y-0 p-0">
        <CardTitle>สถานะเอกสาร</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="grid grid-cols-2 gap-2">
          {rows.map(([label, value]) => (
            <div key={label} className="premium-panel rounded-md p-3">
              <p className="label-caps text-text-tertiary">{label}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-text-primary">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-sm text-text-secondary">
          <p>ผู้อนุมัติ: {header.user_approve || "-"}</p>
          <p>ผู้ยกเลิก: {header.user_cancel || "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function warehouseLabel(line: ApItemLine) {
  const from = [line.wh_code, line.shelf_code].filter(Boolean).join("/");
  return from || "-";
}

function ItemLinesTable({ lines }: { lines: ApItemLine[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-4">
        <div>
          <CardTitle>รายการสินค้า/บริการ</CardTitle>
          <p className="mt-2 text-sm text-text-secondary">{formatNumber(lines.length)} lines</p>
        </div>
        <Warehouse className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[980px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">รายการ</th>
                <th className="px-5 py-3 text-right font-semibold">จำนวน</th>
                <th className="px-5 py-3 text-right font-semibold">ราคา</th>
                <th className="px-5 py-3 font-semibold">ส่วนลด</th>
                <th className="px-5 py-3 text-right font-semibold">มูลค่า</th>
                <th className="px-5 py-3 font-semibold">คลัง/ที่เก็บ</th>
                <th className="px-5 py-3 font-semibold">อ้างอิง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบรายการสินค้า/บริการในเอกสารนี้
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={`${line.line_number}-${line.item_code}`}>
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
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatNumber(line.qty, 2)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {line.unit_code || "-"} / ฐาน {formatNumber(line.base_qty, 2)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(line.price)}
                    </td>
                    <td className="px-5 py-4 align-top text-text-secondary">
                      {line.discount || "-"}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(line.sum_amount)}
                    </td>
                    <td className="px-5 py-4 align-top text-text-secondary">
                      {warehouseLabel(line)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-secondary">{line.ref_doc_no || "-"}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatDate(line.ref_doc_date)}
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

function DebtLinesTable({ lines }: { lines: ApDebtLine[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-4">
        <div>
          <CardTitle>รายการหนี้/อ้างอิง</CardTitle>
          <p className="mt-2 text-sm text-text-secondary">{formatNumber(lines.length)} lines</p>
        </div>
        <ReceiptText className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[980px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">เอกสารอ้างอิง</th>
                <th className="px-5 py-3 font-semibold">ครบกำหนด</th>
                <th className="px-5 py-3 text-right font-semibold">มูลค่า</th>
                <th className="px-5 py-3 text-right font-semibold">VAT</th>
                <th className="px-5 py-3 text-right font-semibold">สุทธิ</th>
                <th className="px-5 py-3 text-right font-semibold">ชำระ</th>
                <th className="px-5 py-3 text-right font-semibold">คงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบรายการหนี้หรือรายการอ้างอิงในเอกสารนี้
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={`${line.line_number}-${line.billing_no}-${line.ref_doc_no}`}>
                    <td className="px-5 py-4 align-top font-mono text-text-tertiary">
                      {line.line_number || "-"}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-primary">
                        {line.billing_no || line.ref_doc_no || "-"}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatDate(line.billing_date || line.ref_doc_date)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-text-secondary">
                      {formatDate(line.due_date)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(line.sum_debt_value)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatMoney(line.sum_tax_value)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(line.sum_debt_amount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(line.sum_pay_money)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-secondary">
                      {formatMoney(line.sum_debt_balance)}
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

export function ApDocumentDetail({ data, backHref }: ApDocumentDetailProps) {
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
            <HandCoins className="h-3.5 w-3.5" aria-hidden="true" />
            ระบบเจ้าหนี้
          </StatusChip>
          <StatusChip variant="neutral">อ่านอย่างเดียว</StatusChip>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 text-[34px] leading-[42px] tracking-normal text-text-primary">
            รายละเอียดเอกสารเจ้าหนี้
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {data.header.flag_label} · {formatDate(data.header.doc_date)}
          </p>
        </div>
      </section>

      <DocumentOverview header={data.header} />

      {data.header.remark ? (
        <Card className="p-5">
          <p className="label-caps text-text-tertiary">หมายเหตุ</p>
          <p className="mt-2 text-sm leading-6 text-text-primary">{data.header.remark}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <ItemLinesTable lines={data.item_lines} />
          <DebtLinesTable lines={data.debt_lines} />
        </div>
        <div className="space-y-4">
          <TotalsPanel header={data.header} />
          <PaymentPanel header={data.header} />
          <StatusPanel header={data.header} />
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
              <div>
                <CardTitle>รวมที่แสดง</CardTitle>
                <p className="mt-2 text-sm text-text-secondary">
                  หนี้ {formatMoney(data.totals.debt_amount)} · ชำระ {formatMoney(data.totals.paid_amount)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
