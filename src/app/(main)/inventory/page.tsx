import { getSession } from "@/lib/auth-helpers";
import { getInventoryDashboard } from "@/lib/queries/inventory";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type InventoryPageProps = {
  searchParams?: Promise<{
    menu?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};

  try {
    const data = await getInventoryDashboard(
      session.provider_code,
      session.db_code,
      {
        menu: params.menu,
        search: params.q,
        startDate: params.from,
        endDate: params.to
      }
    );
    return <InventoryDashboard data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดข้อมูลระบบสินค้าไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <a href="/inventory">ลองใหม่</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
