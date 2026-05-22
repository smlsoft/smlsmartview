import Link from "next/link";
import { AccountingMappingDetail } from "@/components/accounting/AccountingMappingDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getAccountingMappingDetail } from "@/lib/queries/accounting";

export const dynamic = "force-dynamic";

type AccountingMappingPageProps = {
  searchParams?: Promise<{
    doc_code?: string;
    q?: string;
  }>;
};

function accountingMappingBackHref(
  params: Awaited<NonNullable<AccountingMappingPageProps["searchParams"]>>
) {
  const query = new URLSearchParams({ menu: "mapping" });
  if (params.q) query.set("q", params.q);
  return `/accounting?${query.toString()}`;
}

export default async function AccountingMappingPage({
  searchParams
}: AccountingMappingPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = accountingMappingBackHref(params);

  try {
    const data = await getAccountingMappingDetail(session.provider_code, session.db_code, {
      docCode: params.doc_code
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบรายละเอียดฝังบัญชี</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบรหัสรูปแบบเอกสารจากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <AccountingMappingDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดฝังบัญชีไม่สำเร็จ</CardTitle>
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
