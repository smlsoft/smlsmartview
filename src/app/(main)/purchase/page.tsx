import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { getPurchaseDashboard } from "@/lib/queries/purchase";
import { PurchaseDashboard } from "@/components/purchase/PurchaseDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type PurchasePageProps = {
  searchParams?: Promise<{
    menu?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function PurchasePage({ searchParams }: PurchasePageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};

  try {
    const data = await getPurchaseDashboard(
      session.provider_code,
      session.db_code,
      {
        menu: params.menu,
        search: params.q,
        startDate: params.from,
        endDate: params.to
      }
    );
    return <PurchaseDashboard data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดข้อมูลระบบซื้อไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href="/purchase">ลองใหม่</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
