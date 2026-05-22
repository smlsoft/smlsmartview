import { ArrowLeft, BookOpenCheck, FileText, Landmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type { AccountingMappingDetailData } from "@/lib/queries/accounting";

type AccountingMappingDetailProps = {
  data: AccountingMappingDetailData;
  backHref: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0
  }).format(value);
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

export function AccountingMappingDetail({ data, backHref }: AccountingMappingDetailProps) {
  const mapping = data.mapping;

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
          <StatusChip variant="warning">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ฝังบัญชี
          </StatusChip>
          <StatusChip variant="neutral">อ่านอย่างเดียว</StatusChip>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="label-caps text-text-tertiary">{data.company_name}</p>
          <h1 className="font-display mt-2 break-all text-[34px] leading-[42px] tracking-normal text-text-primary">
            {mapping.doc_code}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {mapping.doc_name || "erp_doc_format_gl"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard title="รูปแบบเอกสาร" value={mapping.doc_name} sub={mapping.doc_code} />
        <InfoCard title="หน้าจอ" value={mapping.screen_code} />
        <InfoCard title="สมุดรายวัน" value={mapping.gl_book_name || mapping.gl_book} sub={mapping.gl_book} />
        <InfoCard title="จำนวนบรรทัด" value={formatNumber(mapping.line_count)} />
      </section>

      <Card className="overflow-hidden p-0">
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-4">
          <div>
            <CardTitle>รายละเอียดการผูกบัญชี</CardTitle>
            <p className="mt-2 text-sm text-text-secondary">
              {formatNumber(data.lines.length)} lines
            </p>
          </div>
          <FileText className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto premium-scrollbar">
            <table className="w-full min-w-[1080px] border-t border-border text-sm">
              <thead className="bg-surface-muted text-left">
                <tr className="label-caps text-text-tertiary">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">เงื่อนไข</th>
                  <th className="px-5 py-3 font-semibold">เดบิต</th>
                  <th className="px-5 py-3 font-semibold">เครดิต</th>
                  <th className="px-5 py-3 font-semibold">คำอธิบายบัญชี</th>
                  <th className="px-5 py-3 font-semibold">Compare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-text-secondary">
                      ไม่พบรายการผูกบัญชี
                    </td>
                  </tr>
                ) : (
                  data.lines.map((line) => (
                    <tr key={`${line.line_number}-${line.condition_number}`}>
                      <td className="px-5 py-4 align-top font-mono text-text-tertiary">
                        {line.line_number || line.condition_number || "-"}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="line-clamp-2 max-w-[280px] leading-5 text-text-primary">
                          {line.condition_name || "-"}
                        </p>
                        <p className="label-caps mt-1 text-text-tertiary">
                          {line.condition_case || `condition ${line.condition_number}`}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono text-text-primary">
                          {line.account_code_debit || "-"}
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                          {line.account_debit_name || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono text-text-primary">
                          {line.account_code_credit || "-"}
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-text-tertiary">
                          {line.account_credit_name || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="line-clamp-2 max-w-[240px] leading-5 text-text-secondary">
                          {line.account_name || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono text-text-secondary">
                          {line.code_compare || "-"}
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

      <StatusChip variant="neutral">
        <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
        erp_doc_format_gl
      </StatusChip>
    </div>
  );
}
