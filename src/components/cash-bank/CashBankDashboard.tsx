import { Banknote, CalendarDays, CreditCard, Landmark, Search } from "lucide-react";
import Link from "next/link";
import { DocumentStatusChips } from "@/components/erp/DocumentStatusChips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  CashBankCheque,
  CashBankDashboardData,
  CashBankDocument,
  CashBankMenu
} from "@/lib/queries/cash-bank";

type CashBankDashboardProps = {
  data: CashBankDashboardData;
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

function stageVariant(stage: CashBankMenu["stage"]) {
  if (stage === "ยกมา" || stage === "เงินสดย่อย") return "warning" as const;
  if (stage === "ธนาคาร" || stage === "บัตรเครดิต") return "success" as const;
  if (stage === "เช็ครับ" || stage === "เช็คจ่าย") return "info" as const;
  if (stage === "ยังไม่ยืนยัน") return "danger" as const;
  return "neutral" as const;
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

function documentDetailHref(data: CashBankDashboardData, doc: CashBankDocument) {
  const params = new URLSearchParams({
    menu: data.filters.menu,
    flag: String(doc.trans_flag),
    doc_no: doc.doc_no,
    doc_date: doc.doc_date.slice(0, 10)
  });

  if (data.filters.start_date) params.set("from", data.filters.start_date);
  if (data.filters.end_date) params.set("to", data.filters.end_date);
  if (data.filters.search) params.set("q", data.filters.search);

  return `/cash-bank/document?${params.toString()}`;
}

function chequeDetailHref(data: CashBankDashboardData, cheque: CashBankCheque) {
  const params = new URLSearchParams({
    type: String(cheque.chq_type),
    chq_number: cheque.chq_number
  });
  const getDate = (cheque.chq_get_date || cheque.chq_due_date).slice(0, 10);
  if (getDate) params.set("get_date", getDate);
  if (data.filters.menu) params.set("menu", data.filters.menu);
  if (data.filters.search) params.set("q", data.filters.search);

  return `/cash-bank/cheque?${params.toString()}`;
}

function FilterBar({ data }: { data: CashBankDashboardData }) {
  return (
    <Card className="p-4">
      <form
        action="/cash-bank"
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
            placeholder="เลขเอกสาร / เช็ค / สมุดเงินฝาก / คู่ค้า / อ้างอิง"
            className="h-11 pl-9"
            aria-label="ค้นหาเอกสารเงินสดธนาคาร"
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

function UnconfirmedPanel({ data }: { data: CashBankDashboardData }) {
  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <p className="text-sm leading-6 text-text-secondary">
          {data.selected_menu.unconfirmed_reason ||
            "ยังไม่พบ source ที่ยืนยันเมนูนี้ได้ จึงไม่ผูก query เอกสารให้เดา"}
        </p>
      </CardContent>
    </Card>
  );
}

function DocumentsTable({ data }: { data: CashBankDashboardData }) {
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
                <th className="px-5 py-3 font-semibold">คู่ค้า/บัญชี</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">รายละเอียด</th>
                <th className="px-5 py-3 text-right font-semibold">ยอดเอกสาร</th>
                <th className="px-5 py-3 text-right font-semibold">ยอดรายการ</th>
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
                  <tr key={`${doc.trans_flag}-${doc.doc_no}-${doc.doc_date}`}>
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
                        {doc.party_name || doc.pass_book_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.party_code || doc.pass_book_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[190px] leading-5 text-text-primary">
                        {doc.flag_label}
                      </p>
                      <p className="label-caps mt-1 text-text-tertiary">TF {doc.trans_flag}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[240px] leading-5 text-text-primary">
                        {doc.sample_detail || doc.description || doc.remark || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {doc.bank_info || `${formatNumber(doc.line_count)} lines`}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatCompact(doc.total_amount || doc.detail_amount)}
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <p className="tabular-nums text-text-secondary">
                        {formatCompact(doc.detail_amount)}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatNumber(doc.line_count)} รายการ
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

function ChequesTable({ data }: { data: CashBankDashboardData }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 py-3.5">
        <span className="text-sm font-semibold text-text-secondary">รายการเช็ค</span>
        <StatusChip variant="neutral">{formatNumber(data.cheques.length)} rows</StatusChip>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto premium-scrollbar">
          <table className="w-full min-w-[1080px] border-t border-border text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="label-caps text-text-tertiary">
                <th className="px-5 py-3 font-semibold">เลขเช็ค</th>
                <th className="px-5 py-3 font-semibold">วันที่รับ/ครบกำหนด</th>
                <th className="px-5 py-3 font-semibold">คู่ค้า</th>
                <th className="px-5 py-3 font-semibold">ธนาคาร</th>
                <th className="px-5 py-3 font-semibold">อ้างอิง</th>
                <th className="px-5 py-3 text-right font-semibold">จำนวนเงิน</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.cheques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-secondary">
                    ไม่พบเช็คตามเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                data.cheques.map((cheque) => (
                  <tr key={`${cheque.chq_type}-${cheque.chq_number}-${cheque.chq_get_date}`}>
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={chequeDetailHref(data, cheque)}
                        className="font-mono text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
                      >
                        {cheque.chq_number}
                      </Link>
                      <p className="label-caps mt-1 text-text-tertiary">
                        type {cheque.chq_type}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="tabular-nums text-text-primary">
                        {formatDate(cheque.chq_get_date)}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                        ครบกำหนด {formatDate(cheque.chq_due_date)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[220px] leading-5 text-text-primary">
                        {cheque.ap_ar_name || cheque.owner_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {cheque.ap_ar_code || cheque.person_code || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="line-clamp-2 max-w-[220px] leading-5 text-text-primary">
                        {cheque.bank_name || cheque.pass_book_name || "-"}
                      </p>
                      <p className="label-caps mt-1 truncate text-text-tertiary">
                        {[cheque.bank_code, cheque.bank_branch].filter(Boolean).join(" / ") || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-text-primary">{cheque.doc_ref || "-"}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                        {cheque.remark || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatCompact(cheque.amount)}
                    </td>
                    <td className="px-5 py-4 align-top">{chequeStatus(cheque.status)}</td>
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

export function CashBankDashboard({ data }: CashBankDashboardProps) {
  const sourceLabel =
    data.selected_menu.source === "cheque" ? "cb_chq_list" : data.selected_menu.source;

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

      {data.selected_menu.source === "unconfirmed" ? (
        <UnconfirmedPanel data={data} />
      ) : data.selected_menu.source === "cheque" ? (
        <ChequesTable data={data} />
      ) : (
        <DocumentsTable data={data} />
      )}

      {data.selected_menu.source === "ic_trans" ? (
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="neutral">
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            ic_trans + ic_trans_detail
          </StatusChip>
          {data.selected_menu.stage === "บัตรเครดิต" ? (
            <StatusChip variant="neutral">
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              บัตรเครดิต
            </StatusChip>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
