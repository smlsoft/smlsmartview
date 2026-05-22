import { ArrowLeft, Building2, Landmark, Mail, Phone, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type { ArCustomerDetailData } from "@/lib/queries/ar";

type ArCustomerDetailProps = {
  data: ArCustomerDetailData;
  backHref: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value.slice(0, 19);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok"
  }).format(date);
}

function statusChip(status: number) {
  if (status === 1) return <StatusChip variant="success">ติดต่อ</StatusChip>;
  if (status === 0) return <StatusChip variant="danger">ยกเลิก</StatusChip>;
  return <StatusChip variant="neutral">status {status}</StatusChip>;
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

export function ArCustomerDetail({ data, backHref }: ArCustomerDetailProps) {
  const customer = data.customer;

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
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            ข้อมูลลูกหนี้
          </StatusChip>
          {statusChip(customer.status)}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 break-words text-[34px] leading-[42px] tracking-normal text-text-primary">
            {customer.name_1 || customer.code}
          </h1>
          <p className="mt-3 font-mono text-sm text-text-secondary">{customer.code}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AmountCard title="แต้มสะสม" value={customer.point_balance} />
        <AmountCard title="ระดับราคา" value={customer.price_level} />
        <AmountCard title="ชนิดลูกค้า" value={customer.ar_status} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="ชื่อ 1" value={customer.name_1} />
          <InfoCard title="ชื่อ 2" value={customer.name_2} />
          <InfoCard title="ที่อยู่" value={customer.address} />
          <InfoCard title="ประเภทลูกหนี้" value={customer.ar_type} />
          <InfoCard
            title="สร้างข้อมูล"
            value={formatDateTime(customer.create_datetime)}
            sub="create_datetime"
          />
          <InfoCard
            title="แก้ไขล่าสุด"
            value={formatDateTime(customer.last_update_date_time)}
            sub="last_update_date_time"
          />
        </div>
        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader className="space-y-0 p-0">
              <CardTitle>ช่องทางติดต่อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0 pt-4 text-sm text-text-secondary">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {customer.telephone || "-"}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {customer.email || "-"}
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {customer.website || "-"}
              </p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader className="space-y-0 p-0">
              <CardTitle>หมายเหตุ</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <p className="text-sm leading-6 text-text-secondary">
                {customer.remark || "-"}
              </p>
            </CardContent>
          </Card>
          <StatusChip variant="neutral">
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            ar_customer
          </StatusChip>
        </div>
      </section>
    </div>
  );
}
