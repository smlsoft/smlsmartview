import { Suspense } from "react";
import { getSession } from "@/lib/auth-helpers";
import { getExecutiveDashboard } from "@/lib/queries/dashboard";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function DashboardData({
  providerCode,
  dbCode
}: {
  providerCode: string;
  dbCode: string;
}) {
  try {
    const data = await getExecutiveDashboard(providerCode, dbCode);
    return <ExecutiveDashboard data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดข้อมูลไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <a href="/dashboard">ลองใหม่</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
}

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData
        providerCode={session.provider_code}
        dbCode={session.db_code}
      />
    </Suspense>
  );
}
