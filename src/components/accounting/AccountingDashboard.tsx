import { BookOpenCheck, CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  AccountingAsset,
  AccountingDashboardData,
  AccountingDocument,
  AccountingMapping,
  AccountingMenu
} from "@/lib/queries/accounting";
import { accountingAssetStatusLabel } from "@/lib/queries/accounting";

type AccountingDashboardProps = {
  data: AccountingDashboardData;
};

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits
  }).format(value);
}

function formatMoney(value: number) {
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

function stageVariant(stage: AccountingMenu["stage"]) {
  if (stage === "สินทรัพย์") return "info" as const;
  if (stage === "โอนบัญชี" || stage === "รายวัน") return "success" as const;
  return "warning" as const;
}

function assetStatus(status: number) {
  if (status === 0) return <StatusChip variant="success">ปกติ</StatusChip>;
  if (status === 1) return <StatusChip variant="warning">ชำรุด</StatusChip>;
  if (status === 2) return <StatusChip variant="danger">สูญหาย</StatusChip>;
  return <StatusChip variant="neutral">status {status}</StatusChip>;
}

function rawStatus(status: number) {
  return <StatusChip variant={status === 0 ? "neutral" : "warning"}>status {status}</StatusChip>;
}

function passStatus(isPass: number) {
  if (isPass === 1) return <StatusChip variant="success">ผ่านรายการ</StatusChip>;
  return <StatusChip variant="warning">ยังไม่ผ่าน</StatusChip>;
}

function documentDetailHref(data: AccountingDashboardData, doc: AccountingDocument) {
  const params = new URLSearchParams({
    menu: data.filters.menu,
    doc_no: doc.doc_no,
    doc_date: doc.doc_date.slice(0, 10)
  });

  if (doc.book_code) params.set("book_code", doc.book_code);
  if (data.filters.start_date) params.set("from", data.filters.start_date);
  if (data.filters.end_date) params.set("to", data.filters.end_date);
  if (data.filters.search) params.set("q", data.filters.search);

  return `/accounting/document?${params.toString()}`;
}

function mappingDetailHref(data: AccountingDashboardData, mapping: AccountingMapping) {
  const params = new URLSearchParams({
    doc_code: mapping.doc_code
  });
  if (data.filters.search) params.set("q", data.filters.search);
  return `/accounting/mapping?${params.toString()}`;
}

function FilterBar({ data }: { data: AccountingDashboardData }) {
  return (
    <Card className="p-4">
      <form
        action="/accounting"
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
            placeholder="เลขเอกสาร / สินทรัพย์ / ผังบัญชี / สมุดรายวัน"
            className="h-11 pl-9"
            aria-label="ค้นหาระบบบัญชี"
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

function AssetsTable({ data }: { data: AccountingDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-col gap-3 p-6 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{data.selected_menu.label}</CardTitle>
            <StatusChip variant="info">as_asset</StatusChip>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            แสดงรหัส ชนิด ที่ตั้ง มูลค่า และบัญชีสินทรัพย์
          </p>
        </div>
        <StatusChip variant="neutral">{formatNumber(data.assets.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1120px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">สินทรัพย์</th>
                <th className="px-5 py-3 font-semibold">ชนิด/ที่ตั้ง</th>
                <th className="px-5 py-3 font-semibold">ซื้อมา</th>
                <th className="px-5 py-3 text-right font-semibold">มูลค่า</th>
                <th className="px-5 py-3 text-right font-semibold">ค่าเสื่อมคงเหลือ</th>
                <th className="px-5 py-3 font-semibold">บัญชี</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบสินทรัพย์ตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.assets.map((asset: AccountingAsset) => (
                  <tr key={asset.code}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/accounting/asset?code=${encodeURIComponent(asset.code)}`}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {asset.code}
                      </Link>
                      <p className="mt-1 line-clamp-2 max-w-[260px] leading-5 text-text-primary">
                        {asset.name_1 || asset.name_2 || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[220px] leading-5 text-text-primary">
                        {asset.type_name || asset.as_type || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {asset.location_name || asset.as_location || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatDate(asset.as_buy_date)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        เริ่มคิด {formatDate(asset.start_calc_date)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(asset.as_buy_price || asset.as_calc_value)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-secondary">
                      {formatMoney(asset.depreciate_balance || asset.as_value_balance)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-primary">{asset.account_code || "-"}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {asset.account_name || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">{assetStatus(asset.status)}</td>
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

function DocumentsTable({ data }: { data: AccountingDashboardData }) {
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
                <th className="px-5 py-3 font-semibold">สมุด/คู่ค้า</th>
                <th className="px-5 py-3 font-semibold">รายละเอียด</th>
                <th className="px-5 py-3 text-right font-semibold">เดบิต</th>
                <th className="px-5 py-3 text-right font-semibold">เครดิต/มูลค่า</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบเอกสารตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.documents.map((doc) => (
                  <tr key={`${doc.source}-${doc.book_code}-${doc.doc_no}-${doc.doc_date}`}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={documentDetailHref(data, doc)}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {doc.doc_no}
                      </Link>
                      <p className="label-caps mt-1 text-text-tertiary">
                        {doc.trans_flag ? `TF ${doc.trans_flag}` : doc.doc_format_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatDate(doc.doc_date)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">{doc.doc_time || "-"}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[220px] leading-5 text-text-primary">
                        {doc.book_name || doc.party_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.book_code || doc.party_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[260px] leading-5 text-text-primary">
                        {doc.title || doc.sample_line || doc.remark || "-"}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatNumber(doc.line_count)} lines
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatMoney(doc.debit)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-secondary">
                      {formatMoney(doc.credit || doc.total_amount)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {doc.source === "journal" ? passStatus(doc.is_pass) : rawStatus(doc.status)}
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

function MappingsTable({ data }: { data: AccountingDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-col gap-3 p-6 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{data.selected_menu.label}</CardTitle>
            <StatusChip variant="warning">erp_doc_format_gl</StatusChip>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Mapping เอกสารไปบัญชีเดบิต/เครดิต
          </p>
        </div>
        <StatusChip variant="neutral">{formatNumber(data.mappings.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[980px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">รหัสเอกสาร</th>
                <th className="px-5 py-3 font-semibold">ชื่อ/หน้าจอ</th>
                <th className="px-5 py-3 font-semibold">สมุดรายวัน</th>
                <th className="px-5 py-3 font-semibold">เงื่อนไขตัวอย่าง</th>
                <th className="px-5 py-3 text-right font-semibold">เดบิต</th>
                <th className="px-5 py-3 text-right font-semibold">เครดิต</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.mappings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบ mapping บัญชีตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.mappings.map((mapping) => (
                  <tr key={mapping.doc_code}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={mappingDetailHref(data, mapping)}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {mapping.doc_code}
                      </Link>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatNumber(mapping.line_count)} lines
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[260px] leading-5 text-text-primary">
                        {mapping.doc_name || "-"}
                      </p>
                      <p className="label-caps mt-1 text-text-tertiary">
                        {mapping.screen_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-primary">{mapping.gl_book || "-"}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {mapping.gl_book_name || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-text-secondary">
                      <p className="line-clamp-2 max-w-[260px] leading-5">
                        {mapping.sample_condition || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatNumber(mapping.debit_count)}
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums">
                      {formatNumber(mapping.credit_count)}
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

export function AccountingDashboard({ data }: AccountingDashboardProps) {
  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 text-[34px] leading-[42px] tracking-normal text-text-primary">
            ระบบบัญชี
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            ข้อมูลถึง {formatDate(data.period.as_of_date)} · ช่วงเอกสาร{" "}
            {formatDate(data.period.start_date)} ถึง {formatDate(data.period.end_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="info">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Accounting
          </StatusChip>
          <StatusChip variant="neutral">อ่านอย่างเดียว</StatusChip>
          <StatusChip variant={stageVariant(data.selected_menu.stage)}>
            {data.selected_menu.stage}
          </StatusChip>
        </div>
      </section>

      <FilterBar data={data} />

      {data.selected_menu.source === "asset" ? (
        <AssetsTable data={data} />
      ) : data.selected_menu.source === "mapping" ? (
        <MappingsTable data={data} />
      ) : (
        <DocumentsTable data={data} />
      )}

      {data.selected_menu.source === "asset" ? (
        <StatusChip variant="neutral">
          สถานะสินทรัพย์: {accountingAssetStatusLabel(0)}, {accountingAssetStatusLabel(1)},{" "}
          {accountingAssetStatusLabel(2)}
        </StatusChip>
      ) : null}
    </div>
  );
}
