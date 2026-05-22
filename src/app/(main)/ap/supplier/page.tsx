import Link from "next/link";
import { ApSupplierDetail } from "@/components/ap/ApSupplierDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getApSupplierDetail } from "@/lib/queries/ap";

export const dynamic = "force-dynamic";

type ApSupplierPageProps = {
  searchParams?: Promise<{
    code?: string;
    q?: string;
  }>;
};

function apSupplierBackHref(params: Awaited<NonNullable<ApSupplierPageProps["searchParams"]>>) {
  const query = new URLSearchParams({ menu: "supplier" });
  if (params.q) query.set("q", params.q);
  return `/ap?${query.toString()}`;
}

export default async function ApSupplierPage({ searchParams }: ApSupplierPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = apSupplierBackHref(params);

  try {
    const data = await getApSupplierDetail(session.provider_code, session.db_code, {
      code: params.code
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบข้อมูลเจ้าหนี้</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบรหัสเจ้าหนี้จากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <ApSupplierDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดเจ้าหนี้ไม่สำเร็จ</CardTitle>
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
