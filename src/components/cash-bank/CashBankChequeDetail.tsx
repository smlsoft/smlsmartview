import { ArrowLeft, Banknote, CalendarDays, CreditCard, Landmark, ReceiptText, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type { CashBankChequeDetailData } from "@/lib/queries/cash-bank";

type CashBankChequeDetailProps = {
  data: CashBankChequeDetailData;
  backHref: string;
};

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

function chequeStatus(status: number) {
  const labels = new Map<number, string>([
    [0, "เช็คในมือ"],
    [1, "เช็คนำฝาก"],
    [2, "เช็คผ่าน"],
    [3, "เช็ครับคืน"],
    [4, "เช็คยกเลิก"],
    [5, "เช็คขายลด"],
    [6, "เช็คคืนนำเข้าใหม่"],
    [7, "เช็คเปลี่ยน"]
  ]);
  const label = labels.get(status) ?? `status ${status}`;
  if (status === 2) return <StatusChip variant="success">{label}</StatusChip>;
  if (status === 4) return <StatusChip variant="danger">{label}</StatusChip>;
  if (status === 1 || status === 5 || status === 7) return <StatusChip variant="info">{label}</StatusChip>;
  return <StatusChip variant="warning">{label}</StatusChip>;
}

function InfoCard({
  title,
  value,
  sub
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <p className="label-caps text-text-tertiary">{title}</p>
      <p className="mt-2 break-words text-sm font-medium leading-6 text-text-primary">
        {value || "-"}
      </p>
      {sub ? <p className="mt-1 text-xs text-text-tertiary">{sub}</p> : null}
    </Card>
  );
}

function AmountCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="label-caps text-text-tertiary">{title}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-text-primary">
        {formatMoney(value)}
      </p>
    </Card>
  );
}

export function CashBankChequeDetail({ data, backHref }: CashBankChequeDetailProps) {
  const cheque = data.cheque;
  const chequeTypeLabel = cheque.chq_type === 1 ? "เช็ครับ" : "เช็คจ่าย";

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
            <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
            {chequeTypeLabel}
          </StatusChip>
          {chequeStatus(cheque.status)}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 break-all text-[34px] leading-[42px] tracking-normal text-text-primary">
            {cheque.chq_number}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {chequeTypeLabel} · ครบกำหนด {formatDate(cheque.chq_due_date)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AmountCard title="จำนวนเงิน" value={cheque.amount} />
        <InfoCard title="วันที่รับเช็ค" value={formatDate(cheque.chq_get_date)} />
        <InfoCard title="วันที่ครบกำหนด" value={formatDate(cheque.chq_due_date)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="เลขเช็ค" value={cheque.chq_number} sub={`type ${cheque.chq_type}`} />
          <InfoCard title="เอกสารอ้างอิง" value={cheque.doc_ref} sub={`trans_flag ${cheque.trans_flag || "-"}`} />
          <InfoCard title="คู่ค้า" value={cheque.ap_ar_name || cheque.owner_name} sub={cheque.ap_ar_code || cheque.person_code} />
          <InfoCard title="ธนาคาร" value={cheque.bank_name || cheque.bank_code} sub={cheque.bank_branch} />
          <InfoCard title="สมุดเงินฝาก" value={cheque.pass_book_name || cheque.pass_book_code} sub={cheque.book_code} />
          <InfoCard title="สกุลเงิน" value={cheque.currency_code || "-"} />
        </div>
        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader className="space-y-0 p-0">
              <CardTitle>สถานะเช็ค</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0 pt-4 text-sm text-text-secondary">
              <p className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {chequeStatus(cheque.status)}
              </p>
              <p className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {cheque.owner_name || cheque.ap_ar_name || "-"}
              </p>
              <p className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {[cheque.bank_code, cheque.bank_branch].filter(Boolean).join(" / ") || "-"}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {formatDate(cheque.chq_get_date)} - {formatDate(cheque.chq_due_date)}
              </p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader className="space-y-0 p-0">
              <CardTitle>หมายเหตุ</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <p className="text-sm leading-6 text-text-secondary">{cheque.remark || "-"}</p>
            </CardContent>
          </Card>
          <StatusChip variant="neutral">
            <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
            cb_chq_list
          </StatusChip>
        </div>
      </section>
    </div>
  );
}
