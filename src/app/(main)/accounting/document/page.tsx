import Link from "next/link";
import { AccountingDocumentDetail } from "@/components/accounting/AccountingDocumentDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getAccountingDocumentDetail } from "@/lib/queries/accounting";

export const dynamic = "force-dynamic";

type AccountingDocumentPageProps = {
  searchParams?: Promise<{
    menu?: string;
    doc_no?: string;
    doc_date?: string;
    book_code?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
};

function accountingBackHref(
  params: Awaited<NonNullable<AccountingDocumentPageProps["searchParams"]>>
) {
  const query = new URLSearchParams();
  if (params.menu) query.set("menu", params.menu);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);

  const suffix = query.toString();
  return suffix ? `/accounting?${suffix}` : "/accounting";
}

export default async function AccountingDocumentPage({
  searchParams
}: AccountingDocumentPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = accountingBackHref(params);

  try {
    const data = await getAccountingDocumentDetail(session.provider_code, session.db_code, {
      menu: params.menu,
      docNo: params.doc_no,
      docDate: params.doc_date,
      bookCode: params.book_code
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบเอกสารบัญชี</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบเลขเอกสาร วันที่ และสมุดรายวันจากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <AccountingDocumentDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดเอกสารบัญชีไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href={backHref}>กลับรายการ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
