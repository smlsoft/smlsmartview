import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { getInventoryItems } from "@/lib/queries/inventory";
import { InventoryItemsView } from "@/components/inventory/InventoryMasterViews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type InventoryItemsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function InventoryItemsPage({
  searchParams
}: InventoryItemsPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};

  try {
    const data = await getInventoryItems(
      session.provider_code,
      session.db_code,
      {
        search: params.q
      }
    );

    return <InventoryItemsView data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายการสินค้าไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href="/inventory/items">ลองใหม่</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
