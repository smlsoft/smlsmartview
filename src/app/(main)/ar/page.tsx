import Link from "next/link";
import { ArDashboard } from "@/components/ar/ArDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getArDashboard } from "@/lib/queries/ar";

export const dynamic = "force-dynamic";

type ArPageProps = {
  searchParams?: Promise<{
    menu?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function ArPage({ searchParams }: ArPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};

  try {
    const data = await getArDashboard(session.provider_code, session.db_code, {
      menu: params.menu,
      search: params.q,
      startDate: params.from,
      endDate: params.to
    });
    return <ArDashboard data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดข้อมูลระบบลูกหนี้ไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href="/ar">ลองใหม่</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
