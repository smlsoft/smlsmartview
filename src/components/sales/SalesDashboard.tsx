import { CalendarDays, ReceiptText, Search } from "lucide-react";
import Link from "next/link";
import { DocumentStatusChips } from "@/components/erp/DocumentStatusChips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import type { SalesDashboardData, SalesDocument, SalesMenu } from "@/lib/queries/sales";

type SalesDashboardProps = {
  data: SalesDashboardData;
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

function stageVariant(stage: SalesMenu["stage"]) {
  if (stage === "เงินล่วงหน้า" || stage === "เงินมัดจำ") return "warning" as const;
  if (stage === "ขาย/ลดเพิ่มหนี้") return "success" as const;
  if (stage === "POS") return "info" as const;
  return "neutral" as const;
}

function documentDetailHref(data: SalesDashboardData, doc: SalesDocument) {
  const params = new URLSearchParams({
    menu: data.filters.menu,
    doc_no: doc.doc_no,
    doc_date: doc.doc_date.slice(0, 10)
  });

  if (doc.source === "pos_settle") {
    params.set("pos_type", String(doc.pos_trans_type));
  } else {
    params.set("flag", String(doc.trans_flag));
  }

  if (data.filters.start_date) params.set("from", data.filters.start_date);
  if (data.filters.end_date) params.set("to", data.filters.end_date);
  if (data.filters.search) params.set("q", data.filters.search);

  return `/sales/document?${params.toString()}`;
}

function customerLabel(doc: SalesDocument) {
  if (doc.source === "pos_settle") {
    return doc.cashier_code || doc.machine_code || doc.branch_name || "-";
  }
  return doc.customer_name || doc.customer_code || "-";
}

function customerSubLabel(doc: SalesDocument) {
  if (doc.source === "pos_settle") {
    return [doc.machine_code, doc.branch_name].filter(Boolean).join(" / ") || "-";
  }
  return doc.customer_code || doc.sale_code || "-";
}

function amountSubLabel(doc: SalesDocument) {
  if (doc.source === "pos_settle") {
    const channels = [
      doc.cash_amount ? `เงินสด ${formatCompact(doc.cash_amount)}` : "",
      doc.credit_card_amount ? `บัตร ${formatCompact(doc.credit_card_amount)}` : "",
      doc.transfer_amount ? `โอน ${formatCompact(doc.transfer_amount)}` : "",
      doc.wallet_amount ? `wallet ${formatCompact(doc.wallet_amount)}` : ""
    ].filter(Boolean);
    return channels.join(" / ") || "POS";
  }
  return `${formatNumber(doc.line_count)} lines`;
}

function DocumentStatus({ doc }: { doc: SalesDocument }) {
  if (doc.source === "pos_settle") {
    return (
      <div className="flex flex-wrap gap-1.5">
        <StatusChip variant="info">POS</StatusChip>
        <StatusChip variant="success">บันทึกแล้ว</StatusChip>
      </div>
    );
  }

  return <DocumentStatusChips doc={doc} />;
}

function FilterBar({ data }: { data: SalesDashboardData }) {
  return (
    <Card className="p-4">
      <form
        action="/sales"
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
            placeholder="เลขเอกสาร / ลูกค้า / แคชเชียร์ / อ้างอิง"
            className="h-11 pl-9"
            aria-label="ค้นหาเอกสารขาย"
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

function DocumentsTable({ data }: { data: SalesDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 py-3.5">
        <span className="text-sm font-semibold text-text-secondary">รายการเอกสาร</span>
        <StatusChip variant="neutral">{formatNumber(data.documents.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1120px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">เอกสาร</th>
                <th className="px-5 py-3 font-semibold">วันที่</th>
                <th className="px-5 py-3 font-semibold">ลูกค้า/แคชเชียร์</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">รายการ/หมายเหตุ</th>
                <th className="px-5 py-3 text-right font-semibold">ยอดสุทธิ</th>
                <th className="px-5 py-3 text-right font-semibold">คงเหลือ/ช่องทาง</th>
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
                  <tr
                    key={`${doc.source}-${doc.trans_flag}-${doc.pos_trans_type}-${doc.doc_no}-${doc.doc_date}`}
                  >
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
                        {customerLabel(doc)}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {customerSubLabel(doc)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[190px] leading-5 text-text-primary">
                        {doc.flag_label}
                      </p>
                      <p className="label-caps mt-1 text-text-tertiary">
                        {doc.source === "pos_settle" ? `POS ${doc.pos_trans_type}` : `TF ${doc.trans_flag}`}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[230px] leading-5 text-text-primary">
                        {doc.sample_item_name || doc.remark || doc.doc_ref || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.sample_item_code || amountSubLabel(doc)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatCompact(doc.total_amount || doc.item_amount)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {doc.source === "pos_settle"
                          ? amountSubLabel(doc)
                          : `${formatNumber(doc.line_count)} item`}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-secondary">
                        {formatCompact(doc.balance_amount)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {doc.branch_name || "-"}
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

export function SalesDashboard({ data }: SalesDashboardProps) {
  return (
    <div className="space-y-4">
      <section>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            {data.selected_menu.label}
          </h1>
          {data.selected_menu.stage ? (
            <StatusChip variant={stageVariant(data.selected_menu.stage)}>
              {data.selected_menu.stage}
            </StatusChip>
          ) : null}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          <span>ข้อมูลล่าสุด ณ วันที่ {formatDate(data.period.as_of_date)}</span>
          <span>· ช่วงเอกสาร {formatDate(data.period.start_date)} ถึง {formatDate(data.period.end_date)}</span>
        </p>
      </section>

      <FilterBar data={data} />

      <DocumentsTable data={data} />
    </div>
  );
}
