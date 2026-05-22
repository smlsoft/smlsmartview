import Link from "next/link";
import { CashBankChequeDetail } from "@/components/cash-bank/CashBankChequeDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getCashBankChequeDetail } from "@/lib/queries/cash-bank";

export const dynamic = "force-dynamic";

type CashBankChequePageProps = {
  searchParams?: Promise<{
    menu?: string;
    type?: string;
    chq_number?: string;
    get_date?: string;
    q?: string;
  }>;
};

function cashBankChequeBackHref(
  params: Awaited<NonNullable<CashBankChequePageProps["searchParams"]>>
) {
  const query = new URLSearchParams();
  if (params.menu) query.set("menu", params.menu);
  if (params.q) query.set("q", params.q);

  const suffix = query.toString();
  return suffix ? `/cash-bank?${suffix}` : "/cash-bank";
}

export default async function CashBankChequePage({ searchParams }: CashBankChequePageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = cashBankChequeBackHref(params);

  try {
    const data = await getCashBankChequeDetail(session.provider_code, session.db_code, {
      type: params.type,
      chqNumber: params.chq_number,
      getDate: params.get_date
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบข้อมูลเช็ค</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบเลขเช็ค ประเภทเช็ค และวันที่จากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <CashBankChequeDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดเช็คไม่สำเร็จ</CardTitle>
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
