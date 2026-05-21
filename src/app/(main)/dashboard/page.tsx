import { getSession } from "@/lib/auth-helpers";
import { getExecutiveDashboard } from "@/lib/queries/dashboard";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  try {
    const data = await getExecutiveDashboard(
      session.provider_code,
      session.db_code
    );
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
