import { ArrowLeft, BookOpenCheck, Building2, CalendarDays, Landmark, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { accountingAssetStatusLabel, type AccountingAssetDetailData } from "@/lib/queries/accounting";

type AccountingAssetDetailProps = {
  data: AccountingAssetDetailData;
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

function assetStatus(status: number) {
  if (status === 0) return <StatusChip variant="success">ปกติ</StatusChip>;
  if (status === 1) return <StatusChip variant="warning">ชำรุด</StatusChip>;
  if (status === 2) return <StatusChip variant="danger">สูญหาย</StatusChip>;
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

export function AccountingAssetDetail({ data, backHref }: AccountingAssetDetailProps) {
  const asset = data.asset;

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
            as_asset
          </StatusChip>
          {assetStatus(asset.status)}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 break-words text-[34px] leading-[42px] tracking-normal text-text-primary">
            {asset.name_1 || asset.code}
          </h1>
          <p className="mt-3 font-mono text-sm text-text-secondary">{asset.code}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <AmountCard title="ราคาซื้อ" value={asset.as_buy_price} />
        <AmountCard title="มูลค่าคิดค่าเสื่อม" value={asset.as_calc_value} />
        <AmountCard title="มูลค่าคงเหลือ" value={asset.as_value_balance} />
        <AmountCard title="ค่าเสื่อมคงเหลือ" value={asset.depreciate_balance} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="ชื่อ 1" value={asset.name_1} />
          <InfoCard title="ชื่อ 2" value={asset.name_2} />
          <InfoCard title="ชนิดสินทรัพย์" value={asset.type_name || asset.as_type} sub={asset.as_type} />
          <InfoCard title="ที่ตั้ง" value={asset.location_name || asset.as_location} sub={asset.as_location} />
          <InfoCard title="วันที่ซื้อ" value={formatDate(asset.as_buy_date)} />
          <InfoCard title="เริ่มคิดค่าเสื่อม" value={formatDate(asset.start_calc_date)} />
          <InfoCard title="อัตราค่าเสื่อม" value={`${asset.as_rate || 0}`} sub={asset.depreciate_method} />
          <InfoCard title="แผนก/ฝ่าย" value={[asset.department_code, asset.side_code].filter(Boolean).join(" / ")} />
        </div>
        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader className="space-y-0 p-0">
              <CardTitle>บัญชีที่เกี่ยวข้อง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0 pt-4 text-sm text-text-secondary">
              <p className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {asset.account_code || "-"} {asset.account_name ? `· ${asset.account_name}` : ""}
              </p>
              <p className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {asset.depreciation_account_code || "-"}{" "}
                {asset.depreciation_account_name ? `· ${asset.depreciation_account_name}` : ""}
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {asset.depreciation_sum_account_code || "-"}{" "}
                {asset.depreciation_sum_account_name ? `· ${asset.depreciation_sum_account_name}` : ""}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                {accountingAssetStatusLabel(asset.status)}
              </p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader className="space-y-0 p-0">
              <CardTitle>หมายเหตุ</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <p className="text-sm leading-6 text-text-secondary">{asset.remark || "-"}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
