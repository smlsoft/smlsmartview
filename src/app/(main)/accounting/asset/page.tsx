import Link from "next/link";
import { AccountingAssetDetail } from "@/components/accounting/AccountingAssetDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getAccountingAssetDetail } from "@/lib/queries/accounting";

export const dynamic = "force-dynamic";

type AccountingAssetPageProps = {
  searchParams?: Promise<{
    code?: string;
    q?: string;
  }>;
};

function accountingAssetBackHref(
  params: Awaited<NonNullable<AccountingAssetPageProps["searchParams"]>>
) {
  const query = new URLSearchParams({ menu: "assets" });
  if (params.q) query.set("q", params.q);
  return `/accounting?${query.toString()}`;
}

export default async function AccountingAssetPage({ searchParams }: AccountingAssetPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = accountingAssetBackHref(params);

  try {
    const data = await getAccountingAssetDetail(session.provider_code, session.db_code, {
      code: params.code
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบข้อมูลสินทรัพย์</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบรหัสสินทรัพย์จากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <AccountingAssetDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดสินทรัพย์ไม่สำเร็จ</CardTitle>
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
