import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { getInventoryPrices } from "@/lib/queries/inventory";
import { InventoryPricesView } from "@/components/inventory/InventoryMasterViews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type InventoryPricesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function InventoryPricesPage({
  searchParams
}: InventoryPricesPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};

  try {
    const data = await getInventoryPrices(
      session.provider_code,
      session.db_code,
      {
        search: params.q
      }
    );

    return <InventoryPricesView data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดราคาขายสินค้าไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href="/inventory/prices">ลองใหม่</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
