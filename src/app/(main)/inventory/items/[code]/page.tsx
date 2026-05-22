import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { getInventoryItemDetail } from "@/lib/queries/inventory";
import { InventoryItemDetailView } from "@/components/inventory/InventoryMasterViews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type InventoryItemDetailPageProps = {
  params?: Promise<{
    code?: string;
  }>;
};

export default async function InventoryItemDetailPage({
  params
}: InventoryItemDetailPageProps) {
  const session = await getSession();
  const routeParams = (await params) ?? {};
  const code = routeParams.code ?? "";

  try {
    const data = await getInventoryItemDetail(
      session.provider_code,
      session.db_code,
      code
    );

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบสินค้า</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบรหัสสินค้าอีกครั้งจากรายการสินค้า
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href="/inventory/items">กลับรายการสินค้า</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <InventoryItemDetailView data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดสินค้าไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href="/inventory/items">กลับรายการสินค้า</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
