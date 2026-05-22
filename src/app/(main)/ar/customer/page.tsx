import Link from "next/link";
import { ArCustomerDetail } from "@/components/ar/ArCustomerDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getArCustomerDetail } from "@/lib/queries/ar";

export const dynamic = "force-dynamic";

type ArCustomerPageProps = {
  searchParams?: Promise<{
    code?: string;
    q?: string;
  }>;
};

function ArCustomerBackHref(params: Awaited<NonNullable<ArCustomerPageProps["searchParams"]>>) {
  const query = new URLSearchParams({ menu: "customer" });
  if (params.q) query.set("q", params.q);
  return `/ar?${query.toString()}`;
}

export default async function ArCustomerPage({ searchParams }: ArCustomerPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = ArCustomerBackHref(params);

  try {
    const data = await getArCustomerDetail(session.provider_code, session.db_code, {
      code: params.code
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบข้อมูลลูกหนี้</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบรหัสลูกหนี้จากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <ArCustomerDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดลูกหนี้ไม่สำเร็จ</CardTitle>
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
